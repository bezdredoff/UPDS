import './accessibilityTouchTargets.css';
import type { RuntimeServices } from '../platform/RuntimeServices';
import { isSupportedLocale } from '../localization/Locale';
import { runtimeSelectableLocaleProfiles } from '../localization/LocalizationProduction';
import { escapeHtml } from './viewMarkup';

const pwaStatusSubscriptions = new WeakMap<ParentNode, () => void>();

const tx = (services: RuntimeServices, key: string, params: Readonly<Record<string, string | number | boolean>> = {}): string =>
  escapeHtml(services.localization.t(key, params));

export function languageSettingsMarkup(services: RuntimeServices): string {
  const locale = services.localization.locale;
  return `<div class="language-settings" data-language-settings>
    <label class="language-row"><span><b>${tx(services, 'localization.language.label')}</b><em>${tx(services, 'localization.language.help')}</em></span>
      <select data-language-select aria-label="${tx(services, 'localization.language.label')}">
        ${runtimeSelectableLocaleProfiles.map((profile) => `<option value="${profile.locale}" ${locale === profile.locale ? 'selected' : ''}>${escapeHtml(profile.nativeName)}</option>`).join('')}
      </select>
    </label>
  </div>`;
}

export function bindLanguageSettingsControls(services: RuntimeServices, scope: ParentNode, rerender: () => void): void {
  const select = scope.querySelector<HTMLSelectElement>('[data-language-select]');
  select?.addEventListener('change', () => {
    const locale = select.value;
    if (!isSupportedLocale(locale)) return;
    select.disabled = true;
    void services.localization.activateLocale(locale).then(() => {
      if (typeof document !== 'undefined') document.documentElement.lang = locale;
      rerender();
    }).catch((error) => {
      services.errorLog.record('application', `Locale load failed for ${locale}: ${String(error)}`);
      select.value = services.localization.locale;
      select.disabled = false;
    });
  });
}

export function pwaStatusMarkup(services: RuntimeServices): string {
  const pwa = services.pwa.snapshot();
  const installLabel = pwa.installed
    ? services.localization.t('pwa.install.installed')
    : pwa.canPromptInstall
      ? services.localization.t('pwa.install.available')
      : services.localization.t('pwa.install.browserMenu');
  const status = pwa.offlineReady ? 'OFFLINE READY' : pwa.cachePreparing ? 'CACHE PREPARING' : pwa.cacheFailed > 0 ? 'CACHE INCOMPLETE' : pwa.supported ? 'CACHE PREPARING' : 'BROWSER MODE';
  const connectivity = pwa.online ? services.localization.t('pwa.online') : services.localization.t('pwa.offline');
  const cacheFailures = pwa.cacheFailed ? ` · ${services.localization.t('pwa.cacheFailures', { count: pwa.cacheFailed })}` : '';
  const progress = pwa.cacheTotal > 0 ? Math.min(100, Math.floor((pwa.cacheCompleted / pwa.cacheTotal) * 100)) : 0;
  return `<div class="pwa-status-card"><div><small>PWA / OFFLINE</small><b data-pwa-cache-status>${status}</b><span data-pwa-cache-meta>${escapeHtml(installLabel)} · ${escapeHtml(connectivity)} · ${escapeHtml(pwa.lane)}${escapeHtml(cacheFailures)}</span><div class="pwa-cache-progress" data-pwa-cache-progress ${pwa.supported && !pwa.offlineReady ? '' : 'hidden'}><div><span>${tx(services, 'pwa.cachePreparing')}</span><b data-pwa-cache-percent>${progress}%</b></div><progress data-pwa-cache-bar max="100" value="${progress}" aria-label="${tx(services, 'pwa.cacheProgressAria', { percent: progress })}"></progress></div></div><div class="pwa-status-actions">${pwa.canPromptInstall && !pwa.installed ? `<button data-pwa-install>${tx(services, 'pwa.installAction')}</button>` : ''}<button data-pwa-check>${tx(services, 'pwa.checkUpdate')}</button></div></div>`;
}

