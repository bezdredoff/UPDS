import { BOARD_SIZE, type Match3TileId } from '../data/levels';

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

export type MatchGroup = Readonly<{
  orientation: 'row' | 'column' | 'square';
  indices: readonly number[];
}>;

export type SpecialCreation = Readonly<{
  index: number;
  kind: SpecialKind;
  consumed?: readonly number[];
}>;

export type Match3RuleCell = Readonly<{
  tile: Match3TileId | null;
  special: SpecialKind | null;
}>;

export const rowOf = (index: number): number => Math.floor(index / BOARD_SIZE);
export const colOf = (index: number): number => index % BOARD_SIZE;
export const indexOf = (row: number, column: number): number => row * BOARD_SIZE + column;

export function findMatchGroups(cells: readonly Match3RuleCell[]): MatchGroup[] {
  const groups: MatchGroup[] = [];

  for (let row = 0; row < BOARD_SIZE; row += 1) {
    let start = 0;
    while (start < BOARD_SIZE) {
      const first = cells[indexOf(row, start)]?.tile ?? null;
      let end = start + 1;
      while (first && end < BOARD_SIZE && cells[indexOf(row, end)]?.tile === first) end += 1;
      if (first && end - start >= 3) {
        groups.push({
          orientation: 'row',
          indices: Array.from({ length: end - start }, (_, offset) => indexOf(row, start + offset)),
        });
      }
      start = end;
    }
  }

  for (let column = 0; column < BOARD_SIZE; column += 1) {
    let start = 0;
    while (start < BOARD_SIZE) {
      const first = cells[indexOf(start, column)]?.tile ?? null;
      let end = start + 1;
      while (first && end < BOARD_SIZE && cells[indexOf(end, column)]?.tile === first) end += 1;
      if (first && end - start >= 3) {
        groups.push({
          orientation: 'column',
          indices: Array.from({ length: end - start }, (_, offset) => indexOf(start + offset, column)),
        });
      }
      start = end;
    }
  }

  return groups;
}

export function findSquareMatchGroups(cells: readonly Match3RuleCell[]): MatchGroup[] {
  const groups: MatchGroup[] = [];
  for (let row = 0; row < BOARD_SIZE - 1; row += 1) {
    for (let column = 0; column < BOARD_SIZE - 1; column += 1) {
      const square = [
        indexOf(row, column),
        indexOf(row, column + 1),
        indexOf(row + 1, column),
        indexOf(row + 1, column + 1),
      ];
      const tile = cells[square[0]]?.tile ?? null;
      if (tile && square.every((index) => cells[index]?.tile === tile)) {
        groups.push({ orientation: 'square', indices: square });
      }
    }
  }
  return groups;
}

export function findResolutionMatchGroups(cells: readonly Match3RuleCell[]): MatchGroup[] {
  return [...findMatchGroups(cells), ...findSquareMatchGroups(cells)];
}

const uniqueCreations = (creations: readonly SpecialCreation[]): readonly SpecialCreation[] => {
  const byIndex = new Map<number, SpecialCreation>();
  for (const creation of creations) if (!byIndex.has(creation.index)) byIndex.set(creation.index, creation);
  return [...byIndex.values()];
};

export function findPlayerSpecialCreations(
  cells: readonly Match3RuleCell[],
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
  if (candidates.length > 0) return uniqueCreations(candidates);

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
  if (candidates.length > 0) return uniqueCreations(candidates);

  for (const anchor of [first, second]) {
    const tile = cells[anchor]?.tile;
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
        if (square.every((index) => cells[index]?.tile === tile)) {
          const index = square.includes(second) ? second : anchor;
          candidates.push({ index, kind: 'lead', consumed: square });
        }
      }
    }
  }
  if (candidates.length > 0) return uniqueCreations(candidates);

  for (const group of groups) {
    if (group.orientation === 'square' || group.indices.length !== 4 || !group.indices.some((index) => swapped.has(index))) continue;
    const index = group.indices.includes(second) ? second : first;
    candidates.push({ index, kind: group.orientation === 'row' ? 'flash-row' : 'flash-column' });
  }
  return uniqueCreations(candidates);
}

const automaticCreationAnchor = (
  cells: readonly Match3RuleCell[],
  indices: readonly number[],
  preferredIndices: readonly number[],
): number | null => {
  const available = indices.filter((index) => !cells[index]?.special);
  if (available.length === 0) return null;
  const preferred = preferredIndices.find((index) => available.includes(index));
  return preferred ?? available[Math.floor((available.length - 1) / 2)] ?? null;
};

export function findAutomaticSpecialCreations(
  cells: readonly Match3RuleCell[],
  groups: readonly MatchGroup[],
  preferredIndices: readonly number[] = [],
): readonly SpecialCreation[] {
  const candidates: SpecialCreation[] = [];

  for (const group of groups) {
    if (group.orientation === 'square' || group.indices.length < 5) continue;
    const index = automaticCreationAnchor(cells, group.indices, preferredIndices);
    if (index !== null) candidates.push({ index, kind: 'insight' });
  }
  if (candidates.length > 0) return uniqueCreations(candidates);

  const rows = groups.filter((group) => group.orientation === 'row');
  const columns = groups.filter((group) => group.orientation === 'column');
  for (const rowGroup of rows) {
    for (const columnGroup of columns) {
      const intersection = rowGroup.indices.find((index) => columnGroup.indices.includes(index));
      if (intersection !== undefined && !cells[intersection]?.special) {
        candidates.push({ index: intersection, kind: 'evidence' });
      }
    }
  }
  if (candidates.length > 0) return uniqueCreations(candidates);

  for (const group of groups) {
    if (group.orientation !== 'square') continue;
    const index = automaticCreationAnchor(cells, group.indices, preferredIndices);
    if (index !== null) candidates.push({ index, kind: 'lead', consumed: group.indices });
  }
  if (candidates.length > 0) return uniqueCreations(candidates);

  for (const group of groups) {
    if (group.orientation === 'square' || group.indices.length !== 4) continue;
    const index = automaticCreationAnchor(cells, group.indices, preferredIndices);
    if (index !== null) candidates.push({
      index,
      kind: group.orientation === 'row' ? 'flash-row' : 'flash-column',
    });
  }
  return uniqueCreations(candidates);
}

