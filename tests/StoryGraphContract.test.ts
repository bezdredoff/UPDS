import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { sceneMeta } from '../src/data/narrative';
import {
  legacySceneIndexFromStoryId,
  storyGraph,
  storySceneIdFromLegacyIndex,
  storyTransitionForLegacyScene,
  validateStoryGraph,
  type StorySceneId,
} from '../src/data/storyGraph';

describe('ANM-027A story graph contract', () => {
  it('describes the current authored story frontier as one canonical reachable graph', () => {
    expect(storyGraph.format).toBe('upds-story-graph-v1');
    expect(storyGraph.entrySceneId).toBe('VN_SCENE_00_PROLOGUE');
    expect(storyGraph.episodes).toHaveLength(1);
    expect(storyGraph.chapters).toHaveLength(14);
    expect(storyGraph.scenes).toHaveLength(27);
    expect(validateStoryGraph()).toEqual([]);
  });

  it('preserves the current numeric save scene mapping without changing save schema', () => {
    const expectedIds = sceneMeta.map((scene) => scene.id);
    expect(storyGraph.scenes.map((scene) => scene.id)).toEqual(expectedIds);

    for (let legacyIndex = 0; legacyIndex < expectedIds.length; legacyIndex += 1) {
      const sceneId = storySceneIdFromLegacyIndex(legacyIndex);
      expect(sceneId).toBe(expectedIds[legacyIndex]);
      expect(legacySceneIndexFromStoryId(sceneId as StorySceneId)).toBe(legacyIndex);
    }

    const campaignStoreSource = readFileSync(resolve(process.cwd(), 'src/engine/CampaignStore.ts'), 'utf8');
    expect(campaignStoreSource).toContain('export const SAVE_SCHEMA_VERSION = 2');
  });

  it('models every VN -> Match-3 -> VN handoff explicitly by stable level id', () => {
    const routes = storyGraph.scenes
      .map((scene) => scene.transition)
      .filter((transition) => transition.kind === 'match3')
      .map((transition) => [transition.levelId, transition.onWinSceneId]);

    expect(routes).toEqual([
      ['M3_00_LOCKER_TUTORIAL', 'VN_SCENE_02_E0_POST'],
      ['M3_01_PHOTO_PROPS', 'VN_SCENE_04_E1_POST'],
      ['M3_02_POOL_LAUNDRY', 'VN_SCENE_06_E2_POST'],
      ['M3_03_ORDERED_APARTMENT', 'VN_SCENE_08_E3_POST'],
      ['M3_04_EMERGENCY_MEETING', 'VN_SCENE_10_E4_POST'],
      ['M3_05_BASKETBALL_LOCKERS', 'VN_SCENE_12_E5_POST'],
      ['M3_06_TEXTILE_WORKSHOP', 'VN_SCENE_14_E6_POST'],
      ['M3_07_ASTERION_THREAD', 'VN_SCENE_16_E7_POST'],
      ['M3_08_LOST_FOUND_LEDGER', 'VN_SCENE_18_E8_POST'],
      ['M3_09_MAINTENANCE_KEYS', 'VN_SCENE_20_E9_POST'],
      ['M3_10_CONTROL_SAMPLE_GEAR', 'VN_SCENE_22_E10_POST'],
      ['M3_11_ASTERION_TRANSFER', 'VN_SCENE_24_E11_POST'],
      ['M3_12_SECOND_SKIN_SIGNAL', 'VN_SCENE_26_E12_POST'],
    ]);
    expect(routes.map(([levelId]) => levelId)).toEqual(levels.map((level) => level.id));
  });

  it('keeps screenplay source ranges contiguous and current scene routing inspectable', () => {
    expect(storyGraph.scenes.map((scene) => [scene.source.startLineId, scene.source.endLineId])).toEqual([
      ['VN0001', 'VN0022'],
      ['VN0023', 'VN0057'],
      ['VN0058', 'VN0084'],
      ['VN0085', 'VN0113'],
      ['VN0114', 'VN0142'],
      ['VN0143', 'VN0166'],
      ['VN0167', 'VN0191'],
      ['VN0192', 'VN0216'],
      ['VN0217', 'VN0250'],
      ['VN0251', 'VN0270'], ['VN0271', 'VN0288'],
      ['VN0289', 'VN0308'], ['VN0309', 'VN0326'],
      ['VN0327', 'VN0347'], ['VN0348', 'VN0369'],
      ['VN0370', 'VN0390'], ['VN0391', 'VN0409'],
      ['VN0410', 'VN0429'], ['VN0430', 'VN0448'],
      ['VN0449', 'VN0469'], ['VN0470', 'VN0488'],
      ['VN0489', 'VN0508'], ['VN0509', 'VN0527'],
      ['VN0528', 'VN0547'], ['VN0548', 'VN0567'],
      ['VN0568', 'VN0588'], ['VN0589', 'VN0607'],
    ]);
    expect(storyTransitionForLegacyScene(1)).toEqual({
      kind: 'match3',
      levelId: 'M3_00_LOCKER_TUTORIAL',
      onWinSceneId: 'VN_SCENE_02_E0_POST',
    });
    expect(storyTransitionForLegacyScene(8)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_09_E4_PRE' });
    expect(storyTransitionForLegacyScene(14)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_15_E7_PRE' });
    expect(storyTransitionForLegacyScene(20)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_21_E10_PRE' });
    expect(storyTransitionForLegacyScene(26)).toEqual({ kind: 'ending', endingId: 'ENDING_AUTHORED_FRONTIER_12' });
  });

  it('is pure data/validation and does not pull runtime controllers or storage into the contract', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/data/storyGraph.ts'), 'utf8');
    for (const forbidden of ['VnController', 'Match3Controller', 'CampaignStore', 'RuntimeServices', 'document.', 'window.']) {
      expect(source).not.toContain(forbidden);
    }
  });
});
