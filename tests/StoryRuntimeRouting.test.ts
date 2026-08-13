import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  legacySceneIndexFromStoryId,
  storyGraph,
  storyMatch3RouteForLegacyScene,
  storyMatch3RouteForLevelId,
  storyTransitionForLegacyScene,
  storyWinSceneIndexForLevelId,
} from '../src/data/storyGraph';
import { SAVE_SCHEMA_VERSION } from '../src/engine/CampaignStore';

describe('ANM-027B graph-driven story runtime routing', () => {
  it('resolves every existing scene transition without numeric routing arithmetic', () => {
    expect(storyTransitionForLegacyScene(0)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_01_E0_PRE' });
    expect(storyTransitionForLegacyScene(8)).toEqual({ kind: 'ending', endingId: 'ENDING_CASE_001' });

    const matchRoutes = [1, 3, 5, 7].map((legacyIndex) => storyMatch3RouteForLegacyScene(legacyIndex));
    expect(matchRoutes.map((route) => route?.levelIndex)).toEqual([0, 1, 2, 3]);
    expect(matchRoutes.map((route) => route?.onWinLegacyIndex)).toEqual([2, 4, 6, 8]);

    for (const scene of storyGraph.scenes) {
      if (scene.transition.kind !== 'scene') continue;
      expect(legacySceneIndexFromStoryId(scene.transition.targetSceneId)).toBeGreaterThanOrEqual(0);
    }
  });

  it('resolves Match-3 completion by stable level id rather than level index arithmetic', () => {
    expect(storyMatch3RouteForLevelId('M3_00_LOCKER_TUTORIAL')).toMatchObject({
      sourceSceneId: 'VN_SCENE_01_E0_PRE',
      onWinSceneId: 'VN_SCENE_02_E0_POST',
      onWinLegacyIndex: 2,
    });
    expect(storyWinSceneIndexForLevelId('M3_00_LOCKER_TUTORIAL')).toBe(2);
    expect(storyWinSceneIndexForLevelId('M3_01_PHOTO_PROPS')).toBe(4);
    expect(storyWinSceneIndexForLevelId('M3_02_POOL_LAUNDRY')).toBe(6);
    expect(storyWinSceneIndexForLevelId('M3_03_ORDERED_APARTMENT')).toBe(8);
    expect(storyWinSceneIndexForLevelId('UNKNOWN')).toBe(-1);
  });

  it('cuts runtime controllers over to storyGraph and removes routing ownership from CampaignStore', () => {
    const vn = readFileSync(resolve(process.cwd(), 'src/features/vn/VnController.ts'), 'utf8');
    const match3 = readFileSync(resolve(process.cwd(), 'src/features/match3/Match3Controller.ts'), 'utf8');
    const store = readFileSync(resolve(process.cwd(), 'src/engine/CampaignStore.ts'), 'utf8');

    expect(vn).toContain("from '../../data/storyGraph'");
    expect(vn).toContain('storyTransitionForLegacyScene(this.session.save.scene)');
    expect(vn).toContain('storyMatch3RouteForLegacyScene(this.session.save.scene)');
    expect(vn).not.toContain('isPreMatchScene');
    expect(vn).not.toContain('levelForPreMatchScene');
    expect(vn).not.toContain('this.session.save.scene + 1');
    expect(vn).not.toContain('if (this.session.save.scene === sceneMeta.length - 1)');

    expect(match3).toContain("from '../../data/storyGraph'");
    expect(match3).toContain('storyWinSceneIndexForLevelId(level.id)');
    expect(match3).not.toContain('postSceneForLevel');

    expect(store).not.toContain('isPreMatchScene');
    expect(store).not.toContain('levelForPreMatchScene');
    expect(store).not.toContain('postSceneForLevel');
  });

  it('preserves the existing save schema while routing changes under it', () => {
    expect(SAVE_SCHEMA_VERSION).toBe(2);
  });
});
