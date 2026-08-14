import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';

describe('level definitions', () => {
  it('contains ten valid and distinct production levels', () => {
    expect(levels).toHaveLength(10);
    expect(new Set(levels.map((level) => level.id)).size).toBe(10);
    expect(validateLevelDefinitions()).toEqual([]);
  });

  it('preserves the established move budgets and keeps new macro-locked levels within the three-objective cap', () => {
    expect(levels.map((level) => level.moves)).toEqual([24, 26, 25, 27, 28, 27, 29, 28, 30, 29]);
    expect(levels.map((level) => level.objectives.length)).toEqual([2, 2, 2, 2, 3, 3, 3, 3, 3, 3]);
    expect(levels[0].objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'drop']);
    expect(levels[1].blockers.some((blocker) => blocker.layers === 2)).toBe(true);
    expect(levels[2].blockers).toHaveLength(18);
    expect(levels[3].ingredients).toHaveLength(2);
    expect(levels.slice(4).map((level) => level.objectives.length)).toEqual([3, 3, 3, 3, 3, 3]);
    expect(levels[6].objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'collect', 'dropGroup']);
    expect(levels[9].objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'collect', 'dropGroup']);
  });
});
