import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';

describe('level definitions', () => {
  it('keeps every current production level valid and uniquely identified as content expands', () => {
    expect(levels.length).toBeGreaterThanOrEqual(10);
    expect(new Set(levels.map((level) => level.id)).size).toBe(levels.length);
    expect(validateLevelDefinitions()).toEqual([]);
  });

  it('preserves the current level-0–9 design baseline while enforcing scalable objective limits', () => {
    expect(levels.slice(0, 10).map((level) => level.moves)).toEqual([24, 26, 25, 27, 28, 27, 32, 28, 30, 29]);
    expect(levels.slice(0, 10).map((level) => level.objectives.length)).toEqual([2, 2, 2, 2, 3, 3, 3, 3, 3, 3]);
    expect(levels[0].objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'drop']);
    expect(levels[1].blockers.some((blocker) => blocker.layers === 2)).toBe(true);
    expect(levels[2].blockers).toHaveLength(18);
    expect(levels[3].ingredients).toHaveLength(2);
    expect(levels.slice(4).every((level) => level.objectives.length <= 3)).toBe(true);
    expect(levels[6].objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'collect', 'dropGroup']);
    expect(levels[9].objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'collect', 'dropGroup']);
  });
});
