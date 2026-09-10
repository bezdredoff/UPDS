import { APP_VERSION, BUILD_LABEL } from '../../appVersion';
import { characterRigs, medallionAsset } from '../../data/characterRigs';
import { backgroundAssets } from '../../data/narrative';
import { qaSurfaceEnabled } from '../../platform/QaAccess';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml } from '../../ui/viewMarkup';

export class MainMenuController {
  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: AppSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(): void {
    this.services.audio.setScene('menu');
    this.services.telemetry.trackScreen('menu');
    this.session.reload();
    const hasSave = this.session.save.scene > 0 || this.session.save.line > 0 || this.session.save.completed.length > 0;
    const qaEnabled = qaSurfaceEnabled();
    const t = (key: string, params: Readonly<Record<string, string | number | boolean>> = {}) => escapeHtml(this.services.localization.t(key, params));
    this.shell.render(`<section class="menu-screen" data-qa-surface="${qaEnabled ? 'enabled' : 'hidden'}">
      <img class="menu-background" src="${backgroundAssets.clubroom}" alt="">
      <div class="menu-wash"></div>
      <div class="menu-content">
        <p class="eyebrow">${t('menu.eyebrow')}</p>
        <h1>${t('menu.title')}<br><span>${t('menu.titleAccent')}</span></h1>
        <p class="tagline">${t('menu.tagline')}</p>
        <div class="hero-medallions" aria-label="${t('menu.heroAria')}">
          ${(['miku', 'onoe', 'ayuki'] as const).map((key) => `<img src="${medallionAsset(key)}" alt="${characterRigs[key].displayName}">`).join('')}
        </div>
        <div class="menu-actions">
          <button id="new" class="primary">${t('menu.newGame')}</button>
          <button id="continue" ${hasSave ? '' : 'disabled'}>${t('menu.continue')}</button>
          <button id="match3-campaign">${t('menu.match3Campaign')}</button>
          <button id="settings">${t('menu.settings')}</button>
          ${qaEnabled ? `<div class="menu-qa-row">
            <button id="episodes">${t('menu.sceneNavigation')} <small>QA</small></button>
            <button id="level-lab">${t('menu.levelLab')} <small>QA</small></button>
            <button id="scene-studio">${t('menu.sceneStudio')} <small>QA</small></button>
          </div>
          <button id="support">${t('menu.saveDiagnostics')} <small>QA</small></button>` : ''}
        </div>
        <footer>${BUILD_LABEL}<br><span>v${APP_VERSION}</span></footer>
      </div>
    </section>`);

    this.root.querySelector('#new')?.addEventListener('click', () => {
      this.services.audio.play('uiClick');
      this.session.reset();
      this.navigation.openScene(0, 0);
    });
    this.root.querySelector('#continue')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.navigation.openScene(this.session.save.scene, this.session.save.line); });
    this.root.querySelector('#match3-campaign')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.navigation.showMatch3Campaign(); });
    this.root.querySelector('#settings')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.navigation.showSettings(); });
    this.root.querySelector('#episodes')?.addEventListener('click', () => this.navigation.showSceneSelect());
    this.root.querySelector('#level-lab')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.navigation.showLevelLab(); });
    this.root.querySelector('#scene-studio')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.navigation.showSceneStudio(); });
    this.root.querySelector('#support')?.addEventListener('click', () => this.navigation.showDiagnostics());
  }

}
