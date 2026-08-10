import {
  BOARD_SIZE,
  type IngredientKey,
  type LevelDefinition,
  type TileKey,
  tileKeys,
} from '../data/levels';

export type SpecialKind = 'row' | 'column';

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

export type MoveResult = Readonly<{
  valid: boolean;
  reason?: 'same-cell' | 'not-adjacent' | 'ingredient' | 'blocked' | 'no-match' | 'finished';
  cleared: number;
  cascades: number;
  specialsCreated: number;
  blockersCleared: number;
  ingredientsDropped: number;
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
  blockersCleared: 0,
  ingredientsDropped: 0,
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
    if (first === second) return emptyMoveResult('same-cell', this.won, this.lost);
    if (!this.areAdjacent(first, second)) return emptyMoveResult('not-adjacent', this.won, this.lost);
    if (!this.cells[first]?.tile || !this.cells[second]?.tile) return emptyMoveResult('ingredient', this.won, this.lost);
    if (this.isLockedCell(first) || this.isLockedCell(second)) return emptyMoveResult('blocked', this.won, this.lost);

    this.swapContents(first, second);
    const activatedSpecials = [first, second].filter((index) => this.cells[index].special !== null);
    const groups = this.findMatchGroups();
    if (groups.length === 0 && activatedSpecials.length === 0) {
      this.swapContents(first, second);
      return emptyMoveResult('no-match', this.won, this.lost);
    }

    this.movesLeft -= 1;
    const totals = this.resolve(groups, activatedSpecials, second);
    if (!this.won && !this.lost && !this.hasAvailableMove()) this.shuffle();

    return {
      valid: true,
      ...totals,
      won: this.won,
      lost: this.lost,
    };
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
      const candidates = [index + 1, index + BOARD_SIZE];
      for (const candidate of candidates) {
        if (candidate >= this.cells.length || !this.areAdjacent(index, candidate)) continue;
        if (!this.cells[index].tile || !this.cells[candidate].tile) continue;
        if (this.isLockedCell(index) || this.isLockedCell(candidate)) continue;
        this.swapContents(index, candidate);
        const valid = this.findMatchGroups().length > 0;
        this.swapContents(index, candidate);
        if (valid) return true;
      }
    }
    return false;
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

  private resolve(initialGroups: readonly MatchGroup[], activatedSpecials: readonly number[], preferredSpecialCell: number): ResolutionTotals {
    const totals: ResolutionTotals = { cleared: 0, cascades: 0, specialsCreated: 0, blockersCleared: 0, ingredientsDropped: 0 };
    let groups = [...initialGroups];
    let specialActivations = [...activatedSpecials];

    for (let cascade = 0; cascade < 24 && (groups.length > 0 || specialActivations.length > 0); cascade += 1) {
      totals.cascades += 1;
      const matched = new Set(groups.flatMap((group) => [...group.indices]));
      const creations = new Map<number, SpecialKind>();

      for (const group of groups) {
        if (group.indices.length < 4) continue;
        const preferred = group.indices.includes(preferredSpecialCell)
          ? preferredSpecialCell
          : group.indices[Math.floor(group.indices.length / 2)];
        if (!creations.has(preferred)) creations.set(preferred, group.orientation);
      }

      const clear = new Set<number>([...matched, ...specialActivations]);
      this.expandSpecialEffects(clear);
      for (const creation of creations.keys()) {
        if (!specialActivations.includes(creation)) clear.delete(creation);
      }

      const clearedThisCascade = this.clearTiles(clear);
      totals.cleared += clearedThisCascade;
      totals.blockersCleared += this.damageBlockers(clear);

      for (const [index, special] of creations) {
        const cell = this.cells[index];
        if (!cell.tile || clear.has(index)) continue;
        cell.special = special;
        totals.specialsCreated += 1;
      }

      totals.ingredientsDropped += this.settleBoard();
      groups = this.findMatchGroups();
      specialActivations = [];
    }

    return totals;
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
      const additions = special === 'row'
        ? Array.from({ length: BOARD_SIZE }, (_, column) => indexOf(rowOf(index), column))
        : Array.from({ length: BOARD_SIZE }, (_, row) => indexOf(row, colOf(index)));
      for (const addition of additions) {
        if (!clear.has(addition)) {
          clear.add(addition);
          queue.push(addition);
        }
      }
    }
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

  private settleBoard(): number {
    let dropped = this.collectBottomIngredients();
    this.compactColumns();
    dropped += this.collectBottomIngredients();
    if (dropped > 0) this.compactColumns();

    for (let index = 0; index < this.cells.length; index += 1) {
      const cell = this.cells[index];
      if (!cell.tile && !cell.ingredient) cell.tile = this.randomTile();
    }
    return dropped;
  }

  private compactColumns(): void {
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      let segmentBottom = BOARD_SIZE - 1;
      for (let row = BOARD_SIZE - 1; row >= -1; row -= 1) {
        const barrier = row >= 0 && this.isLockedCell(indexOf(row, column));
        if (row >= 0 && !barrier) continue;
        this.compactSegment(column, row + 1, segmentBottom);
        segmentBottom = row - 1;
      }
    }
  }

  private compactSegment(column: number, segmentTop: number, segmentBottom: number): void {
    if (segmentTop > segmentBottom) return;
    const contents: Array<Pick<MutableCell, 'tile' | 'ingredient' | 'special'>> = [];
    for (let row = segmentBottom; row >= segmentTop; row -= 1) {
      const cell = this.cells[indexOf(row, column)];
      if (cell.tile || cell.ingredient) contents.push({ tile: cell.tile, ingredient: cell.ingredient, special: cell.special });
    }
    for (let row = segmentBottom, contentIndex = 0; row >= segmentTop; row -= 1, contentIndex += 1) {
      const cell = this.cells[indexOf(row, column)];
      const content = contents[contentIndex];
      cell.tile = content?.tile ?? null;
      cell.ingredient = content?.ingredient ?? null;
      cell.special = content?.special ?? null;
    }
  }

  private collectBottomIngredients(): number {
    let dropped = 0;
    for (let column = 0; column < BOARD_SIZE; column += 1) {
      const cell = this.cells[indexOf(BOARD_SIZE - 1, column)];
      if (!cell.ingredient) continue;
      const ingredient = cell.ingredient;
      this.ingredientsDropped[ingredient] = (this.ingredientsDropped[ingredient] ?? 0) + 1;
      cell.ingredient = null;
      cell.tile = null;
      cell.special = null;
      dropped += 1;
    }
    return dropped;
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
