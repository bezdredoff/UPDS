import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const sampleSeeds = Array.from({ length: 40 }, (_, index) => 100_000 + index);

const hintFollowingWinRate = (levelIndex: number): number => {
  let wins = 0;
  for (const seed of sampleSeeds) {
    const game = new Match3Game(levels[levelIndex], seed);
    while (!game.won && !game.lost) {
      const hint = game.getHintMove();
      if (!hint) break;
      const result = game.attemptSwap(hint.first, hint.second);
      if (!result.valid) break;
    }
    if (game.won) wins += 1;
  }
  return wins / sampleSeeds.length;
};

describe('ANM-025E3 quantitative Match-3 balance', () => {
  it('keeps the existing move budgets and uses route placement, not spawn-weight inflation, for this pass', () => {
    expect(levels.slice(0, 4).map((level) => level.moves)).toEqual([24, 26, 25, 27]);
    expect(levels.slice(0, 4).map((level) => level.ingredients.map((ingredient) => ingredient.index))).toEqual([
      [51],
      [50],
      [42],
      [50, 53],
    ]);
    expect(levels.every((level) => level.spawnWeights === undefined)).toBe(true);
    expect(levels.slice(4).map((level) => level.moves)).toEqual([28, 27, 29]);
  });

  it('maintains a deterministic hint-following lower-bound envelope across the established four-level balance baseline', () => {
    const rates = levels.slice(0, 4).map((_, index) => hintFollowingWinRate(index));

    expect(rates[0]).toBeGreaterThanOrEqual(0.70);
    expect(rates[1]).toBeGreaterThanOrEqual(0.60);
    expect(rates[2]).toBeGreaterThanOrEqual(0.60);
    expect(rates[3]).toBeGreaterThanOrEqual(0.45);
    expect(rates[0]).toBeGreaterThan(rates[3]);
  });
});
