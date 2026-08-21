import { describe, expect, it } from 'vitest';
import batchManifestJson from '../src/content/story/ANM027G.episodes-16-18.story.json';
import macroJson from '../src/content/story/ANM027F.full-story-macro.json';
import { guestWitnessForSpeaker, guestWitnessManifest } from '../src/data/guestWitnesses';
import { backgroundAssets } from '../src/data/narrative';
import { levels } from '../src/data/levels';
import { SAVE_SCHEMA_VERSION } from '../src/engine/CampaignStore';
import { storyChoiceGates } from '../src/data/storyChoices';
import { authoredVnShotManifest } from '../src/data/authoredVnShots';
import type { StoryContentManifest } from '../src/content/storyContentFormat';

const manifest = batchManifestJson as StoryContentManifest;
const macro = macroJson as { slots: readonly { slot: number; contentStatus: string; match3: { status: string }; assetTriggers: { heroClueCloseups: readonly string[] } }[] };
const batchLevelIds = ['M3_16_PINK_RIBBON_SCANNER', 'M3_17_RINA_ARCHIVE_CATALOG', 'M3_18_FULL_TIMELINE_PROOF'] as const;

describe('ANM-027G episodes 16–18 canonical production batch', () => {
  it('owns one contiguous source and six graph scenes after the 13–15 batch', () => {
    expect(manifest.sourceId).toBe('ANM027G_EPISODES_16_18');
    expect(manifest.expectedBaseRange).toEqual({ startLineId: 'VN0727', endLineId: 'VN0845' });
    expect(manifest.sceneIds).toEqual([
      'VN_SCENE_33_E16_PRE', 'VN_SCENE_34_E16_POST',
      'VN_SCENE_35_E17_PRE', 'VN_SCENE_36_E17_POST',
      'VN_SCENE_37_E18_PRE', 'VN_SCENE_38_E18_POST',
    ]);
    expect(manifest.deferredLineIds).toEqual([]);
    expect(authoredVnShotManifest.shots.map((shot) => shot.lineId).filter((lineId) => lineId >= 'VN0727' && lineId <= 'VN0845')).toEqual(['VN0753', 'VN0795', 'VN0833']);
  });

  it('promotes macro slots 16–18 and ships exactly their three production Match-3 configs', () => {
    expect(macro.slots.slice(0, 19).every((slot) => slot.contentStatus === 'authored')).toBe(true);
    expect(macro.slots.slice(16, 19).every((slot) => slot.match3.status === 'production-configured')).toBe(true);
    expect(levels.slice(16, 19).map((level) => level.id)).toEqual(batchLevelIds);
    expect(levels.slice(16, 19).map((level) => level.moves)).toEqual([29, 30, 31]);
    expect(levels.slice(16, 19).every((level) => level.objectives.length <= 3)).toBe(true);
  });

  it('adopts the old-archive production sibling and retains the remaining aliases and hero-clue triggers', () => {
    expect(backgroundAssets.gymnasticsCostume).toBe(backgroundAssets.lockerAthletics);
    expect(backgroundAssets.oldArchive).toBe('./assets/backgrounds/BG_OLD_ARCHIVE.webp');
    expect(backgroundAssets.oldArchive).not.toBe(backgroundAssets.poolLocker);
    expect(backgroundAssets.clubroomNight).toBe(backgroundAssets.clubroom);
    expect(macro.slots[17].assetTriggers.heroClueCloseups).toContain('rina-catalog');
    expect(macro.slots[18].assetTriggers.heroClueCloseups).toContain('post-rina-active-tag');
  });

  it('keeps Vincent in the asset-free guest tier', () => {
    expect(guestWitnessForSpeaker('ВИНСЕНТ')).toBe('vincent');
    expect(guestWitnessManifest.guests.vincent.firstSlot).toBe(16);
    expect(guestWitnessManifest.guests.vincent.status).toBe('planned');
    expect(guestWitnessManifest.guests.vincent.assets).toBeNull();
  });

  it('adds the Vincent trust and final-strategy gates without changing save schema', () => {
    expect(SAVE_SCHEMA_VERSION).toBe(2);
    expect(storyChoiceGates.filter((gate) => gate.id === 'trust-vincent' || gate.id === 'final-strategy').map((gate) => [gate.id, gate.checkpointLineId])).toEqual([
      ['trust-vincent', 'VN0756'], ['final-strategy', 'VN0841'],
    ]);
    expect(storyChoiceGates.every((gate) => gate.options.join('') === 'ABC')).toBe(true);
  });
});
