import type { AppNavigation } from '../../app/AppNavigation';
import type { AppShell } from '../../app/AppShell';
import type { Match3CampaignSession } from '../../app/Match3CampaignSession';
import { levels } from '../../data/levels';
import { backgroundAssets } from '../../data/narrative';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import { escapeHtml, headerActionMarkup } from '../../ui/viewMarkup';

export class Match3CampaignController {
  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: Match3CampaignSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
    private readonly startLevel: (levelIndex: number) => void,
  ) {}

  render(): void {
    this.services.audio.setScene('menu');
    this.services.telemetry.trackScreen('match3-campaign');
    this.session.reload();
    const completed = new Set(this.session.save.completed);
    const allComplete = levels.every((level) => completed.has(level.id));
    const t = (key: string, params: Readonly<Record<string, string | number>> = {}) => escapeHtml(this.services.localization.t(key, params));

    this.shell.render(`<section class="match3-campaign-screen">
      <img class="match3-campaign-background" src="${backgroundAssets.clubroom}" alt="">
      <div class="match3-campaign-wash"></div>
      <header class="app-header campaign-topbar">
        ${headerActionMarkup('back', 'back', this.services.localization.t('common.back'), undefined, 'app-header-back')}
        <div class="app-header-title"><small>${t('match3Campaign.eyebrow')}</small><b>${t('match3Campaign.title')}</b></div>
        <nav class="app-header-actions" aria-label="${t('common.navigation')}">
          ${headerActionMarkup('header-settings', 'settings', this.services.localization.t('common.settings'))}
        </nav>
      </header>
      <main class="match3-campaign-content">
        <div class="campaign-summary">
          <p>${t('match3Campaign.summary')}</p>
          <b>${t('match3Campaign.progress', { completed: completed.size, total: levels.length })}</b>
          ${allComplete ? `<span class="campaign-complete">${t('match3Campaign.complete')}</span>` : ''}
        </div>
        <div class="campaign-level-list">
          ${levels.map((level, index) => {
            const unlocked = index === 0 || completed.has(levels[index - 1].id);
            const done = completed.has(level.id);
            const attempts = this.session.save.attempts[level.id] ?? 0;
            const best = this.session.save.bestMovesLeft[level.id];
            const status = !unlocked ? t('match3Campaign.locked') : done ? t('match3Campaign.completed') : t('match3Campaign.available');
            const action = done ? t('match3Campaign.replay') : t('match3Campaign.play');
            return `<article class="campaign-level-card${done ? ' completed' : ''}${unlocked ? '' : ' locked'}">
              <div class="campaign-level-heading"><span>${escapeHtml(level.shortId)}</span><b>${t(`match3.level.${level.id}.title`)}</b></div>
              <p>${t(`match3.level.${level.id}.storyAction`)}</p>
              <div class="campaign-level-meta">
                <span>${status}</span><span>${t('match3Campaign.attempts', { count: attempts })}</span>
                ${best === undefined ? '' : `<span>${t('match3Campaign.best', { moves: best })}</span>`}
              </div>
              <button data-campaign-level="${index}" class="${done ? '' : 'primary'}" ${unlocked ? '' : 'disabled'}>${action}</button>
            </article>`;
          }).join('')}
        </div>
      </main>
    </section>`);

    this.root.querySelector('#back')?.addEventListener('click', () => this.navigation.showMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(), true));
    this.root.querySelectorAll<HTMLElement>('[data-campaign-level]').forEach((button) => button.addEventListener('click', () => {
      const levelIndex = Number(button.dataset.campaignLevel);
      if (!Number.isInteger(levelIndex) || levelIndex < 0 || levelIndex >= levels.length) return;
      const unlocked = levelIndex === 0 || completed.has(levels[levelIndex - 1].id);
      if (!unlocked) return;
      this.services.audio.play('uiClick');
      this.startLevel(levelIndex);
    }));
  }
}
