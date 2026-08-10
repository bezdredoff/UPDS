import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';

describe('ANM-009 level definitions', () => {
  it('contains four valid and distinct levels', () => {
    expect(levels).toHaveLength(4);
    expect(new Set(levels.map((level) => level.id)).size).toBe(4);
    expect(validateLevelDefinitions()).toEqual([]);
  });

  it('preserves the screenplay move budgets and core objective families', () => {
    expect(levels.map((level) => level.moves)).toEqual([24, 26, 25, 27]);
    expect(levels[0].objectives.map((objective) => objective.kind)).toEqual(['collect', 'collect', 'collect', 'clearBlockers', 'drop']);
    expect(levels[1].blockers.some((blocker) => blocker.layers === 2)).toBe(true);
    expect(levels[2].blockers).toHaveLength(18);
    expect(levels[3].ingredients).toHaveLength(2);
  });
});
