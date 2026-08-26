import type { Match3Game } from '../../engine/Match3Game';

export type Match3ObjectiveDelta = Readonly<{
  objectiveIndex: number;
  before: number;
  after: number;
  delta: number;
}>;

export const match3ObjectiveSnapshot = (game: Match3Game): number[] => (
  game.level.objectives.map((_, index) => game.objectiveValue(index))
);

export const match3ObjectiveDeltas = (
  before: readonly number[],
  after: readonly number[],
): Match3ObjectiveDelta[] => after.map((value, objectiveIndex) => ({
  objectiveIndex,
  before: before[objectiveIndex] ?? 0,
  after: value,
  delta: value - (before[objectiveIndex] ?? 0),
}));
