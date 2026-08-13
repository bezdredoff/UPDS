import { characterRigs } from '../../data/characterRigs';
import {
  blockerPresentation,
  cluePresentation,
  ingredientPresentation,
  isLevelBoardCellActive,
  levels,
  specialAsset,
  specialAssets,
  BOARD_SIZE,
  type ClueId,
  type LevelDefinition,
} from '../../data/levels';
import { backgroundAssets, getScene } from '../../data/narrative';
import { resolveMatch3TilePresentation, tilePresentationAssetsForActiveSet } from '../../data/match3TilePresentation';
import { nextPendingMatch3Tutorial, tutorialCompletionEventsForMove, tutorialConceptsCompletedByEvents, tutorialRevealEventsForBoard, tutorialRevealEventsForMove, type Match3TutorialConceptId, type Match3TutorialRevealEvent } from '../../data/match3Tutorials';
import { postSceneForLevel } from '../../engine/CampaignStore';
import { Match3Game, type BoardCell, type Match3Frame, type MoveResult } from '../../engine/Match3Game';
import { preloadImageAssets } from '../../platform/AssetPreloader';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { Match3CampaignSession } from '../../app/Match3CampaignSession';
import type { AppShell } from '../../app/AppShell';
import { getDragPreview, getSwipeDecision } from '../../ui/boardInteraction';
import { matchMotionDuration } from '../../ui/matchMotion';
import { escapeHtml, headerActionMarkup } from '../../ui/viewMarkup';

export type MatchOutcome = 'win' | 'loss' | 'abandon';
export type MatchInteractionSource = 'tap' | 'drag' | 'double-tap';
export type MatchHintSource = 'manual' | 'inactivity';
export const MATCH_AUTO_HINT_DELAY_MS = 5000;
export const SPECIAL_DOUBLE_TAP_WINDOW_MS = 360;
type Bark = Readonly<{ speaker: string; text: string }>;
type LabRun = Readonly<{ levelIndex: number; seed: number; level: LevelDefinition; onExit: () => void }>;
type CampaignRun = Readonly<{ levelIndex: number; session: Match3CampaignSession; onExit: () => void }>;
type MatchRunMode = 'story' | 'campaign' | 'lab';

export class Match3Controller {
  private t(key: string, params?: Readonly<Record<string, string | number>>): string { return this.services.localization.t(key, params); }
  private levelText(level: LevelDefinition, field: 'title' | 'storyAction' | 'clueTitle'): string { return this.t(`match3.level.${level.id}.${field}`); }
  private objectiveText(level: LevelDefinition, index: number): string {
    if (this.labRun) return level.objectives[index]?.label ?? this.t(`match3.level.${level.id}.objective.${index}`);
    return this.t(`match3.level.${level.id}.objective.${index}`);
  }
  private characterName(key: 'miku' | 'onoe' | 'ayuki' | 'emi' | 'kentaro' | 'norihiro'): string { return this.t(`character.${key}`); }
  private bark(key: string, speaker: 'miku' | 'onoe' | 'ayuki' | 'emi' | 'kentaro' | 'norihiro', params?: Readonly<Record<string, string | number>>): Bark { return { speaker: this.characterName(speaker), text: this.t(`match3.bark.${key}`, params) }; }
  private levelBark(level: LevelDefinition, kind: 'start' | 'win'): Bark { return { speaker: this.t(`match3.level.${level.id}.${kind}Bark.speaker`), text: this.t(`match3.level.${level.id}.${kind}Bark.text`) }; }
  private contextAttrs(level: LevelDefinition): string {
    const context = level.context;
    return `data-m3-page="${escapeHtml(context.pageBackground)}" data-m3-board-surface="${escapeHtml(context.boardSurface)}" data-m3-board-frame="${escapeHtml(context.boardFrame)}" data-m3-profile="${escapeHtml(context.narrativeProfile)}" data-m3-tile-profile="${escapeHtml(context.tilePresentationProfile)}"`;
  }

  private activeMatch: Match3Game | null = null;
  private activeLevelIndex = 0;
  private selectedCell: number | null = null;
  private matchBark: Bark | null = null;
  private triggeredBarks = new Set<string>();
  private matchInputLocked = false;
  private activePointer: { id: number; startIndex: number; startX: number; startY: number } | null = null;
  private suppressBoardClickUntil = 0;
  private hintedCells = new Set<number>();
  private matchAttemptStartedAt: number | null = null;
  private autoHintTimer: number | null = null;
  private lastTappedSpecial: { index: number; at: number } | null = null;
  private activeTutorial: Match3TutorialConceptId | null = null;
  private tutorialPromptDismissed = false;
  private tutorialRevealEvents = new Set<Match3TutorialRevealEvent>(['level-start']);
  private labRun: LabRun | null = null;
  private campaignRun: CampaignRun | null = null;

  constructor(
    private readonly root: HTMLElement,
    private readonly services: RuntimeServices,
    private readonly session: AppSession,
    private readonly shell: AppShell,
    private readonly navigation: AppNavigation,
    private readonly onClueAwarded: (clueId: ClueId) => void,
  ) {}

  get hasActiveMatch(): boolean { return this.activeMatch !== null; }

  clearActiveMatch(): void {
    this.clearAutoHintTimer();
    this.activeMatch = null;
    this.selectedCell = null;
    this.activePointer = null;
    this.lastTappedSpecial = null;
    this.activeTutorial = null;
    this.tutorialPromptDismissed = false;
    this.tutorialRevealEvents = new Set(['level-start']);
    this.labRun = null;
    this.campaignRun = null;
    this.matchInputLocked = false;
  }

  private clearAutoHintTimer(): void {
    if (this.autoHintTimer === null) return;
    window.clearTimeout(this.autoHintTimer);
    this.autoHintTimer = null;
  }

