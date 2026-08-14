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
    expect(storyTransitionForLegacyScene(8)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_09_E4_PRE' });
    expect(storyTransitionForLegacyScene(14)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_15_E7_PRE' });
    expect(storyTransitionForLegacyScene(20)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_21_E10_PRE' });
    expect(storyTransitionForLegacyScene(26)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_27_E13_PRE' });
    expect(storyTransitionForLegacyScene(32)).toEqual({ kind: 'ending', endingId: 'ENDING_AUTHORED_FRONTIER_15' });

    const matchRoutes = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31].map((legacyIndex) => storyMatch3RouteForLegacyScene(legacyIndex));
    expect(matchRoutes.map((route) => route?.levelIndex)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]);
    expect(matchRoutes.map((route) => route?.onWinLegacyIndex)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32]);

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
    expect(storyWinSceneIndexForLevelId('M3_04_EMERGENCY_MEETING')).toBe(10);
    expect(storyWinSceneIndexForLevelId('M3_05_BASKETBALL_LOCKERS')).toBe(12);
    expect(storyWinSceneIndexForLevelId('M3_06_TEXTILE_WORKSHOP')).toBe(14);
    expect(storyWinSceneIndexForLevelId('M3_07_ASTERION_THREAD')).toBe(16);
    expect(storyWinSceneIndexForLevelId('M3_08_LOST_FOUND_LEDGER')).toBe(18);
    expect(storyWinSceneIndexForLevelId('M3_09_MAINTENANCE_KEYS')).toBe(20);
    expect(storyWinSceneIndexForLevelId('M3_10_CONTROL_SAMPLE_GEAR')).toBe(22);
    expect(storyWinSceneIndexForLevelId('M3_11_ASTERION_TRANSFER')).toBe(24);
    expect(storyWinSceneIndexForLevelId('M3_12_SECOND_SKIN_SIGNAL')).toBe(26);
    expect(storyMatch3RouteForLevelId('M3_13_KENDO_PILOT_LIST')).toMatchObject({ sourceSceneId: 'VN_SCENE_27_E13_PRE', onWinSceneId: 'VN_SCENE_28_E13_POST' });
    expect(storyWinSceneIndexForLevelId('M3_13_KENDO_PILOT_LIST')).toBe(28);
    expect(storyWinSceneIndexForLevelId('M3_14_KUBO_ATELIER_LEDGER')).toBe(30);
    expect(storyWinSceneIndexForLevelId('M3_15_ABANDONED_LAUNDRY_ROUTE')).toBe(32);
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
