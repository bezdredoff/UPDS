import { describe, expect, it } from 'vitest';
import batchManifestJson from '../src/content/story/ANM027G.episodes-07-09.story.json';
import macroJson from '../src/content/story/ANM027F.full-story-macro.json';
import { characterProductionManifest, productionCharacterKeys } from '../src/data/characterProduction';
import { characterForSpeaker } from '../src/data/characterRigs';
import { guestWitnessForSpeaker, guestWitnessManifest } from '../src/data/guestWitnesses';
import { backgroundAssets } from '../src/data/narrative';
import { levels } from '../src/data/levels';
import { SAVE_SCHEMA_VERSION } from '../src/engine/CampaignStore';
import { storyChoiceGates } from '../src/data/storyChoices';
import { authoredVnShotManifest } from '../src/data/authoredVnShots';
import type { StoryContentManifest } from '../src/content/storyContentFormat';

const manifest = batchManifestJson as StoryContentManifest;
const macro = macroJson as { slots: readonly { slot: number; contentStatus: string; match3: { status: string } }[] };

const batchLevelIds = ['M3_07_ASTERION_THREAD', 'M3_08_LOST_FOUND_LEDGER', 'M3_09_MAINTENANCE_KEYS'] as const;

describe('ANM-027G episodes 7–9 canonical production batch', () => {
  it('owns one contiguous source and six graph scenes after the 4–6 batch', () => {
    expect(manifest.sourceId).toBe('ANM027G_EPISODES_07_09');
    expect(manifest.expectedBaseRange).toEqual({ startLineId: 'VN0370', endLineId: 'VN0488' });
    expect(manifest.sceneIds).toEqual([
      'VN_SCENE_15_E7_PRE', 'VN_SCENE_16_E7_POST',
      'VN_SCENE_17_E8_PRE', 'VN_SCENE_18_E8_POST',
      'VN_SCENE_19_E9_PRE', 'VN_SCENE_20_E9_POST',
    ]);
    expect(manifest.deferredLineIds).toEqual([]);
    expect(
      authoredVnShotManifest.shots
        .map((shot) => shot.lineId)
        .filter((lineId) => lineId >= 'VN0370' && lineId <= 'VN0488'),
    ).toEqual(['VN0389', 'VN0427', 'VN0482']);
  });

  it('promotes macro slots 7–9 and ships exactly their three production Match-3 configs', () => {
    expect(macro.slots.slice(0, 10).every((slot) => slot.contentStatus === 'authored')).toBe(true);
    expect(macro.slots.slice(7, 10).every((slot) => slot.match3.status === 'production-configured')).toBe(true);
    expect(levels.slice(7, 10).map((level) => level.id)).toEqual(batchLevelIds);
    expect(levels.slice(7, 10).every((level) => level.objectives.length <= 3)).toBe(true);
  });

  it('introduces semantic location variants without pretending placeholder binaries are new masters', () => {
    expect(backgroundAssets.asterionLab).toBe(backgroundAssets.norihiroApartment);
    expect(backgroundAssets.lostFoundWarehouse).toBe(backgroundAssets.lockerAthletics);
    expect(backgroundAssets.maintenanceRoom).toBe(backgroundAssets.lockerAthletics);
  });

  it('routes Rina and Kurose through production rigs while Gen stays in the guest tier', () => {
    expect(productionCharacterKeys).toContain('rina');
    expect(productionCharacterKeys).toContain('kurose');
    expect(characterProductionManifest.characters.rina.status).toBe('production');
    expect(characterProductionManifest.characters.kurose.status).toBe('production');
    expect(characterForSpeaker('РИНА')).toBe('rina');
    expect(characterForSpeaker('КУРОСЭ')).toBe('kurose');
    expect(guestWitnessForSpeaker('ГЭН')).toBe('gen');
    expect(guestWitnessManifest.guests.gen.status).toBe('planned');
    expect(guestWitnessManifest.guests.gen.assets).toBeNull();
  });

  it('adds the Gen source-protection choice without changing save schema', () => {
    expect(SAVE_SCHEMA_VERSION).toBe(2);
    expect(storyChoiceGates.slice(0, 3).map((gate) => [gate.id, gate.checkpointLineId])).toEqual([
      ['meeting-tone', 'VN0262'],
      ['apology-to-hinata', 'VN0356'],
      ['protect-gen-source', 'VN0480'],
    ]);
    expect(storyChoiceGates.every((gate) => gate.options.join('') === 'ABC')).toBe(true);
  });
});
