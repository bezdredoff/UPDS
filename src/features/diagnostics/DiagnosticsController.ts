import { APP_VERSION, BUILD_ID, BUILD_LABEL, BUILD_TIMESTAMP } from '../../appVersion';
import { sceneMeta } from '../../data/narrative';
import { createDiagnosticsSnapshot } from '../../platform/Diagnostics';
import { downloadJson } from '../../platform/Download';
import { SAVE_SCHEMA_VERSION } from '../../engine/CampaignStore';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, iconMarkup as icon, panelHeaderMarkup } from '../../ui/viewMarkup';
import { bindPwaControls, pwaStatusMarkup } from '../../ui/systemControls';

export class DiagnosticsController {
  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: AppSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(status = ''): void {
    this.services.audio.setScene('menu');
    this.services.telemetry.trackScreen('support');
    const store = this.services.store;
    const loadReport = store.getLastLoadReport();
    const recovery = store.getRecoveryBackup();
    const assetHealth = this.services.assetHealth.snapshot();
    const errors = this.services.errorLog.getEntries();
    const playtest = this.services.telemetry.snapshot();
    const pwa = this.services.pwa.snapshot();
    const storageLabel = this.services.storage.mode === 'persistent' ? 'localStorage · persistent' : 'memory fallback · текущая вкладка';

    this.shell.render(`<section class="panel support-panel">
      ${panelHeaderMarkup('PLATFORM · QA TOOLS', 'Диагностика')}
      <h2>Сохранения и диагностика</h2>
      <p class="panel-copy">Сервисные инструменты для мобильного плейтеста. Они не меняют канон, VN IDs или игровые правила.</p>
      ${status ? `<div class="support-status">${escapeHtml(status)}</div>` : ''}
      <div class="diagnostic-grid">
        <article><small>VERSION</small><b>${escapeHtml(APP_VERSION)}</b><span>${escapeHtml(BUILD_LABEL)}</span></article>
        <article><small>BUILD</small><b>${escapeHtml(BUILD_ID)}</b><span>${escapeHtml(BUILD_TIMESTAMP)}</span></article>
        <article><small>SAVE SCHEMA</small><b>v${SAVE_SCHEMA_VERSION}</b><span>${escapeHtml(loadReport.status)} · ${escapeHtml(loadReport.detail)}</span></article>
        <article><small>STORAGE</small><b>${this.services.storage.mode === 'persistent' ? 'OK' : 'FALLBACK'}</b><span>${escapeHtml(storageLabel)}</span></article>
        <article><small>RUNTIME</small><b>${errors.length} errors</b><span>${assetHealth.failures.length} asset failures</span></article>
        <article><small>AUDIO</small><b>${this.services.audio.supported ? 'WEB AUDIO' : 'FALLBACK'}</b><span>music ${Math.round(this.services.audio.settings.musicVolume * 100)}% · sfx ${Math.round(this.services.audio.settings.effectsVolume * 100)}% · ${this.services.audio.settings.muted ? 'muted' : 'active'}</span></article>
        <article><small>PLAYTEST</small><b>${playtest.eventCount} events</b><span>${playtest.summary.sessions} sessions · ${playtest.summary.verticalSliceCompletions} completions</span></article>
        <article><small>PWA</small><b>${pwa.offlineReady ? 'OFFLINE READY' : pwa.registration.toUpperCase()}</b><span>${pwa.installed ? 'installed' : 'browser'} · ${pwa.online ? 'online' : 'offline'} · ${escapeHtml(pwa.lane)}</span></article>
      </div>
      ${pwaStatusMarkup(this.services)}
      <div class="support-actions">
        <button id="export-save">${icon('save')}<span><b>Экспорт сохранения</b><small>JSON для переноса или резервной копии</small></span></button>
        <button id="import-save">${icon('load')}<span><b>Импорт сохранения</b><small>Совместимый UPDS save JSON</small></span></button>
        <input id="save-file" class="visually-hidden" type="file" accept="application/json,.json">
        <button id="export-diagnostics">${icon('log')}<span><b>Экспорт диагностики</b><small>Build, save, ошибки, assets, PWA и устройство</small></span></button>
        <button id="export-playtest">${icon('log')}<span><b>Экспорт playtest report</b><small>Summary + полный локальный журнал событий</small></span></button>
        <button id="clear-playtest">${icon('close')}<span><b>Очистить playtest data</b><small>Сбросить локальную телеметрию перед новым тестером</small></span></button>
        ${recovery ? `<button id="export-recovery">${icon('log')}<span><b>Экспорт recovery backup</b><small>Сохранён источник повреждённого или заменённого save</small></span></button>` : ''}
      </div>
      <div class="support-meta">
        <span>Preload: ${assetHealth.preloadLoaded}/${assetHealth.preloadRequested}; active/peak: ${assetHealth.preloadActive}/${assetHealth.preloadPeakActive}; failed: ${assetHealth.preloadFailed}</span>
        <span>Recovery backup: ${recovery ? 'есть' : 'нет'}</span>
        <span>Playtest session: ${escapeHtml(playtest.sessionId)}</span>
        <span>PWA cache: ${escapeHtml(pwa.cacheBuild)} · failures ${pwa.cacheFailed} · ${pwa.scope ? escapeHtml(pwa.scope) : 'no scope'}</span>
      </div>
      <button id="clear-errors" class="danger-link">Очистить журнал runtime-ошибок</button>
    </section>`);

    this.root.querySelector('#back')?.addEventListener('click', () => this.navigation.showMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(status), true));
    this.root.querySelector('#export-save')?.addEventListener('click', () => downloadJson(`UPDS_save_${APP_VERSION}.json`, store.createExportBundle(this.session.save)));
    this.root.querySelector('#export-diagnostics')?.addEventListener('click', () => {
      downloadJson(`UPDS_diagnostics_${APP_VERSION}.json`, createDiagnosticsSnapshot({
        save: this.session.save, storageMode: this.services.storage.mode, loadReport: store.getLastLoadReport(),
        recoveryBackup: store.getRecoveryBackup(), errorLog: this.services.errorLog, assetHealth: this.services.assetHealth,
        audio: { supported: this.services.audio.supported, hapticsSupported: this.services.audio.hapticsSupported, scene: this.services.audio.scene, settings: this.services.audio.settings },
        playtest: this.services.telemetry.snapshot(), pwa: this.services.pwa.snapshot(),
      }));
    });
    this.root.querySelector('#export-recovery')?.addEventListener('click', () => downloadJson(`UPDS_recovery_${APP_VERSION}.json`, store.getRecoveryBackup()));
    this.root.querySelector('#export-playtest')?.addEventListener('click', () => downloadJson(`UPDS_playtest_${APP_VERSION}.json`, this.services.telemetry.createExportBundle()));
    this.root.querySelector('#clear-playtest')?.addEventListener('click', () => {
      if (typeof window.confirm === 'function' && !window.confirm('Очистить локальную playtest telemetry? Игровое сохранение останется.')) return;
      this.services.telemetry.clear();
      this.services.telemetry.startSession({ reset: true, online: navigator.onLine, installed: this.services.pwa.snapshot().installed });
      this.render('Playtest telemetry очищена. Начата новая локальная сессия.');
    });
    this.root.querySelector('#clear-errors')?.addEventListener('click', () => { this.services.errorLog.clear(); this.render('Журнал runtime-ошибок очищен.'); });

