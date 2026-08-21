import { describe, expect, it } from 'vitest';
import batchManifestJson from '../src/content/story/ANM027G.episodes-13-15.story.json';
import macroJson from '../src/content/story/ANM027F.full-story-macro.json';
import { guestWitnessForSpeaker, guestWitnessManifest } from '../src/data/guestWitnesses';
import { backgroundAssets } from '../src/data/narrative';
import { levels } from '../src/data/levels';
import { SAVE_SCHEMA_VERSION } from '../src/engine/CampaignStore';
import { storyChoiceGates } from '../src/data/storyChoices';
import { authoredVnShotManifest } from '../src/data/authoredVnShots';
import type { StoryContentManifest } from '../src/content/storyContentFormat';

const manifest = batchManifestJson as StoryContentManifest;
const macro = macroJson as { slots: readonly { slot: number; contentStatus: string; match3: { status: string } }[] };
const batchLevelIds = ['M3_13_KENDO_PILOT_LIST', 'M3_14_KUBO_ATELIER_LEDGER', 'M3_15_ABANDONED_LAUNDRY_ROUTE'] as const;

describe('ANM-027G episodes 13–15 canonical production batch', () => {
  it('owns one contiguous source and six graph scenes after the 10–12 batch', () => {
    expect(manifest.sourceId).toBe('ANM027G_EPISODES_13_15');
    expect(manifest.expectedBaseRange).toEqual({ startLineId: 'VN0608', endLineId: 'VN0726' });
    expect(manifest.sceneIds).toEqual([
      'VN_SCENE_27_E13_PRE', 'VN_SCENE_28_E13_POST',
      'VN_SCENE_29_E14_PRE', 'VN_SCENE_30_E14_POST',
      'VN_SCENE_31_E15_PRE', 'VN_SCENE_32_E15_POST',
    ]);
    expect(manifest.deferredLineIds).toEqual([]);
    expect(
      authoredVnShotManifest.shots
        .map((shot) => shot.lineId)
        .filter((lineId) => lineId >= 'VN0608' && lineId <= 'VN0726'),
    ).toEqual(['VN0625', 'VN0663', 'VN0721']);
  });

  it('promotes macro slots 13–15 and ships exactly their three production Match-3 configs', () => {
    expect(macro.slots.slice(0, 16).every((slot) => slot.contentStatus === 'authored')).toBe(true);
    expect(macro.slots.slice(13, 16).every((slot) => slot.match3.status === 'production-configured')).toBe(true);
    expect(levels.slice(13, 16).map((level) => level.id)).toEqual(batchLevelIds);
    expect(levels.slice(13, 16).map((level) => level.moves)).toEqual([30, 29, 30]);
    expect(levels.slice(13, 16).every((level) => level.objectives.length <= 3)).toBe(true);
  });

  it('adopts the approved abandoned-laundry anchor while retaining the unresolved campus-path variant', () => {
    expect(backgroundAssets.campusPath).toBe(backgroundAssets.clubroom);
    expect(backgroundAssets.abandonedLaundry).toBe('./assets/backgrounds/BG_ABANDONED_LAUNDRY.webp');
    expect(backgroundAssets.abandonedLaundry).not.toBe(backgroundAssets.poolLocker);
  });

  it('keeps Kubo and his mother in the asset-free guest tier', () => {
    expect(guestWitnessForSpeaker('КУБО')).toBe('kubo');
    expect(guestWitnessForSpeaker('МАТЬ КУБО')).toBe('kubo-mother');
    expect(guestWitnessManifest.guests.kubo.status).toBe('planned');
    expect(guestWitnessManifest.guests.kubo.assets).toBeNull();
    expect(guestWitnessManifest.guests['kubo-mother'].status).toBe('planned');
    expect(guestWitnessManifest.guests['kubo-mother'].assets).toBeNull();
  });

  it('adds only the family-ledger permission gate without changing save schema', () => {
    expect(SAVE_SCHEMA_VERSION).toBe(2);
    expect(
      storyChoiceGates
        .filter((gate) => gate.id === 'family-ledger-permission')
        .map((gate) => [gate.id, gate.checkpointLineId]),
    ).toEqual([['family-ledger-permission', 'VN0678']]);
    expect(storyChoiceGates.every((gate) => gate.options.join('') === 'ABC')).toBe(true);
  });
});
