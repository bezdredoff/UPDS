import { backgroundAssets, getScene, sceneMeta } from '../../data/narrative';
import { cluePresentation, levels } from '../../data/levels';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, headerActionMarkup } from '../../ui/viewMarkup';

export class EndingController {
  private t(key: string, params?: Readonly<Record<string, string | number>>): string { return this.services.localization.t(key, params); }
  private authoredFrontierCompletionTracked = false;

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
    if (!this.authoredFrontierCompletionTracked) {
      this.authoredFrontierCompletionTracked = true;
      this.services.telemetry.track('vertical_slice_complete', { choice: this.session.save.choice, clues: this.session.save.clues.length, completedLevels: this.session.save.completed.length });
    }
    this.session.save.scene = sceneMeta.length - 1;
    this.session.save.line = getScene(this.session.save.scene, this.session.save.choice).length;
    this.session.persist();
    const latestClue = levels[levels.length - 1].clueId;
    this.shell.render(`<section class="ending-screen">
      <img class="ending-background" src="${backgroundAssets.oldGymNight}" alt="">
      <header class="app-header ending-topbar">
        <div class="app-header-title"><small>${escapeHtml(this.t('ending.case'))}</small><b>${escapeHtml(this.t('ending.chapterComplete'))}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('common.navigation'))}">
          ${headerActionMarkup('header-settings', 'settings', this.t('common.settings'))}
        </nav>
      </header>
      <div class="ending-panel">
        <img class="thread-clue" src="${cluePresentation[latestClue].asset}" alt="${escapeHtml(this.t('ending.clueAlt'))}">
        <p class="eyebrow">${escapeHtml(this.t('ending.eyebrow'))}</p>
        <h1>${escapeHtml(this.t('ending.heading'))}</h1>
        <p>${escapeHtml(this.t('ending.copy'))}</p>
        <div class="summary">${escapeHtml(this.t('ending.choice'))}: <b>${escapeHtml(this.t(`vn.choice.${this.session.save.choice}.title`))}</b><br>${escapeHtml(this.t('ending.cluesFound'))}: <b>${this.session.save.clues.length}/${levels.length}</b></div>
        <button class="primary" id="menu-primary">${escapeHtml(this.t('ending.mainMenu'))}</button>
        <button id="replay">${escapeHtml(this.t('ending.replay'))}</button>
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
