import { cluePresentation, levels } from '../../data/levels';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, panelHeaderMarkup } from '../../ui/viewMarkup';

export class DossierController {
  private t(key: string, params?: Readonly<Record<string, string | number>>): string { return this.services.localization.t(key, params); }

  private levelText(levelId: string, field: 'clueTitle' | 'clueSummary'): string { return this.t(`match3.level.${levelId}.${field}`); }
  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: AppSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(back: () => void): void {
    this.services.audio.play('dossier');
    this.services.telemetry.trackScreen('dossier');
    const kentaroCleared = this.session.save.completed.includes(1);
    const norihiroCleared = this.session.save.completed.includes(3);
    this.shell.render(`<section class="panel dossier">
      ${panelHeaderMarkup(this.t('dossier.case'), this.t('dossier.title'))}
      <h2>${escapeHtml(this.t('dossier.heading'))}</h2>
      <div class="tabs"><b>${escapeHtml(this.t('dossier.tab.clues'))}</b><span>${escapeHtml(this.t('dossier.tab.theories'))}</span><span>${escapeHtml(this.t('dossier.tab.timeline'))}</span></div>
      <div class="clue-grid">${levels.map((level, index) => {
        const unlocked = this.session.save.clues.includes(level.clueId);
        const clue = cluePresentation[level.clueId];
        return `<article class="clue-card ${unlocked ? '' : 'locked'}">
          <div>${unlocked ? `<img src="${clue.asset}" alt="">` : '<span>?</span>'}</div>
          <small>${escapeHtml(this.t('dossier.clueNumber', { number: index + 1 }))}</small>
          <b>${unlocked ? escapeHtml(this.levelText(level.id, 'clueTitle')) : escapeHtml(this.t('dossier.locked'))}</b>
          <p>${unlocked ? escapeHtml(this.levelText(level.id, 'clueSummary')) : escapeHtml(this.t('dossier.unlockHint'))}</p>
        </article>`;
      }).join('')}</div>
      <h3>${escapeHtml(this.t('dossier.theoriesHeading'))}</h3>
      <div class="suspects">
        <article class="${kentaroCleared ? 'cleared' : ''}"><i>K</i><span><b>${escapeHtml(this.t('character.kentaro'))}</b><small>${escapeHtml(this.t(kentaroCleared ? 'dossier.kentaro.cleared' : 'dossier.kentaro.active'))}</small></span></article>
        <article class="${norihiroCleared ? 'cleared' : ''}"><i>N</i><span><b>${escapeHtml(this.t('character.norihiro'))}</b><small>${escapeHtml(this.t(norihiroCleared ? 'dossier.norihiro.cleared' : 'dossier.norihiro.pending'))}</small></span></article>
      </div>
      <button id="reset" class="danger-link">${escapeHtml(this.t('dossier.reset'))}</button>
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', back);
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(back), true));
    this.root.querySelector('#reset')?.addEventListener('click', () => {
      this.session.clearProgress();
      this.navigation.showMenu();
    });
  }
}
