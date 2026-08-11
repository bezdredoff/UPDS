import type { RuntimeServices } from '../platform/RuntimeServices';
import type { Locale } from '../localization/Locale';
import { escapeHtml } from './viewMarkup';

const tx = (services: RuntimeServices, key: string, params: Readonly<Record<string, string | number | boolean>> = {}): string =>
  escapeHtml(services.localization.t(key, params));

export function languageSettingsMarkup(services: RuntimeServices): string {
  const locale = services.localization.locale;
  return `<div class="language-settings" data-language-settings>
    <label class="language-row"><span><b>${tx(services, 'localization.language.label')}</b><em>${tx(services, 'localization.language.help')}</em></span>
      <select data-language-select aria-label="${tx(services, 'localization.language.label')}">
        <option value="ru" ${locale === 'ru' ? 'selected' : ''}>${tx(services, 'localization.language.ru')}</option>
        <option value="en" ${locale === 'en' ? 'selected' : ''}>${tx(services, 'localization.language.en')}</option>
      </select>
    </label>
  </div>`;
}

export function bindLanguageSettingsControls(services: RuntimeServices, scope: ParentNode, rerender: () => void): void {
  const select = scope.querySelector<HTMLSelectElement>('[data-language-select]');
  select?.addEventListener('change', () => {
    const locale = select.value as Locale;
    if (locale !== 'ru' && locale !== 'en') return;
    services.localization.setLocale(locale);
    if (typeof document !== 'undefined') document.documentElement.lang = locale;
    rerender();
  });
}

export function pwaStatusMarkup(services: RuntimeServices): string {
  const pwa = services.pwa.snapshot();
  const installLabel = pwa.installed
    ? services.localization.t('pwa.install.installed')
    : pwa.canPromptInstall
      ? services.localization.t('pwa.install.available')
      : services.localization.t('pwa.install.browserMenu');
  const status = pwa.offlineReady ? 'OFFLINE READY' : pwa.supported ? 'CACHE PREPARING' : 'BROWSER MODE';
  const connectivity = pwa.online ? services.localization.t('pwa.online') : services.localization.t('pwa.offline');
  const cacheFailures = pwa.cacheFailed ? ` · ${services.localization.t('pwa.cacheFailures', { count: pwa.cacheFailed })}` : '';
  return `<div class="pwa-status-card"><div><small>PWA / OFFLINE</small><b>${status}</b><span>${escapeHtml(installLabel)} · ${escapeHtml(connectivity)} · ${escapeHtml(pwa.lane)}${escapeHtml(cacheFailures)}</span></div><div class="pwa-status-actions">${pwa.canPromptInstall && !pwa.installed ? `<button data-pwa-install>${tx(services, 'pwa.installAction')}</button>` : ''}<button data-pwa-check>${tx(services, 'pwa.checkUpdate')}</button></div></div>`;
}

export function bindPwaControls(services: RuntimeServices, scope: ParentNode, rerender: () => void): void {
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
