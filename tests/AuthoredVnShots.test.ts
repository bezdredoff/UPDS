import { describe, expect, it } from 'vitest';
import {
  AUTHORED_VN_SHOTS_FORMAT,
  authoredVnShotManifest,
  validateAuthoredVnShotManifest,
} from '../src/data/authoredVnShots';
import { characterForSpeaker, characterRigs } from '../src/data/characterRigs';
import { canonicalStoryLines } from '../src/content/storyRuntime';
import { authoredVnShotAssets, resolveAuthoredVnShot, vnAuthoredShotMarkup } from '../src/ui/vnAuthoredShots';

const storyById = new Map(canonicalStoryLines.map((line) => [line.id, line]));

describe('ANM-028B2 bounded authored VN shot adoption', () => {
  it('locks a bounded valid set across canonical authored batches to approved actor-only presets', () => {
    expect(AUTHORED_VN_SHOTS_FORMAT).toBe('upds-authored-vn-shots-v1');
    expect(validateAuthoredVnShotManifest()).toEqual([]);
    expect(authoredVnShotManifest.adoption).toBe('bounded-runtime');
    const shotLineIds = authoredVnShotManifest.shots.map((shot) => shot.lineId);
    expect(shotLineIds.slice(0, 5)).toEqual(['VN0008', 'VN0013', 'VN0026', 'VN0034', 'VN0038']);
    expect(new Set(shotLineIds).size).toBe(shotLineIds.length);
    expect(shotLineIds).toEqual([...shotLineIds].sort((left, right) => left.localeCompare(right)));
    expect(shotLineIds.length).toBeLessThan(canonicalStoryLines.length);

    for (const shot of authoredVnShotManifest.shots) {
      const line = storyById.get(shot.lineId);
      expect(line, shot.lineId).toBeDefined();
      const speakingCharacter = line ? characterForSpeaker(line.speaker) : null;
      expect(speakingCharacter, `${shot.lineId} speaker`).not.toBeNull();
      expect(shot.actors.some((actor) => actor.character === speakingCharacter), `${shot.lineId} speaker in shot`).toBe(true);
    }
  });

  it('resolves shared preset geometry and renders real multi-character runtime markup', () => {
    const resolved = resolveAuthoredVnShot('VN0008');
    expect(resolved).not.toBeNull();
    expect(resolved?.staging.preset.id).toBe('trio-central-speaker');
    expect(resolved?.staging.actors).toHaveLength(3);
    expect(resolved?.staging.actors.every((actor) => actor.verticalAnchor === 'background-focal-eye-line')).toBe(true);
    expect(resolved?.staging.actors.every((actor) => actor.resolvedEyeLinePercent === 55)).toBe(true);

    const markup = vnAuthoredShotMarkup(resolved!, 'miku');
    expect(markup).toContain('data-authored-shot="VN0008"');
    expect(markup).toContain('data-scene-preset="trio-central-speaker"');
    expect(markup.match(/class="vn-authored-actor-slot"/g)).toHaveLength(3);
    expect(markup).toContain('data-character="miku"');
    expect(markup).toContain('data-speaking="true"');
    expect(markup).toContain('data-vertical-anchor="background-focal-eye-line"');
  });

  it('proves authored Pose B without changing the fallback resolver for unlisted lines', () => {
    const resolved = resolveAuthoredVnShot('VN0038');
    expect(resolved?.shot.presetId).toBe('two-shot-alliance');
    expect(resolved?.shot.actors[0]).toEqual({ character: 'ayuki', expression: 'neutral', pose: 'pose-b' });
    expect(authoredVnShotAssets(resolved!)).toContain(characterRigs.ayuki.poseB);
    expect(vnAuthoredShotMarkup(resolved!, 'ayuki')).toContain(characterRigs.ayuki.poseB);
    expect(resolveAuthoredVnShot('VN0002')).toBeNull();
  });
});
