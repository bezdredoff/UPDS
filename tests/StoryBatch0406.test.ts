import { describe, expect, it } from 'vitest';
import batchManifestJson from '../src/content/story/ANM027G.episodes-04-06.story.json';
import macroJson from '../src/content/story/ANM027F.full-story-macro.json';
import { backgroundAssets } from '../src/data/narrative';
import { levels } from '../src/data/levels';
import { SAVE_SCHEMA_VERSION } from '../src/engine/CampaignStore';
import { storyChoiceGates } from '../src/data/storyChoices';
import { authoredVnShotManifest } from '../src/data/authoredVnShots';
import type { StoryContentManifest } from '../src/content/storyContentFormat';

const manifest = batchManifestJson as StoryContentManifest;
const macro = macroJson as {
  slots: readonly { slot: number; contentStatus: string; match3: { status: string } }[];
};

const batchLevelIds = [
  'M3_04_EMERGENCY_MEETING',
  'M3_05_BASKETBALL_LOCKERS',
  'M3_06_TEXTILE_WORKSHOP',
] as const;

describe('ANM-027G episodes 4–6 canonical production batch', () => {
  it('owns one contiguous incremental source and six graph scenes without overlapping ANM-003', () => {
    expect(manifest.sourceId).toBe('ANM027G_EPISODES_04_06');
    expect(manifest.expectedBaseRange).toEqual({ startLineId: 'VN0251', endLineId: 'VN0369' });
    expect(manifest.sceneIds).toEqual([
      'VN_SCENE_09_E4_PRE', 'VN_SCENE_10_E4_POST',
      'VN_SCENE_11_E5_PRE', 'VN_SCENE_12_E5_POST',
      'VN_SCENE_13_E6_PRE', 'VN_SCENE_14_E6_POST',
    ]);
    expect(manifest.deferredLineIds).toEqual([]);
    expect(
      authoredVnShotManifest.shots
        .map((shot) => shot.lineId)
        .filter((lineId) => lineId >= 'VN0251' && lineId <= 'VN0369'),
    ).toEqual(['VN0254', 'VN0273', 'VN0341']);
  });

  it('promotes only macro slots 4–6 and ships exactly their three production Match-3 configs', () => {
    expect(macro.slots.slice(4, 7).every((slot) => slot.contentStatus === 'authored')).toBe(true);
    expect(macro.slots.slice(4, 7).every((slot) => slot.match3.status === 'production-configured')).toBe(true);
    expect(levels.slice(4, 7).map((level) => level.id)).toEqual(batchLevelIds);
    expect(levels.slice(4, 7).every((level) => level.objectives.length <= 3)).toBe(true);
    expect(levels.slice(4, 7).every((level) => level.tutorialConcepts.every((concept) => concept === 'activate-special' || concept === 'combine-specials'))).toBe(true);
  });

  it('adopts the approved auditorium while retaining unresolved early-route fallbacks', () => {
    expect(backgroundAssets.studentCouncilAuditorium).toBe('./assets/backgrounds/BG_STUDENT_COUNCIL_AUDITORIUM_DAY.webp');
    expect(backgroundAssets.studentCouncilAuditorium).not.toBe(backgroundAssets.clubroom);
    expect(backgroundAssets.basketballLocker).toBe(backgroundAssets.lockerAthletics);
    expect(backgroundAssets.textileWorkshop).toBe(backgroundAssets.kentaroApartment);
  });

  it('adds two additive stable choice gates without changing the Story save schema', () => {
    expect(SAVE_SCHEMA_VERSION).toBe(2);
    expect(storyChoiceGates.slice(0, 2).map((gate) => [gate.id, gate.checkpointLineId])).toEqual([
      ['meeting-tone', 'VN0262'],
      ['apology-to-hinata', 'VN0356'],
    ]);
    expect(storyChoiceGates.every((gate) => gate.options.join('') === 'ABC')).toBe(true);
  });
});
