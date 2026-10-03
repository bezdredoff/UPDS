import { describe, expect, it } from 'vitest';
import { isLevelBoardCellActive, levelBoardDimensions, levels, validateLevelDefinitions, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const SAMPLE_SEEDS = Array.from({ length: 8 }, (_, index) => 120_000 + index);

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

    expect([m11, m12, m17, m21].every((level) => levelBoardDimensions(level).rows === 9 && levelBoardDimensions(level).columns === 7)).toBe(true);
    expect([m11, m12, m17, m21].map((level) => level.boardHoles?.length)).toEqual([8, 16, 8, 12]);

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
    expect(m11.boardHoles).toHaveLength(8);
    expect(m11.moves).toBe(33);
    expect(m11.ingredients.map(({ kind }) => kind)).toEqual(['transferSeal', 'routeCard', 'transferManifest']);

    const m12 = byShortId('M3_12');
    expect(m12.boardHoles).toHaveLength(16);
    expect(m12.moves).toBe(28);
    expect(m12.ingredients.map(({ kind }) => kind)).toEqual(['secondSkinTag']);

    const m17 = byShortId('M3_17');
    expect(m17.boardHoles).toHaveLength(8);
    expect(m17.moves).toBe(30);
    expect(m17.ingredients.map(({ kind }) => kind)).toEqual(['rinaCatalog']);

    const m21 = byShortId('M3_21');
    expect(m21.boardHoles).toHaveLength(12);
    expect(m21.moves).toBe(29);
    expect(m21.objectives.find((objective) => objective.kind === 'clearBlockers')?.target).toBe(8);
    expect(m21.blockers).toHaveLength(8);
    expect(m21.ingredients.map(({ kind }) => kind)).toEqual(['finalSlide']);
  });
});
