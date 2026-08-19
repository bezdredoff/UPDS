import {
  sceneStagingManifest,
  sceneStagingPresetIds,
  validateSceneStagingManifest,
  type SceneStagingActorSlot,
  type SceneStagingPresetId,
  type SceneStagingSafeBox,
} from '../../data/sceneStaging';
import {
  SCENE_STUDIO_QA_REPORT_FORMAT,
  backgroundPointToFramePercent,
  resolveSceneStudioContainBox,
  sceneStudioCalibrationManifest,
  sceneStudioLineupMetrics,
  sceneStudioManualReviewIssues,
  sceneStudioViewportIds,
  validateSceneStudioCalibration,
  type SceneStudioCalibrationIssue,
  type SceneStudioViewMode,
  type SceneStudioViewportId,
} from '../../data/sceneStudioCalibration';
import { characterRigs, expressionAsset, poseAsset } from '../../data/characterRigs';
import {
  applyBrowserLocalCharacterCalibration,
  applyBrowserLocalCharacterOverrides,
  browserLocalCharacterCalibration,
  browserLocalCharacterExportSnapshot,
  browserLocalCharacterOverrideSummaries,
  clearBrowserLocalCharacterOverrides,
  copyBrowserLocalCharacterDefaultCalibrationToSlot,
  hasBrowserLocalCharacterOverrides,
  hasBrowserLocalCharacterSlotCalibration,
  resetBrowserLocalCharacterCalibration,
  resetBrowserLocalCharacterDefaultCalibration,
  type BrowserLocalCharacterCalibrationContext,
  type BrowserLocalCompositionAssignments,
} from '../../data/characterRuntimeOverrides';
import {
  characterProductionManifest,
  productionCharacterKeys,
  runtimeExpressionOrder,
  type ProductionCharacterKey,
  type RuntimeExpression,
} from '../../data/characterProduction';
import { authoredVnShotManifest } from '../../data/authoredVnShots';
import { backgroundAssets, sceneMeta, type BackgroundKey } from '../../data/narrative';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppShell } from '../../app/AppShell';
import {
  resolveSceneStagingPreset,
  type SceneStagingActorInput,
} from '../../ui/sceneStaging';
import { dialogueContinuationText, paginateDialogueText } from '../../ui/vnDialoguePaging';
import type { TextScale } from '../../ui/vnPlayback';
import { vnFrameMarkup } from '../../ui/vnFrameMarkup';
import { SCENE_STUDIO_DEFAULT_EYE_LINE_PERCENT } from '../../ui/vnPortraitGeometry';
import { resolveAuthoredVnShot } from '../../ui/vnAuthoredShots';
import { guestWitnessStageMarkup } from '../../ui/guestWitnessMarkup';
import { escapeHtml, panelHeaderMarkup } from '../../ui/viewMarkup';
import { browserOverrideCopy } from './browserLocalCharacterOverrideCopy';
import { sceneStudioWorkspaceCopy } from './sceneStudioWorkspaceCopy';
import { loadBrowserLocalCharacterOverrideZip, type BrowserLocalCharacterOverrideLoadResult } from './browserLocalCharacterOverrides';

export const sceneStudioBackgroundKeys = Object.keys(backgroundAssets) as BackgroundKey[];
export const sceneStudioStoryLineIds = authoredVnShotManifest.shots.map((shot) => shot.lineId) as readonly string[];
export type SceneStudioWorkspaceMode = 'composition' | 'story';

export type SceneStudioState = Readonly<{
  workspaceMode: SceneStudioWorkspaceMode;
  presetId: SceneStagingPresetId;
  background: BackgroundKey;
  viewportId: SceneStudioViewportId;
  viewMode: SceneStudioViewMode;
  lineId: string;
  textScale: TextScale;
  showGuides: boolean;
}>;

export const sceneStudioSamples: Readonly<Record<SceneStagingPresetId, readonly SceneStagingActorInput[]>> = {
  'solo-close': [{ character: 'miku', expression: 'serious' }],
  'solo-medium': [{ character: 'onoe', expression: 'neutral' }],
  'two-shot-conflict': [
    { character: 'miku', expression: 'serious' },
    { character: 'emi', expression: 'serious' },
  ],
  'two-shot-alliance': [
    { character: 'onoe', expression: 'smile' },
    { character: 'ayuki', expression: 'smile' },
  ],
  'trio-central-speaker': [
    { character: 'miku', expression: 'serious' },
    { character: 'onoe', expression: 'neutral' },
    { character: 'ayuki', expression: 'smile' },
  ],
  'trio-reaction': [
    { character: 'ayuki', expression: 'surprised' },
    { character: 'miku', expression: 'neutral' },
    { character: 'onoe', expression: 'serious' },
  ],
  'evidence-cutaway': [],
  'guest-testimony-card': [],
};

type SceneStudioCompositionAssignments = Partial<Record<SceneStagingPresetId, SceneStagingActorInput[]>>;

const createCompositionAssignments = (): SceneStudioCompositionAssignments => Object.fromEntries(
  sceneStagingPresetIds.map((presetId) => [
    presetId,
    sceneStudioSamples[presetId].map((actor) => ({ ...actor, pose: actor.pose ?? 'pose-a' })),
  ]),
) as SceneStudioCompositionAssignments;

const actorSlotsForPreset = (presetId: SceneStagingPresetId): readonly SceneStagingActorSlot[] =>
  sceneStagingManifest.presets[presetId].slots.filter((slot): slot is SceneStagingActorSlot => slot.kind === 'actor');

const DEFAULT_STATE: SceneStudioState = {
  workspaceMode: 'composition',
  presetId: 'solo-close',
  background: 'clubroom',
  viewportId: '390x844',
  viewMode: 'scene',
  lineId: 'VN0008',
  textScale: 'normal',
  showGuides: true,
};

const safeBoxStyle = (safeBox: SceneStagingSafeBox): string => [
  `left:${safeBox.leftPercent}%`,
  `top:${safeBox.topPercent}%`,
  `width:${safeBox.rightPercent - safeBox.leftPercent}%`,
  `height:${safeBox.bottomPercent - safeBox.topPercent}%`,
].join(';');

const clamp = (value: number, minimum: number, maximum: number): number => Math.min(maximum, Math.max(minimum, value));

type SceneStudioBrowserOverrideStatus = Readonly<{
  kind: 'idle' | 'loading' | 'ready' | 'error';
  message: string;
  detail?: BrowserLocalCharacterOverrideLoadResult;
}>;

