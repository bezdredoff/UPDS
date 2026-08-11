import { characterRigs } from '../../data/characterRigs';
import {
  blockerPresentation,
  cluePresentation,
  ingredientPresentation,
  levels,
  specialAsset,
  tilePresentation,
  type ClueId,
  type LevelDefinition,
} from '../../data/levels';
import { backgroundAssets, getScene } from '../../data/narrative';
import { postSceneForLevel } from '../../engine/CampaignStore';
import { Match3Game, type BoardCell, type Match3Frame, type MoveResult } from '../../engine/Match3Game';
import { preloadImageAssets } from '../../platform/AssetPreloader';
import type { RuntimeServices } from '../../platform/RuntimeServices';
import type { AppNavigation } from '../../app/AppNavigation';
import type { AppSession } from '../../app/AppSession';
import type { AppShell } from '../../app/AppShell';
import { getDragPreview, getSwipeDecision } from '../../ui/boardInteraction';
import { matchMotionDuration } from '../../ui/matchMotion';
import { escapeHtml, headerActionMarkup } from '../../ui/viewMarkup';

export type MatchOutcome = 'win' | 'loss' | 'abandon';
type Bark = Readonly<{ speaker: string; text: string }>;

export class Match3Controller {
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
    this.activeMatch = null;
    this.selectedCell = null;
    this.activePointer = null;
    this.matchInputLocked = false;
  }

  endActiveAttempt(outcome: MatchOutcome, reason = ''): void {
    const game = this.activeMatch;
    if (!game || this.matchAttemptStartedAt === null) return;
    const level = game.level;
    this.services.telemetry.track('match_end', {
      levelId: level.id,
      levelIndex: this.activeLevelIndex,
      attempt: this.session.save.attempts[level.id] ?? 0,
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
      backgroundAssets[level.background],
      blockerPresentation[level.blocker].asset,
      specialAsset,
      ...Object.values(tilePresentation).map((presentation) => presentation.asset),
      ...Object.values(ingredientPresentation).map((presentation) => presentation.asset),
    ];
    void preloadImageAssets(assets, this.services.assetHealth);
  }

  renderMatchIntro(levelIndex: number): void {
    this.services.audio.setScene('match');
    this.services.telemetry.trackScreen('match-intro', levels[levelIndex]?.id ?? String(levelIndex));
    const level = levels[levelIndex];
    this.preloadMatchAssets(level);
    this.activeLevelIndex = levelIndex;
    this.activeMatch = null;
    this.shell.render(`<section class="level-intro">
      <img class="level-intro-background" src="${backgroundAssets[level.background]}" alt="">
      <div class="level-intro-shade"></div>
      <header class="app-header match-topbar intro-topbar">
        ${headerActionMarkup('back', 'back', 'Назад', undefined, 'app-header-back')}
        <div class="app-header-title"><small>РАССЛЕДОВАНИЕ ${levelIndex + 1}/4</small><b>${escapeHtml(level.title)}</b></div>
        <nav class="app-header-actions" aria-label="Навигация расследования">
          ${headerActionMarkup('dossier', 'dossier', 'Досье', this.session.save.clues.length)}
          ${headerActionMarkup('header-settings', 'settings', 'Настройки')}
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
    this.root.querySelector('#back')?.addEventListener('click', () => this.navigation.openScene(this.session.save.scene, Math.max(0, getScene(this.session.save.scene, this.session.save.choice).length - 1)));
    this.root.querySelector('#dossier')?.addEventListener('click', () => this.navigation.showDossier(() => this.renderMatchIntro(levelIndex)));
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.renderMatchIntro(levelIndex), true));
    this.root.querySelector('#start')?.addEventListener('click', () => this.startMatch(levelIndex));
  }

  startMatch(levelIndex: number): void {
    const level = levels[levelIndex];
    const attempt = (this.session.save.attempts[level.id] ?? 0) + 1;
    this.session.save.attempts[level.id] = attempt;
    this.session.persist();
    this.activeLevelIndex = levelIndex;
    this.activeMatch = new Match3Game(level, level.seed + attempt * 101);
    this.matchAttemptStartedAt = Date.now();
    this.services.telemetry.track('match_start', { levelId: level.id, levelIndex, attempt, moveBudget: level.moves });
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
    this.services.telemetry.trackScreen('match', levels[this.activeLevelIndex]?.id ?? String(this.activeLevelIndex));
    const game = this.activeMatch;
    if (!game) return this.renderMatchIntro(this.activeLevelIndex);
    const level = game.level;
    const blocker = blockerPresentation[level.blocker];

    this.shell.render(`<section class="match-screen">
      <img class="match-background" src="${backgroundAssets[level.background]}" alt="">
      <div class="match-shade"></div>
      <header class="app-header match-topbar">
        ${headerActionMarkup('quit', 'back', 'Назад к расследованию', undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(level.shortId)}</small><b>${escapeHtml(level.title)}</b></div>
        <nav class="app-header-actions" aria-label="Навигация расследования">
          ${headerActionMarkup('dossier', 'dossier', 'Досье', this.session.save.clues.length)}
          ${headerActionMarkup('header-settings', 'settings', 'Настройки')}
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
      this.endActiveAttempt('abandon', 'back-to-intro');
      this.activeMatch = null;
      this.renderMatchIntro(this.activeLevelIndex);
    });
    this.root.querySelector('#dossier')?.addEventListener('click', () => {
      if (this.matchInputLocked) return;
      this.navigation.showDossier(() => this.renderMatch());
    });
    this.root.querySelector('#header-settings')?.addEventListener('click', () => {
      if (this.matchInputLocked) return;
      this.navigation.showSettings(() => this.renderMatch(), true);
    });
    this.root.querySelector('#hint')?.addEventListener('click', () => this.showObjectiveHint());
    this.installBoardInput();
  }

  private showObjectiveHint(): void {
    const game = this.activeMatch;
    if (!game || this.matchInputLocked) return;
    const hint = game.getHintMove();
    this.services.telemetry.track('match_hint', { levelId: game.level.id, levelIndex: this.activeLevelIndex, movesLeft: game.movesLeft, available: Boolean(hint) });
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
      this.services.telemetry.track('match_move', {
        levelId: game.level.id, levelIndex: this.activeLevelIndex, valid: result.valid, reason: result.valid ? 'ok' : result.reason,
        movesLeft: game.movesLeft, cascades: result.cascades, specialsCreated: result.specialsCreated, reshuffled: result.reshuffled, won: result.won, lost: result.lost,
      });
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
    this.shell.render(`<section class="evidence-transition">
      <img class="evidence-background" src="${backgroundAssets[level.background]}" alt="">
      <div class="evidence-panel">
        <p class="eyebrow">УЛИКА НАЙДЕНА</p>
        <img src="${clue.asset}" alt="${escapeHtml(clue.label)}">
        <h2>${escapeHtml(level.clueTitle)}</h2>
        <p><b>${escapeHtml(level.winBark.speaker)}:</b> ${escapeHtml(level.winBark.text)}</p>
        <button id="continue-story" class="primary">Продолжить сцену</button>
      </div>
    </section>`);
    const continueStory = (): void => this.navigation.openScene(this.session.save.scene, this.session.save.line);
    this.root.querySelector('#continue-story')?.addEventListener('click', continueStory);
    this.shell.schedule(continueStory, 1800);
  }

  private renderLoss(): void {
    this.services.audio.setScene('match');
    this.services.telemetry.trackScreen('loss', levels[this.activeLevelIndex]?.id ?? String(this.activeLevelIndex));
    const level = levels[this.activeLevelIndex];
    this.endActiveAttempt('loss');
    this.activeMatch = null;
    this.shell.render(`<section class="result-screen loss">
      <header class="app-header result-topbar">
        ${headerActionMarkup('back', 'back', 'Назад к расследованию', undefined, 'app-header-back')}
        <div class="app-header-title"><small>${escapeHtml(level.shortId)}</small><b>Результат</b></div>
        <nav class="app-header-actions" aria-label="Навигация">
          ${headerActionMarkup('header-settings', 'settings', 'Настройки')}
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
    this.root.querySelector('#header-settings')?.addEventListener('click', () => this.navigation.showSettings(() => this.renderLoss(), true));
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

}
