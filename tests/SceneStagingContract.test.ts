import { describe, expect, it } from 'vitest';
import {
  SCENE_STAGING_FORMAT,
  sceneStagingManifest,
  sceneStagingPresetIds,
  validateSceneStagingManifest,
  type SceneStagingManifest,
} from '../src/data/sceneStaging';
import { resolveSceneStagingPreset } from '../src/ui/sceneStaging';

describe('ANM-028B1 reusable scene staging contract', () => {
  it('locks the canonical eight-preset registry and normalized coordinate source', () => {
    expect(sceneStagingManifest.format).toBe(SCENE_STAGING_FORMAT);
    expect(sceneStagingManifest.coordinateSpace).toBe('normalized-percent');
    expect(sceneStagingManifest.characterScaleSource).toBe('upds-character-production-v2');
    expect(Object.keys(sceneStagingManifest.presets)).toEqual(sceneStagingPresetIds);
    expect(validateSceneStagingManifest()).toEqual([]);
  });

  it('keeps every composition inside safe-area boxes without planned overlap', () => {
    const safe = sceneStagingManifest.safeFrame;
    for (const preset of Object.values(sceneStagingManifest.presets)) {
      for (const slot of preset.slots) {
        expect(slot.safeBox.leftPercent, `${preset.id}:${slot.id}:left`).toBeGreaterThanOrEqual(safe.leftPercent);
        expect(slot.safeBox.topPercent, `${preset.id}:${slot.id}:top`).toBeGreaterThanOrEqual(safe.topPercent);
        expect(slot.safeBox.rightPercent, `${preset.id}:${slot.id}:right`).toBeLessThanOrEqual(safe.rightPercent);
        expect(slot.safeBox.bottomPercent, `${preset.id}:${slot.id}:bottom`).toBeLessThanOrEqual(safe.bottomPercent);
      }
    }
  });

  it('separates canonical character scale from reusable shot scale', () => {
    const resolution = resolveSceneStagingPreset('two-shot-conflict', [
      { character: 'miku', expression: 'serious' },
      { character: 'emi', expression: 'serious' },
    ]);
    expect(resolution.actors).toHaveLength(2);
    expect(resolution.actors.map((actor) => actor.canonicalCharacterScale)).toEqual([1, 1]);
    expect(resolution.actors.map((actor) => actor.shotScale)).toEqual([0.54, 0.54]);
    expect(resolution.actors.map((actor) => actor.effectiveScale)).toEqual([0.54, 0.54]);
    expect(resolution.actors[0].safeBox.rightPercent).toBeLessThan(resolution.actors[1].safeBox.leftPercent);
  });

  it('requires exact actor assignments instead of silently dropping a counterpart', () => {
    expect(() => resolveSceneStagingPreset('trio-reaction', [
      { character: 'miku', expression: 'neutral' },
      { character: 'onoe', expression: 'neutral' },
    ])).toThrow('requires 3 actor assignments');
  });

  it('keeps every preset at zero new-art triggers and the guest renderer outside v2 characters', () => {
    for (const preset of Object.values(sceneStagingManifest.presets)) {
      expect(preset.budget.newRuntimeArtAssets, preset.id).toBe(0);
      expect(preset.budget.newBackgroundMasters, preset.id).toBe(0);
      expect(preset.budget.heroClueCloseups, preset.id).toBe(0);
    }
    const guest = sceneStagingManifest.presets['guest-testimony-card'];
    expect(guest.slots.map((slot) => slot.kind)).toEqual(['guest-shell', 'testimony-card']);
    expect(JSON.stringify(guest)).not.toContain('./assets/characters/');
  });

  it('reports authored safe-box overlap instead of accepting it as a valid preset', () => {
    const mutated = JSON.parse(JSON.stringify(sceneStagingManifest)) as SceneStagingManifest;
    const conflict = mutated.presets['two-shot-conflict'] as unknown as { slots: Array<{ safeBox: { leftPercent: number } }> };
    conflict.slots[1].safeBox.leftPercent = 40;
    expect(validateSceneStagingManifest(mutated).map((issue) => issue.code)).toContain('overlap');
  });
});

