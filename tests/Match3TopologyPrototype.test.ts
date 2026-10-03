import { describe, expect, it } from 'vitest';
import { isLevelBoardCellActive, levelBoardDimensions, levels, validateLevelDefinitions, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const byShortId = (shortId: string): LevelDefinition => {
  const level = levels.find((candidate) => candidate.shortId === shortId);
  if (!level) throw new Error(`Missing production level ${shortId}`);
  return level;
};

const shape = (level: LevelDefinition): string => {
  const { rows, columns } = levelBoardDimensions(level);
  return Array.from({ length: rows }, (_, row) => (
  Array.from({ length: columns }, (_, column) => isLevelBoardCellActive(level, row * columns + column) ? '#' : '.').join('')
)).join('\n');
};

const activeCellCount = (level: LevelDefinition): number => {
  const { rows, columns } = levelBoardDimensions(level);
  return rows * columns - (level.boardHoles?.length ?? 0);
};

const expectPlayableStart = (level: LevelDefinition, seed = level.seed): Match3Game => {
  const game = new Match3Game(level, seed);
  expect(game.hasImmediateMatches(), `${level.shortId} seed ${seed} must not auto-match at start`).toBe(false);
  expect(game.hasAvailableMove(), `${level.shortId} seed ${seed} must expose a legal move`).toBe(true);
  return game;
};

describe('ANM-025E4B Match-3 topology prototype cohort', () => {
  it('keeps the production collection valid while adopting four intentionally distinct spatial contracts', () => {
    expect(validateLevelDefinitions(levels)).toEqual([]);

    const m00 = byShortId('M3_00');
    const m02 = byShortId('M3_02');
    const m04 = byShortId('M3_04');
    const m06 = byShortId('M3_06');

    expect(shape(m00).split('\n')).toHaveLength(9);
    expect(shape(m00).split('\n').every((row) => row.length === 7 && row === '#######')).toBe(true);
    expect(m02.boardHoles).toHaveLength(12);
    expect(m04.boardHoles).toHaveLength(8);
    expect(shape(m06)).toBe('###.###\n###.###\n###.###\n#######\n#######\n#######\n#######\n#######\n#######');

    expect(activeCellCount(m00)).toBe(63);
    expect(activeCellCount(m02)).toBe(51);
    expect(activeCellCount(m04)).toBe(55);
    expect(activeCellCount(m06)).toBe(60);
    expect(new Set([shape(m00), shape(m02), shape(m04), shape(m06)]).size).toBe(4);
  });

  it('authors a deterministic one-move flash opportunity into M3_00 without creating a start match', () => {
    const level = byShortId('M3_00');
    expect(level.boardHoles).toBeUndefined();
    expect(level.initialTiles?.map(({ tile }) => tile)).toEqual([
      'pantiesSportWhite', 'pantiesSportWhite', 'pantiesLacePink',
      'pantiesSportWhite', 'pantiesHighWaistBlack', 'pantiesSportWhite',
    ]);

    const game = expectPlayableStart(level);
    const result = game.attemptSwap(2, 9);
    expect(result.valid).toBe(true);
    expect(result.primaryFeedback).toBe('combo');
    expect(result.specialsCreated).toBeGreaterThanOrEqual(1);
  });

  it('keeps every authored blocker and ingredient on active cells in the three shaped production levels', () => {
    for (const shortId of ['M3_02', 'M3_04', 'M3_06']) {
      const level = byShortId(shortId);
      for (const blocker of level.blockers) expect(isLevelBoardCellActive(level, blocker.index), `${shortId} blocker ${blocker.index}`).toBe(true);
      for (const ingredient of level.ingredients) expect(isLevelBoardCellActive(level, ingredient.index), `${shortId} ingredient ${ingredient.index}`).toBe(true);
    }
  });

  it('keeps the rounded foam basin playable on its production seed and a comparative E4A seed', () => {
    const level = byShortId('M3_02');
    expect(level.blocker).toBe('overlay');
    expect(level.blockerIsPermeable).toBe(true);
    expect(level.boardHoles).toHaveLength(12);
    expectPlayableStart(level);
    expectPlayableStart(level, 120_002);
  });

  it('keeps the facts/rumors split board connected through the middle and the calendar on an active bridge lane', () => {
    const level = byShortId('M3_04');
    expect(level.boardHoles).toHaveLength(8);
    expect(level.ingredients.map(({ kind }) => kind)).toEqual(['laundryCalendar']);
    const column = level.ingredients[0].index % levelBoardDimensions(level).columns;
    expect(column).toBe(3);
    for (let row = 2; row <= 6; row += 1) {
      expect(isLevelBoardCellActive(level, row * levelBoardDimensions(level).columns + column)).toBe(true);
    }
    expectPlayableStart(level);
  });

  it('keeps the two workshop evidence routes on separate left/right lanes behind garment-bag gates', () => {
    const level = byShortId('M3_06');
    expect(level.boardSize).toEqual({ rows: 9, columns: 7 });
    expect(level.boardHoles).toEqual([3, 10, 17]);
    expect(level.moves).toBe(32);
    expect(level.ingredients.map((ingredient) => ingredient.index)).toEqual([23, 25]);
    expect(level.ingredients.map((ingredient) => ingredient.index % 7)).toEqual([2, 4]);
    expect(level.blockers.filter((blocker) => blocker.index % 7 === 2).length).toBeGreaterThanOrEqual(3);
    expect(level.blockers.filter((blocker) => blocker.index % 7 === 4).length).toBeGreaterThanOrEqual(3);
    expectPlayableStart(level);
  });
});
