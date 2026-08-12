import {
  characterForSpeaker,
  characterRigs,
  characterStaging,
  expressionForDirection,
  expressionAsset,
  placeholderCharacters,
  placeholderForSpeaker,
  type CharacterKey,
  type RuntimeExpression,
} from '../../data/characterRigs';
import { cluePresentation, levels, type ClueId } from '../../data/levels';
import {
  backgroundAssets,
  choices,
  getBackgroundForLine,
  getReadHistory,
  getScene,
  isDirection,
  sceneMeta,
  type ChoiceId,
  type StoryLine,
} from '../../data/narrative';
import { isPreMatchScene, levelForPreMatchScene } from '../../engine/CampaignStore';
import { preloadImageAssets } from '../../platform/AssetPreloader';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { resolveVnStaging, type VnStageSide } from '../../ui/vnStaging';
import {
  currentDialogueProfile,
  dialogueContinuationText,
  dialogueLocale,
  paginateDialogueText,
  paginateDialogueTextMeasured,
} from '../../ui/vnDialoguePaging';
import { createDialogueRenderedFit } from '../../ui/dialogueMeasurement';
import { autoDelayForLine, nextUnreadIndex, type AutoSpeed, type TextScale } from '../../ui/vnPlayback';
import { escapeHtml, headerActionMarkup, iconMarkup as icon } from '../../ui/viewMarkup';
import { audioSettingsMarkup, bindAudioSettingsControls } from '../../ui/systemControls';

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
    const direction = isDirection(entry);
    const background = getBackgroundForLine(this.session.save.scene, this.session.save.line, this.story);
    const character = direction ? null : characterForSpeaker(entry.speaker);
    const placeholder = direction ? null : placeholderForSpeaker(entry.speaker);
    const expression = expressionForDirection(entry.emotion);
    const staging = direction ? null : resolveVnStaging(this.story, this.session.save.line);
    const clueToast = this.pendingClue ? this.clueToastMarkup(this.pendingClue) : '';
    const skipAvailable = this.session.save.readLines.includes(entry.id);
    if (character && !this.usesPoseB(character, entry.emotion)) {
      void preloadImageAssets([expressionAsset(character, expression)], this.services.assetHealth);
    }

    this.shell.render(`<section class="vn-screen text-${this.textScale}">
      <div class="vn-background-stack" aria-hidden="true">
        <img class="vn-background vn-background-fill" src="${backgroundAssets[background]}" alt="">
        <img class="vn-background vn-background-fit" src="${backgroundAssets[background]}" alt="">
      </div>
      <span class="visually-hidden">${escapeHtml(this.sceneText('location'))}</span>
      <div class="vn-vignette"></div>
      <header class="app-header vn-topbar">
        <button id="dossier" class="vn-case-pill" aria-label="${escapeHtml(this.t('vn.chrome.openDossier'))}">
          <span><small>CASE 001 · SCENE ${String(this.session.save.scene).padStart(2, '0')}</small><b>${escapeHtml(this.sceneText('title'))}</b></span>
          <i>${icon('dossier')}<em>${this.session.save.clues.length}</em></i>
        </button>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('vn.chrome.navigation'))}">
          ${headerActionMarkup('history', 'log', this.t('vn.chrome.history'))}
          ${headerActionMarkup('header-settings', 'settings', this.t('common.settings'))}
        </nav>
      </header>
      <div class="stage ${staging ? `stage-${staging.side}` : 'stage-empty'}" data-stage-side="${staging?.side ?? 'none'}">
        ${character ? this.characterMarkup(character, expression, entry.emotion, staging?.side ?? 'center') : ''}
        ${placeholder ? this.placeholderMarkup(placeholder, staging?.side ?? 'center') : ''}
        ${direction ? `<div class="direction-card"><span>${escapeHtml(this.t('vn.chrome.direction'))}</span><b>${escapeHtml(this.lineEmotion(entry))}</b></div>` : ''}
        ${clueToast}
      </div>
      <div class="dialogue-shell ${direction ? 'direction' : ''}">
        <span class="dialogue-nameplate">${direction ? escapeHtml(this.t('vn.chrome.direction')) : escapeHtml(this.lineSpeaker(entry))}<em>${escapeHtml(this.lineEmotion(entry))}</em></span>
        <button class="dialogue ${direction ? 'direction' : ''}" id="next">
          <span class="dialogue-text" data-dialogue-page="${this.dialoguePageIndex + 1}" data-dialogue-pages="${dialoguePages.length}">${escapeHtml(dialogueContinuationText(dialoguePage, this.dialoguePageIndex < dialoguePages.length - 1))}</span>
          <span class="line-id">${entry.id}${dialoguePages.length > 1 ? ` · ${this.dialoguePageIndex + 1}/${dialoguePages.length}` : ''}</span>
          <span class="dialogue-progress" aria-hidden="true">${dialoguePages.map((_, page) => `<i class="${page <= this.dialoguePageIndex ? 'is-active' : ''}"></i>`).join('')}<b>▼</b></span>
        </button>
      </div>
      <nav class="vn-controls" aria-label="${escapeHtml(this.t('vn.chrome.controls'))}">
        <button id="skip" ${skipAvailable ? '' : 'disabled'}>${icon('skip')}<span>SKIP</span></button>
        <button id="auto" class="${this.autoMode ? 'is-active' : ''}">${icon('auto')}<span>AUTO</span></button>
        <button id="save-vn">${icon('save')}<span>SAVE</span></button>
        <button id="load-vn">${icon('load')}<span>LOAD</span></button>
      </nav>
      <div id="vn-status" class="vn-status" hidden></div>
    </section>`);

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
    const next = this.story[nextIndex];
    if (!next) return;
    const assets = [backgroundAssets[getBackgroundForLine(this.session.save.scene, nextIndex, this.story)]];
    if (!isDirection(next)) {
      const character = characterForSpeaker(next.speaker);
      if (character) {
        const rig = characterRigs[character];
        const poseB = this.usesPoseB(character, next.emotion);
        assets.push(poseB ? rig.poseB : expressionAsset(character, expressionForDirection(next.emotion)));
      }
    }
    void preloadImageAssets(assets, this.services.assetHealth);
  }

  private renderHistoryOverlay(): void {
    this.shell.clearTimers();
    const current = this.story[this.session.save.line];
    const history = getReadHistory(this.session.save.readLines, this.session.save.choice);
    const entries = current && !history.some((line) => line.id === current.id) ? [...history, current] : history;
    const phone = this.root.querySelector<HTMLElement>('.phone');
    if (!phone) return;
    phone.insertAdjacentHTML('beforeend', `<section class="vn-overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(this.t('vn.history.aria'))}">
      <div class="vn-overlay-card history-card">
        <header><div><small>CASE LOG</small><h2>${escapeHtml(this.t('vn.history.title'))}</h2></div><button id="close-overlay" class="overlay-close" aria-label="${escapeHtml(this.t('vn.history.close'))}">${icon('close')}</button></header>
        <div class="history-list">${entries.length ? entries.map((line) => `
          <article class="${isDirection(line) ? 'is-direction' : ''}">
            <div><b>${isDirection(line) ? escapeHtml(this.t('vn.chrome.direction')) : escapeHtml(this.lineSpeaker(line))}</b><small>${line.id}</small></div>
            <p>${escapeHtml(this.lineText(line))}</p>
          </article>`).join('') : `<p class="empty-history">${escapeHtml(this.t('vn.history.empty'))}</p>`}</div>
      </div>
    </section>`);
    phone.querySelector('#close-overlay')?.addEventListener('click', () => this.renderVN());
  }

  private renderVnConfigOverlay(): void {
    this.shell.clearTimers();
    const phone = this.root.querySelector<HTMLElement>('.phone');
    if (!phone) return;
    phone.insertAdjacentHTML('beforeend', `<section class="vn-overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(this.t('vn.config.aria'))}">
      <div class="vn-overlay-card config-card">
        <header><div><small>CONFIG</small><h2>${escapeHtml(this.t('vn.config.title'))}</h2></div><button id="close-overlay" class="overlay-close" aria-label="${escapeHtml(this.t('vn.config.close'))}">${icon('close')}</button></header>
        <fieldset><legend>${escapeHtml(this.t('vn.config.autoSpeed'))}</legend><div class="segmented">
          ${(['slow', 'normal', 'fast'] as AutoSpeed[]).map((speed) => `<button data-auto-speed="${speed}" class="${this.autoSpeed === speed ? 'is-selected' : ''}">${speed === 'slow' ? this.t('vn.config.slow') : speed === 'normal' ? this.t('vn.config.normal') : this.t('vn.config.fast')}</button>`).join('')}
        </div></fieldset>
        <fieldset><legend>${escapeHtml(this.t('vn.config.textSize'))}</legend><div class="segmented">
          ${(['normal', 'large'] as TextScale[]).map((scale) => `<button data-text-scale="${scale}" class="${this.textScale === scale ? 'is-selected' : ''}">${scale === 'normal' ? this.t('vn.config.normal') : this.t('vn.config.large')}</button>`).join('')}
        </div></fieldset>
        <fieldset><legend>${escapeHtml(this.t('vn.config.audio'))}</legend>${audioSettingsMarkup(this.services)}</fieldset>
        <div class="vn-config-navigation"><small>${escapeHtml(this.t('vn.config.navigation'))}</small><button id="vn-main-menu">${icon('menu')}<span><b>${escapeHtml(this.t('vn.config.mainMenu'))}</b><em>${escapeHtml(this.t('vn.config.saved'))}</em></span></button></div>
        <p>${escapeHtml(this.t('vn.config.note'))}</p>
      </div>
    </section>`);
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
    if (entry?.id === 'VN0040' && this.session.save.readLines.includes('VN0040')) this.renderChoice();
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

  private characterMarkup(character: CharacterKey, expression: RuntimeExpression, direction: string, side: VnStageSide): string {
    const rig = characterRigs[character];
    const staging = characterStaging[character];
    const style = `--character-scale:${staging.scale};--character-y:${staging.yPercent}%`;
    if (this.usesPoseB(character, direction)) {
      return `<div class="portrait portrait-${side} portrait-static-wrap" data-character="${character}" style="${style}"><img class="portrait-static" src="${rig.poseB}" alt="${rig.displayName}"></div>`;
    }
    return `<div class="portrait portrait-${side} character-rig" data-character="${character}" data-expression="${expression}" style="${style}">
      <img class="portrait-frame" src="${expressionAsset(character, expression)}" alt="${rig.displayName}">
    </div>`;
  }

  private placeholderMarkup(key: keyof typeof placeholderCharacters, side: VnStageSide): string {
    const character = placeholderCharacters[key];
    return `<div class="portrait-placeholder portrait-placeholder-${side}" style="--placeholder-accent:${character.accent}">
      <span>${character.initials}</span>
      <b>${character.displayName}</b>
      <small>PORTRAIT PLACEHOLDER</small>
    </div>`;
  }

  private usesPoseB(character: CharacterKey, direction: string): boolean {
    const value = direction.toLocaleUpperCase('ru-RU');
    if (character === 'miku') return /С БЛОКНОТОМ|УКАЗЫВАЕТ НА/.test(value);
    if (character === 'onoe') return /КРУЖЕВНЫМ ПАКЕТОМ|БЕР[ЕЁ]Т ПИНЦЕТ/.test(value);
    return /С ТЕЛЕФОНОМ|ПОКАЗЫВАЕТ ТЕЛЕФОН|С ДОСКОЙ НА ТЕЛЕФОНЕ/.test(value);
  }


  nextLine(): void {
    this.services.audio.play('vnAdvance');
    const entry = this.story[this.session.save.line];
    if (!entry) return this.advanceScene();
    const dialoguePages = this.dialoguePageLineId === entry.id && this.dialoguePages.length > 0
      ? this.dialoguePages
      : paginateDialogueText(entry.text, currentDialogueProfile(this.textScale));
    if (this.dialoguePageLineId === entry.id && this.dialoguePageIndex < dialoguePages.length - 1) {
      this.dialoguePageIndex += 1;
      this.renderVN();
      return;
    }
    if (!this.session.save.readLines.includes(entry.id)) this.session.save.readLines.push(entry.id);
    if (this.session.save.scene === 1 && entry.id === 'VN0040') {
      this.session.persist();
      this.renderChoice();
      return;
    }
    this.session.save.line += 1;
    this.session.persist();
    if (this.session.save.line >= this.story.length) this.advanceScene();
    else this.renderVN();
  }


  private clueToastMarkup(clueId: ClueId): string {
    const level = levels.find((candidate) => candidate.clueId === clueId)!;
    const clue = cluePresentation[clueId];
    return `<div class="clue-toast"><img src="${clue.asset}" alt=""><span><small>${escapeHtml(this.t('vn.chrome.dossierUpdated'))}</small><b>${escapeHtml(level.clueTitle)}</b></span></div>`;
  }

  renderChoice(): void {
    this.services.audio.setScene('vn');
    this.services.telemetry.trackScreen('choice', 'CHOICE_00');
    this.shell.render(`<section class="choice-screen">
      <div class="choice-background-stack" aria-hidden="true">
        <img class="choice-background choice-background-fill" src="${backgroundAssets.clubroom}" alt="">
        <img class="choice-background choice-background-fit" src="${backgroundAssets.clubroom}" alt="">
      </div>
      <header class="app-header choice-topbar">
        <div class="app-header-title"><small>CASE 001 · CHOICE_00</small><b>${escapeHtml(this.t('vn.choice.header'))}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('common.navigation'))}">
          ${headerActionMarkup('header-settings', 'settings', this.t('common.settings'))}
        </nav>
      </header>
      <div class="choice-panel">
        <p class="eyebrow">CHOICE_00</p><h2>${escapeHtml(this.t('vn.choice.prompt'))}</h2>
        ${(Object.keys(choices) as ChoiceId[]).map((id) => `<button data-choice="${id}"><i>${id}</i><span><b>${escapeHtml(this.choiceText(id, 'title'))}</b><small>${escapeHtml(this.choiceText(id, 'effect'))}</small></span></button>`).join('')}
      </div>
    </section>`);
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

  private advanceScene(): void {
    if (isPreMatchScene(this.session.save.scene)) {
      this.session.save.line = this.story.length;
      this.session.persist();
      this.navigation.showMatchIntro(levelForPreMatchScene(this.session.save.scene));
      return;
    }
    if (this.session.save.scene === sceneMeta.length - 1) {
      this.navigation.showEnding();
      return;
    }
    this.openScene(this.session.save.scene + 1, 0);
  }

}
