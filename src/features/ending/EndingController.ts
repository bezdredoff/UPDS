import { backgroundAssets, choices, getScene, sceneMeta } from '../../data/narrative';
import { cluePresentation } from '../../data/levels';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, headerActionMarkup } from '../../ui/viewMarkup';

export class EndingController {
  private verticalSliceCompletionTracked = false;

  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: AppSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(): void {
    this.services.audio.setScene('ending');
    this.services.telemetry.trackScreen('ending');
    if (!this.verticalSliceCompletionTracked) {
      this.verticalSliceCompletionTracked = true;
      this.services.telemetry.track('vertical_slice_complete', { choice: this.session.save.choice, clues: this.session.save.clues.length, completedLevels: this.session.save.completed.length });
    }
    this.session.save.scene = sceneMeta.length - 1;
    this.session.save.line = getScene(this.session.save.scene, this.session.save.choice).length;
    this.session.persist();
    this.shell.render(`<section class="ending-screen">
      <img class="ending-background" src="${backgroundAssets.norihiroApartment}" alt="">
      <header class="app-header ending-topbar">
        <div class="app-header-title"><small>CASE 001</small><b>Глава завершена</b></div>
        <nav class="app-header-actions" aria-label="Навигация">
          ${headerActionMarkup('header-settings', 'settings', 'Настройки')}
        </nav>
      </header>
      <div class="ending-panel">
        <img class="thread-clue" src="${cluePresentation.CUE_004.asset}" alt="Проводящий шов">
        <p class="eyebrow">КОНЕЦ ВЕРТИКАЛЬНОГО СРЕЗА</p>
        <h1>Первая нить найдена.</h1>
        <p>Глава завершена на VN0249. Серебристо-бирюзовая проводящая нить выводит расследование за пределы бытовой кражи.</p>
        <div class="summary">Выбор: <b>${escapeHtml(choices[this.session.save.choice].title)}</b><br>Найдено улик: <b>${this.session.save.clues.length}/4</b></div>
        <button class="primary" id="menu-primary">В главное меню</button>
        <button id="replay">Начать заново</button>
      </div>
    </section>`);
    this.root.querySelector('#menu-primary')?.addEventListener('click', () => this.navigation.showMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(), true));
    this.root.querySelector('#replay')?.addEventListener('click', () => {
      this.session.reset();
      this.navigation.openScene(0, 0);
    });
  }
}
