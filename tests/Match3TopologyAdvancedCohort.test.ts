import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, isLevelBoardCellActive, levels, validateLevelDefinitions, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const SAMPLE_SEEDS = Array.from({ length: 8 }, (_, index) => 120_000 + index);

const byShortId = (shortId: string): LevelDefinition => {
  const level = levels.find((candidate) => candidate.shortId === shortId);
  if (!level) throw new Error(`Missing production level ${shortId}`);
  return level;
};

const shape = (level: LevelDefinition): string => Array.from({ length: BOARD_SIZE }, (_, row) => (
  Array.from({ length: BOARD_SIZE }, (_, column) => isLevelBoardCellActive(level, row * BOARD_SIZE + column) ? '#' : '.').join('')
)).join('\n');

const hintFollowingWins = (level: LevelDefinition): number => {
  let wins = 0;
  for (const seed of SAMPLE_SEEDS) {
    const game = new Match3Game(level, seed);
    let safety = level.moves + 2;
    while (!game.won && !game.lost && safety > 0) {
      safety -= 1;
      const hint = game.getHintMove();
      expect(hint, `${level.shortId} seed ${seed} must expose a legal move`).not.toBeNull();
      if (!hint) break;
      const result = game.attemptSwap(hint.first, hint.second);
      expect(result.valid, `${level.shortId} seed ${seed} hint must remain legal`).toBe(true);
      if (!result.valid) break;
    }
    expect(game.won || game.lost, `${level.shortId} seed ${seed} must terminate within move budget`).toBe(true);
    if (game.won) wins += 1;
  }
  return wins;
};

describe('ANM-025E4C advanced Match-3 topology cohort', () => {
  it('keeps all production definitions valid and gives the four late-game levels distinct authored silhouettes', () => {
    expect(validateLevelDefinitions(levels)).toEqual([]);

    const m11 = byShortId('M3_11');
    const m12 = byShortId('M3_12');
    const m17 = byShortId('M3_17');
    const m21 = byShortId('M3_21');

    expect(shape(m11)).toBe('#..##..#\n########\n########\n########\n########\n########\n########\n#..##..#');
    expect(shape(m12)).toBe('..####..\n..####..\n########\n########\n########\n########\n..####..\n..####..');
    expect(shape(m17)).toBe('##..####\n##....##\n########\n########\n########\n########\n########\n####..##');
    expect(shape(m21)).toBe('.######.\n########\n#.#####.\n.#####.#\n#.#####.\n.#####.#\n########\n.#####.#');

    expect(new Set([shape(m11), shape(m12), shape(m17), shape(m21)]).size).toBe(4);
  });

  it('keeps every blocker and ingredient on an active cell in the advanced cohort', () => {
    for (const shortId of ['M3_11', 'M3_12', 'M3_17', 'M3_21']) {
      const level = byShortId(shortId);
      for (const blocker of level.blockers) expect(isLevelBoardCellActive(level, blocker.index), `${shortId} blocker ${blocker.index}`).toBe(true);
      for (const ingredient of level.ingredients) expect(isLevelBoardCellActive(level, ingredient.index), `${shortId} ingredient ${ingredient.index}`).toBe(true);
      const game = new Match3Game(level, level.seed);
      expect(game.hasImmediateMatches(), `${shortId} production seed must start stable`).toBe(false);
      expect(game.hasAvailableMove(), `${shortId} production seed must start playable`).toBe(true);
    }
  });

  it('does not reduce the established E4A hint-following win counts while adding topology', () => {
    const establishedMinimumWins = new Map<string, number>([
      ['M3_11', 1],
      ['M3_12', 4],
      ['M3_17', 6],
      ['M3_21', 7],
    ]);

    for (const [shortId, minimumWins] of establishedMinimumWins) {
      expect(hintFollowingWins(byShortId(shortId)), shortId).toBeGreaterThanOrEqual(minimumWins);
    }
  }, 15_000);

  it('expresses the intended spatial ideas without changing goals or move budgets', () => {
    const m11 = byShortId('M3_11');
    expect(m11.boardHoles).toEqual([1, 2, 5, 6, 57, 58, 61, 62]);
    expect(m11.moves).toBe(33);
    expect(m11.ingredients.map(({ index }) => index)).toEqual([28, 45, 36]);

    const m12 = byShortId('M3_12');
    expect(m12.boardHoles).toEqual([0, 1, 6, 7, 8, 9, 14, 15, 48, 49, 54, 55, 56, 57, 62, 63]);
    expect(m12.moves).toBe(28);
    expect(m12.ingredients).toEqual([{ index: 20, kind: 'secondSkinTag' }]);

    const m17 = byShortId('M3_17');
    expect(m17.boardHoles).toEqual([2, 3, 10, 11, 12, 13, 60, 61]);
    expect(m17.moves).toBe(30);
    expect(m17.ingredients).toEqual([{ index: 28, kind: 'rinaCatalog' }]);

    const m21 = byShortId('M3_21');
    expect(m21.boardHoles).toEqual([0, 7, 17, 23, 24, 30, 33, 39, 40, 46, 56, 62]);
    expect(m21.moves).toBe(29);
    expect(m21.ingredients).toEqual([{ index: 27, kind: 'finalSlide' }]);
  });
});