export function bindPwaControls(services: RuntimeServices, scope: ParentNode, rerender: () => void): void {
  pwaStatusSubscriptions.get(scope)?.();
  const unsubscribe = services.pwa.subscribe((pwa) => {
    const percent = pwa.cacheTotal > 0 ? Math.min(100, Math.floor((pwa.cacheCompleted / pwa.cacheTotal) * 100)) : 0;
    const status = scope.querySelector<HTMLElement>('[data-pwa-cache-status]');
    const progress = scope.querySelector<HTMLElement>('[data-pwa-cache-progress]');
    const percentLabel = scope.querySelector<HTMLElement>('[data-pwa-cache-percent]');
    const progressBar = scope.querySelector<HTMLProgressElement>('[data-pwa-cache-bar]');
    const meta = scope.querySelector<HTMLElement>('[data-pwa-cache-meta]');
    const installLabel = pwa.installed
      ? services.localization.t('pwa.install.installed')
      : pwa.canPromptInstall
        ? services.localization.t('pwa.install.available')
        : services.localization.t('pwa.install.browserMenu');
    const connectivity = services.localization.t(pwa.online ? 'pwa.online' : 'pwa.offline');
    const failures = pwa.cacheFailed ? ` · ${services.localization.t('pwa.cacheFailures', { count: pwa.cacheFailed })}` : '';
    if (status) status.textContent = pwa.offlineReady ? 'OFFLINE READY' : pwa.cachePreparing ? 'CACHE PREPARING' : pwa.cacheFailed > 0 ? 'CACHE INCOMPLETE' : pwa.supported ? 'CACHE PREPARING' : 'BROWSER MODE';
    if (meta) meta.textContent = `${installLabel} · ${connectivity} · ${pwa.lane}${failures}`;
    if (progress) progress.hidden = !pwa.supported || pwa.offlineReady;
    if (percentLabel) percentLabel.textContent = `${percent}%`;
    if (progressBar) {
      progressBar.value = percent;
      progressBar.setAttribute('aria-label', services.localization.t('pwa.cacheProgressAria', { percent }));
    }
  });
  pwaStatusSubscriptions.set(scope, unsubscribe);
  scope.querySelector('[data-pwa-install]')?.addEventListener('click', async () => { await services.pwa.promptInstall(); rerender(); });
  scope.querySelector('[data-pwa-check]')?.addEventListener('click', async () => { await services.pwa.checkForUpdate(); rerender(); });
}

export function audioSettingsMarkup(services: RuntimeServices): string {
  const settings = services.audio.settings;
  const music = Math.round(settings.musicVolume * 100);
  const effects = Math.round(settings.effectsVolume * 100);
  return `<div class="audio-settings" data-audio-settings>
      <label class="volume-row"><span><b>${tx(services, 'audio.music')}</b><em data-music-value>${music}%</em></span><input data-music-volume type="range" min="0" max="100" step="1" value="${music}" aria-label="${tx(services, 'audio.musicVolumeAria')}"></label>
      <label class="volume-row"><span><b>${tx(services, 'audio.effects')}</b><em data-effects-value>${effects}%</em></span><input data-effects-volume type="range" min="0" max="100" step="1" value="${effects}" aria-label="${tx(services, 'audio.effectsVolumeAria')}"></label>
      <div class="audio-toggles">
        <button data-toggle-mute class="setting-toggle ${settings.muted ? 'is-on' : ''}" aria-pressed="${settings.muted}"><span><b>${tx(services, 'audio.mute')}</b><small>${tx(services, settings.muted ? 'common.enabled' : 'common.disabled')}</small></span><i>${tx(services, settings.muted ? 'common.on' : 'common.off')}</i></button>
        <button data-toggle-haptics class="setting-toggle ${settings.hapticsEnabled ? 'is-on' : ''}" aria-pressed="${settings.hapticsEnabled}"><span><b>${tx(services, 'audio.haptics')}</b><small>${tx(services, services.audio.hapticsSupported ? 'audio.hapticsSupported' : 'audio.hapticsUnavailable')}</small></span><i>${tx(services, settings.hapticsEnabled ? 'common.on' : 'common.off')}</i></button>
      </div>
      <div class="audio-preview-actions">
        <button data-preview-music>${tx(services, 'audio.previewMusic')}</button>
        <button data-preview-effects>${tx(services, 'audio.previewEffects')}</button>
      </div>
      <p class="audio-capability">${tx(services, 'audio.webAudio')}: <b>${tx(services, services.audio.supported ? 'common.available' : 'common.unavailable')}</b> · ${tx(services, 'audio.hapticsCapability')}: <b>${tx(services, services.audio.hapticsSupported ? 'audio.hapticsAvailable' : 'audio.hapticsFallback')}</b></p>
    </div>`;
}

export function bindAudioSettingsControls(services: RuntimeServices, scope: ParentNode, rerender: () => void): void {
  const music = scope.querySelector<HTMLInputElement>('[data-music-volume]');
  const effects = scope.querySelector<HTMLInputElement>('[data-effects-volume]');
  music?.addEventListener('input', () => {
    const value = Number(music.value) / 100;
    services.audio.updateSettings({ musicVolume: value });
    const label = scope.querySelector<HTMLElement>('[data-music-value]');
    if (label) label.textContent = `${Math.round(value * 100)}%`;
  });
  effects?.addEventListener('input', () => {
    const value = Number(effects.value) / 100;
    services.audio.updateSettings({ effectsVolume: value });
    const label = scope.querySelector<HTMLElement>('[data-effects-value]');
    if (label) label.textContent = `${Math.round(value * 100)}%`;
  });
  scope.querySelector('[data-toggle-mute]')?.addEventListener('click', () => {
    services.audio.updateSettings({ muted: !services.audio.settings.muted });
    rerender();
  });
  scope.querySelector('[data-toggle-haptics]')?.addEventListener('click', () => {
    services.audio.updateSettings({ hapticsEnabled: !services.audio.settings.hapticsEnabled });
    rerender();
  });
  scope.querySelector('[data-preview-music]')?.addEventListener('click', () => services.audio.previewMusic());
  scope.querySelector('[data-preview-effects]')?.addEventListener('click', () => services.audio.previewEffects());
}
