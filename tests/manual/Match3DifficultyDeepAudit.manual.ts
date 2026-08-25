import { afterAll, describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions, type LevelDefinition } from '../../src/data/levels';
import { Match3Game } from '../../src/engine/Match3Game';

const SAMPLE_COUNT = 200;
const BASE_SEED = 150_000;
const seeds = Array.from({ length: SAMPLE_COUNT }, (_, index) => BASE_SEED + index);

const round = (value: number, digits = 4): number => {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
};
const average = (values: readonly number[]): number => values.length > 0 ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const median = (values: readonly number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const percentile = (values: readonly number[], quantile: number): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * quantile) - 1))];
};
const objectiveCompletion = (game: Match3Game, level: LevelDefinition): number => {
  const fractions = level.objectives.map((objective, index) => Math.min(1, game.objectiveValue(index) / objective.target));
  return fractions.length ? average(fractions) : 1;
};
const outcomeBand = (winRate: number): string => {
  if (winRate >= 0.8) return 'agent-easy';
  if (winRate >= 0.6) return 'agent-moderate';
  if (winRate >= 0.4) return 'agent-hard';
  if (winRate >= 0.2) return 'agent-very-hard';
  return 'agent-severe';
};

type AuditRow = Readonly<{
  shortId: string; levelId: string; moveBudget: number; wins: number; losses: number; winRate: number; outcomeBand: string;
  medianMovesUsed: number | null; p90MovesUsed: number | null; medianMovesLeftOnWin: number | null;
  averageLossObjectiveCompletion: number | null; averageSpecialsCreated: number; specialsCreatedPerValidMove: number;
  cascade2PlusRate: number; reshuffleRate: number; maxCascade: number;
}>;

const auditLevel = (level: LevelDefinition): AuditRow => {
  let wins = 0; let losses = 0; let validMoves = 0; let specialsCreated = 0; let cascade2PlusMoves = 0; let reshuffles = 0; let maxCascade = 0;
  const movesUsed: number[] = []; const movesLeftOnWin: number[] = []; const lossCompletion: number[] = [];
  for (const seed of seeds) {
    const game = new Match3Game(level, seed);
    let safety = level.moves + 2;
    while (!game.won && !game.lost && safety > 0) {
      safety -= 1;
      const hint = game.getHintMove();
      if (!hint) throw new Error(`${level.shortId} seed ${seed}: no legal move`);
      const result = game.attemptSwap(hint.first, hint.second);
      if (!result.valid) throw new Error(`${level.shortId} seed ${seed}: generated hint became invalid`);
      validMoves += 1; specialsCreated += result.specialsCreated;
      if (result.cascades >= 2) cascade2PlusMoves += 1;
      if (result.reshuffled) reshuffles += 1;
      maxCascade = Math.max(maxCascade, result.cascades);
    }
    if (!game.won && !game.lost) throw new Error(`${level.shortId} seed ${seed}: did not terminate`);
    movesUsed.push(level.moves - game.movesLeft);
    if (game.won) { wins += 1; movesLeftOnWin.push(game.movesLeft); }
    else { losses += 1; lossCompletion.push(objectiveCompletion(game, level)); }
  }
  const winRate = wins / SAMPLE_COUNT;
  return {
    shortId: level.shortId, levelId: level.id, moveBudget: level.moves, wins, losses, winRate: round(winRate), outcomeBand: outcomeBand(winRate),
    medianMovesUsed: median(movesUsed), p90MovesUsed: percentile(movesUsed, 0.9), medianMovesLeftOnWin: median(movesLeftOnWin),
    averageLossObjectiveCompletion: lossCompletion.length ? round(average(lossCompletion)) : null,
    averageSpecialsCreated: round(specialsCreated / SAMPLE_COUNT), specialsCreatedPerValidMove: validMoves ? round(specialsCreated / validMoves) : 0,
    cascade2PlusRate: validMoves ? round(cascade2PlusMoves / validMoves) : 0, reshuffleRate: validMoves ? round(reshuffles / validMoves) : 0, maxCascade,
  };
};

const rows: AuditRow[] = [];

describe.sequential('ANM-025E5A manual deep Match-3 difficulty/activity audit', () => {
  it('keeps all production definitions valid before measurement', () => {
    expect(levels).toHaveLength(22);
    expect(validateLevelDefinitions(levels)).toEqual([]);
  });
  for (const level of levels) {
    it(`${level.shortId}: 200-seed measurement`, () => {
      const row = auditLevel(level);
      expect(row.wins + row.losses).toBe(SAMPLE_COUNT);
      rows.push(row);
    }, 20_000);
  }
  afterAll(() => {
    expect(rows).toHaveLength(levels.length);
    const report = { format: 'upds-match3-auto-audit', version: 1, policy: 'objective-aware-getHintMove', seedBase: BASE_SEED, seedsPerLevel: SAMPLE_COUNT, totalRuns: SAMPLE_COUNT * levels.length, rows } as const;
    console.log(`ANM025E5A_DEEP_AUDIT_JSON=${JSON.stringify(report)}`);
  });
});
