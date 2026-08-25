import { describe, expect, it } from 'vitest';
import { levels, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const SAMPLE_SEEDS = Array.from({ length: 24 }, (_, index) => 180_000 + index);

type CohortMetrics = Readonly<{
  wins: number;
  specialsPerValidMove: number;
  cascade2PlusRate: number;
  reshuffleRate: number;
}>;

const byShortId = (shortId: string): LevelDefinition => {
  const level = levels.find((candidate) => candidate.shortId === shortId);
  if (!level) throw new Error(`Missing production level ${shortId}`);
  return level;
};

const runCohort = (level: LevelDefinition): CohortMetrics => {
  let wins = 0;
  let validMoves = 0;
  let specialsCreated = 0;
  let cascade2PlusMoves = 0;
  let reshuffles = 0;

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
      validMoves += 1;
      specialsCreated += result.specialsCreated;
      if (result.cascades >= 2) cascade2PlusMoves += 1;
      if (result.reshuffled) reshuffles += 1;
    }
    expect(game.won || game.lost, `${level.shortId} seed ${seed} must terminate`).toBe(true);
    if (game.won) wins += 1;
  }

  return {
    wins,
    specialsPerValidMove: validMoves > 0 ? specialsCreated / validMoves : 0,
    cascade2PlusRate: validMoves > 0 ? cascade2PlusMoves / validMoves : 0,
    reshuffleRate: validMoves > 0 ? reshuffles / validMoves : 0,
  };
};

const preE5B1M06 = (current: LevelDefinition): LevelDefinition => ({
  ...current,
  boardHoles: [3, 4, 11, 12, 19, 20, 43, 44, 51, 52, 59, 60],
  moves: 29,
});

const preE5B1M11 = (current: LevelDefinition): LevelDefinition => ({
  ...current,
  boardHoles: [1, 2, 5, 6, 25, 30, 33, 38, 57, 58, 61, 62],
  moves: 29,
  ingredients: [
    { index: 4, kind: 'transferSeal' },
    { index: 7, kind: 'routeCard' },
    { index: 12, kind: 'transferManifest' },
  ],
});

describe('ANM-025E5B1 severe Match-3 outlier tuning', () => {
  it('moves M3_06 out of the severe band while increasing board activity', () => {
    const current = runCohort(byShortId('M3_06'));
    const previous = runCohort(preE5B1M06(byShortId('M3_06')));

    expect(previous.wins).toBeLessThanOrEqual(3);
    expect(current.wins).toBeGreaterThanOrEqual(8);
    expect(current.wins - previous.wins).toBeGreaterThanOrEqual(6);
    expect(current.specialsPerValidMove).toBeGreaterThan(previous.specialsPerValidMove);
    expect(current.cascade2PlusRate).toBeGreaterThan(previous.cascade2PlusRate);
    expect(current.reshuffleRate).toBeLessThan(previous.reshuffleRate);
  }, 15_000);

  it('moves M3_11 out of the severe band without turning it into a relief level', () => {
    const current = runCohort(byShortId('M3_11'));
    const previous = runCohort(preE5B1M11(byShortId('M3_11')));

    expect(previous.wins).toBeLessThanOrEqual(2);
    expect(current.wins).toBeGreaterThanOrEqual(8);
    expect(current.wins).toBeLessThanOrEqual(18);
    expect(current.wins - previous.wins).toBeGreaterThanOrEqual(7);
    expect(current.cascade2PlusRate).toBeGreaterThan(previous.cascade2PlusRate);
    expect(current.reshuffleRate).toBeLessThan(previous.reshuffleRate);
  }, 15_000);
});
