import type { CampaignSave } from '../engine/CampaignStore';
import { createRuntimeServices, type RuntimeServices } from '../platform/RuntimeServices';
import { AppSession } from '../app/AppSession';
import { AppShell } from '../app/AppShell';
import type { AppNavigation } from '../app/AppNavigation';
import { MainMenuController } from '../features/menu/MainMenuController';
import { SettingsController } from '../features/settings/SettingsController';
import { DiagnosticsController } from '../features/diagnostics/DiagnosticsController';
import { DossierController } from '../features/dossier/DossierController';
import { EndingController } from '../features/ending/EndingController';
import { VnController } from '../features/vn/VnController';
import { Match3Controller } from '../features/match3/Match3Controller';
import { LevelLabController } from '../features/levelLab/LevelLabController';

/**
 * Composition root for the UI application.
 *
 * Feature state and rendering live in dedicated controllers; this class only
 * wires shared services, navigation, lifecycle and global PWA behaviour.
 */
export class AnimeDetectiveApp {
  private readonly services: RuntimeServices;
  private readonly session: AppSession;
  private readonly shell: AppShell;
  private readonly menu: MainMenuController;
  private readonly settings: SettingsController;
  private readonly diagnostics: DiagnosticsController;
  private readonly dossier: DossierController;
  private readonly ending: EndingController;
  private readonly vn: VnController;
  private readonly match3: Match3Controller;
  private readonly levelLab: LevelLabController;

  constructor(private readonly root: HTMLElement, services: RuntimeServices = createRuntimeServices()) {
    this.services = services;
    this.session = new AppSession(services);
    this.shell = new AppShell(root, () => this.renderPwaUpdateBanner());

    const navigation: AppNavigation = {
      openScene: (scene, line = 0) => this.openScene(scene, line),
      showMatchIntro: (levelIndex) => this.match3.renderMatchIntro(levelIndex),
      showDossier: (back) => this.dossier.render(back),
      showSettings: (back, showMainMenu = false) => this.settings.render(back, showMainMenu),
      showChoice: () => this.vn.renderChoice(),
      showEnding: () => this.ending.render(),
      showSceneSelect: () => this.diagnostics.renderSceneSelect(),
      showDiagnostics: (status = '') => this.diagnostics.render(status),
      showLevelLab: () => this.levelLab.render(),
      showMenu: () => this.renderMenu(),
      returnToMainMenu: () => this.returnToMainMenu(),
    };

    this.vn = new VnController(root, services, this.session, this.shell, navigation);
    this.match3 = new Match3Controller(root, services, this.session, this.shell, navigation, (clueId) => this.vn.setPendingClue(clueId));
    this.levelLab = new LevelLabController(root, services, this.shell, navigation, (levelIndex, seed, level) => {
      this.match3.startLabMatch(levelIndex, seed, () => this.levelLab.render(levelIndex, seed), level);
    });
    this.menu = new MainMenuController(root, services, this.session, this.shell, navigation);
    this.settings = new SettingsController(root, services, this.shell, navigation, () => this.match3.hasActiveMatch);
    this.diagnostics = new DiagnosticsController(root, services, this.session, this.shell, navigation);
    this.dossier = new DossierController(root, services, this.session, this.shell, navigation);
    this.ending = new EndingController(root, services, this.session, this.shell, navigation);
  }

  mount(): void {
    this.vn.mount();
    this.services.pwa.subscribe(() => this.renderPwaUpdateBanner());
    if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
      window.addEventListener('pagehide', () => {
        if (this.match3.hasActiveMatch) this.match3.endActiveAttempt('abandon', 'pagehide');
        this.services.telemetry.endSession('pagehide');
      }, { once: true });
    }
    this.renderMenu();
  }

  private renderPwaUpdateBanner(): void {
    const phone = this.root.querySelector<HTMLElement>('.phone');
    if (!phone) return;
    phone.querySelector('.pwa-update-banner')?.remove();
    const pwa = this.services.pwa.snapshot();
    if (!pwa.updateAvailable) return;
    phone.insertAdjacentHTML('beforeend', `<aside class="pwa-update-banner" role="status"><div><small>НОВАЯ ВЕРСИЯ</small><b>Доступно обновление игры</b><span>Обновление применится после перезапуска интерфейса.</span></div><button id="pwa-update-now" class="primary">Обновить</button><button id="pwa-update-later">Позже</button></aside>`);
    phone.querySelector('#pwa-update-now')?.addEventListener('click', () => {
      if (this.match3.hasActiveMatch && typeof window.confirm === 'function' && !window.confirm('Обновить игру сейчас? Текущая попытка match-3 будет потеряна.')) return;
      if (this.match3.hasActiveMatch) {
        this.match3.endActiveAttempt('abandon', 'pwa-update');
        this.match3.clearActiveMatch();
      }
      this.services.pwa.applyUpdate();
    });
    phone.querySelector('#pwa-update-later')?.addEventListener('click', () => phone.querySelector('.pwa-update-banner')?.remove());
  }

  private renderMenu(): void {
    this.vn.resetSessionUi();
    this.menu.render();
  }

  private returnToMainMenu(): void {
    if (this.match3.hasActiveMatch && typeof window.confirm === 'function' && !window.confirm('Выйти в главное меню? Текущая попытка match-3 будет потеряна.')) return;
    if (this.match3.hasActiveMatch) this.match3.endActiveAttempt('abandon', 'main-menu');
    this.match3.clearActiveMatch();
    this.renderMenu();
  }

  private openScene(scene: number, line = 0): void {
    this.match3.clearActiveMatch();
    this.vn.openScene(scene, line);
  }

  // Compatibility seams retained for existing smoke tests and QA harnesses.
  startMatch(level: number): void { this.match3.startMatch(level); }
  renderSupport(status = ''): void { this.diagnostics.render(status); }
  renderSettings(): void { this.settings.render(); }
  renderLevelLab(): void { this.levelLab.render(); }
  startLabMatch(level: number, seed: number): void { this.match3.startLabMatch(level, seed, () => this.levelLab.render(level, seed)); }
  nextLine(): void { this.vn.nextLine(); }

  get save(): CampaignSave { return this.session.save; }
  set save(value: CampaignSave) { this.session.save = value; }
}
