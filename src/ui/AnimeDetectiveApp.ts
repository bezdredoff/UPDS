import { APP_VERSION, BUILD_ID, BUILD_LABEL, BUILD_TIMESTAMP } from '../appVersion';
import {
  characterForSpeaker,
  characterRigs,
  expressionForDirection,
  faceAsset,
  placeholderCharacters,
  placeholderForSpeaker,
  type CharacterKey,
  type RuntimeExpression,
} from '../data/characterRigs';
import {
  blockerPresentation,
  cluePresentation,
  ingredientPresentation,
  levels,
  specialAsset,
  tilePresentation,
  type ClueId,
  type LevelDefinition,
} from '../data/levels';
import {
  backgroundAssets,
  choices,
  getBackgroundForLine,
  getReadHistory,
  getScene,
  isDirection,
  parsedLineCount,
  sceneMeta,
  type ChoiceId,
  type StoryLine,
} from '../data/narrative';
import {
  freshSave,
  isPreMatchScene,
  levelForPreMatchScene,
  postSceneForLevel,
  type CampaignSave,
} from '../engine/CampaignStore';
import { Match3Game, type BoardCell, type Match3Frame, type MoveResult } from '../engine/Match3Game';
import { preloadImageAssets } from '../platform/AssetPreloader';
import { createDiagnosticsSnapshot } from '../platform/Diagnostics';
import { downloadJson } from '../platform/Download';
import { createRuntimeServices, type RuntimeServices } from '../platform/RuntimeServices';
import { getDragPreview, getSwipeDecision } from './boardInteraction';
import { matchMotionDuration } from './matchMotion';
import { resolveVnStaging, type VnStageSide } from './vnStaging';
import {
  currentDialogueProfile,
  dialogueContinuationText,
  dialogueLocale,
  paginateDialogueText,
  paginateDialogueTextMeasured,
} from './vnDialoguePaging';
import { createDialogueRenderedFit } from './dialogueMeasurement';
import { autoDelayForLine, nextUnreadIndex, type AutoSpeed, type TextScale } from './vnPlayback';

type Bark = Readonly<{ speaker: string; text: string }>;

const escapeHtml = (value: string): string => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

const icon = (name: string, alt = ''): string => `<img src="./assets/ui/icon_${name}.svg" alt="${escapeHtml(alt)}">`;

export class AnimeDetectiveApp {
  private save: CampaignSave = freshSave();
  private story: StoryLine[] = [];
  private readonly services: RuntimeServices;
  private readonly store: RuntimeServices['store'];
  private activeMatch: Match3Game | null = null;
  private activeLevelIndex = 0;
  private selectedCell: number | null = null;
  private matchBark: Bark | null = null;
  private triggeredBarks = new Set<string>();
  private pendingClue: ClueId | null = null;
  private timers: number[] = [];
  private matchInputLocked = false;
  private activePointer: { id: number; startIndex: number; startX: number; startY: number } | null = null;
  private suppressBoardClickUntil = 0;
  private hintedCells = new Set<number>();
  private autoMode = false;
  private autoSpeed: AutoSpeed = 'normal';
  private textScale: TextScale = 'normal';
  private dialoguePageLineId: string | null = null;
  private dialoguePageIndex = 0;
  private dialoguePages: string[] = [];
  private dialogueReflowTimer: number | null = null;

  constructor(private readonly root: HTMLElement, services: RuntimeServices = createRuntimeServices()) {
    this.services = services;
    this.store = services.store;
  }

  mount(): void {
    this.bindDialogueReflow();
    this.renderMenu();
  }

  private persist(): void {
    if (!this.store.save(this.save)) this.services.errorLog.record('application', 'Campaign save failed; runtime progress continues in memory.');
  }

  private clearTimers(): void {
    for (const timer of this.timers) window.clearTimeout(timer);
    this.timers = [];
  }

  private shell(content: string): void {
    this.clearTimers();
    this.root.innerHTML = `<main class="phone">${content}</main>`;
  }

  private headerActionMarkup(id: string, iconName: string, label: string, badge?: number, extraClass = ''): string {
    return `<button id="${id}" class="app-header-action${extraClass ? ` ${extraClass}` : ''}" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${icon(iconName)}${badge === undefined ? '' : `<i>${badge}</i>`}<span class="visually-hidden">${escapeHtml(label)}</span></button>`;
  }

  private panelHeaderMarkup(eyebrow: string, title: string, options: Readonly<{ settings?: boolean }> = { settings: true }): string {
    return `<header class="panel-nav app-header">
      ${this.headerActionMarkup('back', 'back', 'Назад', undefined, 'app-header-back')}
      <div class="app-header-title"><small>${escapeHtml(eyebrow)}</small><b>${escapeHtml(title)}</b></div>
      <nav class="app-header-actions" aria-label="Навигация">
        ${options.settings ? this.headerActionMarkup('header-settings', 'settings', 'Настройки') : ''}
      </nav>
    </header>`;
  }

  private returnToMainMenu(): void {
    if (this.activeMatch && typeof window.confirm === 'function' && !window.confirm('Выйти в главное меню? Текущая попытка match-3 будет потеряна.')) return;
    this.activeMatch = null;
    this.renderMenu();
  }

