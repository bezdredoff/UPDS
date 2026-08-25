import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, levels, validateLevelDefinitions, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const mixedHoldoutSeeds = [180_000, 190_000, 200_000].flatMap((base) => (
  Array.from({ length: 16 }, (_, index) => base + index)
));

const byShortId = (shortId: string): LevelDefinition => {
  const level = levels.find((candidate) => candidate.shortId === shortId);
  if (!level) throw new Error(`Missing production level ${shortId}`);
  return level;
};

const hintFollowingWins = (level: LevelDefinition): number => {
  let wins = 0;
  for (const seed of mixedHoldoutSeeds) {
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
    expect(game.won || game.lost, `${level.shortId} seed ${seed} must terminate`).toBe(true);
    if (game.won) wins += 1;
  }
  return wins;
};

describe('ANM-025E5B2 second Match-3 outlier cohort', () => {
  it('keeps goals and move budgets intact while moving evidence out of bad drop lanes', () => {
    expect(validateLevelDefinitions(levels)).toEqual([]);

    const m09 = byShortId('M3_09');
    expect(m09.moves).toBe(29);
    expect(m09.ingredients).toEqual([
      { index: 27, kind: 'serviceKey' },
      { index: 28, kind: 'handoffSlip' },
    ]);
    expect(m09.objectives.map((objective) => objective.target)).toEqual([8, 14, 2]);

    const m14 = byShortId('M3_14');
    expect(m14.moves).toBe(29);
    expect(m14.ingredients).toEqual([
      { index: 27, kind: 'familyReceipt' },
      { index: 28, kind: 'atelierLedger' },
    ]);
    expect(m14.objectives.map((objective) => objective.target)).toEqual([8, 14, 2]);

    const m15 = byShortId('M3_15');
    expect(m15.moves).toBe(30);
    expect(m15.ingredients).toEqual([
      { index: 20, kind: 'markedPackage' },
      { index: 29, kind: 'serviceKeyCard' },
    ]);
    expect(m15.objectives.map((objective) => objective.target)).toEqual([10, 14, 2]);

    for (const level of [m09, m14, m15]) {
      for (const ingredient of level.ingredients) {
        const column = ingredient.index % BOARD_SIZE;
        expect(column, `${level.shortId} ingredient ${ingredient.kind} should start in a central service lane`).toBeGreaterThanOrEqual(3);
        expect(column, `${level.shortId} ingredient ${ingredient.kind} should start in a central service lane`).toBeLessThanOrEqual(5);
      }
      const game = new Match3Game(level, level.seed);
      expect(game.hasImmediateMatches(), `${level.shortId} production seed must start stable`).toBe(false);
      expect(game.hasAvailableMove(), `${level.shortId} production seed must start playable`).toBe(true);
    }
  });

  it('keeps the tuned cohort inside a comparator challenge envelope on mixed holdout seeds', () => {
    for (const shortId of ['M3_09', 'M3_14', 'M3_15']) {
      const wins = hintFollowingWins(byShortId(shortId));
      expect(wins, `${shortId} should be out of the severe comparator band`).toBeGreaterThanOrEqual(18);
      expect(wins, `${shortId} should remain a challenge rather than become a relief level`).toBeLessThanOrEqual(34);
    }
  }, 20_000);
});
