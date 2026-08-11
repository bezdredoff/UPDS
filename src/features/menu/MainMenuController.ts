import { APP_VERSION, BUILD_LABEL } from '../../appVersion';
import { characterRigs } from '../../data/characterRigs';
import { backgroundAssets, parsedLineCount } from '../../data/narrative';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';

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
    this.shell.render(`<section class="menu-screen">
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
      this.session.reset();
      this.navigation.openScene(0, 0);
    });
    this.root.querySelector('#continue')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.navigation.openScene(this.session.save.scene, this.session.save.line); });
    this.root.querySelector('#settings')?.addEventListener('click', () => { this.services.audio.play('uiClick'); this.navigation.showSettings(); });
    this.root.querySelector('#episodes')?.addEventListener('click', () => this.navigation.showSceneSelect());
    this.root.querySelector('#support')?.addEventListener('click', () => this.navigation.showDiagnostics());
  }

}
