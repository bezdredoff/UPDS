import { afterEach, describe, expect, it } from 'vitest';
import { characterRigs, expressionAsset, medallionAsset, poseAsset, resolvedCharacterStaging, resolvedCharacterXPercent } from '../src/data/characterRigs';
import {
  BROWSER_LOCAL_CHARACTER_EXPORT_FORMAT,
  CHARACTER_RUNTIME_OVERRIDE_FORMAT,
  applyBrowserLocalCharacterCalibration,
  applyBrowserLocalCharacterOverrides,
  browserLocalCharacterExportSnapshot,
  hasBrowserLocalCharacterPlanCalibration,
  clearBrowserLocalCharacterOverrides,
  runtimeFrameOverride,
  validateCharacterRuntimeFrameOverrides,
} from '../src/data/characterRuntimeOverrides';
import { resolveSceneStagingPreset } from '../src/ui/sceneStaging';

afterEach(() => {
  clearBrowserLocalCharacterOverrides();
});

describe('ANM-028D3A Emi approved-frame runtime adoption', () => {
  it('adopts only the four approved Pose A expressions and keeps embarrassed on the legacy rig', () => {
    expect(CHARACTER_RUNTIME_OVERRIDE_FORMAT).toBe('upds-character-runtime-override-v1');
    expect(validateCharacterRuntimeFrameOverrides()).toEqual([]);

    expect(expressionAsset('emi', 'neutral')).toBe('./assets/characters/emi/candidates/anm028d0/neutral-r1.png');
    expect(expressionAsset('emi', 'smile')).toBe('./assets/characters/emi/candidates/anm028d1/frame-smile-r1.png');
    expect(expressionAsset('emi', 'serious')).toBe('./assets/characters/emi/candidates/anm028d2/frame-serious-r1.png');
    expect(expressionAsset('emi', 'surprised')).toBe('./assets/characters/emi/candidates/anm028d3/frame-surprised-r1.png');
    expect(expressionAsset('emi', 'embarrassed')).toBe(characterRigs.emi.frames.embarrassed);
    expect(runtimeFrameOverride('emi', 'embarrassed')).toBeNull();
  });


  it('lets browser-local overrides shadow runtime frame, pose B and medallion assets without touching the approved base contract', () => {
    applyBrowserLocalCharacterOverrides({
      miku: {
        frames: {
          smile: {
            asset: 'blob:miku-smile',
            geometry: { alphaBounds: { left: 310, top: 48, right: 700, bottom: 1496 }, eyeLineYPx: 212 },
            visualApproval: 'approved',
            sourceCandidateId: 'browser-local:test',
          },
        },
        poseB: {
          asset: 'blob:miku-pose-b',
          geometry: { alphaBounds: { left: 320, top: 52, right: 702, bottom: 1498 }, eyeLineYPx: 216 },
          sourceCandidateId: 'browser-local:test',
        },
        medallion: { asset: 'blob:miku-medallion', sourceCandidateId: 'browser-local:test' },
      },
    });

    expect(expressionAsset('miku', 'smile')).toBe('blob:miku-smile');
    expect(runtimeFrameOverride('miku', 'smile')?.geometry.alphaBounds).toEqual({ left: 310, top: 48, right: 700, bottom: 1496 });
    expect(poseAsset('miku')).toBe('blob:miku-pose-b');
    expect(medallionAsset('miku')).toBe('blob:miku-medallion');
    expect(expressionAsset('emi', 'serious')).toBe('./assets/characters/emi/candidates/anm028d2/frame-serious-r1.png');
    expect(poseAsset('onoe')).toBe(characterRigs.onoe.poseB);
  });


  it('applies global and per-plan browser-local calibration, including X/Y/scale, and exports the resolved snapshot', () => {
    applyBrowserLocalCharacterOverrides({
      miku: {
        frames: {
          smile: {
            asset: 'blob:miku-smile',
            geometry: { alphaBounds: { left: 310, top: 48, right: 700, bottom: 1496 }, eyeLineYPx: 212 },
            visualApproval: 'approved',
            sourceCandidateId: 'browser-local:test',
          },
        },
        poseB: {
          asset: 'blob:miku-pose-b',
          geometry: { alphaBounds: { left: 320, top: 52, right: 702, bottom: 1498 }, eyeLineYPx: 216 },
          sourceCandidateId: 'browser-local:test',
        },
      },
    });

    applyBrowserLocalCharacterCalibration('miku', {
      eyeLineOffsetPx: 14,
      bottomOffsetPx: -12,
      scale: 1.08,
      xPercent: 2.5,
      yPercent: 3.5,
    });

    expect(runtimeFrameOverride('miku', 'smile')?.geometry).toEqual({
      alphaBounds: { left: 310, top: 48, right: 700, bottom: 1484 },
      eyeLineYPx: 226,
    });
    expect(resolvedCharacterStaging('miku')).toEqual({ scale: 1.08, yPercent: 3.5 });
    expect(resolvedCharacterXPercent('miku')).toBe(2.5);

    applyBrowserLocalCharacterCalibration('miku', { scale: 1.2, xPercent: -4, yPercent: 6 }, 'solo-close');
    expect(hasBrowserLocalCharacterPlanCalibration('miku', 'solo-close')).toBe(true);
    const plan = resolveSceneStagingPreset('solo-close', [{ character: 'miku', expression: 'smile', pose: 'pose-b' }]);
    expect(plan.actors[0]?.canonicalCharacterScale).toBe(1.2);
    expect(plan.actors[0]?.canonicalCharacterYPercent).toBe(6);
    expect(plan.actors[0]?.anchorXPercent).toBe(46);
    expect(plan.actors[0]?.frameAlphaBounds).toEqual({ left: 320, top: 52, right: 702, bottom: 1486 });
    expect(plan.actors[0]?.eyeLineYPx).toBe(230);

    const inherited = resolveSceneStagingPreset('solo-medium', [{ character: 'miku', expression: 'smile' }]);
    expect(inherited.actors[0]?.canonicalCharacterScale).toBe(1.08);
    expect(inherited.actors[0]?.canonicalCharacterYPercent).toBe(3.5);
    expect(inherited.actors[0]?.anchorXPercent).toBe(52.5);

    const snapshot = browserLocalCharacterExportSnapshot('visual-lab-test.zip');
    expect(snapshot.format).toBe('upds-browser-local-character-export-v2');
    expect(snapshot.format).toBe(BROWSER_LOCAL_CHARACTER_EXPORT_FORMAT);
    expect(snapshot.packageLabel).toBe('visual-lab-test.zip');
    expect(snapshot.characters.miku?.global.staging).toEqual({ scale: 1.08, xPercent: 2.5, yPercent: 3.5 });
    expect(snapshot.characters.miku?.global.frames.smile).toEqual({
      alphaBounds: { left: 310, top: 48, right: 700, bottom: 1484 },
      eyeLineYPx: 226,
    });
    expect(snapshot.characters.miku?.perPlan['solo-close']?.staging).toEqual({ scale: 1.2, xPercent: -4, yPercent: 6 });
    expect(snapshot.characters.miku?.assets.frames.smile).toBe('./assets/characters/miku/rig/pose_a/frames/frame-smile.png');
    expect(snapshot.characters.miku?.assets.poseB).toBe('./assets/characters/miku/poses/pose_b_pointing_sketchbook.png');
  });

  it('uses approved frame geometry in shared multi-actor staging', () => {
    const resolution = resolveSceneStagingPreset('two-shot-conflict', [
      { character: 'miku', expression: 'serious' },
      { character: 'emi', expression: 'serious' },
    ]);
    const emi = resolution.actors.find((actor) => actor.character === 'emi');
    expect(emi).toBeDefined();
    expect(emi?.frameAlphaBounds).toEqual({ left: 330, top: 80, right: 737, bottom: 1508 });
    expect(emi?.eyeLineYPx).toBe(244);
    expect(emi?.visualApproval).toBe('approved');
    expect(emi?.resolvedEyeLinePercent).toBe(55);
  });
});
