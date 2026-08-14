import { describe, expect, it } from 'vitest';
import { freshSave, normalizeSave } from '../src/engine/CampaignStore';
import { levels } from '../src/data/levels';
import { storySceneIds } from '../src/data/storyGraph';

describe('campaign state', () => {
  it('normalizes corrupt or future-facing data safely', () => {
    expect(normalizeSave(null)).toEqual(freshSave());
    const normalized = normalizeSave({
      scene: storySceneIds.length + 99,
      line: -4,
      choice: 'Z',
      clues: ['CUE_001', 'BAD', 'CUE_001'],
      completed: [0, 0, levels.length - 1, levels.length],
      attempts: { M3_00: -2, M3_01: 3.8 },
      readLines: ['VN0001', 'bad'],
      tutorialsCompleted: ['basic-swap', 'clear-blocker', 'drop-ingredient', 'bad', 'basic-swap'],
    });
    expect(normalized.scene).toBe(storySceneIds.length - 1);
    expect(normalized.line).toBe(0);
    expect(normalized.choice).toBe('A');
    expect(normalized.clues).toEqual(['CUE_001']);
    expect(normalized.completed).toEqual([0, levels.length - 1]);
    expect(normalized.attempts).toEqual({ M3_00: 0, M3_01: 3 });
    expect(normalized.readLines).toEqual(['VN0001']);
    expect(normalized.tutorialsCompleted).toEqual(['basic-swap', 'clear-blocker', 'drop-ingredient']);
    expect(normalized.storyChoices).toEqual({});
  });

});