  private armAutoHint(): void {
    this.clearAutoHintTimer();
    const game = this.activeMatch;
    if (!game || this.matchInputLocked || game.won || game.lost || this.tutorialPromptVisible) return;
    this.autoHintTimer = window.setTimeout(() => {
      this.autoHintTimer = null;
      this.showObjectiveHint('inactivity');
    }, MATCH_AUTO_HINT_DELAY_MS);
  }

  private noteMatchActivity(): void {
    this.hintedCells.clear();
    this.root.querySelectorAll<HTMLElement>('.board-cell.hinted').forEach((cell) => cell.classList.remove('hinted'));
    this.armAutoHint();
  }

  private get tutorialPromptVisible(): boolean {
    return this.activeTutorial !== null && !this.tutorialPromptDismissed;
  }

  private tutorialMarkup(): string {
    const concept = this.activeTutorial;
    if (!concept || this.tutorialPromptDismissed) return '';
    return `<div class="match-tutorial-overlay" role="dialog" aria-modal="true" aria-labelledby="match-tutorial-title">
      <div class="match-tutorial-card" data-tutorial-concept="${escapeHtml(concept)}">
        <span class="case-tab">${escapeHtml(this.t('match3.tutorial.label'))}</span>
        <h2 id="match-tutorial-title">${escapeHtml(this.t(`match3.tutorial.${concept}.title`))}</h2>
        <p>${escapeHtml(this.t(`match3.tutorial.${concept}.body`))}</p>
        <button id="tutorial-try" class="primary">${escapeHtml(this.t('match3.tutorial.try'))}</button>
      </div>
    </div>`;
  }

  private currentTutorialRevealEvents(): Match3TutorialRevealEvent[] {
    const dynamic = this.activeMatch ? tutorialRevealEventsForBoard(this.activeMatch.board, BOARD_SIZE) : [];
    return [...new Set<Match3TutorialRevealEvent>([...this.tutorialRevealEvents, ...dynamic])];
  }

  private get runMode(): MatchRunMode {
    if (this.labRun) return 'lab';
    if (this.campaignRun) return 'campaign';
    return 'story';
  }

  private tutorialProgress(): Match3TutorialConceptId[] {
    return this.campaignRun ? this.campaignRun.session.save.tutorialsCompleted : this.session.save.tutorialsCompleted;
  }

  private persistTutorialProgress(): void {
    if (this.campaignRun) this.campaignRun.session.persist();
    else this.session.persist();
  }

  private recordTutorialMove(result: MoveResult, directSpecialActivation = false, directSpecialCombo = false): void {
    if (this.labRun) return;
    const level = this.activeMatch?.level;
    if (!level || !result.valid) return;
    for (const revealEvent of tutorialRevealEventsForMove(result)) this.tutorialRevealEvents.add(revealEvent);

    const events = tutorialCompletionEventsForMove(result, directSpecialActivation, directSpecialCombo);
    const tutorialProgress = this.tutorialProgress();
    const completedNow = tutorialConceptsCompletedByEvents(level.tutorialConcepts, tutorialProgress, events);
    const previousActive = this.activeTutorial;
    for (const concept of completedNow) {
      tutorialProgress.push(concept);
      this.services.telemetry.track('match_tutorial', {
        action: 'completed', conceptId: concept, levelId: level.id, mode: this.runMode, prompted: concept === previousActive,
      });
    }
    if (completedNow.length > 0) this.persistTutorialProgress();

    const next = nextPendingMatch3Tutorial(
      level.tutorialConcepts,
      tutorialProgress,
      this.currentTutorialRevealEvents(),
    );
    if (next === previousActive) return;
    this.activeTutorial = next;
    this.tutorialPromptDismissed = false;
    if (next) this.services.telemetry.track('match_tutorial', { action: 'shown', conceptId: next, levelId: level.id, mode: this.runMode });
  }

  endActiveAttempt(outcome: MatchOutcome, reason = ''): void {
    const game = this.activeMatch;
    if (!game || this.matchAttemptStartedAt === null) return;
    const level = game.level;
    this.services.telemetry.track('match_end', {
      levelId: level.id,
      levelIndex: this.activeLevelIndex,
      attempt: this.labRun ? 0 : this.campaignRun ? (this.campaignRun.session.save.attempts[level.id] ?? 0) : (this.session.save.attempts[level.id] ?? 0),
      mode: this.runMode,
      seed: this.labRun?.seed ?? null,
      outcome,
      reason,
      durationMs: Math.max(0, Date.now() - this.matchAttemptStartedAt),
      movesLeft: game.movesLeft,
      moveBudget: level.moves,
      progress: game.progress,
    });
    this.matchAttemptStartedAt = null;
  }

  private preloadMatchAssets(level: LevelDefinition): void {
    if (typeof Image === 'undefined') return;
    const assets = [
      backgroundAssets[level.context.pageBackground],
      blockerPresentation[level.blocker].asset,
      specialAsset,
      ...Object.values(specialAssets),
      ...tilePresentationAssetsForActiveSet(level.context.tilePresentationProfile, level.activeTiles),
      ...Object.values(ingredientPresentation).map((presentation) => presentation.asset),
    ];
    void preloadImageAssets(assets, this.services.assetHealth);
  }

