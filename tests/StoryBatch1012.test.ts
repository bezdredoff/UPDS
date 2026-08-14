import { describe, expect, it } from 'vitest';
import batchManifestJson from '../src/content/story/ANM027G.episodes-10-12.story.json';
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
const batchLevelIds = ['M3_10_CONTROL_SAMPLE_GEAR', 'M3_11_ASTERION_TRANSFER', 'M3_12_SECOND_SKIN_SIGNAL'] as const;

describe('ANM-027G episodes 10–12 canonical production batch', () => {
  it('owns one contiguous source and six graph scenes after the 7–9 batch', () => {
    expect(manifest.sourceId).toBe('ANM027G_EPISODES_10_12');
    expect(manifest.expectedBaseRange).toEqual({ startLineId: 'VN0489', endLineId: 'VN0607' });
    expect(manifest.sceneIds).toEqual([
      'VN_SCENE_21_E10_PRE', 'VN_SCENE_22_E10_POST',
      'VN_SCENE_23_E11_PRE', 'VN_SCENE_24_E11_POST',
      'VN_SCENE_25_E12_PRE', 'VN_SCENE_26_E12_POST',
    ]);
    expect(manifest.deferredLineIds).toEqual([]);
    expect(
      authoredVnShotManifest.shots
        .map((shot) => shot.lineId)
        .filter((lineId) => lineId >= 'VN0489' && lineId <= 'VN0607'),
    ).toEqual(['VN0505', 'VN0535', 'VN0594']);
  });

  it('promotes macro slots 10–12 and ships exactly their three production Match-3 configs', () => {
    expect(macro.slots.slice(0, 13).every((slot) => slot.contentStatus === 'authored')).toBe(true);
    expect(macro.slots.slice(10, 13).every((slot) => slot.match3.status === 'production-configured')).toBe(true);
    expect(levels.slice(10, 13).map((level) => level.id)).toEqual(batchLevelIds);
    expect(levels.slice(10, 13).map((level) => level.moves)).toEqual([28, 29, 28]);
    expect(levels.slice(10, 13).every((level) => level.objectives.length <= 3)).toBe(true);
  });

  it('introduces semantic location variants without pretending aliases are new binary masters', () => {
    expect(backgroundAssets.combatClubHall).toBe(backgroundAssets.lockerAthletics);
    expect(backgroundAssets.serviceYard).toBe(backgroundAssets.clubroom);
    expect(backgroundAssets.asterionTransferPoint).toBe(backgroundAssets.norihiroApartment);
    expect(backgroundAssets.oldGymNight).toBe(backgroundAssets.poolLocker);
  });

  it('keeps Aoi in the asset-free guest tier and records both hero-clue triggers as native evidence placeholders', () => {
    expect(guestWitnessForSpeaker('АОЙ')).toBe('aoi');
    expect(guestWitnessManifest.guests.aoi.status).toBe('planned');
    expect(guestWitnessManifest.guests.aoi.assets).toBeNull();
    expect(guestWitnessManifest.guests.aoi.firstSlot).toBe(10);
    expect(macro.slots[11].assetTriggers.heroClueCloseups).toContain('asterion-transfer-chain');
    expect(macro.slots[12].assetTriggers.heroClueCloseups).toContain('second-skin-tag');
  });

  it('adds photo-permission and publish-tag choices without changing save schema', () => {
    expect(SAVE_SCHEMA_VERSION).toBe(2);
    expect(
      storyChoiceGates
        .filter((gate) => gate.id === 'photo-permission' || gate.id === 'publish-tag')
        .map((gate) => [gate.id, gate.checkpointLineId]),
    ).toEqual([
      ['photo-permission', 'VN0560'],
      ['publish-tag', 'VN0601'],
    ]);
    expect(storyChoiceGates.every((gate) => gate.options.join('') === 'ABC')).toBe(true);
  });
});
