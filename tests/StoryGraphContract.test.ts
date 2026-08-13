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
  it('describes the current vertical slice as one canonical reachable graph', () => {
    expect(storyGraph.format).toBe('upds-story-graph-v1');
    expect(storyGraph.entrySceneId).toBe('VN_SCENE_00_PROLOGUE');
    expect(storyGraph.episodes).toHaveLength(1);
    expect(storyGraph.chapters).toHaveLength(5);
    expect(storyGraph.scenes).toHaveLength(9);
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
      ['VN0217', 'VN0249'],
    ]);
    expect(storyTransitionForLegacyScene(1)).toEqual({
      kind: 'match3',
      levelId: 'M3_00_LOCKER_TUTORIAL',
      onWinSceneId: 'VN_SCENE_02_E0_POST',
    });
    expect(storyTransitionForLegacyScene(8)).toEqual({ kind: 'ending', endingId: 'ENDING_CASE_001' });
  });

  it('is pure data/validation and does not pull runtime controllers or storage into the contract', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/data/storyGraph.ts'), 'utf8');
    for (const forbidden of ['VnController', 'Match3Controller', 'CampaignStore', 'RuntimeServices', 'document.', 'window.']) {
      expect(source).not.toContain(forbidden);
    }
  });
});
