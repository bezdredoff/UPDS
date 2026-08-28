import {
  BOARD_SIZE,
  blockerLocksTileInteraction,
  objectiveIngredientKeys,
  type IngredientKey,
  type LevelDefinition,
  type Match3TileId,
} from '../data/levels';
import {
  classifyPlayerMove,
  colOf,
  directSpecialComboTargets,
  expandSpecialClearTargets,
  findAutomaticSpecialCreations,
  findMatchGroups as findBoardMatchGroups,
  findResolutionMatchGroups as findBoardResolutionMatchGroups,
  findPlayerSpecialCreations,
  indexOf,
  resolveDirectSpecialCombo,
  rowOf,
  type DirectSpecialCombo,
  type MatchFeedbackKind,
  type MatchGroup,
  type SpecialCreation,
  type SpecialKind,
} from './Match3Rules';

export type { DirectSpecialCombo, MatchFeedbackKind, MatchGroup, SpecialKind } from './Match3Rules';

export type BoardCell = Readonly<{
  tile: Match3TileId | null;
  ingredient: IngredientKey | null;
  blockerLayers: number;
  special: SpecialKind | null;
}>;

type MutableCell = {
  tile: Match3TileId | null;
  ingredient: IngredientKey | null;
  blockerLayers: number;
  special: SpecialKind | null;
};

export type Match3Progress = Readonly<{
  collected: Readonly<Partial<Record<Match3TileId, number>>>;
  blockersCleared: number;
  ingredientsDropped: Readonly<Partial<Record<IngredientKey, number>>>;
}>;

export type SettleMotion = Readonly<{
  index: number;
  fromIndex: number | null;
  kind: 'fall' | 'spawn';
  rows: number;
}>;

export type Match3Frame = Readonly<{
  phase: 'swap' | 'clear' | 'settle' | 'reshuffle';
  feedback?: MatchFeedbackKind;
  cascade: number;
  board: readonly BoardCell[];
  specialsActivated: number;
  clearedIndices?: readonly number[];
  motions?: readonly SettleMotion[];
}>;

export type HintMove = Readonly<{
  first: number;
  second: number;
  score: number;
}>;

type SwapEvaluation = Readonly<{
  valid: boolean;
  reason?: Exclude<MoveResult['reason'], 'finished'>;
  groups: readonly MatchGroup[];
  activatedSpecials: readonly number[];
  creations: readonly SpecialCreation[];
  directCombo: DirectSpecialCombo | null;
}>;

export type MoveResult = Readonly<{
  valid: boolean;
  reason?: 'same-cell' | 'not-adjacent' | 'ingredient' | 'blocked' | 'no-match' | 'no-special' | 'finished';
  cleared: number;
  cascades: number;
  specialsCreated: number;
  primaryFeedback: MatchFeedbackKind | null;
  blockersCleared: number;
  ingredientsDropped: number;
  reshuffled: boolean;
  frames: readonly Match3Frame[];
  won: boolean;
  lost: boolean;
}>;

type ResolutionTotals = {
  cleared: number;
  cascades: number;
  specialsCreated: number;
  blockersCleared: number;
  ingredientsDropped: number;
};

const makeRng = (seed: number): (() => number) => {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
};

const OBJECTIVE_PROGRESS_HINT_PRIORITY = 10_000;
const OBJECTIVE_COMPLETION_HINT_BONUS = 2_000;
// Rotate equal-score hints for a stable half of board signatures. This removes aggregate
// scan-order bias without lowering the established deterministic hint-following win floors.
const HINT_TIE_ROTATION_BUCKET_MASK = 0xd1;

const emptyMoveResult = (reason: MoveResult['reason'], won: boolean, lost: boolean): MoveResult => ({
  valid: false,
  reason,
  cleared: 0,
  cascades: 0,
  specialsCreated: 0,
  primaryFeedback: null,
  blockersCleared: 0,
  ingredientsDropped: 0,
  reshuffled: false,
  frames: [],
  won,
  lost,
});

export class Match3Game {
  readonly level: LevelDefinition;
  movesLeft: number;
  private readonly cells: MutableCell[];
  private readonly random: () => number;
  private readonly boardHoles: ReadonlySet<number>;
  private readonly collected: Partial<Record<Match3TileId, number>> = {};
  private readonly ingredientsDropped: Partial<Record<IngredientKey, number>> = {};
  private blockersCleared = 0;

