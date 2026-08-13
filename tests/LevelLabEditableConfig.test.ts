import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { applyLevelLabDraft, createLevelLabDraft, exportLevelLabDraft, validateLevelLabDraft, type LevelLabDraft } from '../src/features/levelLab/LevelLabController';


describe('ANM-026B1 editable Level Lab config', () => {
  it('creates a draft without changing production data and preserves uniform production RNG by default', () => {
    const base = levels[0];
    const draft = createLevelLabDraft(base);
    const applied = applyLevelLabDraft(base, draft);
    expect(draft.moves).toBe(base.moves);
    expect(applied.spawnWeights).toBeUndefined();
    expect(base.spawnWeights).toBeUndefined();
    expect(validateLevelLabDraft(base, draft)).toEqual([]);
  });

  it('applies validated moves, active tiles and custom spawn weights only to the draft level', () => {
    const base = levels[0];
    const original = createLevelLabDraft(base);
    const draft: LevelLabDraft = {
      ...original,
      moves: 31,
      activeTiles: ['pantiesSportWhite', 'pantiesLacePink', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'towel', 'laundryTag'],
      spawnWeights: {
        pantiesSportWhite: 2.5,
        pantiesLacePink: 1,
        pantiesHighWaistBlack: 0.8,
        pantiesBoyshortBlue: 1.2,
        towel: 0.6,
        laundryTag: 1.8,
      },
    };
    expect(validateLevelLabDraft(base, draft)).toEqual([]);
    const applied = applyLevelLabDraft(base, draft);
    expect(applied.moves).toBe(31);
    expect(applied.spawnWeights?.pantiesSportWhite).toBe(2.5);
    expect(base.moves).toBe(24);
    expect(base.activeTiles).toContain('sportsBra');
  });

  it('exports only the editable override contract, not story/campaign metadata', () => {
    const base = levels[1];
    const draft = { ...createLevelLabDraft(base), moves: 29 };
    const exported = JSON.parse(exportLevelLabDraft(base, draft)) as Record<string, unknown>;
    expect(exported.format).toBe('upds-level-lab-v2');
    expect(exported.levelId).toBe(base.id);
    expect(exported.moves).toBe(29);
    expect(exported).not.toHaveProperty('clueId');
    expect(exported).not.toHaveProperty('tutorialConcepts');
    expect(exported).not.toHaveProperty('context');
  });
});
