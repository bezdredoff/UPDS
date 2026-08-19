import {
  sceneStagingManifest,
  sceneStagingPresetIds,
  validateSceneStagingManifest,
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
import {
  EMI_NEUTRAL_CANDIDATE_ID,
  EMI_SERIOUS_CANDIDATE_ID,
  EMI_SMILE_CANDIDATE_ID,
  EMI_SURPRISED_CANDIDATE_ID,
  emiCandidateForArtSource,
  sceneStudioArtSources,
  validateEmiFrameCandidate,
  type SceneStudioArtSource,
} from '../../data/characterCandidates';
import { characterRigs, expressionAsset, poseAsset } from '../../data/characterRigs';
import {
  applyBrowserLocalCharacterOverrides,
  browserLocalCharacterOverrideSummaries,
  clearBrowserLocalCharacterOverrides,
  hasBrowserLocalCharacterOverrides,
} from '../../data/characterRuntimeOverrides';
import { characterProductionManifest } from '../../data/characterProduction';
import { backgroundAssets, sceneMeta, type BackgroundKey } from '../../data/narrative';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppShell } from '../../app/AppShell';
import {
  overrideResolvedActorFrameGeometry,
  resolveSceneStagingPreset,
  type ResolvedSceneStaging,
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
import { loadBrowserLocalCharacterOverrideZip, type BrowserLocalCharacterOverrideLoadResult } from './browserLocalCharacterOverrides';

export const sceneStudioBackgroundKeys = Object.keys(backgroundAssets) as BackgroundKey[];
export const sceneStudioDialogueLineIds = ['VN0002', 'VN0004', 'VN0008', 'VN0013', 'VN0022', 'VN0024', 'VN0026', 'VN0034', 'VN0038'] as const;
export type SceneStudioDialogueLineId = typeof sceneStudioDialogueLineIds[number];

export type SceneStudioState = Readonly<{
  presetId: SceneStagingPresetId;
  background: BackgroundKey;
  viewportId: SceneStudioViewportId;
  viewMode: SceneStudioViewMode;
  lineId: SceneStudioDialogueLineId;
  textScale: TextScale;
  showGuides: boolean;
  artSource: SceneStudioArtSource;
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

export const sceneStudioEmiCandidateSamples: Readonly<Record<SceneStagingPresetId, readonly SceneStagingActorInput[]>> = {
  'solo-close': [{ character: 'emi', expression: 'neutral' }],
  'solo-medium': [{ character: 'emi', expression: 'neutral' }],
  'two-shot-conflict': [
    { character: 'miku', expression: 'serious' },
    { character: 'emi', expression: 'neutral' },
  ],
  'two-shot-alliance': [
    { character: 'onoe', expression: 'neutral' },
    { character: 'emi', expression: 'neutral' },
  ],
  'trio-central-speaker': [
    { character: 'emi', expression: 'neutral' },
    { character: 'miku', expression: 'neutral' },
    { character: 'ayuki', expression: 'neutral' },
  ],
  'trio-reaction': [
    { character: 'ayuki', expression: 'surprised' },
    { character: 'miku', expression: 'neutral' },
    { character: 'emi', expression: 'neutral' },
  ],
  'evidence-cutaway': [],
  'guest-testimony-card': [],
};

export const sceneStudioEmiSmileCandidateSamples: Readonly<Record<SceneStagingPresetId, readonly SceneStagingActorInput[]>> = {
  'solo-close': [{ character: 'emi', expression: 'smile' }],
  'solo-medium': [{ character: 'emi', expression: 'smile' }],
  'two-shot-conflict': [
    { character: 'miku', expression: 'serious' },
    { character: 'emi', expression: 'smile' },
  ],
  'two-shot-alliance': [
    { character: 'onoe', expression: 'neutral' },
    { character: 'emi', expression: 'smile' },
  ],
  'trio-central-speaker': [
    { character: 'emi', expression: 'smile' },
    { character: 'miku', expression: 'neutral' },
    { character: 'ayuki', expression: 'neutral' },
  ],
  'trio-reaction': [
    { character: 'ayuki', expression: 'surprised' },
    { character: 'miku', expression: 'neutral' },
    { character: 'emi', expression: 'smile' },
  ],
  'evidence-cutaway': [],
  'guest-testimony-card': [],
};

export const sceneStudioEmiSeriousCandidateSamples: Readonly<Record<SceneStagingPresetId, readonly SceneStagingActorInput[]>> = {
  'solo-close': [{ character: 'emi', expression: 'serious' }],
  'solo-medium': [{ character: 'emi', expression: 'serious' }],
  'two-shot-conflict': [
    { character: 'miku', expression: 'serious' },
    { character: 'emi', expression: 'serious' },
  ],
  'two-shot-alliance': [
    { character: 'onoe', expression: 'neutral' },
    { character: 'emi', expression: 'serious' },
  ],
  'trio-central-speaker': [
    { character: 'emi', expression: 'serious' },
    { character: 'miku', expression: 'neutral' },
    { character: 'ayuki', expression: 'neutral' },
  ],
  'trio-reaction': [
    { character: 'ayuki', expression: 'surprised' },
    { character: 'miku', expression: 'neutral' },
    { character: 'emi', expression: 'serious' },
  ],
  'evidence-cutaway': [],
  'guest-testimony-card': [],
};

export const sceneStudioEmiSurprisedCandidateSamples: Readonly<Record<SceneStagingPresetId, readonly SceneStagingActorInput[]>> = {
  'solo-close': [{ character: 'emi', expression: 'surprised' }],
  'solo-medium': [{ character: 'emi', expression: 'surprised' }],
  'two-shot-conflict': [
    { character: 'miku', expression: 'serious' },
    { character: 'emi', expression: 'surprised' },
  ],
  'two-shot-alliance': [
    { character: 'onoe', expression: 'neutral' },
    { character: 'emi', expression: 'surprised' },
  ],
  'trio-central-speaker': [
    { character: 'emi', expression: 'surprised' },
    { character: 'miku', expression: 'neutral' },
    { character: 'ayuki', expression: 'neutral' },
  ],
  'trio-reaction': [
    { character: 'ayuki', expression: 'surprised' },
    { character: 'miku', expression: 'neutral' },
    { character: 'emi', expression: 'surprised' },
  ],
  'evidence-cutaway': [],
  'guest-testimony-card': [],
};

const defaultLineForPreset: Readonly<Record<SceneStagingPresetId, SceneStudioDialogueLineId>> = {
  'solo-close': 'VN0002',
  'solo-medium': 'VN0004',
  'two-shot-conflict': 'VN0002',
  'two-shot-alliance': 'VN0004',
  'trio-central-speaker': 'VN0002',
  'trio-reaction': 'VN0038',
  'evidence-cutaway': 'VN0004',
  'guest-testimony-card': 'VN0022',
};

const DEFAULT_STATE: SceneStudioState = {
  presetId: 'solo-close',
  background: 'clubroom',
  viewportId: '390x844',
  viewMode: 'scene',
  lineId: 'VN0024',
  textScale: 'normal',
  showGuides: true,
  artSource: EMI_SURPRISED_CANDIDATE_ID,
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

  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(requested: Partial<SceneStudioState> = {}): void {
    let state = this.normalizeState(requested);
    if (hasBrowserLocalCharacterOverrides() && state.artSource !== 'runtime') state = { ...state, artSource: 'runtime' };
    this.state = state;
    const authoredShot = resolveAuthoredVnShot(state.lineId);
    if (authoredShot) {
      state = {
        ...state,
        presetId: authoredShot.shot.presetId,
        background: authoredShot.shot.background,
        artSource: 'runtime',
      };
    }
    const sampleSet = state.artSource === EMI_NEUTRAL_CANDIDATE_ID
      ? sceneStudioEmiCandidateSamples
      : state.artSource === EMI_SMILE_CANDIDATE_ID
        ? sceneStudioEmiSmileCandidateSamples
        : state.artSource === EMI_SERIOUS_CANDIDATE_ID
          ? sceneStudioEmiSeriousCandidateSamples
          : state.artSource === EMI_SURPRISED_CANDIDATE_ID
            ? sceneStudioEmiSurprisedCandidateSamples
            : sceneStudioSamples;
    const runtimeResolution = authoredShot?.staging ?? resolveSceneStagingPreset(state.presetId, sampleSet[state.presetId]);
    const resolution = this.applyArtSource(runtimeResolution, state.artSource);
    const viewportProfile = sceneStudioCalibrationManifest.viewports[state.viewportId];
    const backgroundProfile = sceneStudioCalibrationManifest.backgrounds[state.background];
    const presetIndex = sceneStagingPresetIds.indexOf(state.presetId);
    const previousPreset = sceneStagingPresetIds[(presetIndex - 1 + sceneStagingPresetIds.length) % sceneStagingPresetIds.length];
    const nextPreset = sceneStagingPresetIds[(presetIndex + 1) % sceneStagingPresetIds.length];
    const rawT = (key: string, params: Readonly<Record<string, string | number | boolean>> = {}): string => this.services.localization.t(key, params);
    const t = (key: string, params: Readonly<Record<string, string | number | boolean>> = {}): string => escapeHtml(rawT(key, params));
    const localOverrideCopy = browserOverrideCopy(this.services.localization.locale);
    const line = {
      speaker: rawT(`vn.line.${state.lineId}.speaker`),
      emotion: rawT(`vn.line.${state.lineId}.emotion`),
      text: rawT(`vn.line.${state.lineId}.text`),
    };
    const dialoguePages = paginateDialogueText(line.text, {
      width: viewportProfile.viewport.width,
      height: viewportProfile.viewport.height,
      textScale: state.textScale,
    });
    const diagnostics = this.diagnostics(state.background, resolution, state.artSource);
    const stageMarkup = state.viewMode === 'lineup'
      ? this.lineupMarkup(t, state.artSource)
      : this.sceneMarkup(resolution, state.showGuides, state.artSource, t);
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
      lineId: state.lineId,
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

    this.services.audio.setScene('menu');
    this.services.telemetry.trackScreen('scene-studio', `${state.presetId}:${state.viewportId}:${state.viewMode}`);
    this.shell.render(`<section class="panel scene-studio-screen">
      ${panelHeaderMarkup(rawT('sceneStudio.eyebrow'), rawT('sceneStudio.title'), {
        settings: true,
        backLabel: rawT('common.back'),
        navigationLabel: rawT('common.navigation'),
        settingsLabel: rawT('common.settings'),
      })}
      <h2>${t('sceneStudio.heading')}</h2>
      <p class="panel-copy">${t('sceneStudio.copy')}</p>

      <div class="scene-studio-controls">
        <label><span>${t('sceneStudio.mode')}</span><select id="scene-studio-mode">
          <option value="scene"${state.viewMode === 'scene' ? ' selected' : ''}>${t('sceneStudio.mode.scene')}</option>
          <option value="lineup"${state.viewMode === 'lineup' ? ' selected' : ''}>${t('sceneStudio.mode.lineup')}</option>
        </select></label>
        <label><span>${t('sceneStudio.artSource')}</span><select id="scene-studio-art-source">
          ${sceneStudioArtSources.map((source) => `<option value="${source}"${source === state.artSource ? ' selected' : ''}>${t(`sceneStudio.artSource.${source}`)}</option>`).join('')}
        </select></label>
        <label><span>${t('sceneStudio.viewport')}</span><select id="scene-studio-viewport">
          ${sceneStudioViewportIds.map((id) => `<option value="${id}"${id === state.viewportId ? ' selected' : ''}>${id}</option>`).join('')}
        </select></label>
        <label><span>${t('sceneStudio.preset')}</span><select id="scene-studio-preset">
          ${sceneStagingPresetIds.map((id) => `<option value="${id}"${id === state.presetId ? ' selected' : ''}>${t(`sceneStudio.preset.${id}.title`)}</option>`).join('')}
        </select></label>
        <label><span>${t('sceneStudio.background')}</span><select id="scene-studio-background">
          ${sceneStudioBackgroundKeys.map((key) => `<option value="${key}"${key === state.background ? ' selected' : ''}>${t(`sceneStudio.background.${key}`)}</option>`).join('')}
        </select></label>
        <label><span>${t('sceneStudio.line')}</span><select id="scene-studio-line">
          ${sceneStudioDialogueLineIds.map((id) => `<option value="${id}"${id === state.lineId ? ' selected' : ''}>${id} · ${t(`vn.line.${id}.speaker`)}</option>`).join('')}
        </select></label>
        <label><span>${t('sceneStudio.textScale')}</span><select id="scene-studio-text-scale">
          <option value="normal"${state.textScale === 'normal' ? ' selected' : ''}>${t('sceneStudio.textScale.normal')}</option>
          <option value="large"${state.textScale === 'large' ? ' selected' : ''}>${t('sceneStudio.textScale.large')}</option>
        </select></label>
        <div class="scene-studio-control-actions">
          <button id="scene-studio-previous" data-preset="${previousPreset}">${t('sceneStudio.previous')}</button>
          <button id="scene-studio-guides" class="${state.showGuides ? 'is-active' : ''}" aria-pressed="${state.showGuides}">${t(state.showGuides ? 'sceneStudio.guides.hide' : 'sceneStudio.guides.show')}</button>
          <button id="scene-studio-next" data-preset="${nextPreset}">${t('sceneStudio.next')}</button>
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
      </section>

      <div class="scene-studio-device-scroll">
        <section class="scene-studio-device-shell" data-scene-preset="${state.presetId}" data-scene-viewport="${state.viewportId}" data-art-source="${state.artSource}" data-compact="${viewportProfile.compact}" aria-label="${t('sceneStudio.previewAria')}" style="${deviceStyle}">
          ${frame}
        </section>
      </div>

      <p class="scene-studio-summary">${t(`sceneStudio.preset.${state.presetId}.summary`)}</p>
      ${state.viewMode === 'lineup' ? this.lineupMetricsMarkup(t, state.artSource) : ''}
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
    this.root.querySelector<HTMLSelectElement>('#scene-studio-mode')?.addEventListener('change', (event) => {
      rerender({ viewMode: (event.currentTarget as HTMLSelectElement).value as SceneStudioViewMode });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-art-source')?.addEventListener('change', (event) => {
      const artSource = (event.currentTarget as HTMLSelectElement).value as SceneStudioArtSource;
      rerender({
        artSource,
        lineId: artSource === 'runtime' ? defaultLineForPreset[state.presetId] : 'VN0024',
      });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-viewport')?.addEventListener('change', (event) => {
      rerender({ viewportId: (event.currentTarget as HTMLSelectElement).value as SceneStudioViewportId });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-preset')?.addEventListener('change', (event) => {
      const presetId = (event.currentTarget as HTMLSelectElement).value as SceneStagingPresetId;
      rerender({ presetId, lineId: defaultLineForPreset[presetId] });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-background')?.addEventListener('change', (event) => {
      rerender({ background: (event.currentTarget as HTMLSelectElement).value as BackgroundKey });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-line')?.addEventListener('change', (event) => {
      rerender({ lineId: (event.currentTarget as HTMLSelectElement).value as SceneStudioDialogueLineId });
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-text-scale')?.addEventListener('change', (event) => {
      rerender({ textScale: (event.currentTarget as HTMLSelectElement).value as TextScale });
    });
    this.root.querySelector('#scene-studio-previous')?.addEventListener('click', () => rerender({ presetId: previousPreset, lineId: defaultLineForPreset[previousPreset] }));
    this.root.querySelector('#scene-studio-next')?.addEventListener('click', () => rerender({ presetId: nextPreset, lineId: defaultLineForPreset[nextPreset] }));
    this.root.querySelector('#scene-studio-guides')?.addEventListener('click', () => rerender({ showGuides: !state.showGuides }));
    this.root.querySelector('#scene-studio-copy-report')?.addEventListener('click', () => {
      if (typeof navigator !== 'undefined' && navigator.clipboard) void navigator.clipboard.writeText(report);
    });
    const browserOverrideInput = this.root.querySelector<HTMLInputElement>('#scene-studio-browser-override-file');
    this.root.querySelector('#scene-studio-browser-override-load')?.addEventListener('click', () => browserOverrideInput?.click());
    this.root.querySelector('#scene-studio-browser-override-reset')?.addEventListener('click', () => {
      clearBrowserLocalCharacterOverrides();
      this.browserOverrideStatus = { kind: 'idle', message: localOverrideCopy.resetStatus };
      this.render({ ...state, artSource: 'runtime' });
    });
    browserOverrideInput?.addEventListener('change', () => {
      const file = browserOverrideInput.files?.[0];
      if (file) void this.loadBrowserOverrideZip(file);
      browserOverrideInput.value = '';
    });
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
      this.render({ ...this.state, artSource: 'runtime' });
    } catch (error) {
      clearBrowserLocalCharacterOverrides();
      this.browserOverrideStatus = { kind: 'error', message: copy.failed(String(error)) };
      this.render(this.state);
    }
  }

  private normalizeState(requested: Partial<SceneStudioState>): SceneStudioState {
    return {
      presetId: requested.presetId && sceneStagingPresetIds.includes(requested.presetId) ? requested.presetId : DEFAULT_STATE.presetId,
      background: requested.background && sceneStudioBackgroundKeys.includes(requested.background) ? requested.background : DEFAULT_STATE.background,
      viewportId: requested.viewportId && sceneStudioViewportIds.includes(requested.viewportId) ? requested.viewportId : DEFAULT_STATE.viewportId,
      viewMode: requested.viewMode === 'lineup' ? 'lineup' : 'scene',
      lineId: requested.lineId && sceneStudioDialogueLineIds.includes(requested.lineId) ? requested.lineId : DEFAULT_STATE.lineId,
      textScale: requested.textScale === 'large' ? 'large' : 'normal',
      showGuides: requested.showGuides ?? DEFAULT_STATE.showGuides,
      artSource: requested.artSource && sceneStudioArtSources.includes(requested.artSource)
        ? requested.artSource
        : DEFAULT_STATE.artSource,
    };
  }

  private applyArtSource(
    resolution: ResolvedSceneStaging,
    artSource: SceneStudioArtSource,
  ): ResolvedSceneStaging {
    const candidate = emiCandidateForArtSource(artSource);
    if (!candidate) return resolution;
    return {
      ...resolution,
      actors: resolution.actors.map((actor) => actor.character === candidate.character
        ? overrideResolvedActorFrameGeometry(actor, candidate.geometry)
        : actor),
    };
  }

  private diagnostics(
    background: BackgroundKey,
    resolution: ReturnType<typeof resolveSceneStagingPreset>,
    artSource: SceneStudioArtSource,
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
    const candidate = emiCandidateForArtSource(artSource);
    const candidateIssues: SceneStudioCalibrationIssue[] = candidate
      ? [
          ...validateEmiFrameCandidate(candidate).map((detail) => ({
            severity: 'error' as const,
            code: 'staging-contract' as const,
            subject: candidate.id,
            detail,
          })),
          {
            severity: 'manual',
            code: 'visual-style',
            subject: candidate.id,
            detail: candidate.status === 'manual-qa'
              ? `Emi ${candidate.expression} R1 is a Studio-only multi-ROI candidate awaiting lineup, solo, duo and trio approval; runtime assets remain unchanged.`
              : `Emi ${candidate.expression} R1 is an approved authoring reference; runtime assets remain unchanged until the complete expression family is accepted.`,
          },
        ]
      : [];
    return [
      ...stagingIssues,
      ...cameraIssues,
      ...candidateIssues,
      ...validateSceneStudioCalibration(),
      ...sceneStudioManualReviewIssues(background),
    ];
  }

  private sceneMarkup(
    resolution: ReturnType<typeof resolveSceneStagingPreset>,
    showGuides: boolean,
    artSource: SceneStudioArtSource,
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
  ): string {
    const guestWitnessMarkup = resolution.preset.id === 'guest-testimony-card'
      ? guestWitnessStageMarkup('hinata', t('sceneStudio.testimony.emotion'), t('sceneStudio.testimony.status'), 'scene-studio')
      : '';
    return [
      ...resolution.actors.map((actor) => this.actorMarkup(actor, showGuides, artSource, t)),
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
    artSource: SceneStudioArtSource,
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
  ): string {
    const candidate = emiCandidateForArtSource(artSource);
    const usesCandidate = candidate !== null && actor.character === candidate.character &&
      actor.pose === 'pose-a' && actor.expression === candidate.expression;
    const asset = usesCandidate
      ? candidate.asset
      : actor.pose === 'pose-b' ? poseAsset(actor.character) : expressionAsset(actor.character, actor.expression);
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
    const approval = usesCandidate ? candidate.status : actor.visualApproval;
    const source = usesCandidate ? candidate.id : 'runtime';
    return `<div class="scene-studio-actor-slot" data-slot="${actor.slotId}" data-character="${actor.character}" data-role="${actor.role}" data-visual-approval="${approval}" data-art-source="${source}" style="${style}">
      <div class="portrait portrait-static-wrap scene-studio-runtime-portrait" data-shot-scale="${actor.shotScale}" data-runtime-crop="true" data-vertical-anchor="${actor.verticalAnchor}" data-guide-geometry="${actor.guideGeometrySource}" data-eye-line-y="${actor.eyeLineYPx}" data-eye-line-ratio="${actor.eyeLineRatio}" data-alpha-bounds="${bounds.left},${bounds.top},${bounds.right},${bounds.bottom}"><img class="portrait-static" src="${asset}" alt="${t(`character.${actor.character}`)}">${showGuides ? `<i class="scene-studio-actor-alpha-box" aria-hidden="true"><b>${t(`character.${actor.character}`)}</b><small>${t('sceneStudio.guide.frameAlpha')} · ${usesCandidate ? candidate.id : guideFrameLabel}</small></i><i class="scene-studio-actor-eye-marker" aria-hidden="true"><b>${t('sceneStudio.guide.eyes')} · y=${actor.eyeLineYPx}</b></i>` : ''}</div>
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

  private lineupEntries(artSource: SceneStudioArtSource): readonly Readonly<{
    character: 'miku' | 'onoe' | 'ayuki' | 'emi';
    visualHeightPx: number;
    heightVsReference: number;
    bottomPaddingPx: number;
    alphaCenterOffsetPx: number;
    neutralEyeLineYPx: number;
    visualApproval: 'approved' | 'approved-master' | 'approved-expression' | 'rebuild-required' | 'manual-qa';
    asset: string;
    candidate: boolean;
  }>[] {
    const referenceHeight = characterProductionManifest.characters.onoe.proportion.visualHeightPx;
    const selectedCandidate = emiCandidateForArtSource(artSource);
    return sceneStudioLineupMetrics().map((metric) => {
      const candidate = selectedCandidate !== null && metric.character === selectedCandidate.character;
      return candidate
        ? {
            ...metric,
            visualHeightPx: selectedCandidate.visualHeightPx,
            heightVsReference: selectedCandidate.visualHeightPx / referenceHeight,
            bottomPaddingPx: selectedCandidate.bottomPaddingPx,
            alphaCenterOffsetPx: selectedCandidate.alphaCenterOffsetPx,
            neutralEyeLineYPx: selectedCandidate.geometry.eyeLineYPx,
            visualApproval: selectedCandidate.status,
            asset: selectedCandidate.asset,
            candidate: true,
          }
        : {
            ...metric,
            asset: characterRigs[metric.character].frames.neutral,
            candidate: false,
          };
    });
  }

  private lineupMarkup(
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
    artSource: SceneStudioArtSource,
  ): string {
    const metrics = this.lineupEntries(artSource);
    const source = emiCandidateForArtSource(artSource)
      ? 'upds-character-production-v2+upds-character-candidate-v1'
      : 'upds-character-production-v2';
    return `<div class="scene-studio-lineup" data-lineup-source="${source}" data-art-source="${artSource}">
      <div class="scene-studio-lineup-ruler" aria-hidden="true"><i style="bottom:90%">100%</i><i style="bottom:67.5%">75%</i><i style="bottom:45%">50%</i><i style="bottom:22.5%">25%</i></div>
      ${metrics.map((metric) => `<div class="scene-studio-lineup-character" data-character="${metric.character}" data-candidate="${metric.candidate}" data-visual-height="${metric.visualHeightPx}" data-bottom-padding="${metric.bottomPaddingPx}" data-eye-line-y="${metric.neutralEyeLineYPx}" data-visual-approval="${metric.visualApproval}">
        <img src="${metric.asset}" alt="${t(`character.${metric.character}`)}">
        <span><b>${t(`character.${metric.character}`)}</b><small>${metric.visualHeightPx}px · ${(metric.heightVsReference * 100).toFixed(1)}% · ${metric.visualApproval}</small></span>
      </div>`).join('')}
    </div>`;
  }

  private lineupMetricsMarkup(
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
    artSource: SceneStudioArtSource,
  ): string {
    return `<section class="scene-studio-lineup-metrics">
      <div class="scene-studio-section-title"><div><small>${t('sceneStudio.lineup.eyebrow')}</small><b>${t('sceneStudio.lineup.title')}</b></div><code>1024×1536</code></div>
      <div>${this.lineupEntries(artSource).map((metric) => `<article data-candidate="${metric.candidate}"><b>${t(`character.${metric.character}`)}</b><span>${metric.visualHeightPx}px</span><small>${t('sceneStudio.lineup.metric', { ratio: (metric.heightVsReference * 100).toFixed(1), bottom: metric.bottomPaddingPx, center: metric.alphaCenterOffsetPx.toFixed(1) })}</small></article>`).join('')}</div>
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
      runtimeFrame: 'shared-vn-frame',
      portraitPresentation: 'runtime-crop-dialogue-occluded',
      state,
      viewport: sceneStudioCalibrationManifest.viewports[state.viewportId],
      dialoguePages,
      backgroundCalibration: sceneStudioCalibrationManifest.backgrounds[state.background],
      candidate: emiCandidateForArtSource(state.artSource),
      actors: resolution.actors.map((actor) => {
        const candidate = emiCandidateForArtSource(state.artSource);
        const usesCandidate = candidate !== null && actor.character === candidate.character &&
          actor.pose === 'pose-a' && actor.expression === candidate.expression;
        return {
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
        visualApproval: usesCandidate ? candidate.status : actor.visualApproval,
        artSource: usesCandidate ? candidate.id : 'runtime',
        asset: usesCandidate ? candidate.asset : undefined,
      };
      }),
      lineup: this.lineupEntries(state.artSource),
      diagnostics,
      acceptance: {
        automaticErrorsMustBeZero: true,
        manualGoldenSampleReviewRequired: true,
        directProductionWrite: false,
      },
    }, null, 2);
  }
}
