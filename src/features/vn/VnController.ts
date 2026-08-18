import { type ClueId } from '../../data/levels';
import {
  choices,
  getReadHistory,
  getScene,
  isDirection,
  sceneMeta,
  type ChoiceId,
  type StoryLine,
} from '../../data/narrative';
import {
  legacySceneIndexFromStoryId,
  storyBranchTargetForLegacyScene,
  storyMatch3RouteForLegacyScene,
  storyTransitionForLegacyScene,
} from '../../data/storyGraph';
import {
  storyChoiceGateById,
  storyChoiceGateForLine,
  type StoryChoiceGate,
  type StoryChoiceOptionId,
} from '../../data/storyChoices';
import { meetsStoryEndingRequirement, storyOutcomeMetrics } from '../../data/storyOutcome';
import { preloadImageAssets } from '../../platform/AssetPreloader';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import {
  currentDialogueProfile,
  dialogueContinuationText,
  dialogueLocale,
  paginateDialogueText,
  paginateDialogueTextMeasured,
} from '../../ui/vnDialoguePaging';
import { createDialogueRenderedFit } from '../../ui/dialogueMeasurement';
import { autoDelayForLine, nextUnreadIndex, type AutoSpeed, type TextScale } from '../../ui/vnPlayback';
import { vnFrameMarkup } from '../../ui/vnFrameMarkup';
import { audioSettingsMarkup, bindAudioSettingsControls } from '../../ui/systemControls';
import {
  resolveVnStagePresentation,
  vnChoiceBackgroundAsset,
  vnChoiceScreenMarkup,
  vnConfigOverlayMarkup,
  vnHistoryOverlayMarkup,
  vnPreloadAssetsForLine,
  vnStoryChoiceBackgroundAsset,
  vnStoryChoiceScreenMarkup,
} from './VnPresentation';

export class VnController {
  private story: StoryLine[] = [];
  private autoMode = false;
  private autoSpeed: AutoSpeed = 'normal';
  private textScale: TextScale = 'normal';
  private dialoguePageLineId: string | null = null;
  private dialoguePageIndex = 0;
  private dialoguePages: string[] = [];
  private dialogueReflowTimer: number | null = null;
  private trackedVnLineId: string | null = null;
  private trackedPagingKey: string | null = null;
  private pendingClue: ClueId | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: AppSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  private t(key: string, params: Readonly<Record<string, string | number | boolean>> = {}): string {
    return this.services.localization.t(key, params);
  }

  private sceneText(field: 'title' | 'location'): string {
    const meta = sceneMeta[this.session.save.scene];
    return this.t(`vn.scene.${meta.id}.${field}`);
  }

  private choiceText(id: ChoiceId, field: 'title' | 'effect'): string {
    return this.t(`vn.choice.${id}.${field}`);
  }

  private lineText(line: StoryLine): string {
    const key = `vn.line.${line.id}.text`;
    return this.services.localization.has(key, this.services.localization.locale) ? this.t(key) : line.text;
  }

  private lineSpeaker(line: StoryLine): string {
    const key = `vn.line.${line.id}.speaker`;
    return this.services.localization.has(key, this.services.localization.locale) ? this.t(key) : line.speaker;
  }

  private lineEmotion(line: StoryLine): string {
    const key = `vn.line.${line.id}.emotion`;
    return this.services.localization.has(key, this.services.localization.locale) ? this.t(key) : line.emotion;
  }

  mount(): void {
    this.bindDialogueReflow();
  }

  setPendingClue(clueId: ClueId | null): void {
    this.pendingClue = clueId;
  }

  resetSessionUi(): void {
    this.autoMode = false;
  }

