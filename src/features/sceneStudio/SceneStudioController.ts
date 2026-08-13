import {
  sceneStagingManifest,
  sceneStagingPresetIds,
  validateSceneStagingManifest,
  type SceneStagingPresetId,
  type SceneStagingSafeBox,
} from '../../data/sceneStaging';
import { characterRigs, expressionAsset } from '../../data/characterRigs';
import { backgroundAssets, type BackgroundKey } from '../../data/narrative';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppShell } from '../../app/AppShell';
import { resolveSceneStagingPreset, type SceneStagingActorInput } from '../../ui/sceneStaging';
import { escapeHtml, panelHeaderMarkup } from '../../ui/viewMarkup';

export const sceneStudioBackgroundKeys = Object.keys(backgroundAssets) as BackgroundKey[];

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

const safeBoxStyle = (safeBox: SceneStagingSafeBox): string => [
  `left:${safeBox.leftPercent}%`,
  `top:${safeBox.topPercent}%`,
  `width:${safeBox.rightPercent - safeBox.leftPercent}%`,
  `height:${safeBox.bottomPercent - safeBox.topPercent}%`,
].join(';');

export class SceneStudioController {
  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(requestedPreset: SceneStagingPresetId = 'solo-close', requestedBackground: BackgroundKey = 'clubroom'): void {
    const presetId = sceneStagingPresetIds.includes(requestedPreset) ? requestedPreset : 'solo-close';
    const background = sceneStudioBackgroundKeys.includes(requestedBackground) ? requestedBackground : 'clubroom';
    const resolution = resolveSceneStagingPreset(presetId, sceneStudioSamples[presetId]);
    const issues = validateSceneStagingManifest();
    const presetIndex = sceneStagingPresetIds.indexOf(presetId);
    const previousPreset = sceneStagingPresetIds[(presetIndex - 1 + sceneStagingPresetIds.length) % sceneStagingPresetIds.length];
    const nextPreset = sceneStagingPresetIds[(presetIndex + 1) % sceneStagingPresetIds.length];
    const t = (key: string, params: Readonly<Record<string, string | number | boolean>> = {}) => escapeHtml(this.services.localization.t(key, params));

    this.services.audio.setScene('menu');
    this.services.telemetry.trackScreen('scene-studio', presetId);
    this.shell.render(`<section class="panel scene-studio-screen">
      ${panelHeaderMarkup(this.services.localization.t('sceneStudio.eyebrow'), this.services.localization.t('sceneStudio.title'), {
        settings: true,
        backLabel: this.services.localization.t('common.back'),
        navigationLabel: this.services.localization.t('common.navigation'),
        settingsLabel: this.services.localization.t('common.settings'),
      })}
      <h2>${t('sceneStudio.heading')}</h2>
      <p class="panel-copy">${t('sceneStudio.copy')}</p>

      <div class="scene-studio-controls">
        <label><span>${t('sceneStudio.preset')}</span><select id="scene-studio-preset">
          ${sceneStagingPresetIds.map((id) => `<option value="${id}"${id === presetId ? ' selected' : ''}>${t(`sceneStudio.preset.${id}.title`)}</option>`).join('')}
        </select></label>
        <label><span>${t('sceneStudio.background')}</span><select id="scene-studio-background">
          ${sceneStudioBackgroundKeys.map((key) => `<option value="${key}"${key === background ? ' selected' : ''}>${t(`sceneStudio.background.${key}`)}</option>`).join('')}
        </select></label>
        <div class="scene-studio-control-actions">
          <button id="scene-studio-previous" data-preset="${previousPreset}">${t('sceneStudio.previous')}</button>
          <button id="scene-studio-next" data-preset="${nextPreset}">${t('sceneStudio.next')}</button>
        </div>
      </div>

      <section class="scene-studio-preview" data-scene-preset="${presetId}" aria-label="${t('sceneStudio.previewAria')}">
        <div class="scene-studio-background-stack" aria-hidden="true">
          <img class="scene-studio-background scene-studio-background-fill" src="${backgroundAssets[background]}" alt="">
          <img class="scene-studio-background scene-studio-background-fit" src="${backgroundAssets[background]}" alt="">
        </div>
        <div class="scene-studio-shade"></div>
        <div class="scene-studio-safe-frame" aria-hidden="true"></div>
        ${resolution.actors.map((actor) => this.actorMarkup(actor, t)).join('')}
        ${resolution.guestSlots.map((slot) => `<div class="scene-studio-guest-shell" data-slot="${slot.id}" style="${safeBoxStyle(slot.safeBox)};z-index:${slot.zIndex}">
          <span>G</span><b>${t('sceneStudio.guestShell.title')}</b><small>${t('sceneStudio.guestShell.label')}</small>
        </div>`).join('')}
        ${resolution.nativeSlots.map((slot) => slot.kind === 'native-evidence'
          ? `<article class="scene-studio-native-card scene-studio-evidence-card" data-slot="${slot.id}" style="${safeBoxStyle(slot.safeBox)};z-index:${slot.zIndex}">
              <small>${t('sceneStudio.evidence.label')}</small><h3>${t('sceneStudio.evidence.title')}</h3><p>${t('sceneStudio.evidence.body')}</p>
              <div><span><b>0.18 mm</b><em>${t('sceneStudio.evidence.metricWidth')}</em></span><span><b>Cu/Ag</b><em>${t('sceneStudio.evidence.metricMaterial')}</em></span></div>
            </article>`
          : `<article class="scene-studio-native-card scene-studio-testimony-card" data-slot="${slot.id}" style="${safeBoxStyle(slot.safeBox)};z-index:${slot.zIndex}">
              <small>${t('sceneStudio.testimony.label')}</small><h3>${t('sceneStudio.testimony.title')}</h3><p>${t('sceneStudio.testimony.body')}</p><strong>${t('sceneStudio.testimony.status')}</strong>
            </article>`).join('')}
        ${resolution.preset.slots.map((slot) => `<span class="scene-studio-safe-box" style="${safeBoxStyle(slot.safeBox)};z-index:${slot.zIndex + 10}" aria-hidden="true"><b>${t(`sceneStudio.slot.${slot.kind}`)}</b></span>`).join('')}
        <header class="scene-studio-preview-caption"><small>${t('sceneStudio.previewLabel')}</small><b>${t(`sceneStudio.preset.${presetId}.title`)}</b><span>${presetId}</span></header>
      </section>

      <p class="scene-studio-summary">${t(`sceneStudio.preset.${presetId}.summary`)}</p>
      <div class="scene-studio-status ${issues.length ? 'invalid' : 'valid'}">
        <b>${t(issues.length ? 'sceneStudio.validation.invalid' : 'sceneStudio.validation.valid')}</b>
        <span>${issues.length ? escapeHtml(issues.map((issue) => `${issue.code}: ${issue.detail}`).join(' · ')) : t('sceneStudio.validation.detail', { count: sceneStagingPresetIds.length })}</span>
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
    </section>`);

    this.root.querySelector('#back')?.addEventListener('click', () => this.navigation.showMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(presetId, background), true));
    this.root.querySelector<HTMLSelectElement>('#scene-studio-preset')?.addEventListener('change', (event) => {
      this.render((event.currentTarget as HTMLSelectElement).value as SceneStagingPresetId, background);
    });
    this.root.querySelector<HTMLSelectElement>('#scene-studio-background')?.addEventListener('change', (event) => {
      this.render(presetId, (event.currentTarget as HTMLSelectElement).value as BackgroundKey);
    });
    this.root.querySelector('#scene-studio-previous')?.addEventListener('click', () => this.render(previousPreset, background));
    this.root.querySelector('#scene-studio-next')?.addEventListener('click', () => this.render(nextPreset, background));
  }

  private actorMarkup(
    actor: ReturnType<typeof resolveSceneStagingPreset>['actors'][number],
    t: (key: string, params?: Readonly<Record<string, string | number | boolean>>) => string,
  ): string {
    const rig = characterRigs[actor.character];
    const asset = actor.pose === 'pose-b' ? rig.poseB : expressionAsset(actor.character, actor.expression);
    const style = [
      `--scene-x:${actor.anchorXPercent}%`,
      `--scene-anchor-y:${actor.anchorYPercent}%`,
      `--scene-shot-scale:${actor.shotScale}`,
      `--scene-character-scale:${actor.canonicalCharacterScale}`,
      `--scene-character-y:${actor.canonicalCharacterYPercent}%`,
      `--scene-z:${actor.zIndex}`,
    ].join(';');
    return `<div class="scene-studio-actor-slot" data-slot="${actor.slotId}" data-character="${actor.character}" data-role="${actor.role}" style="${style}">
      <div class="scene-studio-character-shot"><div class="scene-studio-character-canonical"><img src="${asset}" alt="${t(`character.${actor.character}`)}"></div></div>
      <span><b>${t(`character.${actor.character}`)}</b><small>${t(`sceneStudio.role.${actor.role}`)} · ${actor.shotScale.toFixed(2)}×</small></span>
    </div>`;
  }
}