  private renderMenu(): void {
    this.services.audio.setScene('menu');
    this.autoMode = false;
    this.save = this.store.load();
    const hasSave = this.save.scene > 0 || this.save.line > 0 || this.save.completed.length > 0;
    this.shell(`<section class="menu-screen">
      <img class="menu-background" src="${backgroundAssets.clubroom}" alt="">
      <div class="menu-wash"></div>
      <div class="menu-content">
        <p class="eyebrow">SEIRAN COLLEGE · CASE 001</p>
        <h1>Детективы<br><span>класса U</span></h1>
        <p class="tagline">Комедийная visual novel × match‑3</p>
        <div class="hero-medallions" aria-label="Мику, Оноэ и Аюки">
          ${(['miku', 'onoe', 'ayuki'] as const).map((key) => `<img src="${characterRigs[key].medallion}" alt="${characterRigs[key].displayName}">`).join('')}
        </div>
        <div class="menu-actions">
          <button id="new" class="primary">Новая игра</button>
          <button id="continue" ${hasSave ? '' : 'disabled'}>Продолжить</button>
          <button id="settings">Настройки</button>
          <button id="episodes">Навигация по сценам <small>QA</small></button>
          <button id="support">Сохранения и диагностика <small>QA</small></button>
        </div>
        <footer>${BUILD_LABEL}<br><span>${APP_VERSION} · ${parsedLineCount} строк сценария</span></footer>
      </div>
    </section>`);

    this.root.querySelector('#new')?.addEventListener('click', () => {
      this.services.audio.play('uiClick');
      this.save = freshSave();
      this.persist();
      this.openScene(0, 0);
    });
    this.root.querySelector('#continue')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.openScene(this.save.scene, this.save.line); });
    this.root.querySelector('#settings')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.renderSettings(); });
    this.root.querySelector('#episodes')?.addEventListener('click', () => this.renderSceneSelect());
    this.root.querySelector('#support')?.addEventListener('click', () => this.renderSupport());
  }

  private renderSupport(status = ''): void {
    this.services.audio.setScene('menu');
    const loadReport = this.store.getLastLoadReport();
    const recovery = this.store.getRecoveryBackup();
    const assetHealth = this.services.assetHealth.snapshot();
    const errors = this.services.errorLog.getEntries();
    const storageLabel = this.services.storage.mode === 'persistent' ? 'localStorage · persistent' : 'memory fallback · текущая вкладка';

    this.shell(`<section class="panel support-panel">
      ${this.panelHeaderMarkup('PLATFORM · QA TOOLS', 'Диагностика')}
      <h2>Сохранения и диагностика</h2>
      <p class="panel-copy">Сервисные инструменты для мобильного плейтеста. Они не меняют канон, VN IDs или игровые правила.</p>
      ${status ? `<div class="support-status">${escapeHtml(status)}</div>` : ''}
      <div class="diagnostic-grid">
        <article><small>BUILD</small><b>${escapeHtml(APP_VERSION)}</b><span>${escapeHtml(BUILD_ID)}</span></article>
        <article><small>SAVE SCHEMA</small><b>v1</b><span>${escapeHtml(loadReport.status)} · ${escapeHtml(loadReport.detail)}</span></article>
        <article><small>STORAGE</small><b>${this.services.storage.mode === 'persistent' ? 'OK' : 'FALLBACK'}</b><span>${escapeHtml(storageLabel)}</span></article>
        <article><small>RUNTIME</small><b>${errors.length} errors</b><span>${assetHealth.failures.length} asset failures</span></article>
        <article><small>AUDIO</small><b>${this.services.audio.supported ? 'WEB AUDIO' : 'FALLBACK'}</b><span>music ${Math.round(this.services.audio.settings.musicVolume * 100)}% · sfx ${Math.round(this.services.audio.settings.effectsVolume * 100)}% · ${this.services.audio.settings.muted ? 'muted' : 'active'}</span></article>
      </div>
      <div class="support-actions">
        <button id="export-save">${icon('save')}<span><b>Экспорт сохранения</b><small>JSON для переноса или резервной копии</small></span></button>
        <button id="import-save">${icon('load')}<span><b>Импорт сохранения</b><small>Совместимый ANM-009+ JSON</small></span></button>
        <input id="save-file" class="visually-hidden" type="file" accept="application/json,.json">
        <button id="export-diagnostics">${icon('log')}<span><b>Экспорт диагностики</b><small>Build, save, ошибки, assets и устройство</small></span></button>
        ${recovery ? `<button id="export-recovery">${icon('log')}<span><b>Экспорт recovery backup</b><small>Сохранён источник повреждённого или заменённого save</small></span></button>` : ''}
      </div>
      <div class="support-meta">
        <b>${escapeHtml(BUILD_LABEL)}</b>
        <span>Build time: ${escapeHtml(BUILD_TIMESTAMP)}</span>
        <span>Preload: ${assetHealth.preloadLoaded}/${assetHealth.preloadRequested}; failed: ${assetHealth.preloadFailed}</span>
        <span>Recovery backup: ${recovery ? 'есть' : 'нет'}</span>
      </div>
      <button id="clear-errors" class="danger-link">Очистить журнал runtime-ошибок</button>
    </section>`);

    this.root.querySelector('#back')?.addEventListener('click', () => this.renderMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.renderSettings(() => this.renderSupport(status), true));
    this.root.querySelector('#export-save')?.addEventListener('click', () => downloadJson(`UPDS_save_${APP_VERSION}.json`, this.store.createExportBundle(this.save)));
    this.root.querySelector('#export-diagnostics')?.addEventListener('click', () => {
      downloadJson(`UPDS_diagnostics_${APP_VERSION}.json`, createDiagnosticsSnapshot({
        save: this.save, storageMode: this.services.storage.mode, loadReport: this.store.getLastLoadReport(),
        recoveryBackup: this.store.getRecoveryBackup(), errorLog: this.services.errorLog, assetHealth: this.services.assetHealth,
        audio: { supported: this.services.audio.supported, hapticsSupported: this.services.audio.hapticsSupported, scene: this.services.audio.scene, settings: this.services.audio.settings },
      }));
    });
    this.root.querySelector('#export-recovery')?.addEventListener('click', () => downloadJson(`UPDS_recovery_${APP_VERSION}.json`, this.store.getRecoveryBackup()));
    this.root.querySelector('#clear-errors')?.addEventListener('click', () => { this.services.errorLog.clear(); this.renderSupport('Журнал runtime-ошибок очищен.'); });

    const input = this.root.querySelector<HTMLInputElement>('#save-file');
    this.root.querySelector('#import-save')?.addEventListener('click', () => input?.click());
    input?.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        if (!window.confirm('Импорт заменит текущий прогресс. Продолжить?')) return;
        const result = this.store.importFromText(text);
        if (!result.ok) { this.services.errorLog.record('application', `Save import rejected: ${result.error}`); this.renderSupport(result.error); return; }
        this.save = result.state;
        this.renderSupport('Сохранение импортировано. Continue продолжит с импортированной позиции.');
      } catch (error) {
        this.services.errorLog.record('application', error);
        this.renderSupport('Не удалось прочитать выбранный файл.');
      }
    });
  }

  private audioSettingsMarkup(): string {
    const settings = this.services.audio.settings;
    const music = Math.round(settings.musicVolume * 100);
    const effects = Math.round(settings.effectsVolume * 100);
    return `<div class="audio-settings" data-audio-settings>
      <label class="volume-row"><span><b>Музыка</b><em data-music-value>${music}%</em></span><input data-music-volume type="range" min="0" max="100" step="1" value="${music}" aria-label="Громкость музыки"></label>
      <label class="volume-row"><span><b>Эффекты</b><em data-effects-value>${effects}%</em></span><input data-effects-volume type="range" min="0" max="100" step="1" value="${effects}" aria-label="Громкость эффектов"></label>
      <div class="audio-toggles">
        <button data-toggle-mute class="setting-toggle ${settings.muted ? 'is-on' : ''}" aria-pressed="${settings.muted}"><span><b>Без звука</b><small>${settings.muted ? 'Включено' : 'Выключено'}</small></span><i>${settings.muted ? 'ON' : 'OFF'}</i></button>
        <button data-toggle-haptics class="setting-toggle ${settings.hapticsEnabled ? 'is-on' : ''}" aria-pressed="${settings.hapticsEnabled}"><span><b>Haptics</b><small>${this.services.audio.hapticsSupported ? 'Поддерживается устройством' : 'Недоступно в этом браузере'}</small></span><i>${settings.hapticsEnabled ? 'ON' : 'OFF'}</i></button>
      </div>
      <div class="audio-preview-actions">
        <button data-preview-music>▶ Проверить музыку</button>
        <button data-preview-effects>✦ Проверить SFX</button>
      </div>
      <p class="audio-capability">Web Audio: <b>${this.services.audio.supported ? 'доступен' : 'недоступен'}</b> · Haptics: <b>${this.services.audio.hapticsSupported ? 'доступны' : 'fallback без вибрации'}</b></p>
    </div>`;
  }

  private bindAudioSettingsControls(scope: ParentNode, rerender: () => void): void {
    const music = scope.querySelector<HTMLInputElement>('[data-music-volume]');
    const effects = scope.querySelector<HTMLInputElement>('[data-effects-volume]');
    music?.addEventListener('input', () => {
      const value = Number(music.value) / 100;
      this.services.audio.updateSettings({ musicVolume: value });
      const label = scope.querySelector<HTMLElement>('[data-music-value]');
      if (label) label.textContent = `${Math.round(value * 100)}%`;
    });
    effects?.addEventListener('input', () => {
      const value = Number(effects.value) / 100;
      this.services.audio.updateSettings({ effectsVolume: value });
      const label = scope.querySelector<HTMLElement>('[data-effects-value]');
      if (label) label.textContent = `${Math.round(value * 100)}%`;
    });
    scope.querySelector('[data-toggle-mute]')?.addEventListener('click', () => {
      this.services.audio.updateSettings({ muted: !this.services.audio.settings.muted });
      rerender();
    });
    scope.querySelector('[data-toggle-haptics]')?.addEventListener('click', () => {
      this.services.audio.updateSettings({ hapticsEnabled: !this.services.audio.settings.hapticsEnabled });
      rerender();
    });
    scope.querySelector('[data-preview-music]')?.addEventListener('click', () => this.services.audio.previewMusic());
    scope.querySelector('[data-preview-effects]')?.addEventListener('click', () => this.services.audio.previewEffects());
  }

  private renderSettings(back: () => void = () => this.renderMenu(), showMainMenu = false): void {
    this.shell(`<section class="panel settings-panel">
      ${this.panelHeaderMarkup('CONFIG · SYSTEM', 'Настройки', { settings: false })}
      <h2>Звук и отклик</h2>
      <p class="panel-copy">Музыка и SFX генерируются локально через Web Audio и не требуют загрузки аудиофайлов. Настройки сохраняются отдельно от игрового прогресса.</p>
      ${this.audioSettingsMarkup()}
      <div class="settings-note"><b>Мобильный контракт</b><span>Звук активируется только после первого касания/клавиши. При сворачивании вкладки музыка приостанавливается и безопасно возобновляется при возвращении.</span></div>
      ${showMainMenu ? `<div class="settings-navigation"><small>НАВИГАЦИЯ</small><button id="settings-main-menu">${icon('menu')}<span><b>Главное меню</b><em>${this.activeMatch ? 'Текущая попытка потребует подтверждения' : 'Сохранённый прогресс не потеряется'}</em></span></button></div>` : ''}
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', back);
    this.root.querySelector('#settings-main-menu')?.addEventListener('click', () => this.returnToMainMenu());
    this.bindAudioSettingsControls(this.root, () => this.renderSettings(back, showMainMenu));
  }

  private renderSceneSelect(): void {
    this.services.audio.setScene('menu');
    this.shell(`<section class="panel scene-select">
      ${this.panelHeaderMarkup('QA NAVIGATION', 'Сцены')}
      <h2>Выбор сцены</h2>
      <p class="panel-copy">Прямой переход предназначен для проверки контента и не открывает предыдущие улики автоматически.</p>
      <div class="scene-list">${sceneMeta.map((meta, index) => `
        <button data-scene="${index}">
          <i>${String(index).padStart(2, '0')}</i>
          <span><b>${escapeHtml(meta.title)}</b><small>${escapeHtml(meta.location)}</small></span>
        </button>`).join('')}</div>
      <aside class="placeholder-note"><b>Допустимые заглушки ANM‑009</b><span>Эми · Маю · Кэнтаро · Норихиро</span></aside>
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', () => this.renderMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.renderSettings(() => this.renderSceneSelect(), true));
    this.root.querySelectorAll<HTMLElement>('[data-scene]').forEach((button) => button.addEventListener('click', () => {
      this.openScene(Number(button.dataset.scene), 0);
    }));
  }

  private openScene(scene: number, line = 0): void {
    this.activeMatch = null;
    this.selectedCell = null;
    this.dialoguePageLineId = null;
    this.dialoguePageIndex = 0;
    this.dialoguePages = [];
    this.save.scene = Math.max(0, Math.min(sceneMeta.length - 1, scene));
    this.story = getScene(this.save.scene, this.save.choice);
    this.save.line = Math.max(0, Math.min(line, this.story.length));
    this.persist();

    if (this.save.line >= this.story.length) {
      this.advanceScene();
      return;
    }
    const resumeEntry = this.story[this.save.line];
    if (this.save.scene === 1 && resumeEntry?.id === 'VN0040' && this.save.readLines.includes('VN0040')) {
      this.renderChoice();
      return;
    }
    this.renderVN();
  }

  private renderVN(): void {
    this.services.audio.setScene('vn');
    const entry = this.story[this.save.line];
    if (!entry) {
      this.advanceScene();
      return;
    }

    const meta = sceneMeta[this.save.scene];
    if (this.dialoguePageLineId !== entry.id) {
      this.dialoguePageLineId = entry.id;
      this.dialoguePageIndex = 0;
      this.dialoguePages = [];
    }
    const fallbackDialoguePages = paginateDialogueText(entry.text, currentDialogueProfile(this.textScale));
    let dialoguePages = this.dialoguePages.length > 0 ? this.dialoguePages : fallbackDialoguePages;
    this.dialoguePageIndex = Math.min(this.dialoguePageIndex, dialoguePages.length - 1);
    let dialoguePage = dialoguePages[this.dialoguePageIndex] ?? entry.text;
    const direction = isDirection(entry);
    const background = getBackgroundForLine(this.save.scene, this.save.line, this.story);
    const character = direction ? null : characterForSpeaker(entry.speaker);
    const placeholder = direction ? null : placeholderForSpeaker(entry.speaker);
    const expression = expressionForDirection(entry.emotion);
    const staging = direction ? null : resolveVnStaging(this.story, this.save.line);
    const clueToast = this.pendingClue ? this.clueToastMarkup(this.pendingClue) : '';
    const skipAvailable = this.save.readLines.includes(entry.id);
    if (character && !this.usesPoseB(character, entry.emotion)) {
      const rig = characterRigs[character];
      const currentFace = faceAsset(character, expression);
      void preloadImageAssets([rig.base, rig.faces.speaking, rig.faces.blink, ...(currentFace ? [currentFace] : [])], this.services.assetHealth);
    }

    this.shell(`<section class="vn-screen text-${this.textScale}">
      <div class="vn-background-stack" aria-hidden="true">
        <img class="vn-background vn-background-fill" src="${backgroundAssets[background]}" alt="">
        <img class="vn-background vn-background-fit" src="${backgroundAssets[background]}" alt="">
      </div>
      <span class="visually-hidden">${escapeHtml(meta.location)}</span>
      <div class="vn-vignette"></div>
      <header class="app-header vn-topbar">
        <button id="dossier" class="vn-case-pill" aria-label="Открыть досье">
          <span><small>CASE 001 · SCENE ${String(this.save.scene).padStart(2, '0')}</small><b>${escapeHtml(meta.title)}</b></span>
          <i>${icon('dossier')}<em>${this.save.clues.length}</em></i>
        </button>
        <nav class="app-header-actions" aria-label="Навигация visual novel">
          ${this.headerActionMarkup('history', 'log', 'История диалога')}
          ${this.headerActionMarkup('header-settings', 'settings', 'Настройки')}
        </nav>
      </header>
      <div class="stage ${staging ? `stage-${staging.side}` : 'stage-empty'}" data-stage-side="${staging?.side ?? 'none'}">
        ${character ? this.characterMarkup(character, expression, entry.emotion, staging?.side ?? 'center') : ''}
        ${placeholder ? this.placeholderMarkup(placeholder, staging?.side ?? 'center') : ''}
        ${direction ? `<div class="direction-card"><span>ПОСТАНОВКА</span><b>${escapeHtml(entry.emotion)}</b></div>` : ''}
        ${clueToast}
      </div>
      <div class="dialogue-shell ${direction ? 'direction' : ''}">
        <span class="dialogue-nameplate">${direction ? 'ПОСТАНОВКА' : escapeHtml(entry.speaker)}<em>${escapeHtml(entry.emotion)}</em></span>
        <button class="dialogue ${direction ? 'direction' : ''}" id="next">
          <span class="dialogue-text" data-dialogue-page="${this.dialoguePageIndex + 1}" data-dialogue-pages="${dialoguePages.length}">${escapeHtml(dialogueContinuationText(dialoguePage, this.dialoguePageIndex < dialoguePages.length - 1))}</span>
          <span class="line-id">${entry.id}${dialoguePages.length > 1 ? ` · ${this.dialoguePageIndex + 1}/${dialoguePages.length}` : ''}</span>
          <span class="dialogue-progress" aria-hidden="true">${dialoguePages.map((_, page) => `<i class="${page <= this.dialoguePageIndex ? 'is-active' : ''}"></i>`).join('')}<b>▼</b></span>
        </button>
      </div>
      <nav class="vn-controls" aria-label="Управление visual novel">
        <button id="skip" ${skipAvailable ? '' : 'disabled'}>${icon('skip')}<span>SKIP</span></button>
        <button id="auto" class="${this.autoMode ? 'is-active' : ''}">${icon('auto')}<span>AUTO</span></button>
        <button id="save-vn">${icon('save')}<span>SAVE</span></button>
        <button id="load-vn">${icon('load')}<span>LOAD</span></button>
      </nav>
      <div id="vn-status" class="vn-status" hidden></div>
    </section>`);

    dialoguePages = this.measureAndApplyDialoguePages(entry.id, entry.text, fallbackDialoguePages);
    dialoguePage = dialoguePages[this.dialoguePageIndex] ?? entry.text;
    this.pendingClue = null;
    this.preloadNextVnAssets();
    this.root.querySelector('#header-settings')?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.renderVnConfigOverlay();
    });
    this.root.querySelector('#dossier')?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.renderDossier(() => this.renderVN());
    });
    this.root.querySelector('#history')?.addEventListener('click', (event) => {
      event.stopPropagation();
      this.renderHistoryOverlay();
    });
    this.root.querySelector('#next')?.addEventListener('click', () => this.nextLine());
    this.root.querySelector('#skip')?.addEventListener('click', () => this.skipReadLines());
    this.root.querySelector('#auto')?.addEventListener('click', () => {
      this.autoMode = !this.autoMode;
      this.renderVN();
    });
    this.root.querySelector('#save-vn')?.addEventListener('click', () => {
      if (this.store.saveManual(this.save)) this.showVnStatus('Ручной слот сохранён');
      else this.showVnStatus('Не удалось сохранить ручной слот');
    });
    this.root.querySelector('#load-vn')?.addEventListener('click', () => {
      const manual = this.store.loadManual();
      if (!manual) { this.showVnStatus('Ручной слот пока пуст'); return; }
      this.save = manual;
      this.persist();
      this.openScene(this.save.scene, this.save.line);
    });
    if (character && !this.usesPoseB(character, entry.emotion)) this.animatePortrait(character, expression);
    if (this.autoMode) this.timers.push(window.setTimeout(() => this.nextLine(), autoDelayForLine(dialoguePage, this.autoSpeed)));
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
    const nextIndex = Math.min(this.story.length - 1, this.save.line + 1);
    const next = this.story[nextIndex];
    if (!next) return;
    const assets = [backgroundAssets[getBackgroundForLine(this.save.scene, nextIndex, this.story)]];
    if (!isDirection(next)) {
      const character = characterForSpeaker(next.speaker);
      if (character) {
        const rig = characterRigs[character];
        const poseB = this.usesPoseB(character, next.emotion);
        assets.push(poseB ? rig.poseB : rig.base);
        if (!poseB) {
          assets.push(rig.faces.speaking, rig.faces.blink);
          const face = faceAsset(character, expressionForDirection(next.emotion));
          if (face) assets.push(face);
        }
      }
    }
    void preloadImageAssets(assets, this.services.assetHealth);
  }

  private renderHistoryOverlay(): void {
    this.clearTimers();
    const current = this.story[this.save.line];
    const history = getReadHistory(this.save.readLines, this.save.choice);
    const entries = current && !history.some((line) => line.id === current.id) ? [...history, current] : history;
    const phone = this.root.querySelector<HTMLElement>('.phone');
    if (!phone) return;
    phone.insertAdjacentHTML('beforeend', `<section class="vn-overlay" role="dialog" aria-modal="true" aria-label="История диалога">
      <div class="vn-overlay-card history-card">
        <header><div><small>CASE LOG</small><h2>История диалога</h2></div><button id="close-overlay" class="overlay-close" aria-label="Закрыть">${icon('close')}</button></header>
        <div class="history-list">${entries.length ? entries.map((line) => `
          <article class="${isDirection(line) ? 'is-direction' : ''}">
            <div><b>${isDirection(line) ? 'ПОСТАНОВКА' : escapeHtml(line.speaker)}</b><small>${line.id}</small></div>
            <p>${escapeHtml(line.text)}</p>
          </article>`).join('') : '<p class="empty-history">Здесь появятся уже прочитанные реплики.</p>'}</div>
      </div>
    </section>`);
    phone.querySelector('#close-overlay')?.addEventListener('click', () => this.renderVN());
  }

  private renderVnConfigOverlay(): void {
    this.clearTimers();
    const phone = this.root.querySelector<HTMLElement>('.phone');
    if (!phone) return;
    phone.insertAdjacentHTML('beforeend', `<section class="vn-overlay" role="dialog" aria-modal="true" aria-label="Настройки чтения">
      <div class="vn-overlay-card config-card">
        <header><div><small>CONFIG</small><h2>Настройки чтения</h2></div><button id="close-overlay" class="overlay-close" aria-label="Закрыть">${icon('close')}</button></header>
        <fieldset><legend>Скорость AUTO</legend><div class="segmented">
          ${(['slow', 'normal', 'fast'] as AutoSpeed[]).map((speed) => `<button data-auto-speed="${speed}" class="${this.autoSpeed === speed ? 'is-selected' : ''}">${speed === 'slow' ? 'Медленно' : speed === 'normal' ? 'Обычно' : 'Быстро'}</button>`).join('')}
        </div></fieldset>
        <fieldset><legend>Размер текста</legend><div class="segmented">
          ${(['normal', 'large'] as TextScale[]).map((scale) => `<button data-text-scale="${scale}" class="${this.textScale === scale ? 'is-selected' : ''}">${scale === 'normal' ? 'Обычный' : 'Крупный'}</button>`).join('')}
        </div></fieldset>
        <fieldset><legend>Звук и отклик</legend>${this.audioSettingsMarkup()}</fieldset>
        <div class="vn-config-navigation"><small>НАВИГАЦИЯ</small><button id="vn-main-menu">${icon('menu')}<span><b>Главное меню</b><em>Текущая позиция сохранена</em></span></button></div>
        <p>Скорость AUTO и размер текста действуют в текущей сессии. Audio-настройки сохраняются между запусками. Системный Reduced Motion по-прежнему имеет приоритет для анимаций.</p>
      </div>
    </section>`);
    phone.querySelector('#close-overlay')?.addEventListener('click', () => this.renderVN());
    phone.querySelector('#vn-main-menu')?.addEventListener('click', () => this.returnToMainMenu());
    phone.querySelectorAll<HTMLElement>('[data-auto-speed]').forEach((button) => button.addEventListener('click', () => {
      this.autoSpeed = button.dataset.autoSpeed as AutoSpeed;
      this.renderVnConfigOverlayFromScratch();
    }));
    phone.querySelectorAll<HTMLElement>('[data-text-scale]').forEach((button) => button.addEventListener('click', () => {
      this.textScale = button.dataset.textScale as TextScale;
      this.renderVnConfigOverlayFromScratch();
    }));
    this.bindAudioSettingsControls(phone, () => this.renderVnConfigOverlayFromScratch());
  }

  private renderVnConfigOverlayFromScratch(): void {
    this.root.querySelector('.vn-overlay')?.remove();
    this.renderVnConfigOverlay();
  }

  private skipReadLines(): void {
    const target = nextUnreadIndex(this.story, this.save.line, this.save.readLines);
    if (target === this.save.line) {
      this.showVnStatus('SKIP доступен только для уже прочитанных реплик');
      return;
    }
    this.save.line = target;
    this.persist();
    const entry = this.story[this.save.line];
    if (entry?.id === 'VN0040' && this.save.readLines.includes('VN0040')) this.renderChoice();
    else if (this.save.line >= this.story.length) this.advanceScene();
    else this.renderVN();
  }

  private showVnStatus(message: string): void {
    const status = this.root.querySelector<HTMLElement>('#vn-status');
    if (!status) return;
    status.textContent = message;
    status.hidden = false;
    this.timers.push(window.setTimeout(() => { status.hidden = true; }, 1500));
  }

  private characterMarkup(character: CharacterKey, expression: RuntimeExpression, direction: string, side: VnStageSide): string {
    const rig = characterRigs[character];
    if (this.usesPoseB(character, direction)) {
      return `<div class="portrait portrait-${side} portrait-static-wrap"><img class="portrait-static" src="${rig.poseB}" alt="${rig.displayName}"></div>`;
    }
    const face = faceAsset(character, expression);
    return `<div class="portrait portrait-${side} character-rig" data-character="${character}">
      <img class="portrait-base" src="${rig.base}" alt="${rig.displayName}">
      <img class="portrait-face ${face ? '' : 'is-hidden'}" src="${face ?? rig.faces.speaking}" alt="">
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

  private animatePortrait(character: CharacterKey, baseExpression: RuntimeExpression): void {
    const face = this.root.querySelector<HTMLImageElement>('.portrait-face');
    if (!face) return;
    const startedAt = performance.now();
    let speaking = false;
    const setFace = (expression: RuntimeExpression): void => {
      const asset = faceAsset(character, expression);
      face.classList.toggle('is-hidden', !asset);
      if (asset) face.src = asset;
    };

    const talk = (): void => {
      if (performance.now() - startedAt > 1750) {
        setFace(baseExpression);
        return;
      }
      speaking = !speaking;
      setFace(speaking ? 'speaking' : baseExpression);
      this.timers.push(window.setTimeout(talk, 120 + Math.round(Math.random() * 60)));
    };
    this.timers.push(window.setTimeout(talk, 180));

    const blink = (): void => {
      setFace('blink');
      this.timers.push(window.setTimeout(() => {
        setFace(baseExpression);
        this.timers.push(window.setTimeout(blink, 3400 + Math.round(Math.random() * 2800)));
      }, 170));
    };
    this.timers.push(window.setTimeout(blink, 3600 + Math.round(Math.random() * 2200)));
  }

  private nextLine(): void {
    this.services.audio.play('vnAdvance');
    const entry = this.story[this.save.line];
    if (!entry) return this.advanceScene();
    const dialoguePages = this.dialoguePageLineId === entry.id && this.dialoguePages.length > 0
      ? this.dialoguePages
      : paginateDialogueText(entry.text, currentDialogueProfile(this.textScale));
    if (this.dialoguePageLineId === entry.id && this.dialoguePageIndex < dialoguePages.length - 1) {
      this.dialoguePageIndex += 1;
      this.renderVN();
      return;
    }
    if (!this.save.readLines.includes(entry.id)) this.save.readLines.push(entry.id);
    if (this.save.scene === 1 && entry.id === 'VN0040') {
      this.persist();
      this.renderChoice();
      return;
    }
    this.save.line += 1;
    this.persist();
    if (this.save.line >= this.story.length) this.advanceScene();
    else this.renderVN();
  }

  private renderChoice(): void {
    this.services.audio.setScene('vn');
    this.shell(`<section class="choice-screen">
      <div class="choice-background-stack" aria-hidden="true">
        <img class="choice-background choice-background-fill" src="${backgroundAssets.clubroom}" alt="">
        <img class="choice-background choice-background-fit" src="${backgroundAssets.clubroom}" alt="">
      </div>
      <header class="app-header choice-topbar">
        <div class="app-header-title"><small>CASE 001 · CHOICE_00</small><b>Выбор версии</b></div>
        <nav class="app-header-actions" aria-label="Навигация">
          ${this.headerActionMarkup('header-settings', 'settings', 'Настройки')}
        </nav>
      </header>
      <div class="choice-panel">
        <p class="eyebrow">CHOICE_00</p><h2>С чего начать?</h2>
        ${(Object.keys(choices) as ChoiceId[]).map((id) => `<button data-choice="${id}"><i>${id}</i><span><b>${choices[id].title}</b><small>${choices[id].effect}</small></span></button>`).join('')}
      </div>
    </section>`);
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.renderSettings(() => this.renderChoice(), true));
    this.root.querySelectorAll<HTMLElement>('[data-choice]').forEach((button) => button.addEventListener('click', () => {
      this.services.audio.play('choice');
      this.save.choice = button.dataset.choice as ChoiceId;
      this.story = getScene(1, this.save.choice);
      const branchIndex = this.story.findIndex((line) => line.id === `VN0041${this.save.choice}`);
      this.save.line = Math.max(0, branchIndex);
      this.persist();
      this.renderVN();
    }));
  }

  private advanceScene(): void {
    if (isPreMatchScene(this.save.scene)) {
      this.save.line = this.story.length;
      this.persist();
      this.renderMatchIntro(levelForPreMatchScene(this.save.scene));
      return;
    }
    if (this.save.scene === sceneMeta.length - 1) {
      this.renderEnding();
      return;
    }
    this.openScene(this.save.scene + 1, 0);
  }

  private preloadMatchAssets(level: LevelDefinition): void {
    if (typeof Image === 'undefined') return;
    const assets = [
      backgroundAssets[level.background],
      blockerPresentation[level.blocker].asset,
      specialAsset,
      ...Object.values(tilePresentation).map((presentation) => presentation.asset),
      ...Object.values(ingredientPresentation).map((presentation) => presentation.asset),
    ];
    void preloadImageAssets(assets, this.services.assetHealth);
  }

  private renderMatchIntro(levelIndex: number): void {
    this.services.audio.setScene('match');
    const level = levels[levelIndex];
    this.preloadMatchAssets(level);
    this.activeLevelIndex = levelIndex;
    this.activeMatch = null;
    this.shell(`<section class="level-intro">
      <img class="level-intro-background" src="${backgroundAssets[level.background]}" alt="">
      <div class="level-intro-shade"></div>
      <header class="app-header match-topbar intro-topbar">
        ${this.headerActionMarkup('back', 'back', 'Назад', undefined, 'app-header-back')}
        <div class="app-header-title"><small>РАССЛЕДОВАНИЕ ${levelIndex + 1}/4</small><b>${escapeHtml(level.title)}</b></div>
        <nav class="app-header-actions" aria-label="Навигация расследования">
          ${this.headerActionMarkup('dossier', 'dossier', 'Досье', this.save.clues.length)}
          ${this.headerActionMarkup('header-settings', 'settings', 'Настройки')}
        </nav>
      </header>
      <div class="level-card">
        <p class="eyebrow">${escapeHtml(level.id)}</p>
        <h2>${escapeHtml(level.title)}</h2>
        <p>${escapeHtml(level.storyAction)}</p>
        <div class="intro-objectives">${level.objectives.map((objective) => this.objectiveMarkup(level, objective, 0, false)).join('')}</div>
        <div class="moves-chip"><b>${level.moves}</b><span>ходов</span></div>
        <button id="start" class="primary">Начать поиск</button>
      </div>
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', () => this.openScene(this.save.scene, Math.max(0, this.story.length - 1)));
    this.root.querySelector('#dossier')?.addEventListener('click', () => this.renderDossier(() => this.renderMatchIntro(levelIndex)));
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.renderSettings(() => this.renderMatchIntro(levelIndex), true));
    this.root.querySelector('#start')?.addEventListener('click', () => this.startMatch(levelIndex));
  }

  private startMatch(levelIndex: number): void {
    const level = levels[levelIndex];
    const attempt = (this.save.attempts[level.id] ?? 0) + 1;
    this.save.attempts[level.id] = attempt;
    this.persist();
    this.activeLevelIndex = levelIndex;
    this.activeMatch = new Match3Game(level, level.seed + attempt * 101);
    this.selectedCell = null;
    this.matchInputLocked = false;
    this.activePointer = null;
    this.hintedCells.clear();
    this.triggeredBarks = new Set(['start']);
    this.matchBark = level.startBark;
    this.renderMatch();
  }

  private boardCellsMarkup(
    board: readonly BoardCell[],
    blockerAsset: string,
    options: Readonly<{ clearing?: ReadonlySet<number>; motions?: ReadonlyMap<number, Readonly<{ kind: 'fall' | 'spawn'; rows: number }>> }> = {},
  ): string {
    return board.map((cell, index) => {
      const selected = this.selectedCell === index ? ' selected' : '';
      const hinted = this.hintedCells.has(index) ? ' hinted' : '';
      const clearing = options.clearing?.has(index) ? ' is-clearing' : '';
      const motion = options.motions?.get(index);
      const motionClass = motion ? ` settle-${motion.kind}` : '';
      const motionStyle = motion ? ` style="--settle-rows:${motion.rows}"` : '';
      const tile = cell.tile ? tilePresentation[cell.tile] : null;
      const ingredient = cell.ingredient ? ingredientPresentation[cell.ingredient] : null;
      const cellLabel = ingredient?.label ?? tile?.label ?? 'Пустая клетка';
      return `<button class="board-cell${selected}${hinted}${clearing}${motionClass}" data-cell="${index}" role="gridcell" aria-label="${escapeHtml(cellLabel)}"${motionStyle}>
        <span class="tile-socket"></span>
        <span class="tile-stack">
          ${tile ? `<img class="tile" src="${tile.asset}" alt="" draggable="false">` : ''}
          ${ingredient ? `<img class="ingredient" src="${ingredient.asset}" alt="" draggable="false">` : ''}
          ${cell.special ? `<img class="special ${cell.special}" src="${specialAsset}" alt="" draggable="false">` : ''}
        </span>
        ${cell.blockerLayers > 0 ? `<span class="blocker"><img src="${blockerAsset}" alt="" draggable="false"><b>${cell.blockerLayers}</b></span>` : ''}
      </button>`;
    }).join('');
  }

  private barkMedallion(): string {
    const speaker = this.matchBark?.speaker ?? '';
    if (speaker.includes('Мику')) return characterRigs.miku.medallion;
    if (speaker.includes('Оноэ')) return characterRigs.onoe.medallion;
    if (speaker.includes('Аюки')) return characterRigs.ayuki.medallion;
    return characterRigs.miku.medallion;
  }

  private renderMatch(): void {
    this.services.audio.setScene('match');
    const game = this.activeMatch;
    if (!game) return this.renderMatchIntro(this.activeLevelIndex);
    const level = game.level;
    const blocker = blockerPresentation[level.blocker];

    this.shell(`<section class="match-screen">
      <img class="match-background" src="${backgroundAssets[level.background]}" alt="">
      <div class="match-shade"></div>
      <header class="app-header match-topbar">
        ${this.headerActionMarkup('quit', 'back', 'Назад к расследованию', undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(level.shortId)}</small><b>${escapeHtml(level.title)}</b></div>
        <nav class="app-header-actions" aria-label="Навигация расследования">
          ${this.headerActionMarkup('dossier', 'dossier', 'Досье', this.save.clues.length)}
          ${this.headerActionMarkup('header-settings', 'settings', 'Настройки')}
        </nav>
      </header>

      <div class="match-case-hud">
        <section class="objective-board" aria-label="Цели расследования">
          <span class="case-tab">ЦЕЛЬ</span>
          <div class="objectives">${level.objectives.map((objective, index) => this.objectiveMarkup(level, objective, game.objectiveValue(index), true)).join('')}</div>
        </section>
        <section class="stage-board" aria-label="Ходы и этап">
          <span class="case-tab">ХОДЫ</span>
          <div class="moves-left"><b>${game.movesLeft}</b></div>
          <div class="stage-meta"><small>ЭТАП ${this.activeLevelIndex + 1}/4</small><b>${escapeHtml(level.shortId)}</b></div>
        </section>
      </div>

      ${this.matchBark ? `<div class="field-bark"><img src="${this.barkMedallion()}" alt=""><div><b>${escapeHtml(this.matchBark.speaker)}</b><span>${escapeHtml(this.matchBark.text)}</span></div></div>` : ''}
      <div id="match-feedback" class="match-feedback" aria-live="polite"></div>
      <div class="board" role="grid" aria-label="Поле 8 на 8">${this.boardCellsMarkup(game.board, blocker.asset)}</div>

      <div class="match-tooltray">
        <div class="detective-strip" aria-label="Команда расследования">
          ${(['miku', 'onoe', 'ayuki'] as const).map((key) => `<span><img src="${characterRigs[key].medallion}" alt="${characterRigs[key].displayName}"><b>${escapeHtml(characterRigs[key].displayName)}</b></span>`).join('')}
        </div>
        <button id="hint" class="hint-button">
          <img src="${specialAsset}" alt=""><span><b>ПОДСКАЗКА</b><small>Лучший ход</small></span>
        </button>
      </div>
      <p class="match-hint">Перетащите фишку, свайпните или выберите две соседние · подсказка учитывает цели.</p>
    </section>`);

    this.root.querySelector('#quit')?.addEventListener('click', () => {
      if (this.matchInputLocked) return;
      this.activeMatch = null;
      this.renderMatchIntro(this.activeLevelIndex);
    });
    this.root.querySelector('#dossier')?.addEventListener('click', () => {
      if (this.matchInputLocked) return;
      this.renderDossier(() => this.renderMatch());
    });
    this.root.querySelector('#header-settings')?.addEventListener('click', () => {
      if (this.matchInputLocked) return;
      this.renderSettings(() => this.renderMatch(), true);
    });
    this.root.querySelector('#hint')?.addEventListener('click', () => this.showObjectiveHint());
    this.installBoardInput();
  }

  private showObjectiveHint(): void {
    const game = this.activeMatch;
    if (!game || this.matchInputLocked) return;
    const hint = game.getHintMove();
    this.selectedCell = null;
    this.hintedCells.clear();
    if (!hint) {
      this.matchBark = { speaker: 'Оноэ', text: 'Поле не даёт корректного обмена. Нужна перестановка.' };
      this.renderMatch();
      return;
    }
    this.hintedCells.add(hint.first);
    this.hintedCells.add(hint.second);
    this.services.audio.play('hint');
    this.matchBark = { speaker: 'Мику', text: 'Этот обмен лучше всего продвигает текущие цели расследования.' };
    this.renderMatch();
  }

  private prefersReducedMatchMotion(): boolean {
    return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  }

  private matchDelay(milliseconds: number): Promise<void> {
    if (this.prefersReducedMatchMotion()) return Promise.resolve();
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  private setMatchFeedback(text: string, kind = ''): void {
    const feedback = this.root.querySelector<HTMLElement>('#match-feedback');
    if (!feedback) return;
    feedback.className = `match-feedback${kind ? ` ${kind}` : ''}${text ? ' visible' : ''}`;
    feedback.textContent = text;
  }

  private renderMatchFrame(frame: Match3Frame): void {
    const game = this.activeMatch;
    const board = this.root.querySelector<HTMLElement>('.board');
    if (!game || !board) return;
    const blocker = blockerPresentation[game.level.blocker];
    const clearing = frame.clearedIndices ? new Set(frame.clearedIndices) : undefined;
    const motions = frame.motions
      ? new Map(frame.motions.map((motion) => [motion.index, { kind: motion.kind, rows: motion.rows }] as const))
      : undefined;
    board.innerHTML = this.boardCellsMarkup(frame.board, blocker.asset, { clearing, motions });
    board.className = `board phase-${frame.phase}`;
    if (frame.phase === 'clear') {
      if (frame.specialsActivated > 0) { this.services.audio.play('special'); this.setMatchFeedback('НАБЛЮДЕНИЕ!', 'special-feedback'); }
      else if (frame.cascade >= 2) { this.services.audio.play('cascade'); this.setMatchFeedback(`ЦЕПОЧКА ×${frame.cascade}`, 'combo-feedback'); }
      else { this.services.audio.play('match'); this.setMatchFeedback('СОВПАДЕНИЕ', 'match-feedback-good'); }
    } else if (frame.phase === 'reshuffle') {
      this.services.audio.play('reshuffle');
      this.setMatchFeedback('ПОЛЕ ПЕРЕМЕШАНО', 'reshuffle-feedback');
    } else if (frame.phase !== 'settle') {
      this.setMatchFeedback('');
    }
  }

  private matchCellStack(index: number): HTMLElement | null {
    return this.root.querySelector<HTMLElement>(`[data-cell="${index}"] .tile-stack`);
  }

  private clearDragPreview(): void {
    this.root.querySelectorAll<HTMLElement>('.board-cell.drag-source, .board-cell.drag-target, .board-cell.drag-target--commit').forEach((cell) => {
      cell.classList.remove('drag-source', 'drag-target', 'drag-target--commit');
    });
    this.root.querySelectorAll<HTMLElement>('.tile-stack').forEach((stack) => {
      stack.style.removeProperty('--drag-x');
      stack.style.removeProperty('--drag-y');
      stack.style.removeProperty('--drag-target-x');
      stack.style.removeProperty('--drag-target-y');
    });
  }

  private async animateSwapStacks(first: number, second: number, keepAtTarget = false): Promise<void> {
    const firstCell = this.root.querySelector<HTMLElement>(`[data-cell="${first}"]`);
    const secondCell = this.root.querySelector<HTMLElement>(`[data-cell="${second}"]`);
    const firstStack = this.matchCellStack(first);
    const secondStack = this.matchCellStack(second);
    if (!firstCell || !secondCell || !firstStack || !secondStack) return;

    const firstRect = firstCell.getBoundingClientRect();
    const secondRect = secondCell.getBoundingClientRect();
    const dx = secondRect.left - firstRect.left;
    const dy = secondRect.top - firstRect.top;
    const duration = matchMotionDuration('swap', this.prefersReducedMatchMotion());
    if (duration <= 0) return;

    for (const [stack, x, y] of [[firstStack, dx, dy], [secondStack, -dx, -dy]] as const) {
      stack.style.setProperty('--swap-x', `${x}px`);
      stack.style.setProperty('--swap-y', `${y}px`);
      stack.classList.add('swap-moving');
    }
    await this.matchDelay(duration);
    for (const stack of [firstStack, secondStack]) {
      stack.classList.remove('swap-moving');
      if (keepAtTarget) stack.classList.add('swap-held');
      else {
        stack.style.removeProperty('--swap-x');
        stack.style.removeProperty('--swap-y');
      }
    }
  }

  private async playMoveFrames(result: MoveResult, first: number, second: number): Promise<void> {
    const reduced = this.prefersReducedMatchMotion();
    this.clearDragPreview();

    if (!result.valid) {
      this.services.audio.play('invalidSwap');
      const cells = [first, second]
        .map((index) => this.root.querySelector<HTMLElement>(`[data-cell="${index}"]`))
        .filter((cell): cell is HTMLElement => Boolean(cell));
      const noMatch = result.reason === 'no-match';
      if (noMatch) await this.animateSwapStacks(first, second, !reduced);
      cells.forEach((cell) => cell.classList.add('swap-rejected'));
      this.setMatchFeedback(noMatch ? 'НЕТ СОВПАДЕНИЯ' : 'ОБМЕН НЕДОСТУПЕН', 'reject-feedback');
      await this.matchDelay(matchMotionDuration('invalidHold', reduced));
      cells.forEach((cell) => cell.classList.remove('swap-rejected'));
      if (noMatch && !reduced) {
        const stacks = [this.matchCellStack(first), this.matchCellStack(second)].filter((stack): stack is HTMLElement => Boolean(stack));
        stacks.forEach((stack) => stack.classList.add('swap-return-home'));
        await this.matchDelay(matchMotionDuration('swap', false));
        stacks.forEach((stack) => {
          stack.classList.remove('swap-held', 'swap-return-home');
          stack.style.removeProperty('--swap-x');
          stack.style.removeProperty('--swap-y');
        });
      }
      this.setMatchFeedback('');
      return;
    }

    this.services.audio.play('swap');
    await this.animateSwapStacks(first, second, !reduced);

    if (reduced) {
      const finalFrame = [...result.frames].reverse().find((frame) => frame.phase === 'settle' || frame.phase === 'reshuffle') ?? result.frames[result.frames.length - 1];
      if (finalFrame) this.renderMatchFrame(finalFrame);
      if (result.specialsCreated > 0) this.services.audio.play('special');
      else if (result.cascades >= 2) this.services.audio.play('cascade');
      else this.services.audio.play('match');
      if (result.reshuffled) this.services.audio.play('reshuffle');
      if (result.won) this.services.audio.play('win');
      else if (result.lost) this.services.audio.play('lose');
      return;
    }

    for (const frame of result.frames) {
      this.renderMatchFrame(frame);
      if (frame.phase === 'swap') continue;
      const duration = frame.phase === 'clear'
        ? matchMotionDuration('clear', false)
        : frame.phase === 'settle'
          ? matchMotionDuration('settle', false)
          : matchMotionDuration('reshuffle', false);
      await this.matchDelay(duration);
    }

    if (result.cascades >= 2) {
      this.setMatchFeedback(`ЦЕПОЧКА ×${result.cascades}`, 'combo-feedback');
      await this.matchDelay(matchMotionDuration('feedbackHold', false));
    }
    if (result.won) {
      this.services.audio.play('win');
      this.setMatchFeedback('УЛИКА СОБРАНА', 'win-feedback');
      await this.matchDelay(matchMotionDuration('feedbackHold', false));
    } else if (result.lost) {
      this.services.audio.play('lose');
      this.setMatchFeedback('ХОДЫ ЗАКОНЧИЛИСЬ', 'loss-feedback');
      await this.matchDelay(matchMotionDuration('feedbackHold', false));
    }
  }

  private installBoardInput(): void {
    const board = this.root.querySelector<HTMLElement>('.board');
    if (!board) return;

    this.root.querySelectorAll<HTMLElement>('[data-cell]').forEach((cell) => {
      cell.addEventListener('click', () => {
        if (performance.now() < this.suppressBoardClickUntil) return;
        this.handleCell(Number(cell.dataset.cell));
      });
      cell.addEventListener('pointerdown', (event) => {
        if (this.matchInputLocked || event.button !== 0) return;
        const startIndex = Number(cell.dataset.cell);
        this.activePointer = { id: event.pointerId, startIndex, startX: event.clientX, startY: event.clientY };
        this.hintedCells.clear();
        cell.classList.add('drag-source');
        cell.setPointerCapture?.(event.pointerId);
      });
    });

    board.addEventListener('pointermove', (event) => {
      const pointer = this.activePointer;
      if (!pointer || pointer.id !== event.pointerId || this.matchInputLocked) return;
      event.preventDefault();
      const sourceCell = this.root.querySelector<HTMLElement>(`[data-cell="${pointer.startIndex}"]`);
      const sourceStack = sourceCell?.querySelector<HTMLElement>('.tile-stack');
      if (!sourceCell || !sourceStack) return;
      const cellSize = Math.max(1, sourceCell.getBoundingClientRect().width);
      const preview = getDragPreview(pointer.startIndex, event.clientX - pointer.startX, event.clientY - pointer.startY, cellSize);

      this.root.querySelectorAll<HTMLElement>('.board-cell.drag-target, .board-cell.drag-target--commit').forEach((target) => {
        target.classList.remove('drag-target', 'drag-target--commit');
        const stack = target.querySelector<HTMLElement>('.tile-stack');
        stack?.style.removeProperty('--drag-target-x');
        stack?.style.removeProperty('--drag-target-y');
      });
      sourceStack.style.setProperty('--drag-x', `${preview.x}px`);
      sourceStack.style.setProperty('--drag-y', `${preview.y}px`);

      if (preview.targetReacting && preview.targetIndex !== null) {
        const targetCell = this.root.querySelector<HTMLElement>(`[data-cell="${preview.targetIndex}"]`);
        const targetStack = targetCell?.querySelector<HTMLElement>('.tile-stack');
        if (targetCell && targetStack) {
          targetCell.classList.add('drag-target');
          if (preview.committed) targetCell.classList.add('drag-target--commit');
          targetStack.style.setProperty('--drag-target-x', `${preview.targetOffsetX}px`);
          targetStack.style.setProperty('--drag-target-y', `${preview.targetOffsetY}px`);
        }
      }
    });

    board.addEventListener('pointercancel', (event) => {
      if (this.activePointer?.id !== event.pointerId) return;
      this.activePointer = null;
      this.clearDragPreview();
    });

    board.addEventListener('pointerup', (event) => {
      const pointer = this.activePointer;
      if (!pointer || pointer.id !== event.pointerId || this.matchInputLocked) return;
      this.activePointer = null;
      const sourceCell = this.root.querySelector<HTMLElement>(`[data-cell="${pointer.startIndex}"]`);
      const cellSize = Math.max(1, sourceCell?.getBoundingClientRect().width ?? board.getBoundingClientRect().width / 8);
      const deltaX = event.clientX - pointer.startX;
      const deltaY = event.clientY - pointer.startY;
      const drag = getDragPreview(pointer.startIndex, deltaX, deltaY, cellSize);
      const swipe = getSwipeDecision(pointer.startIndex, deltaX, deltaY, cellSize);
      this.clearDragPreview();

      const committed = drag.committed || swipe.committed;
      const targetIndex = drag.committed ? drag.targetIndex : swipe.targetIndex;
      if (!committed) return;

      event.preventDefault();
      this.suppressBoardClickUntil = performance.now() + 500;
      this.hintedCells.clear();
      this.selectedCell = null;
      if (targetIndex === null) {
        this.selectedCell = null;
        this.matchBark = { speaker: 'Мику', text: 'За краем поля обмена нет. Попробуем соседнюю клетку.' };
        this.renderMatch();
        return;
      }
      this.attemptMatchSwap(pointer.startIndex, targetIndex);
    });
  }

  private handleCell(index: number): void {
    const game = this.activeMatch;
    if (!game || this.matchInputLocked) return;
    this.hintedCells.clear();
    if (this.selectedCell === null) {
      this.selectedCell = index;
      this.renderMatch();
      return;
    }
    if (this.selectedCell === index) {
      this.selectedCell = null;
      this.renderMatch();
      return;
    }

    const first = this.selectedCell;
    this.selectedCell = null;
    this.attemptMatchSwap(first, index, true);
  }

  private async attemptMatchSwap(first: number, second: number, selectSecondWhenNonAdjacent = false): Promise<void> {
    const game = this.activeMatch;
    if (!game || this.matchInputLocked) return;
    this.matchInputLocked = true;
    this.hintedCells.clear();
    try {
      const result = game.attemptSwap(first, second);
      if (!result.valid) {
        if (result.reason === 'not-adjacent' && selectSecondWhenNonAdjacent) {
          this.selectedCell = second;
          this.renderMatch();
          return;
        }
        if (result.reason === 'ingredient') this.matchBark = { speaker: 'Мику', text: 'Сюжетный объект нужно опустить вниз совпадениями под ним.' };
        else if (result.reason === 'blocked') this.matchBark = { speaker: 'Оноэ', text: 'Эта секция заперта. Сначала соберём совпадение рядом.' };
        else if (result.reason === 'no-match') this.matchBark = { speaker: 'Оноэ', text: 'Этот обмен не образует ряд. Проверим соседние категории.' };
        await this.playMoveFrames(result, first, second);
        this.renderMatch();
        return;
      }

      this.updateBark(result);
      await this.playMoveFrames(result, first, second);
      if (result.won) {
        this.completeLevel();
        return;
      }
      if (result.lost) {
        this.renderLoss();
        return;
      }
      this.renderMatch();
    } finally {
      this.matchInputLocked = false;
    }
  }

  private updateBark(result: MoveResult): void {
    const game = this.activeMatch!;
    const index = this.activeLevelIndex;
    const progress = game.progress;
    const moveNumber = game.level.moves - game.movesLeft;

    if (game.movesLeft === 5 && !this.triggeredBarks.has('fiveMoves')) {
      this.triggeredBarks.add('fiveMoves');
      const texts: Bark[] = [
        { speaker: 'Мику', text: 'Ещё немного. Нам нужна связь с прачечной.' },
        { speaker: 'Кэнтаро', text: 'Если вы её снова потеряете, это будет уже коллективное алиби.' },
        { speaker: 'Мику', text: 'Нужен шкаф. Там журнал возврата.' },
        { speaker: 'Оноэ', text: 'Нужны оба объекта. Без чека версия не закрыта.' },
      ];
      this.matchBark = texts[index];
      return;
    }
    if (result.specialsCreated > 0 && !this.triggeredBarks.has('special')) {
      this.triggeredBarks.add('special');
      this.matchBark = { speaker: 'Мику', text: 'Если посмотреть на всё сразу, беспорядок превращается в узор.' };
      return;
    }
    const blockerThresholds = [3, 1, 6, 4];
    if (progress.blockersCleared >= blockerThresholds[index] && !this.triggeredBarks.has('blockers')) {
      this.triggeredBarks.add('blockers');
      const texts: Bark[] = [
        { speaker: 'Аюки', text: 'Улика U-1 освобождена. Нет, я не дала ей имя.' },
        { speaker: 'Оноэ', text: 'Упаковка плотная. Один удар откроет, второй освободит содержимое.' },
        { speaker: 'Мику', text: 'Под пеной вещи из разных секций. Их смешали ещё до шкафчиков.' },
        { speaker: 'Аюки', text: 'Ни тайника, ни сообщницы. У этой квартиры нет чувства драмы.' },
      ];
      this.matchBark = texts[index];
      return;
    }
    if (moveNumber === 1 && !this.triggeredBarks.has('ingredient')) {
      this.triggeredBarks.add('ingredient');
      const texts: Bark[] = [
        { speaker: 'Оноэ', text: 'Документ в верхней секции. Освободи путь к нижнему краю.' },
        { speaker: 'Аюки', text: 'Маленькая чёрная карта, огромный шанс на драму.' },
        { speaker: 'Аюки', text: 'Ключ всплыл. Метафорически. Буквально он движется вниз.' },
        { speaker: 'Мику', text: 'Ищем оба документа: чек и полотенце с изменённым краем.' },
      ];
      this.matchBark = texts[index];
      return;
    }
    if (result.cascades >= 2) this.matchBark = { speaker: 'Аюки', text: `Цепочка наблюдений: ${result.cascades}. Это уже почти дедукция.` };
  }

  private completeLevel(): void {
    const levelIndex = this.activeLevelIndex;
    const level = levels[levelIndex];
    if (!this.save.completed.includes(levelIndex)) this.save.completed.push(levelIndex);
    if (!this.save.clues.includes(level.clueId)) this.save.clues.push(level.clueId);
    this.pendingClue = level.clueId;
    this.activeMatch = null;
    this.save.scene = postSceneForLevel(levelIndex);
    this.save.line = 0;
    this.story = getScene(this.save.scene, this.save.choice);
    this.persist();
    this.renderEvidenceTransition(level);
  }

  private renderEvidenceTransition(level: LevelDefinition): void {
    this.services.audio.setScene('vn');
    this.services.audio.play('clue');
    const clue = cluePresentation[level.clueId];
    this.shell(`<section class="evidence-transition">
      <img class="evidence-background" src="${backgroundAssets[level.background]}" alt="">
      <div class="evidence-panel">
        <p class="eyebrow">УЛИКА НАЙДЕНА</p>
        <img src="${clue.asset}" alt="${escapeHtml(clue.label)}">
        <h2>${escapeHtml(level.clueTitle)}</h2>
        <p><b>${escapeHtml(level.winBark.speaker)}:</b> ${escapeHtml(level.winBark.text)}</p>
        <button id="continue-story" class="primary">Продолжить сцену</button>
      </div>
    </section>`);
    const continueStory = (): void => this.renderVN();
    this.root.querySelector('#continue-story')?.addEventListener('click', continueStory);
    this.timers.push(window.setTimeout(continueStory, 1800));
  }

  private renderLoss(): void {
    this.services.audio.setScene('match');
    const level = levels[this.activeLevelIndex];
    this.activeMatch = null;
    this.shell(`<section class="result-screen loss">
      <header class="app-header result-topbar">
        ${this.headerActionMarkup('back', 'back', 'Назад к расследованию', undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(level.shortId)}</small><b>Результат</b></div>
        <nav class="app-header-actions" aria-label="Навигация">
          ${this.headerActionMarkup('header-settings', 'settings', 'Настройки')}
        </nav>
      </header>
      <div class="result-content">
        <div class="result-mark">↻</div>
        <p class="eyebrow">ХОДЫ ЗАКОНЧИЛИСЬ</p>
        <h2>Версия требует повторной проверки</h2>
        <blockquote><b>${escapeHtml(level.loseBark.speaker)}</b>${escapeHtml(level.loseBark.text)}</blockquote>
        <button class="primary" id="retry">Повторить уровень</button>
      </div>
    </section>`);
    this.root.querySelector('#retry')?.addEventListener('click', () => this.startMatch(this.activeLevelIndex));
    this.root.querySelector('#back')?.addEventListener('click', () => this.renderMatchIntro(this.activeLevelIndex));
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.renderSettings(() => this.renderLoss(), true));
  }

  private objectiveMarkup(level: LevelDefinition, objective: LevelDefinition['objectives'][number], value: number, showProgress: boolean): string {
    let asset: string;
    if (objective.kind === 'collect') asset = tilePresentation[objective.tile].asset;
    else if (objective.kind === 'drop') asset = ingredientPresentation[objective.ingredient].asset;
    else asset = blockerPresentation[level.blocker].asset;
    const current = Math.min(value, objective.target);
    return `<div class="objective ${showProgress && current >= objective.target ? 'done' : ''}">
      <img src="${asset}" alt=""><span>${escapeHtml(objective.label)}</span>
      <b>${showProgress ? `${current}/` : ''}${objective.target}</b>
    </div>`;
  }

  private clueToastMarkup(clueId: ClueId): string {
    const level = levels.find((candidate) => candidate.clueId === clueId)!;
    const clue = cluePresentation[clueId];
    return `<div class="clue-toast"><img src="${clue.asset}" alt=""><span><small>ДОСЬЕ ОБНОВЛЕНО</small><b>${escapeHtml(level.clueTitle)}</b></span></div>`;
  }

  private renderDossier(back: () => void): void {
    this.services.audio.play('dossier');
    const kentaroCleared = this.save.completed.includes(1);
    const norihiroCleared = this.save.completed.includes(3);
    this.shell(`<section class="panel dossier">
      ${this.panelHeaderMarkup('ДЕЛО 001', 'Досье')}
      <h2>Серийные пропажи</h2>
      <div class="tabs"><b>Улики</b><span>Версии</span><span>Хронология</span></div>
      <div class="clue-grid">${levels.map((level, index) => {
        const unlocked = this.save.clues.includes(level.clueId);
        const clue = cluePresentation[level.clueId];
        return `<article class="clue-card ${unlocked ? '' : 'locked'}">
          <div>${unlocked ? `<img src="${clue.asset}" alt="">` : '<span>?</span>'}</div>
          <small>УЛИКА 0${index + 1}</small>
          <b>${unlocked ? escapeHtml(level.clueTitle) : 'Не открыта'}</b>
          <p>${unlocked ? escapeHtml(level.clueSummary) : 'Победите в соответствующем расследовании.'}</p>
        </article>`;
      }).join('')}</div>
      <h3>Проверяемые версии</h3>
      <div class="suspects">
        <article class="${kentaroCleared ? 'cleared' : ''}"><i>К</i><span><b>Кэнтаро</b><small>${kentaroCleared ? 'ОПРАВДАН ТАЙМКОДАМИ' : 'АКТИВНАЯ ВЕРСИЯ'}</small></span></article>
        <article class="${norihiroCleared ? 'cleared' : ''}"><i>Н</i><span><b>Норихиро</b><small>${norihiroCleared ? 'ВЕРСИЯ ЗАКРЫТА' : 'ОЖИДАЕТ ПРОВЕРКИ'}</small></span></article>
      </div>
      <button id="reset" class="danger-link">Сбросить прогресс</button>
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', back);
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.renderSettings(() => this.renderDossier(back), true));
    this.root.querySelector('#reset')?.addEventListener('click', () => {
      this.save = this.store.reset();
      this.renderMenu();
    });
  }

  private renderEnding(): void {
    this.services.audio.setScene('ending');
    this.save.scene = sceneMeta.length - 1;
    this.save.line = this.story.length;
    this.persist();
    this.shell(`<section class="ending-screen">
      <img class="ending-background" src="${backgroundAssets.norihiroApartment}" alt="">
      <header class="app-header ending-topbar">
        <div class="app-header-title"><small>CASE 001</small><b>Глава завершена</b></div>
        <nav class="app-header-actions" aria-label="Навигация">
          ${this.headerActionMarkup('header-settings', 'settings', 'Настройки')}
        </nav>
      </header>
      <div class="ending-panel">
        <img class="thread-clue" src="${cluePresentation.CUE_004.asset}" alt="Проводящий шов">
        <p class="eyebrow">КОНЕЦ ВЕРТИКАЛЬНОГО СРЕЗА</p>
        <h1>Первая нить найдена.</h1>
        <p>Глава завершена на VN0249. Серебристо-бирюзовая проводящая нить выводит расследование за пределы бытовой кражи.</p>
        <div class="summary">Выбор: <b>${escapeHtml(choices[this.save.choice].title)}</b><br>Найдено улик: <b>${this.save.clues.length}/4</b></div>
        <button class="primary" id="menu-primary">В главное меню</button>
        <button id="replay">Начать заново</button>
      </div>
    </section>`);
    this.root.querySelector('#menu-primary')?.addEventListener('click', () => this.renderMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.renderSettings(() => this.renderEnding(), true));
    this.root.querySelector('#replay')?.addEventListener('click', () => {
      this.save = freshSave();
      this.persist();
      this.openScene(0, 0);
    });
  }
}