  renderMatchIntro(levelIndex: number): void {
    this.clearAutoHintTimer();
    this.lastTappedSpecial = null;
    this.services.audio.setScene('match');
    this.services.telemetry.trackScreen('match-intro', levels[levelIndex]?.id ?? String(levelIndex));
    const level = levels[levelIndex];
    this.preloadMatchAssets(level);
    this.activeLevelIndex = levelIndex;
    this.activeMatch = null;
    this.shell.render(`<section class="level-intro" ${this.contextAttrs(level)}>
      <img class="level-intro-background" src="${backgroundAssets[level.context.pageBackground]}" alt="">
      <div class="level-intro-shade"></div>
      <header class="app-header match-topbar intro-topbar">
        ${headerActionMarkup('back', 'back', this.t('common.back'), undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(this.t('match3.investigation', { current: levelIndex + 1, total: 4 }))}</small><b>${escapeHtml(this.levelText(level, 'title'))}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('match3.investigationNavigation'))}">
          ${headerActionMarkup('dossier', 'dossier', this.t('dossier.title'), this.session.save.clues.length)}
          ${headerActionMarkup('header-settings', 'settings', this.t('common.settings'))}
        </nav>
      </header>
      <div class="level-card">
        <p class="eyebrow">${escapeHtml(level.id)}</p>
        <h2>${escapeHtml(this.levelText(level, 'title'))}</h2>
        <p>${escapeHtml(this.levelText(level, 'storyAction'))}</p>
        <div class="intro-objectives">${level.objectives.map((objective, index) => this.objectiveMarkup(level, objective, index, 0, false)).join('')}</div>
        <div class="moves-chip"><b>${level.moves}</b><span>${escapeHtml(this.t('match3.moves'))}</span></div>
        <button id="start" class="primary">${escapeHtml(this.t('match3.start'))}</button>
      </div>
    </section>`);
    this.root.querySelector('#back')?.addEventListener('click', () => this.navigation.openScene(this.session.save.scene, Math.max(0, getScene(this.session.save.scene, this.session.save.choice).length - 1)));
    this.root.querySelector('#dossier')?.addEventListener('click', () => this.navigation.showDossier(() => this.renderMatchIntro(levelIndex)));
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.renderMatchIntro(levelIndex), true));
    this.root.querySelector('#start')?.addEventListener('click', () => this.startMatch(levelIndex));
  }

  startMatch(levelIndex: number): void {
    this.labRun = null;
    this.campaignRun = null;
    const level = levels[levelIndex];
    const attempt = (this.session.save.attempts[level.id] ?? 0) + 1;
    this.session.save.attempts[level.id] = attempt;
    this.session.persist();
    this.activeLevelIndex = levelIndex;
    this.activeMatch = new Match3Game(level, level.seed + attempt * 101);
    this.matchAttemptStartedAt = Date.now();
    this.services.telemetry.track('match_start', { levelId: level.id, levelIndex, attempt, moveBudget: level.moves, narrativeProfile: level.context.narrativeProfile, pageBackground: level.context.pageBackground, boardSurface: level.context.boardSurface, tilePresentationProfile: level.context.tilePresentationProfile });
    this.selectedCell = null;
    this.matchInputLocked = false;
    this.activePointer = null;
    this.hintedCells.clear();
    this.triggeredBarks = new Set(['start']);
    this.matchBark = this.levelBark(level, 'start');
    this.lastTappedSpecial = null;
    this.tutorialRevealEvents = new Set(['level-start']);
    this.activeTutorial = nextPendingMatch3Tutorial(level.tutorialConcepts, this.session.save.tutorialsCompleted, this.currentTutorialRevealEvents());
    this.tutorialPromptDismissed = false;
    if (this.activeTutorial) {
      this.services.telemetry.track('match_tutorial', { action: 'shown', conceptId: this.activeTutorial, levelId: level.id, mode: 'story' });
    }
    this.renderMatch();
    this.armAutoHint();
  }

  startCampaignMatch(levelIndex: number, campaignSession: Match3CampaignSession, onExit: () => void): void {
    const level = levels[levelIndex];
    if (!level) return;
    const unlocked = levelIndex === 0 || campaignSession.save.completed.includes(levels[levelIndex - 1].id);
    if (!unlocked) return;
    this.labRun = null;
    this.campaignRun = { levelIndex, session: campaignSession, onExit };
    const attempt = (campaignSession.save.attempts[level.id] ?? 0) + 1;
    campaignSession.save.attempts[level.id] = attempt;
    campaignSession.persist();
    this.activeLevelIndex = levelIndex;
    this.activeMatch = new Match3Game(level, level.seed + attempt * 101);
    this.matchAttemptStartedAt = Date.now();
    this.services.telemetry.track('match_start', {
      levelId: level.id, levelIndex, attempt, mode: 'campaign', moveBudget: level.moves,
      narrativeProfile: level.context.narrativeProfile, pageBackground: level.context.pageBackground,
      boardSurface: level.context.boardSurface, tilePresentationProfile: level.context.tilePresentationProfile,
    });
    this.selectedCell = null;
    this.matchInputLocked = false;
    this.activePointer = null;
    this.hintedCells.clear();
    this.triggeredBarks = new Set(['start']);
    this.matchBark = this.levelBark(level, 'start');
    this.lastTappedSpecial = null;
    this.tutorialRevealEvents = new Set(['level-start']);
    this.activeTutorial = nextPendingMatch3Tutorial(level.tutorialConcepts, campaignSession.save.tutorialsCompleted, this.currentTutorialRevealEvents());
    this.tutorialPromptDismissed = false;
    if (this.activeTutorial) this.services.telemetry.track('match_tutorial', { action: 'shown', conceptId: this.activeTutorial, levelId: level.id, mode: 'campaign' });
    this.renderMatch();
    this.armAutoHint();
  }

  startLabMatch(levelIndex: number, requestedSeed: number, onExit: () => void, levelOverride?: LevelDefinition): void {
    this.campaignRun = null;
    const level = levelOverride ?? levels[levelIndex];
    if (!level) return;
    const parsedSeed = Number(requestedSeed);
    const seed = (Number.isFinite(parsedSeed) ? Math.max(0, Math.min(0xffffffff, Math.trunc(parsedSeed))) : level.seed) >>> 0;
    this.labRun = { levelIndex, seed, level, onExit };
    this.activeLevelIndex = levelIndex;
    this.activeMatch = new Match3Game(level, seed);
    this.matchAttemptStartedAt = Date.now();
    this.services.telemetry.track('match_start', {
      levelId: level.id, levelIndex, attempt: 0, mode: 'lab', seed, moveBudget: level.moves,
      narrativeProfile: level.context.narrativeProfile, pageBackground: level.context.pageBackground,
      boardSurface: level.context.boardSurface, tilePresentationProfile: level.context.tilePresentationProfile,
    });
    this.selectedCell = null;
    this.matchInputLocked = false;
    this.activePointer = null;
    this.hintedCells.clear();
    this.triggeredBarks = new Set(['start']);
    this.matchBark = this.levelBark(level, 'start');
    this.lastTappedSpecial = null;
    this.tutorialRevealEvents = new Set(['level-start']);
    this.activeTutorial = null;
    this.tutorialPromptDismissed = true;
    this.renderMatch();
    this.armAutoHint();
  }

  private boardCellsMarkup(
    level: LevelDefinition,
    board: readonly BoardCell[],
    blockerAsset: string,
    options: Readonly<{ clearing?: ReadonlySet<number>; motions?: ReadonlyMap<number, Readonly<{ kind: 'fall' | 'spawn'; rows: number }>> }> = {},
  ): string {
    return board.map((cell, index) => {
      if (!isLevelBoardCellActive(level, index)) {
        return `<span class="board-cell board-hole" role="gridcell" aria-label="${escapeHtml(this.t('match3.holeCell'))}" aria-disabled="true"></span>`;
      }
      const selected = this.selectedCell === index ? ' selected' : '';
      const hinted = this.hintedCells.has(index) ? ' hinted' : '';
      const clearing = options.clearing?.has(index) ? ' is-clearing' : '';
      const motion = options.motions?.get(index);
      const motionClass = motion ? ` settle-${motion.kind}` : '';
      const motionStyle = motion ? ` style="--settle-rows:${motion.rows}"` : '';
      const tile = cell.tile ? resolveMatch3TilePresentation(level.context.tilePresentationProfile, cell.tile) : null;
      const ingredient = cell.ingredient ? ingredientPresentation[cell.ingredient] : null;
      const cellLabel = cell.ingredient ? this.t(`match3.ingredient.${cell.ingredient}`) : cell.tile ? this.t(`match3.tile.${cell.tile}`) : this.t('match3.emptyCell');
      return `<button class="board-cell${selected}${hinted}${clearing}${motionClass}" data-cell="${index}" role="gridcell" aria-label="${escapeHtml(cellLabel)}"${motionStyle}>
        <span class="tile-socket"></span>
        <span class="tile-stack">
          ${tile ? `<img class="tile" src="${tile.asset}" data-tile-variant="${escapeHtml(tile.variantId)}" alt="" draggable="false">` : ''}
          ${ingredient ? `<img class="ingredient" src="${ingredient.asset}" alt="" draggable="false">` : ''}
          ${cell.special ? `<img class="special ${cell.special}" src="${specialAssets[cell.special]}" alt="${escapeHtml(this.t(`match3.special.${cell.special}`))}" draggable="false">` : ''}
        </span>
        ${cell.blockerLayers > 0 ? `<span class="blocker"><img src="${blockerAsset}" alt="" draggable="false"><b>${cell.blockerLayers}</b></span>` : ''}
      </button>`;
    }).join('');
  }

  private barkMedallion(): string {
    const speaker = this.matchBark?.speaker ?? '';
    if (speaker === this.characterName('miku')) return characterRigs.miku.medallion;
    if (speaker === this.characterName('onoe')) return characterRigs.onoe.medallion;
    if (speaker === this.characterName('ayuki')) return characterRigs.ayuki.medallion;
    return characterRigs.miku.medallion;
  }

  private renderMatch(): void {
    this.services.audio.setScene('match');
    this.services.telemetry.trackScreen('match', `${levels[this.activeLevelIndex]?.id ?? String(this.activeLevelIndex)}:${this.runMode}`);
    const game = this.activeMatch;
    if (!game) return this.renderMatchIntro(this.activeLevelIndex);
    const level = game.level;
    const blocker = blockerPresentation[level.blocker];

    this.shell.render(`<section class="match-screen${this.tutorialPromptVisible ? ' tutorial-active' : ''}" ${this.contextAttrs(level)}>
      <img class="match-background" src="${backgroundAssets[level.context.pageBackground]}" alt="">
      <div class="match-shade"></div>
      <header class="app-header match-topbar">
        ${headerActionMarkup('quit', 'back', this.labRun ? this.t('levelLab.backToLab') : this.campaignRun ? this.t('match3Campaign.backToCampaign') : this.t('match3.backToInvestigation'), undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(level.shortId)}</small><b>${escapeHtml(this.levelText(level, 'title'))}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('match3.investigationNavigation'))}">
          ${this.runMode === 'story' ? headerActionMarkup('dossier', 'dossier', this.t('dossier.title'), this.session.save.clues.length) : ''}
          ${headerActionMarkup('header-settings', 'settings', this.t('common.settings'))}
        </nav>
      </header>

      <div class="match-case-hud">
        <section class="objective-board" aria-label="${escapeHtml(this.t('match3.objectivesAria'))}">
          <span class="case-tab">${escapeHtml(this.t('match3.objective'))}</span>
          <div class="objectives">${level.objectives.map((objective, index) => this.objectiveMarkup(level, objective, index, game.objectiveValue(index), true)).join('')}</div>
        </section>
        <section class="stage-board" aria-label="${escapeHtml(this.t('match3.movesStageAria'))}">
          <span class="case-tab">${escapeHtml(this.t('match3.movesUpper'))}</span>
          <div class="moves-left"><b>${game.movesLeft}</b></div>
          <div class="stage-meta"><small>${escapeHtml(this.labRun ? this.t('levelLab.runLabel') : this.campaignRun ? this.t('match3Campaign.stage', { current: this.activeLevelIndex + 1, total: levels.length }) : this.t('match3.stage', { current: this.activeLevelIndex + 1, total: levels.length }))}</small><b>${escapeHtml(this.labRun ? `SEED ${this.labRun.seed}` : level.shortId)}</b></div>
        </section>
      </div>

      ${this.matchBark ? `<div class="field-bark"><img src="${this.barkMedallion()}" alt=""><div><b>${escapeHtml(this.matchBark.speaker)}</b><span>${escapeHtml(this.matchBark.text)}</span></div></div>` : ''}
      <div id="match-feedback" class="match-feedback" aria-live="polite"></div>
      <div class="board" role="grid" aria-label="${escapeHtml(this.t('match3.boardAria'))}">${this.boardCellsMarkup(level, game.board, blocker.asset)}</div>

      <div class="match-tooltray">
        <div class="detective-strip" aria-label="${escapeHtml(this.t('match3.teamAria'))}">
          ${(['miku', 'onoe', 'ayuki'] as const).map((key) => `<span><img src="${characterRigs[key].medallion}" alt="${escapeHtml(this.characterName(key))}"><b>${escapeHtml(this.characterName(key))}</b></span>`).join('')}
        </div>
        <button id="hint" class="hint-button">
          <img src="${specialAsset}" alt=""><span><b>${escapeHtml(this.t('match3.hint'))}</b><small>${escapeHtml(this.t('match3.bestMove'))}</small></span>
        </button>
      </div>
      <p class="match-hint">${escapeHtml(this.t('match3.inputHint'))}</p>
      ${this.tutorialMarkup()}
    </section>`);

    this.root.querySelector('#quit')?.addEventListener('click', () => {
      if (this.matchInputLocked) return;
      this.clearAutoHintTimer();
      this.endActiveAttempt('abandon', this.labRun ? 'back-to-level-lab' : this.campaignRun ? 'back-to-campaign' : 'back-to-intro');
      if (this.labRun) {
        const onExit = this.labRun.onExit;
        this.clearActiveMatch();
        onExit();
        return;
      }
      if (this.campaignRun) {
        const onExit = this.campaignRun.onExit;
        this.clearActiveMatch();
        onExit();
        return;
      }
      this.activeMatch = null;
      this.renderMatchIntro(this.activeLevelIndex);
    });
    this.root.querySelector('#dossier')?.addEventListener('click', () => {
      if (this.matchInputLocked) return;
      this.clearAutoHintTimer();
      this.navigation.showDossier(() => { this.renderMatch(); this.armAutoHint(); });
    });
    this.root.querySelector('#header-settings')?.addEventListener('click', () => {
      if (this.matchInputLocked) return;
      this.clearAutoHintTimer();
      this.navigation.showSettings(() => { this.renderMatch(); this.armAutoHint(); }, true);
    });
    this.root.querySelector('#hint')?.addEventListener('click', () => {
      this.noteMatchActivity();
      this.showObjectiveHint('manual');
    });
    this.root.querySelector('#tutorial-try')?.addEventListener('click', () => {
      if (!this.activeTutorial) return;
      this.services.telemetry.track('match_tutorial', { action: 'try', conceptId: this.activeTutorial, levelId: level.id, mode: this.runMode });
      this.tutorialPromptDismissed = true;
      this.renderMatch();
      this.armAutoHint();
    });
    this.installBoardInput();
  }

  private showObjectiveHint(source: MatchHintSource): void {
    const game = this.activeMatch;
    if (!game || this.matchInputLocked) return;
    const hint = game.getHintMove();
    this.services.telemetry.track('match_hint', { levelId: game.level.id, levelIndex: this.activeLevelIndex, movesLeft: game.movesLeft, available: Boolean(hint), source });
    this.selectedCell = null;
    this.hintedCells.clear();
    if (!hint) {
      this.matchBark = this.bark('noHint', 'onoe');
      this.renderMatch();
      return;
    }
    this.hintedCells.add(hint.first);
    this.hintedCells.add(hint.second);
    this.services.audio.play('hint');
    this.matchBark = this.bark('hintFound', 'miku');
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
    board.innerHTML = this.boardCellsMarkup(game.level, frame.board, blocker.asset, { clearing, motions });
    board.className = `board phase-${frame.phase}`;
    if (frame.phase === 'clear') {
      const feedback = frame.feedback ?? 'match';
      if (feedback === 'special') {
        this.services.audio.play('special');
        this.setMatchFeedback(this.t('match3.feedback.special'), 'special-feedback');
      } else if (feedback === 'chain') {
        this.services.audio.play('cascade');
        this.setMatchFeedback(this.t('match3.feedback.chain', { count: frame.cascade }), 'chain-feedback');
      } else if (feedback === 'combo') {
        this.services.audio.play('special');
        this.setMatchFeedback(this.t('match3.feedback.combo'), 'combo-feedback');
      } else {
        this.services.audio.play('match');
        this.setMatchFeedback(this.t('match3.feedback.match'), 'match-feedback-good');
      }
    } else if (frame.phase === 'reshuffle') {
      this.services.audio.play('reshuffle');
      this.setMatchFeedback(this.t('match3.feedback.reshuffled'), 'reshuffle-feedback');
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

  private async playMoveFrames(result: MoveResult, first: number, second: number, animateSwap = true): Promise<void> {
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
      this.setMatchFeedback(noMatch ? this.t('match3.feedback.noMatch') : this.t('match3.feedback.swapUnavailable'), 'reject-feedback');
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

    if (animateSwap) {
      this.services.audio.play('swap');
      await this.animateSwapStacks(first, second, !reduced);
    }

    if (reduced) {
      const finalFrame = [...result.frames].reverse().find((frame) => frame.phase === 'settle' || frame.phase === 'reshuffle') ?? result.frames[result.frames.length - 1];
      if (finalFrame) this.renderMatchFrame(finalFrame);
      if (result.primaryFeedback === 'special' || result.primaryFeedback === 'combo') this.services.audio.play('special');
      else if (result.primaryFeedback === 'chain') this.services.audio.play('cascade');
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
      this.setMatchFeedback(this.t('match3.feedback.chain', { count: result.cascades }), 'chain-feedback');
      await this.matchDelay(matchMotionDuration('feedbackHold', false));
    }
    if (result.won) {
      this.services.audio.play('win');
      this.setMatchFeedback(this.t('match3.feedback.clueCollected'), 'win-feedback');
      await this.matchDelay(matchMotionDuration('feedbackHold', false));
    } else if (result.lost) {
      this.services.audio.play('lose');
      this.setMatchFeedback(this.t('match3.feedback.outOfMoves'), 'loss-feedback');
      await this.matchDelay(matchMotionDuration('feedbackHold', false));
    }
  }

  private installBoardInput(): void {
    const board = this.root.querySelector<HTMLElement>('.board');
    if (!board) return;

    this.root.querySelectorAll<HTMLElement>('[data-cell]').forEach((cell) => {
      cell.addEventListener('click', () => {
        if (performance.now() < this.suppressBoardClickUntil) return;
        this.noteMatchActivity();
        this.handleCell(Number(cell.dataset.cell));
      });
      cell.addEventListener('pointerdown', (event) => {
        if (this.matchInputLocked || event.button !== 0) return;
        this.noteMatchActivity();
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
      this.lastTappedSpecial = null;
      const activeLevel = this.activeMatch?.level;
      if (targetIndex === null || !activeLevel || !isLevelBoardCellActive(activeLevel, targetIndex)) {
        this.selectedCell = null;
        this.matchBark = this.bark('edge', 'miku');
        this.renderMatch();
        return;
      }
      this.attemptMatchSwap(pointer.startIndex, targetIndex, false, 'drag');
    });
  }

  private handleCell(index: number): void {
    const game = this.activeMatch;
    if (!game || this.matchInputLocked) return;
    this.hintedCells.clear();
    const now = performance.now();
    const isSpecial = Boolean(game.board[index]?.special);

    if (
      isSpecial
      && this.selectedCell === index
      && this.lastTappedSpecial?.index === index
      && now - this.lastTappedSpecial.at <= SPECIAL_DOUBLE_TAP_WINDOW_MS
    ) {
      this.selectedCell = null;
      this.lastTappedSpecial = null;
      this.attemptSpecialActivation(index);
      return;
    }

    if (this.selectedCell === null) {
      this.selectedCell = index;
      this.lastTappedSpecial = isSpecial ? { index, at: now } : null;
      this.renderMatch();
      return;
    }
    if (this.selectedCell === index) {
      this.selectedCell = null;
      this.lastTappedSpecial = null;
      this.renderMatch();
      return;
    }

    const first = this.selectedCell;
    this.selectedCell = null;
    this.lastTappedSpecial = null;
    this.attemptMatchSwap(first, index, true, 'tap');
  }

  private async attemptSpecialActivation(index: number): Promise<void> {
    const game = this.activeMatch;
    if (!game || this.matchInputLocked) return;
    this.matchInputLocked = true;
    this.clearAutoHintTimer();
    this.hintedCells.clear();
    try {
      const result = game.attemptSpecialActivation(index);
      this.services.telemetry.track('match_move', {
        levelId: game.level.id, levelIndex: this.activeLevelIndex, valid: result.valid, reason: result.valid ? 'ok' : result.reason,
        source: 'double-tap', activation: 'direct', movesLeft: game.movesLeft, cascades: result.cascades, specialsCreated: result.specialsCreated,
        reshuffled: result.reshuffled, won: result.won, lost: result.lost,
      });
      if (!result.valid) {
        this.renderMatch();
        return;
      }

      this.recordTutorialMove(result, true);
      this.updateBark(result);
      await this.playMoveFrames(result, index, index, false);
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
      this.armAutoHint();
    }
  }

  private async attemptMatchSwap(
    first: number,
    second: number,
    selectSecondWhenNonAdjacent = false,
    source: MatchInteractionSource = 'tap',
  ): Promise<void> {
    const game = this.activeMatch;
    if (!game || this.matchInputLocked) return;
    this.matchInputLocked = true;
    this.clearAutoHintTimer();
    this.hintedCells.clear();
    this.lastTappedSpecial = null;
    try {
      const directSpecialCombo = Boolean(game.board[first]?.special && game.board[second]?.special);
      const result = game.attemptSwap(first, second);
      this.services.telemetry.track('match_move', {
        levelId: game.level.id, levelIndex: this.activeLevelIndex, valid: result.valid, reason: result.valid ? 'ok' : result.reason,
        source, activation: 'swap', movesLeft: game.movesLeft, cascades: result.cascades, specialsCreated: result.specialsCreated,
        reshuffled: result.reshuffled, won: result.won, lost: result.lost,
      });
      if (!result.valid) {
        if (result.reason === 'not-adjacent' && selectSecondWhenNonAdjacent) {
          this.selectedCell = second;
          this.renderMatch();
          return;
        }
        if (result.reason === 'ingredient') this.matchBark = this.bark('ingredientInvalid', 'miku');
        else if (result.reason === 'blocked') this.matchBark = this.bark('blockedInvalid', 'onoe');
        else if (result.reason === 'no-match') this.matchBark = this.bark('noMatchInvalid', 'onoe');
        await this.playMoveFrames(result, first, second);
        this.renderMatch();
        return;
      }

      this.recordTutorialMove(result, false, directSpecialCombo);
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
      this.armAutoHint();
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
        this.bark('fiveMoves.0', 'miku'), this.bark('fiveMoves.1', 'kentaro'), this.bark('fiveMoves.2', 'miku'), this.bark('fiveMoves.3', 'onoe'),
      ];
      this.matchBark = texts[index];
      return;
    }
    if (result.specialsCreated > 0 && !this.triggeredBarks.has('special')) {
      this.triggeredBarks.add('special');
      this.matchBark = this.bark('special', 'miku');
      return;
    }
    const blockerThresholds = [3, 1, 6, 4];
    if (progress.blockersCleared >= blockerThresholds[index] && !this.triggeredBarks.has('blockers')) {
      this.triggeredBarks.add('blockers');
      const texts: Bark[] = [
        this.bark('blockers.0', 'ayuki'), this.bark('blockers.1', 'onoe'), this.bark('blockers.2', 'miku'), this.bark('blockers.3', 'ayuki'),
      ];
      this.matchBark = texts[index];
      return;
    }
    if (moveNumber === 1 && !this.triggeredBarks.has('ingredient')) {
      this.triggeredBarks.add('ingredient');
      const texts: Bark[] = [
        this.bark('ingredient.0', 'onoe'), this.bark('ingredient.1', 'ayuki'), this.bark('ingredient.2', 'ayuki'), this.bark('ingredient.3', 'miku'),
      ];
      this.matchBark = texts[index];
      return;
    }
    if (result.cascades >= 2) this.matchBark = this.bark('cascade', 'ayuki', { count: result.cascades });
  }

  private completeLevel(): void {
    this.clearAutoHintTimer();
    if (this.labRun) {
      this.renderLabResult('win');
      return;
    }
    if (this.campaignRun) {
      this.renderCampaignResult('win');
      return;
    }
    this.endActiveAttempt('win');
    const levelIndex = this.activeLevelIndex;
    const level = levels[levelIndex];
    if (!this.session.save.completed.includes(levelIndex)) this.session.save.completed.push(levelIndex);
    if (!this.session.save.clues.includes(level.clueId)) this.session.save.clues.push(level.clueId);
    this.onClueAwarded(level.clueId);
    this.activeMatch = null;
    this.session.save.scene = postSceneForLevel(levelIndex);
    this.session.save.line = 0;
    this.session.persist();
    this.renderEvidenceTransition(level);
  }

  private renderEvidenceTransition(level: LevelDefinition): void {
    this.services.audio.setScene('vn');
    this.services.telemetry.trackScreen('evidence', level.id);
    this.services.audio.play('clue');
    const clue = cluePresentation[level.clueId];
    this.shell.render(`<section class="evidence-transition" ${this.contextAttrs(level)}>
      <img class="evidence-background" src="${backgroundAssets[level.context.pageBackground]}" alt="">
      <div class="evidence-panel">
        <p class="eyebrow">${escapeHtml(this.t('match3.evidenceFound'))}</p>
        <img src="${clue.asset}" alt="${escapeHtml(this.t(`match3.clue.${level.clueId}`))}">
        <h2>${escapeHtml(this.levelText(level, 'clueTitle'))}</h2>
        <p><b>${escapeHtml(this.levelBark(level, 'win').speaker)}:</b> ${escapeHtml(this.levelBark(level, 'win').text)}</p>
        <button id="continue-story" class="primary">${escapeHtml(this.t('match3.continueStory'))}</button>
      </div>
    </section>`);
    const continueStory = (): void => this.navigation.openScene(this.session.save.scene, this.session.save.line);
    this.root.querySelector('#continue-story')?.addEventListener('click', continueStory);
    this.shell.schedule(continueStory, 1800);
  }

  private renderLoss(): void {
    this.clearAutoHintTimer();
    if (this.labRun) {
      this.renderLabResult('loss');
      return;
    }
    if (this.campaignRun) {
      this.renderCampaignResult('loss');
      return;
    }
    this.services.audio.setScene('match');
    this.services.telemetry.trackScreen('loss', levels[this.activeLevelIndex]?.id ?? String(this.activeLevelIndex));
    const level = levels[this.activeLevelIndex];
    this.endActiveAttempt('loss');
    this.activeMatch = null;
    this.shell.render(`<section class="result-screen loss">
      <header class="app-header result-topbar">
        ${headerActionMarkup('back', 'back', this.t('match3.backToInvestigation'), undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(level.shortId)}</small><b>${escapeHtml(this.t('match3.result'))}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('common.navigation'))}"></nav>
      </header>
      <div class="result-content">
        <div class="result-mark">↻</div>
        <p class="eyebrow">${escapeHtml(this.t('match3.feedback.outOfMoves'))}</p>
        <h2>${escapeHtml(this.t('match3.lossHeading'))}</h2>
        <blockquote><b>${escapeHtml(level.loseBark.speaker)}</b>${escapeHtml(level.loseBark.text)}</blockquote>
        <button class="primary" id="retry">${escapeHtml(this.t('match3.retry'))}</button>
      </div>
    </section>`);
    this.root.querySelector('#retry')?.addEventListener('click', () => this.startMatch(this.activeLevelIndex));
    this.root.querySelector('#back')?.addEventListener('click', () => this.renderMatchIntro(this.activeLevelIndex));
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.renderLoss(), true));
  }

  private renderCampaignResult(outcome: 'win' | 'loss'): void {
    const campaign = this.campaignRun;
    const game = this.activeMatch;
    if (!campaign || !game) return;
    const level = game.level;
    const movesLeft = game.movesLeft;
    this.endActiveAttempt(outcome, 'match3-campaign');
    if (outcome === 'win') {
      if (!campaign.session.save.completed.includes(level.id)) campaign.session.save.completed.push(level.id);
      const previousBest = campaign.session.save.bestMovesLeft[level.id];
      if (previousBest === undefined || movesLeft > previousBest) campaign.session.save.bestMovesLeft[level.id] = movesLeft;
      campaign.session.persist();
    }
    this.activeMatch = null;
    this.services.audio.setScene('match');
    this.services.telemetry.trackScreen('match3-campaign-result', `${level.id}:${outcome}`);
    const hasNext = outcome === 'win' && campaign.levelIndex + 1 < levels.length;
    this.shell.render(`<section class="result-screen ${outcome === 'win' ? 'win' : 'loss'} match3-campaign-result">
      <header class="app-header result-topbar">
        ${headerActionMarkup('back', 'back', this.t('match3Campaign.backToCampaign'), undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(this.t('match3Campaign.eyebrow'))}</small><b>${escapeHtml(level.shortId)}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('common.navigation'))}"></nav>
      </header>
      <div class="result-content">
        <div class="result-mark">${outcome === 'win' ? '✓' : '↻'}</div>
        <p class="eyebrow">${escapeHtml(this.t(outcome === 'win' ? 'match3Campaign.winEyebrow' : 'match3Campaign.lossEyebrow'))}</p>
        <h2>${escapeHtml(this.t(outcome === 'win' ? 'match3Campaign.winHeading' : 'match3Campaign.lossHeading'))}</h2>
        <p>${escapeHtml(this.t('match3Campaign.resultDetail', { movesLeft }))}</p>
        ${hasNext ? `<button class="primary" id="campaign-next">${escapeHtml(this.t('match3Campaign.nextLevel'))}</button>` : ''}
        <button class="${hasNext ? '' : 'primary'}" id="campaign-retry">${escapeHtml(this.t('match3Campaign.retry'))}</button>
        <button id="campaign-hub">${escapeHtml(this.t('match3Campaign.backToCampaign'))}</button>
      </div>
    </section>`);
    this.root.querySelector('#campaign-next')?.addEventListener('click', () => this.startCampaignMatch(campaign.levelIndex + 1, campaign.session, campaign.onExit));
    this.root.querySelector('#campaign-retry')?.addEventListener('click', () => this.startCampaignMatch(campaign.levelIndex, campaign.session, campaign.onExit));
    const backToCampaign = (): void => { const onExit = campaign.onExit; this.clearActiveMatch(); onExit(); };
    this.root.querySelector('#back')?.addEventListener('click', backToCampaign);
    this.root.querySelector('#campaign-hub')?.addEventListener('click', backToCampaign);
  }

  private renderLabResult(outcome: 'win' | 'loss'): void {
    const lab = this.labRun;
    const game = this.activeMatch;
    if (!lab || !game) return;
    const level = game.level;
    const movesLeft = game.movesLeft;
    this.endActiveAttempt(outcome, 'level-lab');
    this.activeMatch = null;
    this.services.audio.setScene('match');
    this.services.telemetry.trackScreen('level-lab-result', `${level.id}:${lab.seed}:${outcome}`);
    this.shell.render(`<section class="result-screen ${outcome === 'win' ? 'win' : 'loss'} level-lab-result">
      <header class="app-header result-topbar">
        ${headerActionMarkup('back', 'back', this.t('levelLab.backToLab'), undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(this.t('levelLab.runLabel'))}</small><b>${escapeHtml(level.shortId)} · SEED ${lab.seed}</b></div>
        <nav class="app-header-actions" aria-label="${escapeHtml(this.t('common.navigation'))}"></nav>
      </header>
      <div class="result-content">
        <div class="result-mark">${outcome === 'win' ? '✓' : '↻'}</div>
        <p class="eyebrow">${escapeHtml(this.t('levelLab.resultEyebrow'))}</p>
        <h2>${escapeHtml(this.t(outcome === 'win' ? 'levelLab.resultWin' : 'levelLab.resultLoss'))}</h2>
        <p>${escapeHtml(this.t('levelLab.resultDetail', { seed: lab.seed, movesLeft }))}</p>
        <button class="primary" id="lab-retry">${escapeHtml(this.t('levelLab.retrySameSeed'))}</button>
        <button id="lab-back">${escapeHtml(this.t('levelLab.backToLab'))}</button>
      </div>
    </section>`);
    this.root.querySelector('#lab-retry')?.addEventListener('click', () => this.startLabMatch(lab.levelIndex, lab.seed, lab.onExit, lab.level));
    const backToLab = (): void => { const onExit = lab.onExit; this.clearActiveMatch(); onExit(); };
    this.root.querySelector('#back')?.addEventListener('click', backToLab);
    this.root.querySelector('#lab-back')?.addEventListener('click', backToLab);
  }

  private objectiveMarkup(level: LevelDefinition, objective: LevelDefinition['objectives'][number], objectiveIndex: number, value: number, showProgress: boolean): string {
    let assets: readonly string[];
    if (objective.kind === 'collect') assets = [resolveMatch3TilePresentation(level.context.tilePresentationProfile, objective.tile).asset];
    else if (objective.kind === 'drop') assets = [ingredientPresentation[objective.ingredient].asset];
    else if (objective.kind === 'dropGroup') assets = objective.ingredients.map((ingredient) => ingredientPresentation[ingredient].asset);
    else assets = [blockerPresentation[level.blocker].asset];
    const current = Math.min(value, objective.target);
    const icons = assets.map((asset) => `<img src="${asset}" alt="">`).join('');
    return `<div class="objective ${showProgress && current >= objective.target ? 'done' : ''}">
      <div class="objective-icons ${assets.length > 1 ? 'multi' : ''}">${icons}</div><span>${escapeHtml(this.objectiveText(level, objectiveIndex))}</span>
      <b>${showProgress ? `${current}/` : ''}${objective.target}</b>
    </div>`;
  }

}
