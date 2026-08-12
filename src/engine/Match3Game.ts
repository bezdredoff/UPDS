import {
  BOARD_SIZE,
  type IngredientKey,
  type LevelDefinition,
  type TileKey,
  tileKeys,
} from '../data/levels';

export type SpecialKind = 'flash-row' | 'flash-column' | 'evidence' | 'lead' | 'insight';
export type MatchFeedbackKind = 'match' | 'combo' | 'chain' | 'special';

export type DirectSpecialCombo =
  | 'flash-flash'
  | 'flash-evidence'
  | 'evidence-evidence'
  | 'lead-flash'
  | 'lead-evidence'
  | 'insight-normal'
  | 'insight-special'
  | 'fallback';

export type BoardCell = Readonly<{
  tile: TileKey | null;
  ingredient: IngredientKey | null;
  blockerLayers: number;
  special: SpecialKind | null;
}>;

type MutableCell = {
  tile: TileKey | null;
  ingredient: IngredientKey | null;
  blockerLayers: number;
  special: SpecialKind | null;
};

export type Match3Progress = Readonly<{
  collected: Readonly<Partial<Record<TileKey, number>>>;
  blockersCleared: number;
  ingredientsDropped: Readonly<Partial<Record<IngredientKey, number>>>;
}>;

export type MatchGroup = Readonly<{
  orientation: 'row' | 'column';
  indices: readonly number[];
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

type SpecialCreation = Readonly<{ index: number; kind: SpecialKind; consumed?: readonly number[] }>;

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
  reason?: 'same-cell' | 'not-adjacent' | 'ingredient' | 'blocked' | 'no-match' | 'finished';
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

const rowOf = (index: number): number => Math.floor(index / BOARD_SIZE);
const colOf = (index: number): number => index % BOARD_SIZE;
const indexOf = (row: number, column: number): number => row * BOARD_SIZE + column;

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
  private readonly collected: Partial<Record<TileKey, number>> = {};
  private readonly ingredientsDropped: Partial<Record<IngredientKey, number>> = {};
  private blockersCleared = 0;

  constructor(level: LevelDefinition, seed = level.seed) {
    this.level = level;
    this.movesLeft = level.moves;
    this.random = makeRng(seed);
    this.cells = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => ({
      tile: null,
      ingredient: null,
      blockerLayers: 0,
      special: null,
    }));

    for (const blocker of level.blockers) this.cells[blocker.index].blockerLayers = blocker.layers;
    this.fillInitialTiles();
    for (const ingredient of level.ingredients) {
      const cell = this.cells[ingredient.index];
      cell.tile = null;
      cell.special = null;
      cell.ingredient = ingredient.kind;
    }
    this.ensurePlayable();
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
      return (this.ingredientsDropped[objective.ingredient] ?? 0) >= objective.target;
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
    return this.ingredientsDropped[objective.ingredient] ?? 0;
  }

  attemptSwap(first: number, second: number): MoveResult {
    if (this.won || this.lost) return emptyMoveResult('finished', this.won, this.lost);

    const evaluation = this.evaluateSwap(first, second);
    if (!evaluation.valid) return emptyMoveResult(evaluation.reason ?? 'no-match', this.won, this.lost);

    const primaryFeedback = this.classifyPlayerMove(evaluation.groups, evaluation.activatedSpecials, evaluation.creations);
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

  getHintMove(): HintMove | null {
    let best: HintMove | null = null;

    for (let index = 0; index < this.cells.length; index += 1) {
      for (const candidate of [index + 1, index + BOARD_SIZE]) {
        const evaluation = this.evaluateSwap(index, candidate);
        if (!evaluation.valid) continue;

        const score = this.scorePotentialMove(evaluation.groups, evaluation.activatedSpecials);
        const move = { first: index, second: candidate, score };
        if (
          !best
          || move.score > best.score
          || (move.score === best.score && (move.first < best.first || (move.first === best.first && move.second < best.second)))
        ) best = move;
      }
    }

    return best;
  }

  findMatchGroups(): MatchGroup[] {
    const groups: MatchGroup[] = [];

    for (let row = 0; row < BOARD_SIZE; row += 1) {
      let start = 0;
      while (start < BOARD_SIZE) {
        const first = this.cells[indexOf(row, start)].tile;
        let end = start + 1;
        while (first && end < BOARD_SIZE && this.cells[indexOf(row, end)].tile === first) end += 1;
        if (first && end - start >= 3) {
          groups.push({ orientation: 'row', indices: Array.from({ length: end - start }, (_, offset) => indexOf(row, start + offset)) });
        }
        start = end;
      }
    }

    for (let column = 0; column < BOARD_SIZE; column += 1) {
      let start = 0;
      while (start < BOARD_SIZE) {
        const first = this.cells[indexOf(start, column)].tile;
        let end = start + 1;
        while (first && end < BOARD_SIZE && this.cells[indexOf(end, column)].tile === first) end += 1;
        if (first && end - start >= 3) {
          groups.push({ orientation: 'column', indices: Array.from({ length: end - start }, (_, offset) => indexOf(start + offset, column)) });
        }
        start = end;
      }
    }

    return groups;
  }

  hasImmediateMatches(): boolean {
    return this.findMatchGroups().length > 0;
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
    if (this.isLockedCell(first) || this.isLockedCell(second)) return empty('blocked');

    const sameTile = this.cells[first].tile === this.cells[second].tile;
    const firstSpecial = this.cells[first].special;
    const secondSpecial = this.cells[second].special;
    const directCombo = this.getDirectSpecialCombo(firstSpecial, secondSpecial);

    this.swapContents(first, second);
    const activatedSpecials = [first, second].filter((index) => this.cells[index].special !== null);
    const groups = this.findMatchGroups();
    const creations = sameTile && activatedSpecials.length === 0
      ? []
      : this.findPlayerSpecialCreations(groups, first, second);
    this.swapContents(first, second);

    if (groups.length === 0 && activatedSpecials.length === 0 && creations.length === 0 && directCombo === null) return empty('no-match');
    return { valid: true, groups, activatedSpecials, creations, directCombo };
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
        return !horizontalMatch && !verticalMatch;
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

    for (
      let cascade = 0;
      cascade < 24 && (groups.length > 0 || specialActivations.length > 0 || (cascade === 0 && playerCreations.length > 0));
      cascade += 1
    ) {
      totals.cascades += 1;
      const matched = new Set(groups.flatMap((group) => [...group.indices]));
      const creations = totals.cascades === 1
        ? new Map(playerCreations.map((creation) => [creation.index, creation] as const))
        : new Map<number, SpecialCreation>();

      const creationConsumed = [...creations.values()].flatMap((creation) => [...(creation.consumed ?? [])]);
      const clear = new Set<number>([...matched, ...specialActivations, ...creationConsumed]);
      if (totals.cascades === 1 && directCombo) this.expandDirectSpecialCombo(clear, directCombo, first, second);
      this.expandSpecialEffects(clear);
      for (const creation of creations.keys()) {
        if (!specialActivations.includes(creation)) clear.delete(creation);
      }

      const activatedCount = specialActivations.length;
      const visibleClear = [...clear].filter((index) => Boolean(this.cells[index]?.tile) && !this.isLockedCell(index));
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
      totals.ingredientsDropped += settle.dropped;
      frames.push({
        phase: 'settle',
        cascade: totals.cascades,
        board: this.snapshotBoard(),
        specialsActivated: 0,
        motions: settle.motions,
      });
      groups = this.findMatchGroups();
      specialActivations = [];
    }

    return totals;
  }

  private findPlayerSpecialCreations(
    groups: readonly MatchGroup[],
    first: number,
    second: number,
  ): readonly SpecialCreation[] {
    const swapped = new Set([first, second]);
    const candidates: SpecialCreation[] = [];

    for (const group of groups) {
      if (group.indices.length < 5 || !group.indices.some((index) => swapped.has(index))) continue;
      const index = group.indices.includes(second) ? second : first;
      candidates.push({ index, kind: 'insight' });
    }
    if (candidates.length > 0) return this.uniqueCreations(candidates);

    const rows = groups.filter((group) => group.orientation === 'row');
    const columns = groups.filter((group) => group.orientation === 'column');
    for (const rowGroup of rows) {
      for (const columnGroup of columns) {
        const intersection = rowGroup.indices.find((index) => columnGroup.indices.includes(index));
        if (intersection === undefined) continue;
        const shape = new Set([...rowGroup.indices, ...columnGroup.indices]);
        if (![...swapped].some((index) => shape.has(index))) continue;
        candidates.push({ index: intersection, kind: 'evidence' });
      }
    }
    if (candidates.length > 0) return this.uniqueCreations(candidates);

    for (const anchor of [first, second]) {
      const tile = this.cells[anchor]?.tile;
      if (!tile) continue;
      const row = rowOf(anchor);
      const column = colOf(anchor);
      for (const top of [row - 1, row]) {
        for (const left of [column - 1, column]) {
          if (top < 0 || left < 0 || top >= BOARD_SIZE - 1 || left >= BOARD_SIZE - 1) continue;
          const square = [
            indexOf(top, left),
            indexOf(top, left + 1),
            indexOf(top + 1, left),
            indexOf(top + 1, left + 1),
          ];
          if (square.every((index) => this.cells[index]?.tile === tile)) {
            const index = square.includes(second) ? second : anchor;
            candidates.push({ index, kind: 'lead', consumed: square });
          }
        }
      }
    }
    if (candidates.length > 0) return this.uniqueCreations(candidates);

    for (const group of groups) {
      if (group.indices.length !== 4 || !group.indices.some((index) => swapped.has(index))) continue;
      const index = group.indices.includes(second) ? second : first;
      candidates.push({ index, kind: group.orientation === 'row' ? 'flash-row' : 'flash-column' });
    }
    return this.uniqueCreations(candidates);
  }

  private uniqueCreations(creations: readonly SpecialCreation[]): readonly SpecialCreation[] {
    const byIndex = new Map<number, SpecialCreation>();
    for (const creation of creations) if (!byIndex.has(creation.index)) byIndex.set(creation.index, creation);
    return [...byIndex.values()];
  }

  private classifyPlayerMove(
    groups: readonly MatchGroup[],
    activatedSpecials: readonly number[],
    creations: readonly SpecialCreation[],
  ): MatchFeedbackKind {
    if (activatedSpecials.length > 0) return 'special';
    if (creations.length > 0 || groups.some((group) => group.indices.length >= 4)) return 'combo';

    const seen = new Set<number>();
    for (const group of groups) {
      for (const index of group.indices) {
        if (seen.has(index)) return 'combo';
        seen.add(index);
      }
    }
    return 'match';
  }

  private snapshotBoard(): readonly BoardCell[] {
    return this.cells.map((cell) => ({ ...cell }));
  }

  private scorePotentialMove(groups: readonly MatchGroup[], activatedSpecials: readonly number[]): number {
    const matched = new Set(groups.flatMap((group) => [...group.indices]));
    let score = 100 + matched.size * 4 + activatedSpecials.length * 90;

    for (const group of groups) {
      if (group.indices.length >= 4) score += 24 + (group.indices.length - 4) * 8;
    }

    for (const objective of this.level.objectives) {
      if (objective.kind === 'collect') {
        const remaining = Math.max(0, objective.target - (this.collected[objective.tile] ?? 0));
        if (remaining <= 0) continue;
        const useful = [...matched].filter((index) => this.cells[index].tile === objective.tile).length;
        score += useful * 36;
        continue;
      }

      if (objective.kind === 'clearBlockers') {
        const usefulBlockers = new Set<number>();
        for (const index of matched) {
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
        score += usefulBlockers.size * 30;
        continue;
      }

      const remaining = Math.max(0, objective.target - (this.ingredientsDropped[objective.ingredient] ?? 0));
      if (remaining <= 0) continue;
      for (let ingredientIndex = 0; ingredientIndex < this.cells.length; ingredientIndex += 1) {
        if (this.cells[ingredientIndex].ingredient !== objective.ingredient) continue;
        const ingredientColumn = colOf(ingredientIndex);
        const ingredientRow = rowOf(ingredientIndex);
        const clearsBelow = [...matched].some((index) => colOf(index) === ingredientColumn && rowOf(index) > ingredientRow);
        if (clearsBelow) score += 34;
      }
    }

    return score;
  }

  private getDirectSpecialCombo(
    first: SpecialKind | null,
    second: SpecialKind | null,
  ): DirectSpecialCombo | null {
    const isFlash = (kind: SpecialKind | null): boolean => kind === 'flash-row' || kind === 'flash-column';
    if (!first && !second) return null;
    if ((first === 'insight' && !second) || (second === 'insight' && !first)) return 'insight-normal';
    if (first === 'insight' || second === 'insight') return 'insight-special';
    if (isFlash(first) && isFlash(second)) return 'flash-flash';
    if ((isFlash(first) && second === 'evidence') || (first === 'evidence' && isFlash(second))) return 'flash-evidence';
    if (first === 'evidence' && second === 'evidence') return 'evidence-evidence';
    if ((first === 'lead' && isFlash(second)) || (isFlash(first) && second === 'lead')) return 'lead-flash';
    if ((first === 'lead' && second === 'evidence') || (first === 'evidence' && second === 'lead')) return 'lead-evidence';
    if (first || second) return 'fallback';
    return null;
  }

  private expandDirectSpecialCombo(
    clear: Set<number>,
    combo: DirectSpecialCombo,
    first: number,
    second: number,
  ): void {
    const centre = second;
    const addRow = (row: number): void => {
      for (let column = 0; column < BOARD_SIZE; column += 1) clear.add(indexOf(row, column));
    };
    const addColumn = (column: number): void => {
      for (let row = 0; row < BOARD_SIZE; row += 1) clear.add(indexOf(row, column));
    };
    const addArea = (radius: number): void => {
      for (let row = Math.max(0, rowOf(centre) - radius); row <= Math.min(BOARD_SIZE - 1, rowOf(centre) + radius); row += 1) {
        for (let column = Math.max(0, colOf(centre) - radius); column <= Math.min(BOARD_SIZE - 1, colOf(centre) + radius); column += 1) {
          clear.add(indexOf(row, column));
        }
      }
    };

    if (combo === 'flash-flash') {
      addRow(rowOf(centre));
      addColumn(colOf(centre));
      return;
    }
    if (combo === 'flash-evidence') {
      for (const row of [rowOf(centre) - 1, rowOf(centre), rowOf(centre) + 1]) {
        if (row >= 0 && row < BOARD_SIZE) addRow(row);
      }
      for (const column of [colOf(centre) - 1, colOf(centre), colOf(centre) + 1]) {
        if (column >= 0 && column < BOARD_SIZE) addColumn(column);
      }
      return;
    }
    if (combo === 'evidence-evidence') {
      addArea(2);
      return;
    }
    if (combo === 'lead-flash') {
      addRow(rowOf(centre));
      addColumn(colOf(centre));
      for (const target of this.leadTargets(centre)) clear.add(target);
      return;
    }
    if (combo === 'lead-evidence') {
      addArea(2);
      for (const target of this.leadTargets(centre)) clear.add(target);
      return;
    }
    if (combo === 'insight-normal') {
      const insightIndex = this.cells[first]?.special === 'insight' ? first : second;
      const normalIndex = insightIndex === first ? second : first;
      const tile = this.cells[normalIndex]?.tile;
      if (tile) {
        this.cells.forEach((cell, index) => {
          if (cell.tile === tile) clear.add(index);
        });
      }
      clear.add(insightIndex);
      return;
    }
    if (combo === 'insight-special') {
      const insightIndex = this.cells[first]?.special === 'insight' ? first : second;
      const partnerIndex = insightIndex === first ? second : first;
      const tile = this.cells[partnerIndex]?.tile;
      if (tile) {
        this.cells.forEach((cell, index) => {
          if (cell.tile === tile) clear.add(index);
        });
      }
      clear.add(insightIndex);
      clear.add(partnerIndex);
      return;
    }

    clear.add(first);
    clear.add(second);
  }

  private expandSpecialEffects(clear: Set<number>): void {
    const queue = [...clear];
    const expanded = new Set<number>();
    while (queue.length > 0) {
      const index = queue.shift()!;
      if (expanded.has(index)) continue;
      expanded.add(index);
      const special = this.cells[index]?.special;
      if (!special) continue;
      let additions: number[];
      if (special === 'flash-row') {
        additions = Array.from({ length: BOARD_SIZE }, (_, column) => indexOf(rowOf(index), column));
      } else if (special === 'flash-column') {
        additions = Array.from({ length: BOARD_SIZE }, (_, row) => indexOf(row, colOf(index)));
      } else if (special === 'evidence') {
        additions = [];
        for (let row = Math.max(0, rowOf(index) - 1); row <= Math.min(BOARD_SIZE - 1, rowOf(index) + 1); row += 1) {
          for (let column = Math.max(0, colOf(index) - 1); column <= Math.min(BOARD_SIZE - 1, colOf(index) + 1); column += 1) {
            additions.push(indexOf(row, column));
          }
        }
      } else if (special === 'lead') {
        additions = this.leadTargets(index);
      } else {
        const tile = this.cells[index]?.tile;
        additions = tile ? this.cells.flatMap((cell, cellIndex) => cell.tile === tile ? [cellIndex] : []) : [];
      }
      for (const addition of additions) {
        if (!clear.has(addition)) {
          clear.add(addition);
          queue.push(addition);
        }
      }
    }
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
        cellIndex !== index && !local.includes(cellIndex) && cell.tile === objective.tile && !this.isLockedCell(cellIndex));
      if (target >= 0) return [...local, target];
    }
    const fallback = this.cells.findIndex((cell, cellIndex) =>
      cellIndex !== index && !local.includes(cellIndex) && Boolean(cell.tile) && !this.isLockedCell(cellIndex));
    return fallback >= 0 ? [...local, fallback] : local;
  }

  private clearTiles(indices: ReadonlySet<number>): number {
    let cleared = 0;
    for (const index of indices) {
      const cell = this.cells[index];
      if (!cell?.tile) continue;
      if (this.isLockedCell(index)) continue;
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
      if (!cell.tile && !cell.ingredient) {
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
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      let segmentBottom = BOARD_SIZE - 1;
      for (let row = BOARD_SIZE - 1; row >= -1; row -= 1) {
        const barrier = row >= 0 && this.isLockedCell(indexOf(row, column));
        if (row >= 0 && !barrier) continue;
        this.compactSegment(column, row + 1, segmentBottom, origins);
        segmentBottom = row - 1;
      }
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
      const index = indexOf(BOARD_SIZE - 1, column);
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
    for (let row = rowOf(index) - 1; row >= 0; row -= 1) {
      if (this.isLockedCell(indexOf(row, column))) return row + 1;
    }
    return 0;
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
      const groups = this.findMatchGroups();
      for (const group of groups) this.cells[group.indices[group.indices.length - 1]].tile = this.randomTile();
    }
  }

  private areAdjacent(first: number, second: number): boolean {
    if (first < 0 || second < 0 || first >= this.cells.length || second >= this.cells.length) return false;
    const rowDistance = Math.abs(rowOf(first) - rowOf(second));
    const columnDistance = Math.abs(colOf(first) - colOf(second));
    return rowDistance + columnDistance === 1;
  }

  private isLockedCell(index: number): boolean {
    return this.level.blocker !== 'foam' && this.cells[index].blockerLayers > 0;
  }

  private swapContents(first: number, second: number): void {
    const a = this.cells[first];
    const b = this.cells[second];
    [a.tile, b.tile] = [b.tile, a.tile];
    [a.special, b.special] = [b.special, a.special];
  }

  private shuffledTileKeys(): TileKey[] {
    return [...tileKeys].sort(() => this.random() - 0.5);
  }

  private randomTile(): TileKey {
    return tileKeys[Math.floor(this.random() * tileKeys.length)];
  }
}