export function classifyPlayerMove(
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

export function resolveDirectSpecialCombo(
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

export function directSpecialComboTargets(
  cells: readonly Match3RuleCell[],
  combo: DirectSpecialCombo,
  first: number,
  second: number,
  leadTargets: (index: number) => readonly number[],
): readonly number[] {
  const targets = new Set<number>();
  const centre = second;
  const addRow = (row: number): void => {
    for (let column = 0; column < BOARD_SIZE; column += 1) targets.add(indexOf(row, column));
  };
  const addColumn = (column: number): void => {
    for (let row = 0; row < BOARD_SIZE; row += 1) targets.add(indexOf(row, column));
  };
  const addArea = (radius: number): void => {
    for (let row = Math.max(0, rowOf(centre) - radius); row <= Math.min(BOARD_SIZE - 1, rowOf(centre) + radius); row += 1) {
      for (let column = Math.max(0, colOf(centre) - radius); column <= Math.min(BOARD_SIZE - 1, colOf(centre) + radius); column += 1) {
        targets.add(indexOf(row, column));
      }
    }
  };

  if (combo === 'flash-flash') {
    addRow(rowOf(centre));
    addColumn(colOf(centre));
    return [...targets];
  }
  if (combo === 'flash-evidence') {
    for (const row of [rowOf(centre) - 1, rowOf(centre), rowOf(centre) + 1]) {
      if (row >= 0 && row < BOARD_SIZE) addRow(row);
    }
    for (const column of [colOf(centre) - 1, colOf(centre), colOf(centre) + 1]) {
      if (column >= 0 && column < BOARD_SIZE) addColumn(column);
    }
    return [...targets];
  }
  if (combo === 'evidence-evidence') {
    addArea(2);
    return [...targets];
  }
  if (combo === 'lead-flash') {
    addRow(rowOf(centre));
    addColumn(colOf(centre));
    for (const target of leadTargets(centre)) targets.add(target);
    return [...targets];
  }
  if (combo === 'lead-evidence') {
    addArea(2);
    for (const target of leadTargets(centre)) targets.add(target);
    return [...targets];
  }
  if (combo === 'insight-normal') {
    const insightIndex = cells[first]?.special === 'insight' ? first : second;
    const normalIndex = insightIndex === first ? second : first;
    const tile = cells[normalIndex]?.tile;
    if (tile) {
      cells.forEach((cell, index) => {
        if (cell.tile === tile) targets.add(index);
      });
    }
    targets.add(insightIndex);
    return [...targets];
  }
  if (combo === 'insight-special') {
    const insightIndex = cells[first]?.special === 'insight' ? first : second;
    const partnerIndex = insightIndex === first ? second : first;
    const tile = cells[partnerIndex]?.tile;
    if (tile) {
      cells.forEach((cell, index) => {
        if (cell.tile === tile) targets.add(index);
      });
    }
    targets.add(insightIndex);
    targets.add(partnerIndex);
    return [...targets];
  }

  targets.add(first);
  targets.add(second);
  return [...targets];
}

export function expandSpecialClearTargets(
  cells: readonly Match3RuleCell[],
  initialTargets: ReadonlySet<number>,
  leadTargets: (index: number) => readonly number[],
): Set<number> {
  const clear = new Set(initialTargets);
  const queue = [...clear];
  const expanded = new Set<number>();

  while (queue.length > 0) {
    const index = queue.shift()!;
    if (expanded.has(index)) continue;
    expanded.add(index);
    const special = cells[index]?.special;
    if (!special) continue;

    let additions: readonly number[];
    if (special === 'flash-row') {
      additions = Array.from({ length: BOARD_SIZE }, (_, column) => indexOf(rowOf(index), column));
    } else if (special === 'flash-column') {
      additions = Array.from({ length: BOARD_SIZE }, (_, row) => indexOf(row, colOf(index)));
    } else if (special === 'evidence') {
      const area: number[] = [];
      for (let row = Math.max(0, rowOf(index) - 1); row <= Math.min(BOARD_SIZE - 1, rowOf(index) + 1); row += 1) {
        for (let column = Math.max(0, colOf(index) - 1); column <= Math.min(BOARD_SIZE - 1, colOf(index) + 1); column += 1) {
          area.push(indexOf(row, column));
        }
      }
      additions = area;
    } else if (special === 'lead') {
      additions = leadTargets(index);
    } else {
      const tile = cells[index]?.tile;
      additions = tile ? cells.flatMap((cell, cellIndex) => cell.tile === tile ? [cellIndex] : []) : [];
    }

    for (const addition of additions) {
      if (!clear.has(addition)) {
        clear.add(addition);
        queue.push(addition);
      }
    }
  }

  return clear;
}
