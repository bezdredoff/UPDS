import { levels, type LevelDefinition } from '../../src/data/levels';

/** Isolated design probe. Never added to Story, Campaign, or the production level array. */
export function workshopRectanglePrototype(): LevelDefinition {
  const source = levels.find((level) => level.shortId === 'M3_06');
  if (!source) throw new Error('M3_06 production source missing');
  return {
    ...source,
    boardSize: { rows: 9, columns: 7 },
    // Two three-column entrances separated by one inactive column, then a shared workbench.
    boardHoles: [3, 10, 17],
    blockers: [
      { index: 9, layers: 2 }, { index: 11, layers: 1 },
      { index: 16, layers: 2 }, { index: 18, layers: 1 },
      { index: 37, layers: 1 }, { index: 39, layers: 2 },
      { index: 44, layers: 1 }, { index: 46, layers: 1 },
    ],
    ingredients: [
      { index: 23, kind: 'warrantyCard' },
      { index: 25, kind: 'silverSpool' },
    ],
  };
}
