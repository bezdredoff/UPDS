import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, levels, validateLevelDefinitions, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const SAMPLE_SEEDS = Array.from({ length: 8 }, (_, index) => 120_000 + index);

type FunBaseline = Readonly<{
  levelId: string;
  activeCells: number;
  blockerCells: number;
  blockerLayers: number;
  ingredients: number;
  objectives: number;
  winRate: number;
  averageMovesUsed: number;
  averageSpecialsCreated: number;
  cascade2PlusRate: number;
  reshuffleRate: number;
  maxCascade: number;
}>;

const baselineFor = (level: LevelDefinition): FunBaseline => {
  let wins = 0;
  let movesUsed = 0;
  let specialsCreated = 0;
  let cascade2PlusMoves = 0;
  let reshuffles = 0;
  let validMoves = 0;
  let maxCascade = 0;

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
      movesUsed += 1;
      specialsCreated += result.specialsCreated;
      if (result.cascades >= 2) cascade2PlusMoves += 1;
      if (result.reshuffled) reshuffles += 1;
      maxCascade = Math.max(maxCascade, result.cascades);
    }
    expect(game.won || game.lost, `${level.shortId} seed ${seed} must terminate within move budget`).toBe(true);
    if (game.won) wins += 1;
  }

  return {
    levelId: level.id,
    activeCells: BOARD_SIZE * BOARD_SIZE - (level.boardHoles?.length ?? 0),
    blockerCells: level.blockers.length,
    blockerLayers: level.blockers.reduce((sum, blocker) => sum + blocker.layers, 0),
    ingredients: level.ingredients.length,
    objectives: level.objectives.length,
    winRate: wins / SAMPLE_SEEDS.length,
    averageMovesUsed: movesUsed / SAMPLE_SEEDS.length,
    averageSpecialsCreated: specialsCreated / SAMPLE_SEEDS.length,
    cascade2PlusRate: validMoves > 0 ? cascade2PlusMoves / validMoves : 0,
    reshuffleRate: validMoves > 0 ? reshuffles / validMoves : 0,
    maxCascade,
  };
};

describe('ANM-025E4A Match-3 fun baseline', () => {
  it('keeps all 22 production level definitions structurally valid', () => {
    expect(levels).toHaveLength(22);
    expect(validateLevelDefinitions(levels)).toEqual([]);
  });

  for (const level of levels) {
    it(`${level.shortId} produces a terminating deterministic comparative baseline`, () => {
      const row = baselineFor(level);
      expect(row.levelId).toBe(level.id);
      expect(row.activeCells).toBeGreaterThanOrEqual(3);
      expect(row.objectives).toBeGreaterThan(0);
      expect(row.winRate).toBeGreaterThanOrEqual(0);
      expect(row.winRate).toBeLessThanOrEqual(1);
      expect(row.averageMovesUsed).toBeGreaterThan(0);
      expect(row.averageSpecialsCreated).toBeGreaterThanOrEqual(0);
      expect(row.cascade2PlusRate).toBeGreaterThanOrEqual(0);
      expect(row.cascade2PlusRate).toBeLessThanOrEqual(1);
      expect(row.reshuffleRate).toBeGreaterThanOrEqual(0);
      expect(row.reshuffleRate).toBeLessThanOrEqual(1);
      expect(row.maxCascade).toBeGreaterThanOrEqual(0);
    }, 15_000);
  }
});
