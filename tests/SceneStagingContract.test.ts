import { describe, expect, it } from 'vitest';
import { characterProductionManifest, productionCharacterKeys } from '../src/data/characterProduction';
import {
  SCENE_STAGING_FORMAT,
  sceneStagingManifest,
  sceneStagingPresetIds,
  validateSceneStagingManifest,
  type SceneStagingManifest,
} from '../src/data/sceneStaging';
import { resolveSceneStagingPreset } from '../src/ui/sceneStaging';
import {
  VN_RUNTIME_PORTRAIT_BOTTOM_PERCENT,
  VN_RUNTIME_PORTRAIT_HEIGHT_PERCENT,
  SCENE_STUDIO_DEFAULT_EYE_LINE_PERCENT,
  resolveVnPortraitCamera,
  resolveVnPortraitEyeLineCamera,
} from '../src/ui/vnPortraitGeometry';
import {
  SCENE_STUDIO_CALIBRATION_FORMAT,
  resolveSceneStudioContainBox,
  sceneStudioCalibrationManifest,
  sceneStudioLineupMetrics,
  sceneStudioViewportIds,
  validateSceneStudioCalibration,
} from '../src/data/sceneStudioCalibration';

describe('ANM-028B1 reusable scene staging contract', () => {
  it('locks the canonical eight-preset registry and normalized coordinate source', () => {
    expect(sceneStagingManifest.format).toBe(SCENE_STAGING_FORMAT);
    expect(sceneStagingManifest.coordinateSpace).toBe('normalized-percent');
    expect(sceneStagingManifest.characterScaleSource).toBe('upds-character-production-v2');
    expect(sceneStagingManifest.actorSafeBoxSemantics).toBe('face-critical-lane');
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
    expect(resolution.actors.map((actor) => actor.shotScale)).toEqual([0.84, 0.84]);
    expect(resolution.actors.map((actor) => actor.effectiveScale)).toEqual([0.84, 0.84]);
    expect(resolution.actors.map((actor) => actor.portraitHeightPercent)).toEqual([149.52, 149.52]);
    expect(resolution.actors.map((actor) => actor.verticalAnchor)).toEqual([
      'background-focal-eye-line',
      'background-focal-eye-line',
    ]);
    expect(resolution.actors.every((actor) => actor.resolvedEyeLinePercent === SCENE_STUDIO_DEFAULT_EYE_LINE_PERCENT)).toBe(true);
    expect(resolution.actors[0].safeBox.rightPercent).toBeLessThan(resolution.actors[1].safeBox.leftPercent);
  });

  it('preserves the accepted runtime crop and keeps only solo shots top-anchored', () => {
    expect(resolveVnPortraitCamera()).toEqual({
      shotScale: 1,
      heightPercent: VN_RUNTIME_PORTRAIT_HEIGHT_PERCENT,
      topPercent: 0,
      bottomPercent: VN_RUNTIME_PORTRAIT_BOTTOM_PERCENT,
    });
    for (const preset of Object.values(sceneStagingManifest.presets)) {
      const actorSlots = preset.slots.filter((slot) => slot.kind === 'actor');
      for (const slot of preset.slots) {
        if (slot.kind !== 'actor') continue;
        const camera = resolveVnPortraitCamera(slot.shotScale);
        expect(camera.heightPercent + camera.bottomPercent, `${preset.id}:${slot.id}`).toBeCloseTo(100, 8);
        expect(camera.heightPercent, `${preset.id}:${slot.id}`).toBeGreaterThan(120);
        expect(slot.verticalAnchor, `${preset.id}:${slot.id}`).toBe(
          actorSlots.length > 1 ? 'background-focal-eye-line' : 'runtime-top',
        );
      }
    }
  });

  it('anchors duo and trio eyes to the focal line instead of shrinking full masters from a fixed top edge', () => {
    const duo = resolveSceneStagingPreset('two-shot-alliance', [
      { character: 'onoe', expression: 'smile' },
      { character: 'ayuki', expression: 'smile' },
    ]);
    const trio = resolveSceneStagingPreset('trio-central-speaker', [
      { character: 'miku', expression: 'serious' },
      { character: 'onoe', expression: 'neutral' },
      { character: 'ayuki', expression: 'smile' },
    ]);
    expect(duo.actors).toHaveLength(2);
    expect(trio.actors).toHaveLength(3);
    for (const actor of [...duo.actors, ...trio.actors]) {
      expect(actor.verticalAnchor).toBe('background-focal-eye-line');
      expect(actor.resolvedEyeLinePercent).toBeCloseTo(SCENE_STUDIO_DEFAULT_EYE_LINE_PERCENT, 4);
      expect(actor.portraitTopPercent).toBeGreaterThan(20);
      expect(actor.headTopPercent).toBeGreaterThan(20);
      expect(actor.portraitBottomPercent).toBeLessThan(-60);
      expect(actor.guideGeometrySource).toBe('expression-frame');
      expect(actor.frameAlphaBounds).toEqual(
        characterProductionManifest.characters[actor.character].proportion.frameGeometry[actor.expression].alphaBounds,
      );
    }
    expect(resolveVnPortraitEyeLineCamera(0.72, 158).resolvedEyeLinePercent)
      .toBe(SCENE_STUDIO_DEFAULT_EYE_LINE_PERCENT);
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

  it('mirrors the ANM-024 viewport matrix and runtime contain-over-fill background geometry', () => {
    expect(sceneStudioCalibrationManifest.format).toBe(SCENE_STUDIO_CALIBRATION_FORMAT);
    expect(Object.keys(sceneStudioCalibrationManifest.viewports)).toEqual(sceneStudioViewportIds);
    expect(validateSceneStudioCalibration().filter((issue) => issue.severity === 'error')).toEqual([]);

    const tallFit = resolveSceneStudioContainBox({ width: 390, height: 844 });
    expect(tallFit.widthPercent).toBe(100);
    expect(tallFit.heightPercent).toBeLessThan(100);
    expect(tallFit.topPercent).toBeGreaterThan(0);
  });

  it('exposes measurable lineup drift as QA warnings without altering canonical scale', () => {
    const metrics = sceneStudioLineupMetrics();
    expect(metrics.map((metric) => metric.character)).toEqual(productionCharacterKeys);
    expect(metrics.find((metric) => metric.character === 'miku')?.bottomPaddingPx).toBe(118);
    expect(validateSceneStudioCalibration()).toContainEqual(expect.objectContaining({
      severity: 'warning',
      code: 'bottom-pivot',
      subject: 'miku',
    }));
    expect(metrics.every((metric) => metric.visualApproval === 'approved')).toBe(true);
    expect(validateSceneStudioCalibration().some((issue) => issue.code === 'master-rebuild')).toBe(false);
  });
});
