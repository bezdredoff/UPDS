import type { RuntimeServices } from '../platform/RuntimeServices';
import { escapeHtml } from './viewMarkup';

export function pwaStatusMarkup(services: RuntimeServices): string {
  const pwa = services.pwa.snapshot();
  const installLabel = pwa.installed ? 'Установлено' : pwa.canPromptInstall ? 'Можно установить' : 'Через меню браузера';
  return `<div class="pwa-status-card"><div><small>PWA / OFFLINE</small><b>${pwa.offlineReady ? 'OFFLINE READY' : pwa.supported ? 'CACHE PREPARING' : 'BROWSER MODE'}</b><span>${escapeHtml(installLabel)} · ${pwa.online ? 'online' : 'offline'} · ${escapeHtml(pwa.lane)}${pwa.cacheFailed ? ` · ${pwa.cacheFailed} cache failures` : ''}</span></div><div class="pwa-status-actions">${pwa.canPromptInstall && !pwa.installed ? '<button data-pwa-install>Установить</button>' : ''}<button data-pwa-check>Проверить обновление</button></div></div>`;
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
      <label class="volume-row"><span><b>Музыка</b><em data-music-value>${music}%</em></span><input data-music-volume type="range" min="0" max="100" step="1" value="${music}" aria-label="Громкость музыки"></label>
      <label class="volume-row"><span><b>Эффекты</b><em data-effects-value>${effects}%</em></span><input data-effects-volume type="range" min="0" max="100" step="1" value="${effects}" aria-label="Громкость эффектов"></label>
      <div class="audio-toggles">
        <button data-toggle-mute class="setting-toggle ${settings.muted ? 'is-on' : ''}" aria-pressed="${settings.muted}"><span><b>Без звука</b><small>${settings.muted ? 'Включено' : 'Выключено'}</small></span><i>${settings.muted ? 'ON' : 'OFF'}</i></button>
        <button data-toggle-haptics class="setting-toggle ${settings.hapticsEnabled ? 'is-on' : ''}" aria-pressed="${settings.hapticsEnabled}"><span><b>Haptics</b><small>${services.audio.hapticsSupported ? 'Поддерживается устройством' : 'Недоступно в этом браузере'}</small></span><i>${settings.hapticsEnabled ? 'ON' : 'OFF'}</i></button>
      </div>
      <div class="audio-preview-actions">
        <button data-preview-music>▶ Проверить музыку</button>
        <button data-preview-effects>✦ Проверить SFX</button>
      </div>
      <p class="audio-capability">Web Audio: <b>${services.audio.supported ? 'доступен' : 'недоступен'}</b> · Haptics: <b>${services.audio.hapticsSupported ? 'доступны' : 'fallback без вибрации'}</b></p>
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
