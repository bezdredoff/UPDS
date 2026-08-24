import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, isLevelBoardCellActive, levels, validateLevelDefinitions, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const byShortId = (shortId: string): LevelDefinition => {
  const level = levels.find((candidate) => candidate.shortId === shortId);
  if (!level) throw new Error(`Missing production level ${shortId}`);
  return level;
};

const shape = (level: LevelDefinition): string => Array.from({ length: BOARD_SIZE }, (_, row) => (
  Array.from({ length: BOARD_SIZE }, (_, column) => isLevelBoardCellActive(level, row * BOARD_SIZE + column) ? '#' : '.').join('')
)).join('\n');

const activeCellCount = (level: LevelDefinition): number => BOARD_SIZE * BOARD_SIZE - (level.boardHoles?.length ?? 0);

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

    expect(shape(m00)).toBe('########\n########\n########\n########\n########\n########\n########\n########');
    expect(shape(m02)).toBe('..####..\n.######.\n########\n########\n########\n########\n.######.\n..####..');
    expect(shape(m04)).toBe('###..###\n###..###\n########\n########\n########\n########\n###..###\n###..###');
    expect(shape(m06)).toBe('###..###\n###..###\n###..###\n########\n########\n###..###\n###..###\n###..###');

    expect(activeCellCount(m00)).toBe(64);
    expect(activeCellCount(m02)).toBe(52);
    expect(activeCellCount(m04)).toBe(56);
    expect(activeCellCount(m06)).toBe(52);
    expect(new Set([shape(m00), shape(m02), shape(m04), shape(m06)]).size).toBe(4);
  });

  it('authors a deterministic one-move flash opportunity into M3_00 without creating a start match', () => {
    const level = byShortId('M3_00');
    expect(level.boardHoles).toBeUndefined();
    expect(level.initialTiles).toEqual([
      { index: 0, tile: 'pantiesSportWhite' },
      { index: 1, tile: 'pantiesSportWhite' },
      { index: 2, tile: 'pantiesLacePink' },
      { index: 3, tile: 'pantiesSportWhite' },
      { index: 4, tile: 'pantiesHighWaistBlack' },
      { index: 10, tile: 'pantiesSportWhite' },
    ]);

    const game = expectPlayableStart(level);
    const result = game.attemptSwap(2, 10);
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
    expect(level.blocker).toBe('foam');
    expect(level.boardHoles).toEqual([0, 1, 6, 7, 8, 15, 48, 55, 56, 57, 62, 63]);
    expectPlayableStart(level);
    expectPlayableStart(level, 120_002);
  });

  it('keeps the facts/rumors split board connected through the middle and the calendar on an active bridge lane', () => {
    const level = byShortId('M3_04');
    expect(level.boardHoles).toEqual([3, 4, 11, 12, 51, 52, 59, 60]);
    expect(level.ingredients).toEqual([{ index: 27, kind: 'laundryCalendar' }]);
    expect(isLevelBoardCellActive(level, 27)).toBe(true);
    expect(isLevelBoardCellActive(level, 35)).toBe(true);
    expect(isLevelBoardCellActive(level, 43)).toBe(true);
    expectPlayableStart(level);
  });

  it('keeps the two workshop evidence routes on separate left/right lanes behind garment-bag gates', () => {
    const level = byShortId('M3_06');
    expect(level.boardHoles).toEqual([3, 4, 11, 12, 19, 20, 43, 44, 51, 52, 59, 60]);
    expect(level.ingredients.map((ingredient) => ingredient.index)).toEqual([26, 29]);
    expect(level.ingredients.map((ingredient) => ingredient.index % BOARD_SIZE)).toEqual([2, 5]);
    expect(level.blockers.filter((blocker) => blocker.index % BOARD_SIZE === 2).length).toBeGreaterThanOrEqual(3);
    expect(level.blockers.filter((blocker) => blocker.index % BOARD_SIZE === 5).length).toBeGreaterThanOrEqual(3);
    expectPlayableStart(level);
  });
});
