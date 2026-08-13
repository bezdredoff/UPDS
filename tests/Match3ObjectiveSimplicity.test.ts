import { describe, expect, it } from 'vitest';
import {
  MAX_OBJECTIVES_PER_LEVEL,
  levels,
  validateLevelDefinitions,
  type LevelDefinition,
} from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const byShortId = (shortId: string) => levels.find((level) => level.shortId === shortId)!;

describe('ANM-025E1 objective simplicity and grouped narrative goals', () => {
  it('keeps the four production levels to two player-facing win objectives each', () => {
    expect(levels.map((level) => level.objectives.length)).toEqual([2, 2, 2, 2]);
    expect(levels.every((level) => level.objectives.length <= MAX_OBJECTIVES_PER_LEVEL)).toBe(true);
    expect(byShortId('M3_00').objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'drop']);
    expect(byShortId('M3_01').objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'drop']);
    expect(byShortId('M3_02').objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'drop']);
    expect(byShortId('M3_03').objectives.map((objective) => objective.kind)).toEqual(['clearBlockers', 'dropGroup']);
  });

  it('treats receipt + damaged towel as one evidence objective in M3_03', () => {
    const grouped = byShortId('M3_03').objectives[1];
    expect(grouped.kind).toBe('dropGroup');
    if (grouped.kind !== 'dropGroup') return;
    expect(grouped.ingredients).toEqual(['receipt', 'damagedTowel']);
    expect(grouped.target).toBe(2);
  });

  it('accepts a production-valid level with one large collect goal and no blockers or ingredients', () => {
    const source = byShortId('M3_00');
    const collectOnly: LevelDefinition = {
      ...source,
      id: 'M3_COLLECT_ONLY_TEST',
      shortId: 'M3_TEST',
      tutorialConcepts: [],
      moves: 22,
      objectives: [{ kind: 'collect', tile: 'pantiesLacePink', target: 40, label: 'Розовые' }],
      blockers: [],
      ingredients: [],
    };
    expect(validateLevelDefinitions([collectOnly])).toEqual([]);
  });

  it('rejects objective-card overload above the production hard maximum', () => {
    const source = byShortId('M3_00');
    const overloaded: LevelDefinition = {
      ...source,
      id: 'M3_OVERLOADED_TEST',
      objectives: [
        { kind: 'collect', tile: 'pantiesSportWhite', target: 3, label: 'A' },
        { kind: 'collect', tile: 'pantiesLacePink', target: 3, label: 'B' },
        { kind: 'collect', tile: 'pantiesHighWaistBlack', target: 3, label: 'C' },
        { kind: 'collect', tile: 'pantiesBoyshortBlue', target: 3, label: 'D' },
      ],
      blockers: [],
      ingredients: [],
    };
    expect(validateLevelDefinitions([overloaded])).toContain(`M3_OVERLOADED_TEST: more than ${MAX_OBJECTIVES_PER_LEVEL} objectives`);
  });

  it('counts multiple narrative ingredients toward one grouped objective through the public game API', () => {
    const source = byShortId('M3_00');
    const grouped: LevelDefinition = {
      ...source,
      id: 'M3_GROUPED_DROP_TEST',
      shortId: 'M3_GROUP',
      tutorialConcepts: [],
      objectives: [{ kind: 'dropGroup', ingredients: ['receipt', 'damagedTowel'], target: 2, label: 'Улики' }],
      blockers: [],
      ingredients: [
        { index: 56, kind: 'receipt' },
        { index: 63, kind: 'damagedTowel' },
      ],
      seed: 9413,
    };
    expect(validateLevelDefinitions([grouped])).toEqual([]);
    const game = new Match3Game(grouped, grouped.seed);
    const hint = game.getHintMove();
    expect(hint).not.toBeNull();
    if (!hint) return;
    const result = game.attemptSwap(hint.first, hint.second);
    expect(result.valid).toBe(true);
    expect(game.objectiveValue(0)).toBe(2);
    expect(game.won).toBe(true);
  });
});