export class SceneStudioController {
  private state: SceneStudioState = DEFAULT_STATE;
  private browserOverrideStatus: SceneStudioBrowserOverrideStatus = { kind: 'idle', message: '' };
  private compositionAssignments: SceneStudioCompositionAssignments = createCompositionAssignments();
  private selectedCompositionSlotId: string | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(requested: Partial<SceneStudioState> = {}): void {
    let state = this.normalizeState(requested);
    const authoredShot = state.workspaceMode === 'story' ? resolveAuthoredVnShot(state.lineId) : null;
    if (state.workspaceMode === 'story' && authoredShot) {
      state = {
        ...state,
        presetId: authoredShot.shot.presetId,
        background: authoredShot.shot.background,
        viewMode: 'scene',
      };
    }
    this.state = state;

    const compositionActors = this.compositionAssignments[state.presetId] ?? sceneStudioSamples[state.presetId].map((actor) => ({ ...actor }));
    const compositionActorSlots = actorSlotsForPreset(state.presetId);
    if (state.workspaceMode === 'composition') {
      if (!compositionActorSlots.some((slot) => slot.id === this.selectedCompositionSlotId)) {
        this.selectedCompositionSlotId = compositionActorSlots[0]?.id ?? null;
      }
    }
    const resolution = authoredShot?.staging ?? resolveSceneStagingPreset(state.presetId, compositionActors);
    const viewportProfile = sceneStudioCalibrationManifest.viewports[state.viewportId];
    const backgroundProfile = sceneStudioCalibrationManifest.backgrounds[state.background];
    const presetIndex = sceneStagingPresetIds.indexOf(state.presetId);
    const previousPreset = sceneStagingPresetIds[(presetIndex - 1 + sceneStagingPresetIds.length) % sceneStagingPresetIds.length];
    const nextPreset = sceneStagingPresetIds[(presetIndex + 1) % sceneStagingPresetIds.length];
    const storyIndex = Math.max(0, sceneStudioStoryLineIds.indexOf(state.lineId));
    const previousStoryLine = sceneStudioStoryLineIds[(storyIndex - 1 + sceneStudioStoryLineIds.length) % sceneStudioStoryLineIds.length];
    const nextStoryLine = sceneStudioStoryLineIds[(storyIndex + 1) % sceneStudioStoryLineIds.length];

    const rawT = (key: string, params: Readonly<Record<string, string | number | boolean>> = {}): string => this.services.localization.t(key, params);
    const t = (key: string, params: Readonly<Record<string, string | number | boolean>> = {}): string => escapeHtml(rawT(key, params));
    const localOverrideCopy = browserOverrideCopy(this.services.localization.locale);
    const workspaceCopy = sceneStudioWorkspaceCopy(this.services.localization.locale);
    const line = state.workspaceMode === 'story'
      ? {
          speaker: rawT(`vn.line.${state.lineId}.speaker`),
          emotion: rawT(`vn.line.${state.lineId}.emotion`),
          text: rawT(`vn.line.${state.lineId}.text`),
        }
      : {
          speaker: workspaceCopy.compositionSpeaker,
          emotion: workspaceCopy.compositionEmotion,
          text: workspaceCopy.compositionText,
        };
    const frameLineId = state.workspaceMode === 'story' ? state.lineId : 'composition-preview';
    const dialoguePages = paginateDialogueText(line.text, {
      width: viewportProfile.viewport.width,
      height: viewportProfile.viewport.height,
      textScale: state.textScale,
    });
    const diagnostics = this.diagnostics(state.background, resolution);
    const stageMarkup = state.viewMode === 'lineup'
      ? this.lineupMarkup(t)
      : this.sceneMarkup(resolution, state.showGuides, t, state.workspaceMode === 'composition');
    const frame = vnFrameMarkup({
      idPrefix: 'scene-studio-runtime-',
      frameContext: 'scene-studio',
      screenClass: 'scene-studio-runtime-screen',
      textScale: state.textScale,
      backgroundAsset: backgroundAssets[state.background],
      location: rawT(`vn.scene.${sceneMeta[backgroundProfile.sceneIndex].id}.location`),
      caseLabel: `CASE 001 · SCENE ${String(backgroundProfile.sceneIndex).padStart(2, '0')}`,
      sceneTitle: rawT(`vn.scene.${sceneMeta[backgroundProfile.sceneIndex].id}.title`),
      clueCount: 3,
      stageSide: state.viewMode,
      stageMarkup,
      overlayMarkup: this.calibrationOverlayMarkup(state.background, state.viewportId, state.showGuides, t),
      direction: false,
      speaker: line.speaker,
      emotion: line.emotion,
      dialogueText: dialogueContinuationText(dialoguePages[0] ?? line.text, dialoguePages.length > 1),
      dialoguePageIndex: 0,
      dialoguePageCount: dialoguePages.length,
      lineId: frameLineId,
      skipAvailable: false,
      autoMode: false,
      interactive: false,
      labels: {
        openDossier: rawT('vn.chrome.openDossier'),
        navigation: rawT('vn.chrome.navigation'),
        history: rawT('vn.chrome.history'),
        settings: rawT('common.settings'),
        controls: rawT('vn.chrome.controls'),
      },
    });
    const deviceStyle = [
      `--scene-studio-viewport-width:${viewportProfile.viewport.width}px`,
      `--scene-studio-viewport-height:${viewportProfile.viewport.height}px`,
      `--safe-area-top:${viewportProfile.representativeInsets.top}px`,
      `--safe-area-right:${viewportProfile.representativeInsets.right}px`,
      `--safe-area-bottom:${viewportProfile.representativeInsets.bottom}px`,
      `--safe-area-left:${viewportProfile.representativeInsets.left}px`,
      `--scene-studio-dialogue-row:${viewportProfile.compact ? 136 : clamp(viewportProfile.viewport.height * 0.22, 154, 198)}px`,
      `--scene-studio-control-row:${clamp(viewportProfile.viewport.height * 0.09, 60, 82)}px`,
    ].join(';');
    const report = this.qaReport(state, resolution, diagnostics, dialoguePages.length);
    const errorCount = diagnostics.filter((issue) => issue.severity === 'error').length;
    const warningCount = diagnostics.filter((issue) => issue.severity === 'warning').length;
    const manualCount = diagnostics.filter((issue) => issue.severity === 'manual').length;
    const browserOverrides = browserLocalCharacterOverrideSummaries();
    const browserOverrideStatusClass = hasBrowserLocalCharacterOverrides()
      ? 'scene-studio-browser-overrides-active'
      : this.browserOverrideStatus.kind === 'error'
        ? 'scene-studio-browser-overrides-error'
        : this.browserOverrideStatus.kind === 'loading'
          ? 'scene-studio-browser-overrides-loading'
          : 'scene-studio-browser-overrides-idle';
    const browserOverrideSnapshotJson = hasBrowserLocalCharacterOverrides()
      ? JSON.stringify(browserLocalCharacterExportSnapshot(
          this.browserOverrideStatus.detail?.packageLabel ?? null,
          this.compositionAssignmentSnapshot(),
        ), null, 2)
      : '';
    const compositionMode = state.workspaceMode === 'composition';

    this.services.audio.setScene('menu');
    this.services.telemetry.trackScreen('scene-studio', `${state.workspaceMode}:${state.presetId}:${state.viewportId}:${state.viewMode}`);
    this.shell.render(`<section class="panel scene-studio-screen" data-scene-studio-workspace="${state.workspaceMode}">
      ${panelHeaderMarkup(rawT('sceneStudio.eyebrow'), rawT('sceneStudio.title'), {
        settings: true,
        backLabel: rawT('common.back'),
        navigationLabel: rawT('common.navigation'),
        settingsLabel: rawT('common.settings'),
      })}
      <h2>${t('sceneStudio.heading')}</h2>
      <p class="panel-copy">${t('sceneStudio.copy')}</p>

      <div class="scene-studio-workspace-switch">
        <label><span>${escapeHtml(workspaceCopy.workspace)}</span><select id="scene-studio-workspace">
          <option value="composition"${compositionMode ? ' selected' : ''}>${escapeHtml(workspaceCopy.composition)}</option>
          <option value="story"${compositionMode ? '' : ' selected'}>${escapeHtml(workspaceCopy.storyQa)}</option>
        </select></label>
        <p>${escapeHtml(compositionMode ? workspaceCopy.compositionNote : workspaceCopy.storyQaNote)}</p>
      </div>

      <div class="scene-studio-controls">
        ${compositionMode ? `<label><span>${t('sceneStudio.mode')}</span><select id="scene-studio-mode">
          <option value="scene"${state.viewMode === 'scene' ? ' selected' : ''}>${t('sceneStudio.mode.scene')}</option>
          <option value="lineup"${state.viewMode === 'lineup' ? ' selected' : ''}>${t('sceneStudio.mode.lineup')}</option>
        </select></label>` : ''}
        <label><span>${t('sceneStudio.viewport')}</span><select id="scene-studio-viewport">
          ${sceneStudioViewportIds.map((id) => `<option value="${id}"${id === state.viewportId ? ' selected' : ''}>${id}</option>`).join('')}
        </select></label>
        ${compositionMode ? `<label><span>${t('sceneStudio.preset')}</span><select id="scene-studio-preset">
          ${sceneStagingPresetIds.map((id) => `<option value="${id}"${id === state.presetId ? ' selected' : ''}>${t(`sceneStudio.preset.${id}.title`)}</option>`).join('')}
        </select></label>
        <label><span>${t('sceneStudio.background')}</span><select id="scene-studio-background">
          ${sceneStudioBackgroundKeys.map((key) => `<option value="${key}"${key === state.background ? ' selected' : ''}>${t(`sceneStudio.background.${key}`)}</option>`).join('')}
        </select></label>` : `<label data-story-derived="preset"><span>${escapeHtml(workspaceCopy.derivedPreset)}</span><select disabled>
          <option>${t(`sceneStudio.preset.${state.presetId}.title`)}</option>
        </select></label>
        <label data-story-derived="background"><span>${escapeHtml(workspaceCopy.derivedBackground)}</span><select disabled>
          <option>${t(`sceneStudio.background.${state.background}`)}</option>
        </select></label>
        <label><span>${escapeHtml(workspaceCopy.authoredLine)}</span><select id="scene-studio-line">
          ${sceneStudioStoryLineIds.map((id) => `<option value="${id}"${id === state.lineId ? ' selected' : ''}>${id} · ${t(`vn.line.${id}.speaker`)}</option>`).join('')}
        </select></label>`}
        <label><span>${t('sceneStudio.textScale')}</span><select id="scene-studio-text-scale">
          <option value="normal"${state.textScale === 'normal' ? ' selected' : ''}>${t('sceneStudio.textScale.normal')}</option>
          <option value="large"${state.textScale === 'large' ? ' selected' : ''}>${t('sceneStudio.textScale.large')}</option>
        </select></label>
        <div class="scene-studio-control-actions">
          <button id="scene-studio-previous" data-target="${compositionMode ? previousPreset : previousStoryLine}">${t('sceneStudio.previous')}</button>
          <button id="scene-studio-guides" class="${state.showGuides ? 'is-active' : ''}" aria-pressed="${state.showGuides}">${t(state.showGuides ? 'sceneStudio.guides.hide' : 'sceneStudio.guides.show')}</button>
          <button id="scene-studio-next" data-target="${compositionMode ? nextPreset : nextStoryLine}">${t('sceneStudio.next')}</button>
        </div>
      </div>

      <section class="scene-studio-browser-overrides ${browserOverrideStatusClass}" data-browser-override-state="${this.browserOverrideStatus.kind}">
        <div class="scene-studio-section-title"><div><small>${escapeHtml(localOverrideCopy.eyebrow)}</small><b>${escapeHtml(localOverrideCopy.title)}</b></div><code>BROWSER LOCAL</code></div>
        <p>${escapeHtml(localOverrideCopy.copy)}</p>
        <input id="scene-studio-browser-override-file" type="file" accept=".zip,application/zip" hidden>
        <div class="scene-studio-browser-override-actions">
          <button id="scene-studio-browser-override-load" class="primary" ${this.browserOverrideStatus.kind === 'loading' ? 'disabled' : ''}>${escapeHtml(localOverrideCopy.load)}</button>
          <button id="scene-studio-browser-override-reset" ${hasBrowserLocalCharacterOverrides() ? '' : 'disabled'}>${escapeHtml(localOverrideCopy.reset)}</button>
        </div>
        <p class="scene-studio-browser-override-note">${escapeHtml(localOverrideCopy.note)}</p>
        <div class="scene-studio-browser-override-status">
          <b>${escapeHtml(this.browserOverrideStatus.message || (hasBrowserLocalCharacterOverrides() ? localOverrideCopy.activeStatus : localOverrideCopy.idleStatus))}</b>
          ${browserOverrides.length ? `<ul>${browserOverrides.map((summary) => `<li><code>${summary.character}</code><span>${escapeHtml(localOverrideCopy.summary(summary.frameCount, summary.poseB, summary.medallion, summary.assetCount))}</span></li>`).join('')}</ul>` : ''}
          ${this.browserOverrideStatus.detail?.warnings.length ? `<ul>${this.browserOverrideStatus.detail.warnings.map((warning) => `<li>${escapeHtml(warning)}</li>`).join('')}</ul>` : ''}
        </div>
        ${compositionMode && hasBrowserLocalCharacterOverrides() ? this.browserOverrideExportMarkup(localOverrideCopy, browserOverrideSnapshotJson) : ''}
      </section>

      ${compositionMode && state.viewMode === 'scene' && compositionActorSlots.length > 0
        ? this.compositionEditorMarkup(state.presetId, compositionActors, localOverrideCopy)
        : ''}

      <div class="scene-studio-device-scroll">
        <section class="scene-studio-device-shell" data-scene-preset="${state.presetId}" data-scene-viewport="${state.viewportId}" data-art-source="runtime" data-compact="${viewportProfile.compact}" aria-label="${t('sceneStudio.previewAria')}" style="${deviceStyle}">
          ${frame}
        </section>
      </div>

      <p class="scene-studio-summary">${t(`sceneStudio.preset.${state.presetId}.summary`)}</p>
      ${state.viewMode === 'lineup' ? this.lineupMetricsMarkup(t) : ''}
      <div class="scene-studio-status ${errorCount ? 'invalid' : warningCount || manualCount ? 'review' : 'valid'}">
        <b>${t(errorCount ? 'sceneStudio.validation.invalid' : warningCount || manualCount ? 'sceneStudio.validation.review' : 'sceneStudio.validation.valid')}</b>
        <span>${t('sceneStudio.validation.counts', { errors: errorCount, warnings: warningCount, manual: manualCount })}</span>
        <ul>${diagnostics.map((issue) => `<li data-severity="${issue.severity}"><b>${t(`sceneStudio.severity.${issue.severity}`)}</b><code>${issue.code}${issue.subject ? `:${escapeHtml(issue.subject)}` : ''}</code><span>${escapeHtml(issue.detail)}</span></li>`).join('')}</ul>
      </div>

      <section class="scene-studio-budget">
        <div class="scene-studio-section-title"><div><small>${t('sceneStudio.budget.eyebrow')}</small><b>${t('sceneStudio.budget.title')}</b></div><code>${sceneStagingManifest.format}</code></div>
        <div class="scene-studio-budget-grid">
          <article><small>${t('sceneStudio.budget.actorSlots')}</small><b>${resolution.preset.budget.actorSlots}</b></article>
          <article><small>${t('sceneStudio.budget.guestShells')}</small><b>${resolution.preset.budget.guestShells}</b></article>
          <article><small>${t('sceneStudio.budget.nativeUiSlots')}</small><b>${resolution.preset.budget.nativeUiSlots}</b></article>
          <article><small>${t('sceneStudio.budget.newArt')}</small><b>${resolution.preset.budget.newRuntimeArtAssets}</b></article>
          <article><small>${t('sceneStudio.budget.newBackgrounds')}</small><b>${resolution.preset.budget.newBackgroundMasters}</b></article>
          <article><small>${t('sceneStudio.budget.heroCloseups')}</small><b>${resolution.preset.budget.heroClueCloseups}</b></article>
        </div>
        <p>${t('sceneStudio.budget.note')}</p>
      </section>

      <section class="scene-studio-report">
        <div class="scene-studio-section-title"><div><small>${t('sceneStudio.report.eyebrow')}</small><b>${t('sceneStudio.report.title')}</b></div><code>${SCENE_STUDIO_QA_REPORT_FORMAT}</code></div>
        <textarea id="scene-studio-report" readonly spellcheck="false">${escapeHtml(report)}</textarea>
        <button id="scene-studio-copy-report">${t('sceneStudio.report.copy')}</button>
        <p>${t('sceneStudio.report.note')}</p>
      </section>
    </section>`);

    this.alignFocalEyeLineActors();

    const rerender = (patch: Partial<SceneStudioState>): void => this.render({ ...state, ...patch });
    this.root.querySelector('#back')?.addEventListener('click', () => this.navigation.showMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(state), true));
    this.root.querySelector<HTMLSelectElement>('#scene-studio-workspace')?.addEventListener('change', (event) => {
      const workspaceMode = (event.currentTarget as HTMLSelectElement).value === 'story' ? 'story' : 'composition';
      rerender({ workspaceMode, viewMode: workspaceMode === 'story' ? 'scene' : state.viewMode });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-mode')?.addEventListener('change', (event) => {
      rerender({ viewMode: (event.currentTarget as HTMLSelectElement).value as SceneStudioViewMode });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-viewport')?.addEventListener('change', (event) => {
      rerender({ viewportId: (event.currentTarget as HTMLSelectElement).value as SceneStudioViewportId });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-preset')?.addEventListener('change', (event) => {
      rerender({ presetId: (event.currentTarget as HTMLSelectElement).value as SceneStagingPresetId });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-background')?.addEventListener('change', (event) => {
      rerender({ background: (event.currentTarget as HTMLSelectElement).value as BackgroundKey });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-line')?.addEventListener('change', (event) => {
      rerender({ lineId: (event.currentTarget as HTMLSelectElement).value });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-text-scale')?.addEventListener('change', (event) => {
      rerender({ textScale: (event.currentTarget as HTMLSelectElement).value as TextScale });
    });
    this.root.querySelector('#scene-studio-previous')?.addEventListener('click', () => {
      if (compositionMode) rerender({ presetId: previousPreset });
      else rerender({ lineId: previousStoryLine });
    });
    this.root.querySelector('#scene-studio-next')?.addEventListener('click', () => {
      if (compositionMode) rerender({ presetId: nextPreset });
      else rerender({ lineId: nextStoryLine });
    });
    this.root.querySelector('#scene-studio-guides')?.addEventListener('click', () => rerender({ showGuides: !state.showGuides }));
    this.root.querySelector('#scene-studio-copy-report')?.addEventListener('click', () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(report);
    });
    const browserOverrideInput = this.root.querySelector<HTMLInputElement>('#scene-studio-browser-override-file');
    this.root.querySelector('#scene-studio-browser-override-load')?.addEventListener('click', () => browserOverrideInput?.click());
    this.root.querySelector('#scene-studio-browser-override-reset')?.addEventListener('click', () => {
      clearBrowserLocalCharacterOverrides();
      this.browserOverrideStatus = { kind: 'idle', message: localOverrideCopy.resetStatus };
      this.render(state);
    });
    browserOverrideInput?.addEventListener('change', () => {
      const file = browserOverrideInput.files?.[0];
      if (file) void this.loadBrowserOverrideZip(file);
      browserOverrideInput.value = '';
    });

    if (compositionMode) {
      for (const button of this.root.querySelectorAll<HTMLElement>('[data-composition-select-slot]')) {
        button.addEventListener('click', () => {
          const slotId = button.dataset.compositionSelectSlot;
          if (!slotId) return;
          this.selectedCompositionSlotId = slotId;
          this.render(state);
        });
      }
      for (const select of this.root.querySelectorAll<HTMLSelectElement>('[data-composition-character]')) {
        select.addEventListener('change', () => {
          const slotId = select.dataset.compositionCharacter;
          const character = select.value as ProductionCharacterKey;
          if (!slotId || !productionCharacterKeys.includes(character)) return;
          this.selectedCompositionSlotId = slotId;
          this.updateCompositionCharacter(state.presetId, slotId, character);
          this.render(state);
        });
      }
      for (const select of this.root.querySelectorAll<HTMLSelectElement>('[data-composition-expression]')) {
        select.addEventListener('change', () => {
          const slotId = select.dataset.compositionExpression;
          const expression = select.value as RuntimeExpression;
          if (!slotId || !runtimeExpressionOrder.includes(expression)) return;
          this.selectedCompositionSlotId = slotId;
          this.updateCompositionActor(state.presetId, slotId, { expression });
          this.render(state);
        });
      }
      for (const select of this.root.querySelectorAll<HTMLSelectElement>('[data-composition-pose]')) {
        select.addEventListener('change', () => {
          const slotId = select.dataset.compositionPose;
          const pose = select.value === 'pose-b' ? 'pose-b' : 'pose-a';
          if (!slotId) return;
          this.selectedCompositionSlotId = slotId;
          this.updateCompositionActor(state.presetId, slotId, { pose });
          this.render(state);
        });
      }
      for (const slider of this.root.querySelectorAll<HTMLInputElement>('[data-slot-calibration-field]')) {
        const updateOutput = (): void => {
          const output = slider.parentElement?.querySelector('output');
          if (!output) return;
          output.textContent = slider.dataset.slotCalibrationField === 'scale' ? `${slider.value}%` : `${slider.value}%`;
        };
        slider.addEventListener('input', updateOutput);
        slider.addEventListener('change', () => {
          const slotId = slider.dataset.slotId;
          const character = slider.dataset.slotCharacter as ProductionCharacterKey | undefined;
          const field = slider.dataset.slotCalibrationField as 'scale' | 'xPercent' | 'yPercent' | undefined;
          if (!slotId || !character || !field) return;
          const numericValue = Number(slider.value);
          const context = { presetId: state.presetId, slotId };
          applyBrowserLocalCharacterCalibration(
            character,
            field === 'scale' ? { scale: numericValue / 100 } : { [field]: numericValue },
            context,
          );
          this.render(state);
        });
      }
      for (const slider of this.root.querySelectorAll<HTMLInputElement>('[data-default-calibration-field]')) {
        const updateOutput = (): void => {
          const output = slider.parentElement?.querySelector('output');
          if (output) output.textContent = `${slider.value}%`;
        };
        slider.addEventListener('input', updateOutput);
        slider.addEventListener('change', () => {
          const character = slider.dataset.defaultCharacter as ProductionCharacterKey | undefined;
          const field = slider.dataset.defaultCalibrationField as 'scale' | 'xPercent' | 'yPercent' | undefined;
          if (!character || !field) return;
          const numericValue = Number(slider.value);
          applyBrowserLocalCharacterCalibration(
            character,
            field === 'scale' ? { scale: numericValue / 100 } : { [field]: numericValue },
          );
          this.render(state);
        });
      }
      for (const button of this.root.querySelectorAll<HTMLElement>('[data-reset-slot-calibration]')) {
        button.addEventListener('click', () => {
          const slotId = button.dataset.resetSlotCalibration;
          const character = button.dataset.slotCharacter as ProductionCharacterKey | undefined;
          if (!slotId || !character) return;
          resetBrowserLocalCharacterCalibration(character, { presetId: state.presetId, slotId });
          this.render(state);
        });
      }
      for (const button of this.root.querySelectorAll<HTMLElement>('[data-copy-default-to-slot]')) {
        button.addEventListener('click', () => {
          const slotId = button.dataset.copyDefaultToSlot;
          const character = button.dataset.slotCharacter as ProductionCharacterKey | undefined;
          if (!slotId || !character) return;
          copyBrowserLocalCharacterDefaultCalibrationToSlot(character, { presetId: state.presetId, slotId });
          this.render(state);
        });
      }
      for (const button of this.root.querySelectorAll<HTMLElement>('[data-reset-default-calibration]')) {
        button.addEventListener('click', () => {
          const character = button.dataset.resetDefaultCalibration as ProductionCharacterKey | undefined;
          if (!character) return;
          resetBrowserLocalCharacterDefaultCalibration(character);
          this.render(state);
        });
      }
      this.bindCompositionDrag(state);
      this.root.querySelector('#scene-studio-browser-override-copy-json')?.addEventListener('click', () => {
        if (typeof navigator !== 'undefined' && navigator.clipboard && browserOverrideSnapshotJson) void navigator.clipboard.writeText(browserOverrideSnapshotJson);
      });
      this.root.querySelector('#scene-studio-browser-override-download-json')?.addEventListener('click', () => {
        if (!browserOverrideSnapshotJson || typeof document === 'undefined' || typeof URL === 'undefined') return;
        const blob = new Blob([browserOverrideSnapshotJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'browser-local-character-overrides.json';
        link.click();
        URL.revokeObjectURL(url);
      });
    }
  }

  private compositionEditorMarkup(
    presetId: SceneStagingPresetId,
    actors: readonly SceneStagingActorInput[],
    copy: ReturnType<typeof browserOverrideCopy>,
  ): string {
    const slots = actorSlotsForPreset(presetId);
    const selectedSlotId = slots.some((slot) => slot.id === this.selectedCompositionSlotId)
      ? this.selectedCompositionSlotId
      : slots[0]?.id ?? null;
    const selectedIndex = selectedSlotId ? slots.findIndex((slot) => slot.id === selectedSlotId) : -1;
    const selectedActor = selectedIndex >= 0 ? actors[selectedIndex] : undefined;
    const selectedContext: BrowserLocalCharacterCalibrationContext | null = selectedSlotId
      ? { presetId, slotId: selectedSlotId }
      : null;
    const selectedCalibration = selectedActor && selectedContext
      ? browserLocalCharacterCalibration(selectedActor.character as ProductionCharacterKey, selectedContext)
      : null;
    const selectedHasOverride = selectedActor && selectedContext
      ? hasBrowserLocalCharacterSlotCalibration(selectedActor.character as ProductionCharacterKey, selectedContext)
      : false;

    return `<section class="scene-studio-composition-editor" data-composition-editor="${presetId}" data-selected-slot="${selectedSlotId ?? ''}">
      <div class="scene-studio-section-title"><div><small>${escapeHtml(copy.editorEyebrow)}</small><b>${escapeHtml(copy.editorTitle)}</b></div><code>${escapeHtml(presetId)}</code></div>
      <p>${escapeHtml(copy.editorCopy)}</p>
      <div class="scene-studio-composition-slot-grid">${slots.map((slot, index) => {
        const actor = actors[index];
        if (!actor) return '';
        const selected = slot.id === selectedSlotId;
        return `<article class="scene-studio-composition-slot-card${selected ? ' is-selected' : ''}" data-composition-slot="${slot.id}">
          <button class="scene-studio-composition-slot-select" data-composition-select-slot="${slot.id}">
            <small>${escapeHtml(this.slotPositionLabel(slots, slot, copy))}</small><b>${escapeHtml(characterProductionManifest.characters[actor.character as ProductionCharacterKey].shortName)}</b>
          </button>
          <label><span>${escapeHtml(copy.character)}</span><select data-composition-character="${slot.id}">
            ${productionCharacterKeys.map((character) => `<option value="${character}"${character === actor.character ? ' selected' : ''}>${escapeHtml(characterProductionManifest.characters[character].shortName)}</option>`).join('')}
          </select></label>
          <label><span>${escapeHtml(copy.expression)}</span><select data-composition-expression="${slot.id}">
            ${runtimeExpressionOrder.map((expression) => `<option value="${expression}"${expression === actor.expression ? ' selected' : ''}>${escapeHtml(expression)}</option>`).join('')}
          </select></label>
          <label><span>${escapeHtml(copy.pose)}</span><select data-composition-pose="${slot.id}">
            <option value="pose-a"${(actor.pose ?? 'pose-a') === 'pose-a' ? ' selected' : ''}>${escapeHtml(copy.poseA)}</option>
            <option value="pose-b"${actor.pose === 'pose-b' ? ' selected' : ''}>${escapeHtml(copy.poseB)}</option>
          </select></label>
        </article>`;
      }).join('')}</div>
      ${selectedActor && selectedContext && selectedCalibration ? `<div class="scene-studio-slot-calibration" data-calibration-slot="${selectedContext.slotId}" data-slot-override="${selectedHasOverride}">
        <header><div><small>${escapeHtml(copy.editing)}</small><b>${escapeHtml(this.slotPositionLabel(slots, slots[selectedIndex]!, copy))} · ${escapeHtml(characterProductionManifest.characters[selectedActor.character as ProductionCharacterKey].shortName)}</b></div><span>${escapeHtml(selectedHasOverride ? copy.customOverride : copy.usesDefault)}</span></header>
        <p>${escapeHtml(copy.dragHint)}</p>
        <div class="scene-studio-slot-calibration-controls">
          ${this.slotCalibrationRangeMarkup(selectedActor.character as ProductionCharacterKey, selectedContext.slotId, 'scale', copy.scale, Math.round(selectedCalibration.scale * 100), 70, 130, 1)}
          ${this.slotCalibrationRangeMarkup(selectedActor.character as ProductionCharacterKey, selectedContext.slotId, 'xPercent', copy.frameX, selectedCalibration.xPercent, -24, 24, 0.5)}
          ${this.slotCalibrationRangeMarkup(selectedActor.character as ProductionCharacterKey, selectedContext.slotId, 'yPercent', copy.frameY, selectedCalibration.yPercent, -24, 24, 0.5)}
        </div>
        <div class="scene-studio-browser-calibration-actions">
          <button data-copy-default-to-slot="${selectedContext.slotId}" data-slot-character="${selectedActor.character}">${escapeHtml(copy.copyDefaultToSlot)}</button>
          <button data-reset-slot-calibration="${selectedContext.slotId}" data-slot-character="${selectedActor.character}">${escapeHtml(copy.resetSlot)}</button>
        </div>
      </div>` : ''}
      <details class="scene-studio-character-defaults">
        <summary>${escapeHtml(copy.defaultsTitle)}</summary>
        <p>${escapeHtml(copy.defaultsCopy)}</p>
        <div class="scene-studio-character-default-grid">${productionCharacterKeys.map((character) => {
          const calibration = browserLocalCharacterCalibration(character);
          return `<article><header><b>${escapeHtml(characterProductionManifest.characters[character].shortName)}</b><code>${character}</code></header>
            ${this.defaultCalibrationRangeMarkup(character, 'scale', copy.scale, Math.round(calibration.scale * 100), 70, 130, 1)}
            ${this.defaultCalibrationRangeMarkup(character, 'xPercent', copy.frameX, calibration.xPercent, -24, 24, 0.5)}
            ${this.defaultCalibrationRangeMarkup(character, 'yPercent', copy.frameY, calibration.yPercent, -24, 24, 0.5)}
            <button data-reset-default-calibration="${character}">${escapeHtml(copy.resetDefault)}</button>
          </article>`;
        }).join('')}</div>
      </details>
    </section>`;
  }

  private slotCalibrationRangeMarkup(
    character: ProductionCharacterKey,
    slotId: string,
    field: 'scale' | 'xPercent' | 'yPercent',
    label: string,
    value: number,
    minimum: number,
    maximum: number,
    step: number,
  ): string {
    return `<label class="scene-studio-browser-calibration-control"><span>${escapeHtml(label)}</span><input type="range" min="${minimum}" max="${maximum}" step="${step}" value="${value}" data-slot-id="${slotId}" data-slot-character="${character}" data-slot-calibration-field="${field}"><output>${value}%</output></label>`;
  }

  private defaultCalibrationRangeMarkup(
    character: ProductionCharacterKey,
    field: 'scale' | 'xPercent' | 'yPercent',
    label: string,
    value: number,
    minimum: number,
    maximum: number,
    step: number,
  ): string {
    return `<label class="scene-studio-browser-calibration-control"><span>${escapeHtml(label)}</span><input type="range" min="${minimum}" max="${maximum}" step="${step}" value="${value}" data-default-character="${character}" data-default-calibration-field="${field}"><output>${value}%</output></label>`;
  }

  private slotPositionLabel(
    slots: readonly SceneStagingActorSlot[],
    slot: SceneStagingActorSlot,
    copy: ReturnType<typeof browserOverrideCopy>,
  ): string {
    if (slots.length === 1) return copy.center;
    const sorted = [...slots].sort((left, right) => left.anchorXPercent - right.anchorXPercent);
    const index = sorted.findIndex((candidate) => candidate.id === slot.id);
    if (index <= 0) return copy.left;
    if (index >= sorted.length - 1) return copy.right;
    return copy.center;
  }

  private updateCompositionActor(
    presetId: SceneStagingPresetId,
    slotId: string,
    patch: Partial<SceneStagingActorInput>,
  ): void {
    const slots = actorSlotsForPreset(presetId);
    const index = slots.findIndex((slot) => slot.id === slotId);
    if (index === -1) return;
    const current = [...(this.compositionAssignments[presetId] ?? sceneStudioSamples[presetId])];
    const actor = current[index];
    if (!actor) return;
    current[index] = { ...actor, ...patch };
    this.compositionAssignments = { ...this.compositionAssignments, [presetId]: current };
  }

  private updateCompositionCharacter(
    presetId: SceneStagingPresetId,
    slotId: string,
    character: ProductionCharacterKey,
  ): void {
    const slots = actorSlotsForPreset(presetId);
    const targetIndex = slots.findIndex((slot) => slot.id === slotId);
    if (targetIndex === -1) return;
    const current = [...(this.compositionAssignments[presetId] ?? sceneStudioSamples[presetId])];
    const targetActor = current[targetIndex];
    if (!targetActor) return;
    const existingIndex = current.findIndex((actor, index) => index !== targetIndex && actor.character === character);
    if (existingIndex !== -1) {
      const existingActor = current[existingIndex];
      if (!existingActor) return;
      current[targetIndex] = { ...existingActor };
      current[existingIndex] = { ...targetActor };
    } else {
      current[targetIndex] = { ...targetActor, character };
    }
    this.compositionAssignments = { ...this.compositionAssignments, [presetId]: current };
  }

  private compositionAssignmentSnapshot(): BrowserLocalCompositionAssignments {
    return Object.fromEntries(sceneStagingPresetIds.flatMap((presetId) => {
      const slots = actorSlotsForPreset(presetId);
      if (slots.length === 0) return [];
      const actors = this.compositionAssignments[presetId] ?? sceneStudioSamples[presetId];
      return [[presetId, Object.fromEntries(slots.flatMap((slot, index) => {
        const actor = actors[index];
        if (!actor) return [];
        return [[slot.id, {
          character: actor.character as ProductionCharacterKey,
          expression: actor.expression,
          pose: actor.pose ?? 'pose-a',
        }]];
      }))]];
    })) as BrowserLocalCompositionAssignments;
  }

  private bindCompositionDrag(state: SceneStudioState): void {
    if (state.workspaceMode !== 'composition' || state.viewMode !== 'scene') return;
    const stage = this.root.querySelector<HTMLElement>('[data-frame-context="scene-studio"] .stage');
    if (!stage) return;
    for (const portrait of this.root.querySelectorAll<HTMLElement>('.scene-studio-actor-slot[data-editor-draggable="true"] .scene-studio-runtime-portrait')) {
      portrait.addEventListener('pointerdown', (event) => {
        const actorSlot = portrait.closest<HTMLElement>('.scene-studio-actor-slot');
        const slotId = actorSlot?.dataset.slot;
        const character = actorSlot?.dataset.character as ProductionCharacterKey | undefined;
        if (!actorSlot || !slotId || !character) return;
        const rect = stage.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;
        event.preventDefault();
        this.selectedCompositionSlotId = slotId;
        const context = { presetId: state.presetId, slotId };
        const startCalibration = browserLocalCharacterCalibration(character, context);
        const slot = actorSlotsForPreset(state.presetId).find((candidate) => candidate.id === slotId);
        if (!slot) return;
        const startX = event.clientX;
        const startY = event.clientY;
        let nextX = startCalibration.xPercent;
        let nextY = startCalibration.yPercent;
        portrait.setPointerCapture?.(event.pointerId);
        const move = (moveEvent: PointerEvent): void => {
          nextX = clamp(startCalibration.xPercent + (moveEvent.clientX - startX) / rect.width * 100, -30, 30);
          nextY = clamp(startCalibration.yPercent + (moveEvent.clientY - startY) / rect.height * 100, -30, 30);
          actorSlot.style.setProperty('--scene-x', `${slot.anchorXPercent + nextX}%`);
          portrait.style.setProperty('--character-y', `${characterProductionManifest.characters[character].staging.yPercent + nextY}%`);
        };
        const finish = (): void => {
          portrait.removeEventListener('pointermove', move);
          applyBrowserLocalCharacterCalibration(character, { xPercent: nextX, yPercent: nextY }, context);
          this.render(state);
        };
        portrait.addEventListener('pointermove', move);
        portrait.addEventListener('pointerup', finish, { once: true });
        portrait.addEventListener('pointercancel', finish, { once: true });
      });
    }
  }

  private browserOverrideExportMarkup(copy: ReturnType<typeof browserOverrideCopy>, snapshotJson: string): string {
    return `<section class="scene-studio-browser-export">
      <div class="scene-studio-section-title"><div><small>${escapeHtml(copy.eyebrow)}</small><b>${escapeHtml(copy.exportTitle)}</b></div><code>JSON</code></div>
      <p>${escapeHtml(copy.exportCopy)}</p>
      <div class="scene-studio-browser-override-actions">
        <button id="scene-studio-browser-override-copy-json">${escapeHtml(copy.copyJson)}</button>
        <button id="scene-studio-browser-override-download-json">${escapeHtml(copy.downloadJson)}</button>
      </div>
      <textarea id="scene-studio-browser-override-json" readonly spellcheck="false">${escapeHtml(snapshotJson)}</textarea>
    </section>`;
  }

  private async loadBrowserOverrideZip(file: File): Promise<void> {
    const copy = browserOverrideCopy(this.services.localization.locale);
    this.browserOverrideStatus = { kind: 'loading', message: copy.loading(file.name) };
    this.render(this.state);
    try {
      const loaded = await loadBrowserLocalCharacterOverrideZip(file);
      applyBrowserLocalCharacterOverrides(loaded.overrides);
      this.browserOverrideStatus = {
        kind: 'ready',
        message: copy.loaded(file.name, loaded.result.activeAssetCount),
        detail: loaded.result,
      };
      this.render(this.state);
    } catch (error) {
      clearBrowserLocalCharacterOverrides();
      this.browserOverrideStatus = { kind: 'error', message: copy.failed(String(error)) };
      this.render(this.state);
    }
  }

  private normalizeState(requested: Partial<SceneStudioState>): SceneStudioState {
    const workspaceMode: SceneStudioWorkspaceMode = requested.workspaceMode === 'story' ? 'story' : 'composition';
    return {
      workspaceMode,
      presetId: requested.presetId && sceneStagingPresetIds.includes(requested.presetId) ? requested.presetId : DEFAULT_STATE.presetId,
      background: requested.background && sceneStudioBackgroundKeys.includes(requested.background) ? requested.background : DEFAULT_STATE.background,
      viewportId: requested.viewportId && sceneStudioViewportIds.includes(requested.viewportId) ? requested.viewportId : DEFAULT_STATE.viewportId,
      viewMode: workspaceMode === 'story' ? 'scene' : requested.viewMode === 'lineup' ? 'lineup' : 'scene',
      lineId: requested.lineId && sceneStudioStoryLineIds.includes(requested.lineId) ? requested.lineId : DEFAULT_STATE.lineId,
      textScale: requested.textScale === 'large' ? 'large' : 'normal',
      showGuides: requested.showGuides ?? DEFAULT_STATE.showGuides,
    };
  }

  private diagnostics(
    background: BackgroundKey,
    resolution: ReturnType<typeof resolveSceneStagingPreset>,
  ): readonly SceneStudioCalibrationIssue[] {
    const stagingIssues: SceneStudioCalibrationIssue[] = validateSceneStagingManifest().map((issue) => ({
      severity: 'error',
      code: 'staging-contract',
      subject: issue.preset ? `${issue.preset}${issue.slot ? `:${issue.slot}` : ''}` : undefined,
      detail: `${issue.code}: ${issue.detail}`,
    }));
    const cameraIssues: SceneStudioCalibrationIssue[] = resolution.actors.flatMap((actor) => {
      if (actor.verticalAnchor !== 'background-focal-eye-line') return [];
      const issues: SceneStudioCalibrationIssue[] = [];
      if (actor.resolvedEyeLinePercent === undefined ||
          Math.abs(actor.resolvedEyeLinePercent - SCENE_STUDIO_DEFAULT_EYE_LINE_PERCENT) > 0.05) {
        issues.push({
          severity: 'error',
          code: 'staging-contract',
          subject: `${resolution.preset.id}:${actor.slotId}`,
          detail: `${actor.character} eye-line does not resolve to the focal target.`,
        });
      }
      if (actor.portraitTopPercent <= 0 || actor.headTopPercent < 4) {
        issues.push({
          severity: 'error',
          code: 'staging-contract',
          subject: `${resolution.preset.id}:${actor.slotId}`,
          detail: `${actor.character} multi-actor camera lost required headroom or regressed to a fixed canvas top.`,
        });
      }
      return issues;
    });
    return [
      ...stagingIssues,
      ...cameraIssues,
      ...validateSceneStudioCalibration(),
      ...sceneStudioManualReviewIssues(background),
    ];
  }

  private sceneMarkup(
    resolution: ReturnType<typeof resolveSceneStagingPreset>,
    showGuides: boolean,
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
    editorInteractive = false,
  ): string {
    const guestWitnessMarkup = resolution.preset.id === 'guest-testimony-card'
      ? guestWitnessStageMarkup('hinata', t('sceneStudio.testimony.emotion'), t('sceneStudio.testimony.status'), 'scene-studio')
      : '';
    return [
      ...resolution.actors.map((actor) => this.actorMarkup(actor, showGuides, t, editorInteractive)),
      ...(guestWitnessMarkup ? [guestWitnessMarkup] : resolution.guestSlots.map((slot) => `<div class="scene-studio-guest-shell" data-slot="${slot.id}" style="${safeBoxStyle(slot.safeBox)};z-index:${slot.zIndex}">
        <span>G</span><b>${t('sceneStudio.guestShell.title')}</b><small>${t('sceneStudio.guestShell.label')}</small>
      </div>`)),
      ...(guestWitnessMarkup ? [] : resolution.nativeSlots.map((slot) => slot.kind === 'native-evidence'
        ? `<article class="scene-studio-native-card scene-studio-evidence-card" data-slot="${slot.id}" style="${safeBoxStyle(slot.safeBox)};z-index:${slot.zIndex}">
            <small>${t('sceneStudio.evidence.label')}</small><h3>${t('sceneStudio.evidence.title')}</h3><p>${t('sceneStudio.evidence.body')}</p>
            <div><span><b>0.18 mm</b><em>${t('sceneStudio.evidence.metricWidth')}</em></span><span><b>Cu/Ag</b><em>${t('sceneStudio.evidence.metricMaterial')}</em></span></div>
          </article>`
        : `<article class="scene-studio-native-card scene-studio-testimony-card" data-slot="${slot.id}" style="${safeBoxStyle(slot.safeBox)};z-index:${slot.zIndex}">
            <small>${t('sceneStudio.testimony.label')}</small><h3>${t('sceneStudio.testimony.title')}</h3><p>${t('sceneStudio.testimony.body')}</p><strong>${t('sceneStudio.testimony.status')}</strong>
          </article>`)),
      ...(showGuides ? resolution.preset.slots.map((slot) => `<span class="scene-studio-safe-box scene-studio-safe-box-${slot.kind}" data-guide="${slot.kind === 'actor' ? 'face-lane' : 'slot-safe-box'}" style="${safeBoxStyle(slot.safeBox)};z-index:${slot.zIndex + 10}" aria-hidden="true"><b>${t(`sceneStudio.slot.${slot.kind}`)}</b></span>`) : []),
    ].join('');
  }

  private actorMarkup(
    actor: ReturnType<typeof resolveSceneStagingPreset>['actors'][number],
    showGuides: boolean,
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
    editorInteractive = false,
  ): string {
    const asset = actor.pose === 'pose-b' ? poseAsset(actor.character) : expressionAsset(actor.character, actor.expression);
    const bounds = actor.frameAlphaBounds;
    const canvas = characterProductionManifest.frameCanvas;
    const guideFrameLabel = actor.guideGeometrySource === 'expression-frame'
      ? actor.expression
      : 'pose-b · neutral fallback';
    const style = [
      `--scene-x:${actor.anchorXPercent}%`,
      `--scene-z:${actor.zIndex}`,
      `--portrait-height:${actor.portraitHeightPercent}%`,
      `--portrait-top:${actor.portraitTopPercent}%`,
      `--portrait-bottom:${actor.portraitBottomPercent}%`,
      `--eye-line-percent:${actor.eyeLineRatio * 100}%`,
      `--frame-alpha-left:${bounds.left / canvas.width * 100}%`,
      `--frame-alpha-top:${bounds.top / canvas.height * 100}%`,
      `--frame-alpha-width:${(bounds.right - bounds.left) / canvas.width * 100}%`,
      `--frame-alpha-height:${(bounds.bottom - bounds.top) / canvas.height * 100}%`,
      `--character-scale:${actor.canonicalCharacterScale}`,
      `--character-y:${actor.canonicalCharacterYPercent}%`,
    ].join(';');
    const portraitStyle = `--character-scale:${actor.canonicalCharacterScale};--character-y:${actor.canonicalCharacterYPercent}%`;
    return `<div class="scene-studio-actor-slot${editorInteractive && actor.slotId === this.selectedCompositionSlotId ? ' is-editor-selected' : ''}" data-slot="${actor.slotId}" data-character="${actor.character}" data-role="${actor.role}" data-visual-approval="${actor.visualApproval}" data-art-source="runtime" data-editor-draggable="${editorInteractive}" style="${style}">
      <div class="portrait portrait-static-wrap scene-studio-runtime-portrait" data-shot-scale="${actor.shotScale}" data-runtime-crop="true" data-vertical-anchor="${actor.verticalAnchor}" data-guide-geometry="${actor.guideGeometrySource}" data-eye-line-y="${actor.eyeLineYPx}" data-eye-line-ratio="${actor.eyeLineRatio}" data-alpha-bounds="${bounds.left},${bounds.top},${bounds.right},${bounds.bottom}" style="${portraitStyle}"><img class="portrait-static" src="${asset}" alt="${t(`character.${actor.character}`)}">${showGuides ? `<i class="scene-studio-actor-alpha-box" aria-hidden="true"><b>${t(`character.${actor.character}`)}</b><small>${t('sceneStudio.guide.frameAlpha')} · ${guideFrameLabel}</small></i><i class="scene-studio-actor-eye-marker" aria-hidden="true"><b>${t('sceneStudio.guide.eyes')} · y=${actor.eyeLineYPx}</b></i>` : ''}</div>
    </div>`;
  }

  private alignFocalEyeLineActors(): void {
    const stage = this.root.querySelector<HTMLElement>('[data-frame-context="scene-studio"] .stage');
    const focal = this.root.querySelector<HTMLElement>('.scene-studio-focal-point');
    if (!stage || !focal) return;
    const stageRect = stage.getBoundingClientRect();
    const focalRect = focal.getBoundingClientRect();
    if (stageRect.height <= 0) return;
    const targetEyeLinePx = focalRect.top + focalRect.height / 2 - stageRect.top;
    for (const portrait of this.root.querySelectorAll<HTMLElement>('[data-vertical-anchor="background-focal-eye-line"]')) {
      const eyeLineRatio = Number(portrait.dataset.eyeLineRatio);
      const portraitHeightPx = portrait.getBoundingClientRect().height;
      if (!Number.isFinite(eyeLineRatio) || eyeLineRatio <= 0 || eyeLineRatio >= 1 || portraitHeightPx <= 0) continue;
      portrait.style.setProperty('--portrait-top', `${targetEyeLinePx - eyeLineRatio * portraitHeightPx}px`);
      portrait.dataset.resolvedEyeLinePx = targetEyeLinePx.toFixed(2);
    }
  }

  private lineupEntries(): readonly Readonly<{
    character: 'miku' | 'onoe' | 'ayuki' | 'emi';
    visualHeightPx: number;
    heightVsReference: number;
    bottomPaddingPx: number;
    alphaCenterOffsetPx: number;
    neutralEyeLineYPx: number;
    visualApproval: 'approved' | 'rebuild-required';
    asset: string;
    candidate: false;
  }>[] {
    return sceneStudioLineupMetrics().map((metric) => ({
      ...metric,
      asset: characterRigs[metric.character].frames.neutral,
      candidate: false as const,
    }));
  }

  private lineupMarkup(
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
  ): string {
    const metrics = this.lineupEntries();
    return `<div class="scene-studio-lineup" data-lineup-source="upds-character-production-v2" data-art-source="runtime">
      <div class="scene-studio-lineup-ruler" aria-hidden="true"><i style="bottom:90%">100%</i><i style="bottom:67.5%">75%</i><i style="bottom:45%">50%</i><i style="bottom:22.5%">25%</i></div>
      ${metrics.map((metric) => `<div class="scene-studio-lineup-character" data-character="${metric.character}" data-candidate="false" data-visual-height="${metric.visualHeightPx}" data-bottom-padding="${metric.bottomPaddingPx}" data-eye-line-y="${metric.neutralEyeLineYPx}" data-visual-approval="${metric.visualApproval}">
        <img src="${metric.asset}" alt="${t(`character.${metric.character}`)}">
        <span><b>${t(`character.${metric.character}`)}</b><small>${metric.visualHeightPx}px · ${(metric.heightVsReference * 100).toFixed(1)}% · ${metric.visualApproval}</small></span>
      </div>`).join('')}
    </div>`;
  }

  private lineupMetricsMarkup(
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
  ): string {
    return `<section class="scene-studio-lineup-metrics">
      <div class="scene-studio-section-title"><div><small>${t('sceneStudio.lineup.eyebrow')}</small><b>${t('sceneStudio.lineup.title')}</b></div><code>1024×1536</code></div>
      <div>${this.lineupEntries().map((metric) => `<article data-candidate="false"><b>${t(`character.${metric.character}`)}</b><span>${metric.visualHeightPx}px</span><small>${t('sceneStudio.lineup.metric', { ratio: (metric.heightVsReference * 100).toFixed(1), bottom: metric.bottomPaddingPx, center: metric.alphaCenterOffsetPx.toFixed(1) })}</small></article>`).join('')}</div>
      <p>${t('sceneStudio.lineup.note')}</p>
    </section>`;
  }

  private calibrationOverlayMarkup(
    backgroundKey: BackgroundKey,
    viewportId: SceneStudioViewportId,
    showGuides: boolean,
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
  ): string {
    const profile = sceneStudioCalibrationManifest.backgrounds[backgroundKey];
    const viewportProfile = sceneStudioCalibrationManifest.viewports[viewportId];
    const contain = resolveSceneStudioContainBox(viewportProfile.viewport, profile.master);
    const focal = backgroundPointToFramePercent(contain, profile.focalPoint.xPercent, profile.focalPoint.yPercent);
    const horizon = backgroundPointToFramePercent(contain, 50, profile.horizonYPercent);
    const footline = backgroundPointToFramePercent(contain, 50, profile.footlineYPercent);
    const actorZoneTopLeft = backgroundPointToFramePercent(contain, profile.actorZone.leftPercent, profile.actorZone.topPercent);
    const actorZoneBottomRight = backgroundPointToFramePercent(contain, profile.actorZone.rightPercent, profile.actorZone.bottomPercent);
    const insets = viewportProfile.representativeInsets;
    return `<div class="scene-studio-calibration-overlay ${showGuides ? 'is-visible' : 'is-hidden'}" aria-hidden="true">
      <span class="scene-studio-fit-box" style="left:${contain.leftPercent}%;top:${contain.topPercent}%;width:${contain.widthPercent}%;height:${contain.heightPercent}%"><b>${t('sceneStudio.guide.fit')}</b></span>
      <span class="scene-studio-actor-zone" style="left:${actorZoneTopLeft.xPercent}%;top:${actorZoneTopLeft.yPercent}%;width:${actorZoneBottomRight.xPercent - actorZoneTopLeft.xPercent}%;height:${actorZoneBottomRight.yPercent - actorZoneTopLeft.yPercent}%"><b>${t('sceneStudio.guide.actorZone')}</b></span>
      <span class="scene-studio-horizon" style="top:${horizon.yPercent}%"><b>${t('sceneStudio.guide.horizon')}</b></span>
      <span class="scene-studio-footline" style="top:${footline.yPercent}%"><b>${t('sceneStudio.guide.footline')}</b></span>
      <span class="scene-studio-focal-eye-line" style="top:${focal.yPercent}%"><b>${t('sceneStudio.guide.focalEyeLine')}</b></span>
      <span class="scene-studio-focal-point" style="left:${focal.xPercent}%;top:${focal.yPercent}%"><b>${t('sceneStudio.guide.focal')}</b></span>
      <span class="scene-studio-safe-band scene-studio-safe-band-top" style="height:${insets.top}px"><b>${t('sceneStudio.guide.safeArea')}</b></span>
      <span class="scene-studio-safe-band scene-studio-safe-band-bottom" style="height:${insets.bottom}px"></span>
    </div>`;
  }

  private qaReport(
    state: SceneStudioState,
    resolution: ReturnType<typeof resolveSceneStagingPreset>,
    diagnostics: readonly SceneStudioCalibrationIssue[],
    dialoguePages: number,
  ): string {
    return JSON.stringify({
      format: SCENE_STUDIO_QA_REPORT_FORMAT,
      writePolicy: 'read-only',
      workspaceMode: state.workspaceMode,
      runtimeFrame: 'shared-vn-frame',
      portraitPresentation: 'runtime-crop-dialogue-occluded',
      artSource: 'runtime',
      state,
      viewport: sceneStudioCalibrationManifest.viewports[state.viewportId],
      dialoguePages,
      backgroundCalibration: sceneStudioCalibrationManifest.backgrounds[state.background],
      actors: resolution.actors.map((actor) => ({
        slotId: actor.slotId,
        character: actor.character,
        expression: actor.expression,
        pose: actor.pose,
        role: actor.role,
        anchorXPercent: actor.anchorXPercent,
        anchorYPercent: actor.anchorYPercent,
        verticalAnchor: actor.verticalAnchor,
        shotScale: actor.shotScale,
        canonicalCharacterScale: actor.canonicalCharacterScale,
        effectiveScale: actor.effectiveScale,
        portraitHeightPercent: actor.portraitHeightPercent,
        portraitTopPercent: actor.portraitTopPercent,
        portraitBottomPercent: actor.portraitBottomPercent,
        frameAlphaBounds: actor.frameAlphaBounds,
        eyeLineYPx: actor.eyeLineYPx,
        resolvedEyeLinePercent: actor.resolvedEyeLinePercent,
        headTopPercent: actor.headTopPercent,
        guideGeometrySource: actor.guideGeometrySource,
        visualApproval: actor.visualApproval,
        artSource: 'runtime',
      })),
      lineup: this.lineupEntries(),
      diagnostics,
      acceptance: {
        automaticErrorsMustBeZero: true,
        manualGoldenSampleReviewRequired: true,
        directProductionWrite: false,
      },
    }, null, 2);
  }

}
