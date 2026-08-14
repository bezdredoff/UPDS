import { backgroundAssets, getScene } from '../../data/narrative';
import { cluePresentation, levels, type ClueId } from '../../data/levels';
import { storyOutcomeMetrics } from '../../data/storyOutcome';
import type { StoryEndingId } from '../../data/storyGraph';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { escapeHtml, headerActionMarkup } from '../../ui/viewMarkup';

const endingBackground: Record<StoryEndingId, keyof typeof backgroundAssets> = {
  ENDING_A_FULL_TRUTH: 'disciplinaryAssembly',
  ENDING_B_CASE_CLOSED: 'clubroom',
  ENDING_C_PERFECT_SUSPECT: 'clubroom',
};

export class EndingController {
  private t(key: string, params?: Readonly<Record<string, string | number>>): string { return this.services.localization.t(key, params); }
  private completionTracked = false;
  private activeEndingId: StoryEndingId = 'ENDING_B_CASE_CLOSED';

  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: AppSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
  ) {}

  render(endingId: StoryEndingId = this.activeEndingId): void {
    this.activeEndingId = endingId;
    this.services.audio.setScene('ending');
    this.services.telemetry.trackScreen('ending', endingId);
    const metrics = storyOutcomeMetrics(this.session.save);
    if (!this.completionTracked) {
      this.completionTracked = true;
      this.services.telemetry.track('vertical_slice_complete', {
        choice: this.session.save.choice,
        finalStrategy: this.session.save.storyChoices['final-strategy'] ?? 'none',
        endingId,
        clues: this.session.save.clues.length,
        completedLevels: this.session.save.completed.length,
        evidence: metrics.evidence,
        teamTrust: metrics.teamTrust,
        sourceTrust: metrics.sourceTrust,
      });
    }

    this.session.save.line = getScene(this.session.save.scene, this.session.save.choice).length;
    this.session.persist();

    const finalStrategy = this.session.save.storyChoices['final-strategy'] ?? 'A';
    const fallbackFromTruthAttempt = endingId === 'ENDING_B_CASE_CLOSED' && finalStrategy === 'B';
    const latestClueId: ClueId = this.session.save.clues[this.session.save.clues.length - 1] ?? levels[levels.length - 1].clueId;
    const copyKey = fallbackFromTruthAttempt
      ? 'ending.outcome.ENDING_B_CASE_CLOSED.fallbackCopy'
      : `ending.outcome.${endingId}.copy`;

    this.shell.render(`<section class="ending-screen" data-ending-id="${endingId}">
      <img class="ending-background" src="${backgroundAssets[endingBackground[endingId]]}" alt="">
      <header class="app-header ending-topbar">
        <div class="app-header-title"><small>${escapeHtml(this.t('ending.case'))}</small><b>${escapeHtml(this.t('ending.chapterComplete'))}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('common.navigation'))}">
          ${headerActionMarkup('header-settings', 'settings', this.t('common.settings'))}
        </nav>
      </header>
      <div class="ending-panel">
        <img class="thread-clue" src="${cluePresentation[latestClueId].asset}" alt="${escapeHtml(this.t('ending.clueAlt'))}">
        <p class="eyebrow">${escapeHtml(this.t(`ending.outcome.${endingId}.eyebrow`))}</p>
        <h1>${escapeHtml(this.t(`ending.outcome.${endingId}.heading`))}</h1>
        <p>${escapeHtml(this.t(copyKey))}</p>
        <div class="summary">
          ${escapeHtml(this.t('ending.finalStrategy'))}: <b>${escapeHtml(this.t(`vn.storyChoice.final-strategy.${finalStrategy}.title`))}</b><br>
          ${escapeHtml(this.t('ending.metrics'))}: <b>${metrics.evidence} / ${metrics.teamTrust} / ${metrics.sourceTrust}</b><br>
          ${escapeHtml(this.t('ending.cluesFound'))}: <b>${this.session.save.clues.length}/${levels.length}</b>
        </div>
        <button class="primary" id="menu-primary">${escapeHtml(this.t('ending.mainMenu'))}</button>
        <button id="replay">${escapeHtml(this.t('ending.replay'))}</button>
      </div>
    </section>`);
    this.root.querySelector('#menu-primary')?.addEventListener('click', () => this.navigation.showMenu());
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.render(this.activeEndingId), true));
    this.root.querySelector('#replay')?.addEventListener('click', () => {
      this.session.reset();
      this.navigation.openScene(0, 0);
    });
  }
}