    const input = this.root.querySelector<HTMLInputElement>('#save-file');
    this.root.querySelector('#import-save')?.addEventListener('click', () => input?.click());
    bindPwaControls(this.services, this.root, () => this.render(status));

    input?.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (!window.confirm('Импорт заменит текущий прогресс. Продолжить?')) return;
        const result = store.importFromText(text);
        if (!result.ok) { this.services.errorLog.record('application', `Save import rejected: ${result.error}`); this.render(result.error); return; }
        this.session.save = result.state;
        this.render('Сохранение импортировано. Continue продолжит с импортированной позиции.');
      } catch (error) {
        this.services.errorLog.record('application', error);
        this.render('Не удалось прочитать выбранный файл.');
      }
    });
  }

  renderSceneSelect(): void {
    this.services.audio.setScene('menu');
    this.services.telemetry.trackScreen('scene-select');
    this.shell.render(`<section class="panel scene-select">
      ${panelHeaderMarkup('QA NAVIGATION', 'Сцены')}
      <h2>Выбор сцены</h2>
      <p class="panel-copy">Прямой переход предназначен для проверки контента и не открывает предыдущие улики автоматически.</p>
      <div class="scene-list">${sceneMeta.map((meta, index) => `
        <button data-scene="${index}">
          <i>${String(index).padStart(2, '0')}</i>
          <span><b>${escapeHtml(meta.title)}</b><small>${escapeHtml(meta.location)}</small></span>
        </button>`).join('')}</div>
      <aside class="placeholder-note"><b>Допустимые заглушки ANM‑009</b><span>Эми · Маю · Кэнтаро · Норихиро</span></aside>
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', () => this.navigation.showMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.renderSceneSelect(), true));
    this.root.querySelectorAll<HTMLElement>('[data-scene]').forEach((button) => button.addEventListener('click', () => {
      this.navigation.openScene(Number(button.dataset.scene), 0);
    }));
  }
}
