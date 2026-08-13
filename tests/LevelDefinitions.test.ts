import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';

describe('level definitions', () => {
  it('contains four valid and distinct levels', () => {
    expect(levels).toHaveLength(4);
    expect(new Set(levels.map((level) => level.id)).size).toBe(4);
    expect(validateLevelDefinitions()).toEqual([]);
  });

  it('preserves the move budgets while simplifying each production level to a focused objective pair', () => {
    expect(levels.map((level) => level.moves)).toEqual([24, 26, 25, 27]);
    expect(levels.map((level) => level.objectives.length)).toEqual([2, 2, 2, 2]);
    expect(levels[0].objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'drop']);
    expect(levels[1].blockers.some((blocker) => blocker.layers === 2)).toBe(true);
    expect(levels[2].blockers).toHaveLength(18);
    expect(levels[3].ingredients).toHaveLength(2);
  });
});
