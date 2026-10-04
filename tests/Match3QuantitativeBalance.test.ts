import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const sampleSeeds = Array.from({ length: 40 }, (_, index) => 100_000 + index);
const m3_02AuditSeeds = Array.from({ length: 200 }, (_, index) => 150_000 + index);

const hintFollowingWinRate = (levelIndex: number): number => {
  const seeds = levelIndex === 2 ? m3_02AuditSeeds : sampleSeeds;
  let wins = 0;
  for (const seed of seeds) {
    const game = new Match3Game(levels[levelIndex], seed);
    while (!game.won && !game.lost) {
      const hint = game.getHintMove();
      if (!hint) break;
      const result = game.attemptSwap(hint.first, hint.second);
      if (!result.valid) break;
    }
    if (game.won) wins += 1;
  }
  return wins / seeds.length;
};

describe('ANM-025E3 quantitative Match-3 balance', () => {
  it('keeps the established early budgets and avoids spawn-weight inflation while later evidence-driven tuning evolves', () => {
    expect(levels.slice(0, 4).map((level) => level.moves)).toEqual([24, 26, 25, 27]);
    expect(levels.slice(0, 4).map((level) => level.ingredients.length)).toEqual([0, 1, 1, 2]);
    expect(levels.every((level) => level.spawnWeights === undefined)).toBe(true);
    expect(levels.slice(4, 10).map((level) => level.moves)).toEqual([28, 27, 32, 28, 30, 29]);
  });

  it('maintains the established envelope and uses the audited 200-seed cohort for M3_02 blocker semantics', () => {
    const rates = levels.slice(0, 4).map((_, index) => hintFollowingWinRate(index));

    expect(rates[0]).toBeGreaterThanOrEqual(0.70);
    expect(rates[1]).toBeGreaterThanOrEqual(0.60);
    expect(rates[2]).toBeGreaterThanOrEqual(0.60);
    expect(rates[3]).toBeGreaterThanOrEqual(0.45);
    expect(rates[0]).toBeGreaterThan(rates[3]);
  });
});