  openScene(scene: number, line = 0): void {
    this.dialoguePageLineId = null;
    this.dialoguePageIndex = 0;
    this.dialoguePages = [];
    this.trackedVnLineId = null;
    this.trackedPagingKey = null;
    this.session.save.scene = Math.max(0, Math.min(sceneMeta.length - 1, scene));
    this.story = getScene(this.session.save.scene, this.session.save.choice);
    this.session.save.line = Math.max(0, Math.min(line, this.story.length));
    this.session.persist();

    if (this.session.save.line >= this.story.length) {
      this.advanceScene();
      return;
    }
    const resumeEntry = this.story[this.session.save.line];
    if (this.session.save.scene === 1 && resumeEntry?.id === 'VN0040' && this.session.save.readLines.includes('VN0040')) {
      this.renderChoice();
      return;
    }
    const resumeGate = resumeEntry ? storyChoiceGateForLine(resumeEntry.id) : null;
    if (resumeGate && this.session.save.readLines.includes(resumeEntry!.id) && !this.session.save.storyChoices[resumeGate.id]) {
      this.renderStoryChoice(resumeGate);
      return;
    }
    this.renderVN();
  }

  private renderVN(): void {
    this.services.audio.setScene('vn');
    const entry = this.story[this.session.save.line];
    if (!entry) {
      this.advanceScene();
      return;
    }

    this.services.telemetry.trackScreen('vn', entry.id);
    if (this.trackedVnLineId !== entry.id) {
      this.trackedVnLineId = entry.id;
      this.trackedPagingKey = null;
      this.services.telemetry.track('vn_line', { scene: this.session.save.scene, line: this.session.save.line, lineId: entry.id, speaker: isDirection(entry) ? 'DIRECTION' : entry.speaker });
    }
    if (this.dialoguePageLineId !== entry.id) {
      this.dialoguePageLineId = entry.id;
      this.dialoguePageIndex = 0;
      this.dialoguePages = [];
    }
    const localizedText = this.lineText(entry);
    const fallbackDialoguePages = paginateDialogueText(localizedText, currentDialogueProfile(this.textScale));
    let dialoguePages = this.dialoguePages.length > 0 ? this.dialoguePages : fallbackDialoguePages;
    this.dialoguePageIndex = Math.min(this.dialoguePageIndex, dialoguePages.length - 1);
    let dialoguePage = dialoguePages[this.dialoguePageIndex] ?? localizedText;
    const localizedEmotion = this.lineEmotion(entry);
    const stage = resolveVnStagePresentation({
      story: this.story,
      sceneIndex: this.session.save.scene,
      lineIndex: this.session.save.line,
      entry,
      localizedEmotion,
      directionLabel: this.t('vn.chrome.direction'),
      dossierUpdatedLabel: this.t('vn.chrome.dossierUpdated'),
      pendingClue: this.pendingClue,
    });
    const direction = stage.direction;
    const skipAvailable = this.session.save.readLines.includes(entry.id);
    if (stage.preloadAssets.length > 0) {
      void preloadImageAssets(stage.preloadAssets, this.services.assetHealth);
    }
    this.shell.render(vnFrameMarkup({
      frameContext: 'runtime',
      textScale: this.textScale,
      backgroundAsset: stage.backgroundAsset,
      location: this.sceneText('location'),
      caseLabel: `CASE 001 · SCENE ${String(this.session.save.scene).padStart(2, '0')}`,
      sceneTitle: this.sceneText('title'),
      clueCount: this.session.save.clues.length,
      stageSide: stage.stageSide,
      stageMarkup: stage.stageMarkup,
      direction,
      speaker: direction ? this.t('vn.chrome.direction') : this.lineSpeaker(entry),
      emotion: localizedEmotion,
      dialogueText: dialogueContinuationText(dialoguePage, this.dialoguePageIndex < dialoguePages.length - 1),
      dialoguePageIndex: this.dialoguePageIndex,
      dialoguePageCount: dialoguePages.length,
      lineId: entry.id,
      skipAvailable,
      autoMode: this.autoMode,
      labels: {
        openDossier: this.t('vn.chrome.openDossier'),
        navigation: this.t('vn.chrome.navigation'),
        history: this.t('vn.chrome.history'),
        settings: this.t('common.settings'),
        controls: this.t('vn.chrome.controls'),
      },
    }));

    dialoguePages = this.measureAndApplyDialoguePages(entry.id, localizedText, fallbackDialoguePages);
    dialoguePage = dialoguePages[this.dialoguePageIndex] ?? localizedText;
    const pagingKey = `${entry.id}:${dialoguePages.length}:${this.textScale}`;
    if (dialoguePages.length > 1 && pagingKey !== this.trackedPagingKey) {
      this.trackedPagingKey = pagingKey;
      this.services.telemetry.track('vn_paging', { lineId: entry.id, pages: dialoguePages.length, textScale: this.textScale, locale: dialogueLocale() });
    }
    this.pendingClue = null;
    this.preloadNextVnAssets();
    this.root.querySelector('#header-settings')?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.renderVnConfigOverlay();
    });
    this.root.querySelector('#dossier')?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.navigation.showDossier(() => this.renderVN());
    });
    this.root.querySelector('#history')?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.services.telemetry.track('vn_log_open', { lineId: entry.id });
      this.renderHistoryOverlay();
    });
    this.root.querySelector('#next')?.addEventListener('click', () => this.nextLine());
    this.root.querySelector('#skip')?.addEventListener('click', () => this.skipReadLines());
    this.root.querySelector('#auto')?.addEventListener('click', () => {
      this.autoMode = !this.autoMode;
      this.services.telemetry.track('vn_auto', { enabled: this.autoMode, speed: this.autoSpeed });
      this.renderVN();
    });
    this.root.querySelector('#save-vn')?.addEventListener('click', () => {
      if (this.services.store.saveManual(this.session.save)) this.showVnStatus(this.t('vn.status.saved'));
      else this.showVnStatus(this.t('vn.status.saveFailed'));
    });
    this.root.querySelector('#load-vn')?.addEventListener('click', () => {
      const manual = this.services.store.loadManual();
      if (!manual) { this.showVnStatus(this.t('vn.status.emptySlot')); return; }
      this.session.save = manual;
      this.session.persist();
      this.openScene(this.session.save.scene, this.session.save.line);
    });
    if (this.autoMode) this.shell.schedule(() => this.nextLine(), autoDelayForLine(dialoguePage, this.autoSpeed));
  }

  private measureAndApplyDialoguePages(lineId: string, text: string, fallbackPages: string[]): string[] {
    const textElement = this.root.querySelector<HTMLElement>('.dialogue-text');
    if (!textElement) {
      this.dialoguePages = fallbackPages;
      return fallbackPages;
    }

    const measurement = createDialogueRenderedFit(textElement);
    if (!measurement) {
      // An unstable/zero-size layout must never drive the measured paginator
      // down to one- or two-grapheme pages. Keep the deterministic fallback
      // until resize/font/layout reflow gives us a real viewport.
      this.dialoguePages = fallbackPages;
      return fallbackPages;
    }

    let measuredPages: string[];
    try {
      measuredPages = paginateDialogueTextMeasured(text, measurement.fits, dialogueLocale());
    } finally {
      measurement.dispose();
    }
    this.dialoguePages = measuredPages;
    this.dialoguePageIndex = Math.min(this.dialoguePageIndex, measuredPages.length - 1);

    const currentPage = measuredPages[this.dialoguePageIndex] ?? text;
    textElement.textContent = dialogueContinuationText(currentPage, this.dialoguePageIndex < measuredPages.length - 1);
    textElement.dataset.dialoguePage = String(this.dialoguePageIndex + 1);
    textElement.dataset.dialoguePages = String(measuredPages.length);

    const lineIdElement = this.root.querySelector<HTMLElement>('.line-id');
    if (lineIdElement) {
      lineIdElement.textContent = measuredPages.length > 1
        ? `${lineId} · ${this.dialoguePageIndex + 1}/${measuredPages.length}`
        : lineId;
    }

    const progressElement = this.root.querySelector<HTMLElement>('.dialogue-progress');
    if (progressElement) {
      progressElement.innerHTML = `${measuredPages.map((_, page) => `<i class="${page <= this.dialoguePageIndex ? 'is-active' : ''}"></i>`).join('')}<b>▼</b>`;
    }
    return measuredPages;
  }

  private bindDialogueReflow(): void {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    const requestReflow = (): void => {
      if (!this.root.querySelector('.vn-screen')) return;
      if (this.dialogueReflowTimer !== null) window.clearTimeout(this.dialogueReflowTimer);
      this.dialogueReflowTimer = window.setTimeout(() => {
        this.dialogueReflowTimer = null;
        this.dialoguePages = [];
        this.renderVN();
      }, 80);
    };
    window.addEventListener('resize', requestReflow, { passive: true });
    window.addEventListener('orientationchange', requestReflow, { passive: true });

    if (typeof document !== 'undefined' && document.fonts?.ready) {
      void document.fonts.ready.then(() => requestReflow());
    }
  }

  private preloadNextVnAssets(): void {
    if (typeof Image === 'undefined') return;
    const nextIndex = Math.min(this.story.length - 1, this.session.save.line + 1);
    const assets = vnPreloadAssetsForLine(this.story, this.session.save.scene, nextIndex);
    if (assets.length > 0) void preloadImageAssets(assets, this.services.assetHealth);
  }

  private renderHistoryOverlay(): void {
    this.shell.clearTimers();
    const current = this.story[this.session.save.line];
    const history = getReadHistory(this.session.save.readLines, this.session.save.choice);
    const lines = current && !history.some((line) => line.id === current.id) ? [...history, current] : history;
    const phone = this.root.querySelector<HTMLElement>('.phone');
    if (!phone) return;
    phone.insertAdjacentHTML('beforeend', vnHistoryOverlayMarkup({
      ariaLabel: this.t('vn.history.aria'),
      title: this.t('vn.history.title'),
      closeLabel: this.t('vn.history.close'),
      emptyLabel: this.t('vn.history.empty'),
      entries: lines.map((line) => ({
        id: line.id,
        speaker: isDirection(line) ? this.t('vn.chrome.direction') : this.lineSpeaker(line),
        text: this.lineText(line),
        direction: isDirection(line),
      })),
    }));
    phone.querySelector('#close-overlay')?.addEventListener('click', () => this.renderVN());
  }

  private renderVnConfigOverlay(): void {
    this.shell.clearTimers();
    const phone = this.root.querySelector<HTMLElement>('.phone');
    if (!phone) return;
    phone.insertAdjacentHTML('beforeend', vnConfigOverlayMarkup({
      autoSpeed: this.autoSpeed,
      textScale: this.textScale,
      audioSettingsHtml: audioSettingsMarkup(this.services),
      labels: {
        ariaLabel: this.t('vn.config.aria'),
        title: this.t('vn.config.title'),
        close: this.t('vn.config.close'),
        autoSpeed: this.t('vn.config.autoSpeed'),
        textSize: this.t('vn.config.textSize'),
        audio: this.t('vn.config.audio'),
        navigation: this.t('vn.config.navigation'),
        mainMenu: this.t('vn.config.mainMenu'),
        saved: this.t('vn.config.saved'),
        note: this.t('vn.config.note'),
        slow: this.t('vn.config.slow'),
        normal: this.t('vn.config.normal'),
        fast: this.t('vn.config.fast'),
        large: this.t('vn.config.large'),
      },
    }));
    phone.querySelector('#close-overlay')?.addEventListener('click', () => this.renderVN());
    phone.querySelector('#vn-main-menu')?.addEventListener('click', () => this.navigation.returnToMainMenu());
    phone.querySelectorAll<HTMLElement>('[data-auto-speed]').forEach((button) => button.addEventListener('click', () => {
      this.autoSpeed = button.dataset.autoSpeed as AutoSpeed;
      this.refreshVnConfigOverlay();
    }));
    phone.querySelectorAll<HTMLElement>('[data-text-scale]').forEach((button) => button.addEventListener('click', () => {
      this.textScale = button.dataset.textScale as TextScale;
      this.refreshVnConfigOverlay();
    }));
    bindAudioSettingsControls(this.services, phone, () => this.refreshVnConfigOverlay());
  }

  private refreshVnConfigOverlay(): void {
    this.root.querySelector('.vn-overlay')?.remove();
    this.renderVnConfigOverlay();
  }

  private skipReadLines(): void {
    const from = this.session.save.line;
    const target = nextUnreadIndex(this.story, this.session.save.line, this.session.save.readLines);
    if (target === this.session.save.line) {
      this.showVnStatus(this.t('vn.status.skipReadOnly'));
      return;
    }
    this.services.telemetry.track('vn_skip', { scene: this.session.save.scene, fromLine: from, toLine: target, skipped: Math.max(0, target - from) });
    this.session.save.line = target;
    this.session.persist();
    const entry = this.story[this.session.save.line];
    const gate = entry ? storyChoiceGateForLine(entry.id) : null;
    if (entry?.id === 'VN0040' && this.session.save.readLines.includes('VN0040')) this.renderChoice();
    else if (gate && this.session.save.readLines.includes(entry!.id) && !this.session.save.storyChoices[gate.id]) this.renderStoryChoice(gate);
    else if (this.session.save.line >= this.story.length) this.advanceScene();
    else this.renderVN();
  }

  private showVnStatus(message: string): void {
    const status = this.root.querySelector<HTMLElement>('#vn-status');
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    this.shell.schedule(() => { status.hidden = true; }, 1500);
  }

  private updateDialoguePageInPlace(entry: StoryLine, dialoguePages: string[]): boolean {
    const textElement = this.root.querySelector<HTMLElement>('.dialogue-text');
    const lineIdElement = this.root.querySelector<HTMLElement>('.line-id');
    const progressElement = this.root.querySelector<HTMLElement>('.dialogue-progress');
    if (!textElement || !lineIdElement || !progressElement) return false;

    const page = dialoguePages[this.dialoguePageIndex] ?? this.lineText(entry);
    this.shell.clearTimers();
    textElement.textContent = dialogueContinuationText(page, this.dialoguePageIndex < dialoguePages.length - 1);
    textElement.dataset.dialoguePage = String(this.dialoguePageIndex + 1);
    textElement.dataset.dialoguePages = String(dialoguePages.length);
    lineIdElement.textContent = dialoguePages.length > 1
      ? `${entry.id} · ${this.dialoguePageIndex + 1}/${dialoguePages.length}`
      : entry.id;
    progressElement.innerHTML = `${dialoguePages.map((_, pageIndex) => `<i class="${pageIndex <= this.dialoguePageIndex ? 'is-active' : ''}"></i>`).join('')}<b>▼</b>`;

    if (this.autoMode) this.shell.schedule(() => this.nextLine(), autoDelayForLine(page, this.autoSpeed));
    return true;
  }

  nextLine(): void {
    this.services.audio.play('vnAdvance');
    const entry = this.story[this.session.save.line];
    if (!entry) return this.advanceScene();
    const localizedText = this.lineText(entry);
    const dialoguePages = this.dialoguePageLineId === entry.id && this.dialoguePages.length > 0
      ? this.dialoguePages
      : paginateDialogueText(localizedText, currentDialogueProfile(this.textScale));
    if (this.dialoguePageLineId === entry.id && this.dialoguePageIndex < dialoguePages.length - 1) {
      this.dialoguePageIndex += 1;
      if (!this.updateDialoguePageInPlace(entry, dialoguePages)) this.renderVN();
      return;
    }
    if (!this.session.save.readLines.includes(entry.id)) this.session.save.readLines.push(entry.id);
    if (this.session.save.scene === 1 && entry.id === 'VN0040') {
      this.session.persist();
      this.renderChoice();
      return;
    }
    const storyGate = storyChoiceGateForLine(entry.id);
    if (storyGate && !this.session.save.storyChoices[storyGate.id]) {
      this.session.persist();
      this.renderStoryChoice(storyGate);
      return;
    }
    this.session.save.line += 1;
    this.session.persist();
    if (this.session.save.line >= this.story.length) this.advanceScene();
    else this.renderVN();
  }


  renderChoice(): void {
    this.services.audio.setScene('vn');
    this.services.telemetry.trackScreen('choice', 'CHOICE_00');
    this.shell.render(vnChoiceScreenMarkup({
      backgroundAsset: vnChoiceBackgroundAsset,
      headerLabel: this.t('vn.choice.header'),
      prompt: this.t('vn.choice.prompt'),
      navigationLabel: this.t('common.navigation'),
      settingsLabel: this.t('common.settings'),
      options: (Object.keys(choices) as ChoiceId[]).map((id) => ({
        id,
        title: this.choiceText(id, 'title'),
        effect: this.choiceText(id, 'effect'),
      })),
    }));
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.renderChoice(), true));
    this.root.querySelectorAll<HTMLElement>('[data-choice]').forEach((button) => button.addEventListener('click', () => {
      this.services.audio.play('choice');
      this.session.save.choice = button.dataset.choice as ChoiceId;
      this.services.telemetry.track('choice_selected', { choice: this.session.save.choice });
      this.story = getScene(1, this.session.save.choice);
      const branchIndex = this.story.findIndex((line) => line.id === `VN0041${this.session.save.choice}`);
      this.session.save.line = Math.max(0, branchIndex);
      this.session.persist();
      this.renderVN();
    }));
  }

  private renderStoryChoice(gate: StoryChoiceGate): void {
    this.services.audio.setScene('vn');
    this.services.telemetry.trackScreen('choice', gate.id);
    const background = vnStoryChoiceBackgroundAsset(sceneMeta[this.session.save.scene].defaultBackground);
    this.shell.render(vnStoryChoiceScreenMarkup({
      gate,
      backgroundAsset: background,
      headerLabel: this.t('vn.storyChoice.header'),
      prompt: this.t(`vn.storyChoice.${gate.id}.prompt`),
      navigationLabel: this.t('common.navigation'),
      settingsLabel: this.t('common.settings'),
      options: gate.options.map((id) => ({
        id,
        title: this.t(`vn.storyChoice.${gate.id}.${id}.title`),
        effect: this.t(`vn.storyChoice.${gate.id}.${id}.effect`),
      })),
    }));
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.renderStoryChoice(gate), true));
    this.root.querySelectorAll<HTMLElement>('[data-story-choice]').forEach((button) => button.addEventListener('click', () => {
      this.services.audio.play('choice');
      const option = button.dataset.storyChoice as StoryChoiceOptionId;
      this.session.save.storyChoices[gate.id] = option;
      this.services.telemetry.track('choice_selected', { gate: gate.id, choice: option });
      this.session.save.line += 1;
      this.session.persist();
      if (this.session.save.line >= this.story.length) this.advanceScene(); else this.renderVN();
    }));
  }

  private advanceScene(): void {
    const transition = storyTransitionForLegacyScene(this.session.save.scene);
    if (!transition) throw new Error(`Missing story transition for legacy scene ${this.session.save.scene}`);

    if (transition.kind === 'match3') {
      const route = storyMatch3RouteForLegacyScene(this.session.save.scene);
      if (!route || route.levelIndex < 0) throw new Error(`Invalid Match-3 story route from ${this.session.save.scene}`);
      this.session.save.line = this.story.length;
      this.session.persist();
      this.navigation.showMatchIntro(route.levelIndex);
      return;
    }

    if (transition.kind === 'branch') {
      const targetSceneId = storyBranchTargetForLegacyScene(this.session.save.scene, this.session.save.storyChoices);
      if (!targetSceneId) {
        this.renderStoryChoice(storyChoiceGateById(transition.gateId));
        return;
      }
      const nextScene = legacySceneIndexFromStoryId(targetSceneId);
      if (nextScene < 0) throw new Error(`Unknown branch story scene ${targetSceneId}`);
      this.openScene(nextScene, 0);
      return;
    }

    if (transition.kind === 'ending') {
      const metrics = storyOutcomeMetrics(this.session.save);
      const endingId = transition.successRequirement && transition.fallbackEndingId
        && !meetsStoryEndingRequirement(metrics, transition.successRequirement)
        ? transition.fallbackEndingId
        : transition.endingId;
      this.navigation.showEnding(endingId);
      return;
    }

    const nextScene = legacySceneIndexFromStoryId(transition.targetSceneId);
    if (nextScene < 0) throw new Error(`Unknown story scene ${transition.targetSceneId}`);
    this.openScene(nextScene, 0);
  }

}