  constructor(level: LevelDefinition, seed = level.seed) {
    this.level = level;
    this.movesLeft = level.moves;
    this.random = makeRng(seed);
    this.boardHoles = new Set(level.boardHoles ?? []);
    this.cells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => ({
      tile: null,
      ingredient: null,
      blockerLayers: 0,
      special: null,
    }));

    for (const blocker of level.blockers) this.cells[blocker.index].blockerLayers = blocker.layers;
    if (this.hasConfiguredInitialBoard()) {
      this.initializeConfiguredBoard();
    } else {
      this.fillInitialTiles();
      for (const ingredient of level.ingredients) {
        const cell = this.cells[ingredient.index];
        cell.tile = null;
        cell.special = null;
        cell.ingredient = ingredient.kind;
      }
      this.ensurePlayable();
    }
  }

  get board(): readonly BoardCell[] {
    return this.cells;
  }

  get progress(): Match3Progress {
    return {
      collected: { ...this.collected },
      blockersCleared: this.blockersCleared,
      ingredientsDropped: { ...this.ingredientsDropped },
    };
  }

  get won(): boolean {
    return this.level.objectives.every((objective) => {
      if (objective.kind === 'collect') return (this.collected[objective.tile] ?? 0) >= objective.target;
      if (objective.kind === 'clearBlockers') return this.blockersCleared >= objective.target;
      const dropped = objectiveIngredientKeys(objective).reduce((total, ingredient) => total + (this.ingredientsDropped[ingredient] ?? 0), 0);
      return dropped >= objective.target;
    });
  }

  get lost(): boolean {
    return this.movesLeft <= 0 && !this.won;
  }

  objectiveValue(objectiveIndex: number): number {
    const objective = this.level.objectives[objectiveIndex];
    if (!objective) return 0;
    if (objective.kind === 'collect') return this.collected[objective.tile] ?? 0;
    if (objective.kind === 'clearBlockers') return this.blockersCleared;
    return objectiveIngredientKeys(objective).reduce((total, ingredient) => total + (this.ingredientsDropped[ingredient] ?? 0), 0);
  }

  attemptSwap(first: number, second: number): MoveResult {
    if (this.won || this.lost) return emptyMoveResult('finished', this.won, this.lost);

    const evaluation = this.evaluateSwap(first, second);
    if (!evaluation.valid) return emptyMoveResult(evaluation.reason ?? 'no-match', this.won, this.lost);

    const primaryFeedback = classifyPlayerMove(evaluation.groups, evaluation.activatedSpecials, evaluation.creations);
    this.swapContents(first, second);
    const groups = [...evaluation.groups];
    const activatedSpecials = [...evaluation.activatedSpecials];
    const creations = [...evaluation.creations];
    const directCombo = evaluation.directCombo;

    const frames: Match3Frame[] = [{
      phase: 'swap',
      cascade: 0,
      board: this.snapshotBoard(),
      specialsActivated: activatedSpecials.length,
    }];

    this.movesLeft -= 1;
    const totals = this.resolve(groups, activatedSpecials, creations, directCombo, first, second, frames, primaryFeedback);
    let reshuffled = false;
    if (!this.won && !this.lost && !this.hasAvailableMove()) {
      this.shuffle();
      reshuffled = true;
      frames.push({
        phase: 'reshuffle',
        cascade: totals.cascades,
        board: this.snapshotBoard(),
        specialsActivated: 0,
      });
    }

    return {
      valid: true,
      ...totals,
      primaryFeedback,
      reshuffled,
      frames,
      won: this.won,
      lost: this.lost,
    };
  }

  attemptSpecialActivation(index: number): MoveResult {
    if (this.won || this.lost) return emptyMoveResult('finished', this.won, this.lost);

    const cell = this.cells[index];
    if (!cell?.tile) return emptyMoveResult('ingredient', this.won, this.lost);
    if (this.isBlockedCell(index)) return emptyMoveResult('blocked', this.won, this.lost);
    if (!cell.special) return emptyMoveResult('no-special', this.won, this.lost);

    const frames: Match3Frame[] = [];
    this.movesLeft -= 1;
    const totals = this.resolve([], [index], [], null, index, index, frames, 'special');
    let reshuffled = false;
    if (!this.won && !this.lost && !this.hasAvailableMove()) {
      this.shuffle();
      reshuffled = true;
      frames.push({
        phase: 'reshuffle',
        cascade: totals.cascades,
        board: this.snapshotBoard(),
        specialsActivated: 0,
      });
    }

    return {
      valid: true,
      ...totals,
      primaryFeedback: 'special',
      reshuffled,
      frames,
      won: this.won,
      lost: this.lost,
    };
  }

  getHintMove(): HintMove | null {
    let bestMoves: HintMove[] = [];

    for (let index = 0; index < this.cells.length; index += 1) {
      for (const candidate of [index + 1, index + BOARD_SIZE]) {
        const evaluation = this.evaluateSwap(index, candidate);
        if (!evaluation.valid) continue;

        const score = this.scoreHintEvaluation(index, candidate, evaluation);
        const move = { first: index, second: candidate, score };
        if (bestMoves.length === 0 || move.score > bestMoves[0].score) bestMoves = [move];
        else if (move.score === bestMoves[0].score) bestMoves.push(move);
      }
    }

    return bestMoves[this.hintTieBreakIndex(bestMoves.length)] ?? null;
  }

  private hintTieBreakIndex(candidateCount: number): number {
    if (candidateCount <= 1) return 0;
    const signature = `${this.level.id}|${this.cells.map((cell) => (
      `${cell.tile ?? '-'},${cell.ingredient ?? '-'},${cell.blockerLayers},${cell.special ?? '-'}`
    )).join(';')}`;
    let hash = 2166136261;
    for (let index = 0; index < signature.length; index += 1) {
      hash ^= signature.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const rotationBucket = (hash >>> 8) & 7;
    if ((HINT_TIE_ROTATION_BUCKET_MASK & (1 << rotationBucket)) === 0) return 0;
    return (hash >>> 0) % candidateCount;
  }

  private scoreHintEvaluation(first: number, second: number, evaluation: SwapEvaluation): number {
    this.swapContents(first, second);
    try {
      return this.scorePotentialMove(evaluation.groups, evaluation.activatedSpecials);
    } finally {
      this.swapContents(first, second);
    }
  }

  findMatchGroups(): MatchGroup[] {
    return findBoardMatchGroups(this.cells);
  }

  private findResolutionMatchGroups(): MatchGroup[] {
    return findBoardResolutionMatchGroups(this.cells);
  }

  hasImmediateMatches(): boolean {
    return this.findResolutionMatchGroups().length > 0;
  }

  hasAvailableMove(): boolean {
    for (let index = 0; index < this.cells.length; index += 1) {
      for (const candidate of [index + 1, index + BOARD_SIZE]) {
        if (this.evaluateSwap(index, candidate).valid) return true;
      }
    }
    return false;
  }

  private evaluateSwap(first: number, second: number): SwapEvaluation {
    const empty = (reason: Exclude<MoveResult['reason'], 'finished'>): SwapEvaluation => ({
      valid: false,
      reason,
      groups: [],
      activatedSpecials: [],
      creations: [],
      directCombo: null,
    });
    if (first === second) return empty('same-cell');
    if (!this.areAdjacent(first, second)) return empty('not-adjacent');
    if (!this.cells[first]?.tile || !this.cells[second]?.tile) return empty('ingredient');
    if (this.isBlockedCell(first) || this.isBlockedCell(second)) return empty('blocked');

    const sameTile = this.cells[first].tile === this.cells[second].tile;
    const firstSpecial = this.cells[first].special;
    const secondSpecial = this.cells[second].special;
    const directCombo = resolveDirectSpecialCombo(firstSpecial, secondSpecial);

    this.swapContents(first, second);
    const activatedSpecials = [first, second].filter((index) => this.cells[index].special !== null);
    const groups = this.findMatchGroups();
    const creations = sameTile && activatedSpecials.length === 0
      ? []
      : findPlayerSpecialCreations(this.cells, groups, first, second);
    this.swapContents(first, second);

    if (groups.length === 0 && activatedSpecials.length === 0 && creations.length === 0 && directCombo === null) return empty('no-match');
    return { valid: true, groups, activatedSpecials, creations, directCombo };
  }

  private hasConfiguredInitialBoard(): boolean {
    return this.boardHoles.size > 0 || (this.level.initialTiles?.length ?? 0) > 0;
  }

  private isActiveCell(index: number): boolean {
    return index >= 0 && index < this.cells.length && !this.boardHoles.has(index);
  }

  private initializeConfiguredBoard(): void {
    for (let attempt = 0; attempt < 100; attempt += 1) {
      for (let index = 0; index < this.cells.length; index += 1) {
        const cell = this.cells[index];
        cell.tile = null;
        cell.ingredient = null;
        cell.special = null;
      }
      for (const placement of this.level.initialTiles ?? []) this.cells[placement.index].tile = placement.tile;
      for (const ingredient of this.level.ingredients) this.cells[ingredient.index].ingredient = ingredient.kind;
      this.fillConfiguredTiles();
      if (!this.hasImmediateMatches() && this.hasAvailableMove()) return;
    }
    throw new Error(`${this.level.id}: unable to generate playable board from boardHoles/initialTiles`);
  }

  private fillConfiguredTiles(): void {
    for (let index = 0; index < this.cells.length; index += 1) {
      if (!this.isActiveCell(index)) continue;
      const cell = this.cells[index];
      if (cell.tile || cell.ingredient) continue;
      const candidates = this.shuffledTileKeys().filter((tile) => {
        const row = rowOf(index);
        const column = colOf(index);
        const horizontalMatch = column >= 2
          && this.cells[index - 1].tile === tile
          && this.cells[index - 2].tile === tile;
        const verticalMatch = row >= 2
          && this.cells[index - BOARD_SIZE].tile === tile
          && this.cells[index - BOARD_SIZE * 2].tile === tile;
        const squareMatch = row >= 1 && column >= 1
          && this.cells[index - 1].tile === tile
          && this.cells[index - BOARD_SIZE].tile === tile
          && this.cells[index - BOARD_SIZE - 1].tile === tile;
        return !horizontalMatch && !verticalMatch && !squareMatch;
      });
      cell.tile = candidates[0] ?? this.randomTile();
    }
  }

  private fillInitialTiles(): void {
    for (let index = 0; index < this.cells.length; index += 1) {
      const candidates = this.shuffledTileKeys().filter((tile) => {
        const row = rowOf(index);
        const column = colOf(index);
        const horizontalMatch = column >= 2
          && this.cells[index - 1].tile === tile
          && this.cells[index - 2].tile === tile;
        const verticalMatch = row >= 2
          && this.cells[index - BOARD_SIZE].tile === tile
          && this.cells[index - BOARD_SIZE * 2].tile === tile;
        const squareMatch = row >= 1 && column >= 1
          && this.cells[index - 1].tile === tile
          && this.cells[index - BOARD_SIZE].tile === tile
          && this.cells[index - BOARD_SIZE - 1].tile === tile;
        return !horizontalMatch && !verticalMatch && !squareMatch;
      });
      this.cells[index].tile = candidates[0] ?? this.randomTile();
    }
  }

  private resolve(
    initialGroups: readonly MatchGroup[],
    activatedSpecials: readonly number[],
    playerCreations: readonly SpecialCreation[],
    directCombo: DirectSpecialCombo | null,
    first: number,
    second: number,
    frames: Match3Frame[],
    primaryFeedback: MatchFeedbackKind,
  ): ResolutionTotals {
    const totals: ResolutionTotals = { cleared: 0, cascades: 0, specialsCreated: 0, blockersCleared: 0, ingredientsDropped: 0 };
    let groups = [...initialGroups];
    let specialActivations = [...activatedSpecials];
    let automaticCreationAnchors: readonly number[] = [];

    for (
      let cascade = 0;
      cascade < 24 && (groups.length > 0 || specialActivations.length > 0 || (cascade === 0 && playerCreations.length > 0));
      cascade += 1
    ) {
      totals.cascades += 1;
      const matched = new Set(groups.flatMap((group) => [...group.indices]));
      const creations = totals.cascades === 1
        ? new Map(playerCreations.map((creation) => [creation.index, creation] as const))
        : new Map(findAutomaticSpecialCreations(this.cells, groups, automaticCreationAnchors)
          .map((creation) => [creation.index, creation] as const));

      const creationConsumed = [...creations.values()].flatMap((creation) => [...(creation.consumed ?? [])]);
      const clearSeed = new Set<number>([...matched, ...specialActivations, ...creationConsumed]);
      if (totals.cascades === 1 && directCombo) {
        for (const target of directSpecialComboTargets(this.cells, directCombo, first, second, (index) => this.leadTargets(index))) {
          clearSeed.add(target);
        }
      }
      const clear = expandSpecialClearTargets(this.cells, clearSeed, (index) => this.leadTargets(index));
      for (const creation of creations.keys()) {
        if (!specialActivations.includes(creation)) clear.delete(creation);
      }

      const activatedCount = specialActivations.length;
      const visibleClear = [...clear].filter((index) => Boolean(this.cells[index]?.tile) && !this.isBlockedCell(index));
      const feedback: MatchFeedbackKind = activatedCount > 0
        ? 'special'
        : totals.cascades >= 2
          ? 'chain'
          : primaryFeedback;
      frames.push({
        phase: 'clear',
        feedback,
        cascade: totals.cascades,
        board: this.snapshotBoard(),
        specialsActivated: activatedCount,
        clearedIndices: visibleClear.sort((a, b) => a - b),
      });

      const clearedThisCascade = this.clearTiles(clear);
      totals.cleared += clearedThisCascade;
      totals.blockersCleared += this.damageBlockers(clear);

      for (const [index, creation] of creations) {
        const cell = this.cells[index];
        if (!cell.tile || clear.has(index)) continue;
        cell.special = creation.kind;
        totals.specialsCreated += 1;
      }

      const settle = this.settleBoard();
      automaticCreationAnchors = [...settle.motions]
        .sort((a, b) => Number(b.kind === 'spawn') - Number(a.kind === 'spawn') || b.rows - a.rows || a.index - b.index)
        .map((motion) => motion.index);
      totals.ingredientsDropped += settle.dropped;
      frames.push({
        phase: 'settle',
        cascade: totals.cascades,
        board: this.snapshotBoard(),
        specialsActivated: 0,
        motions: settle.motions,
      });
      groups = this.findResolutionMatchGroups();
      specialActivations = [];
    }

    return totals;
  }

  private snapshotBoard(): readonly BoardCell[] {
    return this.cells.map((cell) => ({ ...cell }));
  }

  private scorePotentialMove(groups: readonly MatchGroup[], activatedSpecials: readonly number[]): number {
    const matched = new Set(groups.flatMap((group) => [...group.indices]));
    const projectedClear = expandSpecialClearTargets(
      this.cells,
      new Set<number>([...matched, ...activatedSpecials]),
      (index) => this.leadTargets(index),
    );

    let tacticalScore = 100 + matched.size * 4 + activatedSpecials.length * 90;
    for (const group of groups) {
      if (group.indices.length >= 4) tacticalScore += 24 + (group.indices.length - 4) * 8;
    }

    let objectiveProgressUnits = 0;
    let objectiveCompletionBonuses = 0;

    for (const objective of this.level.objectives) {
      if (objective.kind === 'collect') {
        const remaining = Math.max(0, objective.target - (this.collected[objective.tile] ?? 0));
        if (remaining <= 0) continue;
        const useful = [...projectedClear].filter((index) =>
          this.cells[index].tile === objective.tile && !this.isBlockedCell(index)).length;
        const progress = Math.min(remaining, useful);
        objectiveProgressUnits += progress;
        if (progress >= remaining) objectiveCompletionBonuses += 1;
        continue;
      }

      if (objective.kind === 'clearBlockers') {
        const remaining = Math.max(0, objective.target - this.blockersCleared);
        if (remaining <= 0) continue;
        const usefulBlockers = new Set<number>();
        for (const index of projectedClear) {
          const row = rowOf(index);
          const column = colOf(index);
          for (const neighbour of [index, index - 1, index + 1, index - BOARD_SIZE, index + BOARD_SIZE]) {
            if (neighbour < 0 || neighbour >= this.cells.length) continue;
            const neighbourRow = rowOf(neighbour);
            const neighbourColumn = colOf(neighbour);
            if (Math.abs(neighbourRow - row) + Math.abs(neighbourColumn - column) > 1) continue;
            if (this.cells[neighbour].blockerLayers > 0) usefulBlockers.add(neighbour);
          }
        }
        const progress = Math.min(remaining, usefulBlockers.size);
        objectiveProgressUnits += progress;
        if (progress >= remaining && [...usefulBlockers].every((index) => this.cells[index].blockerLayers === 1)) {
          objectiveCompletionBonuses += 1;
        }
        continue;
      }

      const ingredientKeys = objectiveIngredientKeys(objective);
      const dropped = ingredientKeys.reduce((total, ingredient) => total + (this.ingredientsDropped[ingredient] ?? 0), 0);
      const remaining = Math.max(0, objective.target - dropped);
      if (remaining <= 0) continue;
      for (let ingredientIndex = 0; ingredientIndex < this.cells.length; ingredientIndex += 1) {
        const ingredient = this.cells[ingredientIndex].ingredient;
        if (!ingredient || !ingredientKeys.includes(ingredient)) continue;
        const ingredientColumn = colOf(ingredientIndex);
        const ingredientRow = rowOf(ingredientIndex);
        const clearsBelow = [...projectedClear].filter((index) =>
          colOf(index) === ingredientColumn
          && rowOf(index) > ingredientRow
          && Boolean(this.cells[index].tile)
          && !this.isBlockedCell(index)
          && !this.hasLockedBarrierBetween(ingredientIndex, index));
        objectiveProgressUnits += clearsBelow.length;
      }
    }

    // Guidance is intentionally lexicographic: direct progress on an unfinished win objective
    // outranks a tactically larger but irrelevant match. Tactical strength remains the tie-breaker.
    return objectiveProgressUnits * OBJECTIVE_PROGRESS_HINT_PRIORITY
      + objectiveCompletionBonuses * OBJECTIVE_COMPLETION_HINT_BONUS
      + tacticalScore;
  }

  private hasLockedBarrierBetween(upperIndex: number, lowerIndex: number): boolean {
    if (colOf(upperIndex) !== colOf(lowerIndex) || rowOf(lowerIndex) <= rowOf(upperIndex)) return true;
    const column = colOf(upperIndex);
    for (let row = rowOf(upperIndex) + 1; row <= rowOf(lowerIndex); row += 1) {
      const index = indexOf(row, column);
      if (!this.isActiveCell(index)) continue;
      if (this.isBlockedCell(index)) return true;
    }
    return false;
  }

  private leadTargets(index: number): number[] {
    const row = rowOf(index);
    const column = colOf(index);
    const local = [
      index,
      row > 0 ? indexOf(row - 1, column) : -1,
      row < BOARD_SIZE - 1 ? indexOf(row + 1, column) : -1,
      column > 0 ? indexOf(row, column - 1) : -1,
      column < BOARD_SIZE - 1 ? indexOf(row, column + 1) : -1,
    ].filter((candidate) => candidate >= 0);

    for (const objective of this.level.objectives) {
      if (objective.kind !== 'collect') continue;
      if ((this.collected[objective.tile] ?? 0) >= objective.target) continue;
      const target = this.cells.findIndex((cell, cellIndex) =>
        cellIndex !== index && !local.includes(cellIndex) && cell.tile === objective.tile && !this.isBlockedCell(cellIndex));
      if (target >= 0) return [...local, target];
    }
    const fallback = this.cells.findIndex((cell, cellIndex) =>
      cellIndex !== index && !local.includes(cellIndex) && Boolean(cell.tile) && !this.isBlockedCell(cellIndex));
    return fallback >= 0 ? [...local, fallback] : local;
  }

  private clearTiles(indices: ReadonlySet<number>): number {
    let cleared = 0;
    for (const index of indices) {
      const cell = this.cells[index];
      if (!cell?.tile) continue;
      if (this.isBlockedCell(index)) continue;
      this.collected[cell.tile] = (this.collected[cell.tile] ?? 0) + 1;
      cell.tile = null;
      cell.special = null;
      cleared += 1;
    }
    return cleared;
  }

  private damageBlockers(cleared: ReadonlySet<number>): number {
    const damaged = new Set<number>();
    for (const index of cleared) {
      const row = rowOf(index);
      const column = colOf(index);
      const neighbours = [index, index - 1, index + 1, index - BOARD_SIZE, index + BOARD_SIZE];
      for (const neighbour of neighbours) {
        if (neighbour < 0 || neighbour >= this.cells.length) continue;
        const neighbourRow = rowOf(neighbour);
        const neighbourColumn = colOf(neighbour);
        if (Math.abs(neighbourRow - row) + Math.abs(neighbourColumn - column) > 1) continue;
        if (this.cells[neighbour].blockerLayers > 0) damaged.add(neighbour);
      }
    }

    let clearedBlockers = 0;
    for (const index of damaged) {
      const cell = this.cells[index];
      cell.blockerLayers -= 1;
      if (cell.blockerLayers === 0) {
        this.blockersCleared += 1;
        clearedBlockers += 1;
      }
    }
    return clearedBlockers;
  }

  private settleBoard(): { dropped: number; motions: readonly SettleMotion[] } {
    const origins: Array<number | null> = this.cells.map((cell, index) => (cell.tile || cell.ingredient) ? index : null);
    let dropped = this.collectBottomIngredients(origins);
    this.compactColumns(origins);
    dropped += this.collectBottomIngredients(origins);
    if (dropped > 0) this.compactColumns(origins);

    for (let index = 0; index < this.cells.length; index += 1) {
      const cell = this.cells[index];
      if (this.isActiveCell(index) && !cell.tile && !cell.ingredient) {
        cell.tile = this.randomTile();
        origins[index] = null;
      }
    }

    const motions: SettleMotion[] = [];
    for (let index = 0; index < this.cells.length; index += 1) {
      const cell = this.cells[index];
      if (!cell.tile && !cell.ingredient) continue;
      const fromIndex = origins[index];
      if (fromIndex === null) {
        const row = rowOf(index);
        const segmentTop = this.segmentTopFor(index);
        motions.push({ index, fromIndex: null, kind: 'spawn', rows: Math.max(1, row - segmentTop + 1) });
      } else if (fromIndex !== index) {
        const rows = rowOf(index) - rowOf(fromIndex);
        if (rows > 0) motions.push({ index, fromIndex, kind: 'fall', rows });
      }
    }
    return { dropped, motions };
  }

  private compactColumns(origins: Array<number | null>): void {
    if (this.boardHoles.size === 0) {
      for (let column = 0; column < BOARD_SIZE; column += 1) {
        let segmentBottom = BOARD_SIZE - 1;
        for (let row = BOARD_SIZE - 1; row >= -1; row -= 1) {
          const barrier = row >= 0 && this.isBlockedCell(indexOf(row, column));
          if (row >= 0 && !barrier) continue;
          this.compactSegment(column, row + 1, segmentBottom, origins);
          segmentBottom = row - 1;
        }
      }
      return;
    }

    for (let column = 0; column < BOARD_SIZE; column += 1) {
      let segment: number[] = [];
      const flush = (): void => {
        if (segment.length > 0) this.compactActiveSegment(segment, origins);
        segment = [];
      };
      for (let row = 0; row < BOARD_SIZE; row += 1) {
        const index = indexOf(row, column);
        if (!this.isActiveCell(index)) continue;
        if (this.isBlockedCell(index)) {
          flush();
          continue;
        }
        segment.push(index);
      }
      flush();
    }
  }

  private compactActiveSegment(indices: readonly number[], origins: Array<number | null>): void {
    const contents: Array<Pick<MutableCell, 'tile' | 'ingredient' | 'special'> & { origin: number | null }> = [];
    for (let offset = indices.length - 1; offset >= 0; offset -= 1) {
      const index = indices[offset];
      const cell = this.cells[index];
      if (cell.tile || cell.ingredient) contents.push({ tile: cell.tile, ingredient: cell.ingredient, special: cell.special, origin: origins[index] });
    }
    for (let offset = indices.length - 1, contentIndex = 0; offset >= 0; offset -= 1, contentIndex += 1) {
      const index = indices[offset];
      const cell = this.cells[index];
      const content = contents[contentIndex];
      cell.tile = content?.tile ?? null;
      cell.ingredient = content?.ingredient ?? null;
      cell.special = content?.special ?? null;
      origins[index] = content?.origin ?? null;
    }
  }

  private compactSegment(column: number, segmentTop: number, segmentBottom: number, origins: Array<number | null>): void {
    if (segmentTop > segmentBottom) return;
    const contents: Array<Pick<MutableCell, 'tile' | 'ingredient' | 'special'> & { origin: number | null }> = [];
    for (let row = segmentBottom; row >= segmentTop; row -= 1) {
      const index = indexOf(row, column);
      const cell = this.cells[index];
      if (cell.tile || cell.ingredient) contents.push({ tile: cell.tile, ingredient: cell.ingredient, special: cell.special, origin: origins[index] });
    }
    for (let row = segmentBottom, contentIndex = 0; row >= segmentTop; row -= 1, contentIndex += 1) {
      const index = indexOf(row, column);
      const cell = this.cells[index];
      const content = contents[contentIndex];
      cell.tile = content?.tile ?? null;
      cell.ingredient = content?.ingredient ?? null;
      cell.special = content?.special ?? null;
      origins[index] = content?.origin ?? null;
    }
  }

  private collectBottomIngredients(origins?: Array<number | null>): number {
    let dropped = 0;
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      let index = indexOf(BOARD_SIZE - 1, column);
      if (this.boardHoles.size > 0) {
        let row = BOARD_SIZE - 1;
        while (row >= 0 && !this.isActiveCell(indexOf(row, column))) row -= 1;
        if (row < 0) continue;
        index = indexOf(row, column);
      }
      const cell = this.cells[index];
      if (!cell.ingredient) continue;
      const ingredient = cell.ingredient;
      this.ingredientsDropped[ingredient] = (this.ingredientsDropped[ingredient] ?? 0) + 1;
      cell.ingredient = null;
      cell.tile = null;
      cell.special = null;
      if (origins) origins[index] = null;
      dropped += 1;
    }
    return dropped;
  }

  private segmentTopFor(index: number): number {
    const column = colOf(index);
    if (this.boardHoles.size === 0) {
      for (let row = rowOf(index) - 1; row >= 0; row -= 1) {
        if (this.isBlockedCell(indexOf(row, column))) return row + 1;
      }
      return 0;
    }
    let top = rowOf(index);
    for (let row = rowOf(index) - 1; row >= 0; row -= 1) {
      const candidate = indexOf(row, column);
      if (!this.isActiveCell(candidate)) continue;
      if (this.isBlockedCell(candidate)) return top;
      top = row;
    }
    return top;
  }

  private ensurePlayable(): void {
    if (!this.hasImmediateMatches() && this.hasAvailableMove()) return;
    this.shuffle();
  }

  private shuffle(): void {
    const tileCells = this.cells.filter((cell) => cell.tile);
    const tiles = tileCells.map((cell) => cell.tile!);
    for (let attempt = 0; attempt < 100; attempt += 1) {
      for (let index = tiles.length - 1; index > 0; index -= 1) {
        const other = Math.floor(this.random() * (index + 1));
        [tiles[index], tiles[other]] = [tiles[other], tiles[index]];
      }
      tileCells.forEach((cell, index) => {
        cell.tile = tiles[index];
        cell.special = null;
      });
      if (!this.hasImmediateMatches() && this.hasAvailableMove()) return;
    }

    for (const cell of tileCells) {
      cell.tile = this.randomTile();
      cell.special = null;
    }
    while (this.hasImmediateMatches()) {
      const groups = this.findResolutionMatchGroups();
      for (const group of groups) this.cells[group.indices[group.indices.length - 1]].tile = this.randomTile();
    }
  }

  private areAdjacent(first: number, second: number): boolean {
    if (!this.isActiveCell(first) || !this.isActiveCell(second)) return false;
    const rowDistance = Math.abs(rowOf(first) - rowOf(second));
    const columnDistance = Math.abs(colOf(first) - colOf(second));
    return rowDistance + columnDistance === 1;
  }

  private isBlockedCell(index: number): boolean {
    return blockerLocksTileInteraction(this.level, this.cells[index].blockerLayers);
  }

  private swapContents(first: number, second: number): void {
    const a = this.cells[first];
    const b = this.cells[second];
    [a.tile, b.tile] = [b.tile, a.tile];
    [a.special, b.special] = [b.special, a.special];
  }

  private tileSpawnWeight(tile: Match3TileId): number {
    return this.level.spawnWeights?.[tile] ?? 1;
  }

  private shuffledTileKeys(): Match3TileId[] {
    if (!this.level.spawnWeights) return [...this.level.activeTiles].sort(() => this.random() - 0.5);

    const remaining = [...this.level.activeTiles];
    const ordered: Match3TileId[] = [];
    while (remaining.length > 0) {
      const total = remaining.reduce((sum, tile) => sum + this.tileSpawnWeight(tile), 0);
      let roll = this.random() * total;
      let selectedIndex = remaining.length - 1;
      for (let index = 0; index < remaining.length; index += 1) {
        roll -= this.tileSpawnWeight(remaining[index]);
        if (roll < 0) { selectedIndex = index; break; }
      }
      ordered.push(remaining.splice(selectedIndex, 1)[0]);
    }
    return ordered;
  }

  private randomTile(): Match3TileId {
    const tiles = this.level.activeTiles;
    if (tiles.length === 0) throw new Error(`${this.level.id}: active tile set is empty`);
    if (!this.level.spawnWeights) {
      const tile = tiles[Math.floor(this.random() * tiles.length)];
      if (!tile) throw new Error(`${this.level.id}: active tile set is empty`);
      return tile;
    }

    const total = tiles.reduce((sum, tile) => sum + this.tileSpawnWeight(tile), 0);
    let roll = this.random() * total;
    for (const tile of tiles) {
      roll -= this.tileSpawnWeight(tile);
      if (roll < 0) return tile;
    }
    return tiles[tiles.length - 1];
  }
}
