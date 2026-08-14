import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  legacySceneIndexFromStoryId,
  storyBranchTargetForLegacyScene,
  storyGraph,
  storyMatch3RouteForLegacyScene,
  storyMatch3RouteForLevelId,
  storyTransitionForLegacyScene,
  storyWinSceneIndexForLevelId,
} from '../src/data/storyGraph';
import { levels } from '../src/data/levels';
import { SAVE_SCHEMA_VERSION } from '../src/engine/CampaignStore';

describe('ANM-027B graph-driven story runtime routing', () => {
  it('resolves common-route transitions and the saved final-strategy branch without numeric routing arithmetic', () => {
    expect(storyTransitionForLegacyScene(0)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_01_E0_PRE' });
    expect(storyTransitionForLegacyScene(32)).toEqual({ kind: 'scene', targetSceneId: 'VN_SCENE_33_E16_PRE' });
    expect(storyTransitionForLegacyScene(38)?.kind).toBe('branch');
    expect(storyBranchTargetForLegacyScene(38, { 'final-strategy': 'A' })).toBe('VN_SCENE_39_E19_PRE');
    expect(storyBranchTargetForLegacyScene(38, { 'final-strategy': 'B' })).toBe('VN_SCENE_41_E20_PRE');
    expect(storyBranchTargetForLegacyScene(38, { 'final-strategy': 'C' })).toBe('VN_SCENE_43_E21_PRE');
    expect(storyBranchTargetForLegacyScene(38, {})).toBeNull();

    for (const scene of storyGraph.scenes) {
      if (scene.transition.kind === 'scene') expect(legacySceneIndexFromStoryId(scene.transition.targetSceneId)).toBeGreaterThanOrEqual(0);
    }
  });

  it('resolves all 22 Match-3 completions by stable level id rather than level-index arithmetic', () => {
    const routes = storyGraph.scenes.filter((scene) => scene.transition.kind === 'match3').map((scene) => storyMatch3RouteForLegacyScene(scene.legacyIndex));
    expect(routes.map((route) => route?.levelId)).toEqual(levels.map((level) => level.id));
    expect(routes.map((route) => route?.levelIndex)).toEqual(Array.from({ length: 22 }, (_, index) => index));
    expect(routes.slice(0, 19).map((route) => route?.onWinLegacyIndex)).toEqual(Array.from({ length: 19 }, (_, index) => (index + 1) * 2));
    expect(routes.slice(19).map((route) => route?.onWinLegacyIndex)).toEqual([40, 42, 44]);
    expect(storyMatch3RouteForLevelId('M3_20_SERVER_CONSENT_LOGS')).toMatchObject({ sourceSceneId: 'VN_SCENE_41_E20_PRE', onWinSceneId: 'VN_SCENE_42_E20_POST' });
    expect(storyWinSceneIndexForLevelId('M3_19_PRIVATE_RETURN')).toBe(40);
    expect(storyWinSceneIndexForLevelId('M3_20_SERVER_CONSENT_LOGS')).toBe(42);
    expect(storyWinSceneIndexForLevelId('M3_21_CONVENIENT_CASE')).toBe(44);
    expect(storyWinSceneIndexForLevelId('UNKNOWN')).toBe(-1);
  });

  it('cuts runtime controllers over to storyGraph including branch and outcome resolution', () => {
    const vn = readFileSync(resolve(process.cwd(), 'src/features/vn/VnController.ts'), 'utf8');
    const match3 = readFileSync(resolve(process.cwd(), 'src/features/match3/Match3Controller.ts'), 'utf8');
    const store = readFileSync(resolve(process.cwd(), 'src/engine/CampaignStore.ts'), 'utf8');
    expect(vn).toContain("from '../../data/storyGraph'");
    expect(vn).toContain('storyTransitionForLegacyScene(this.session.save.scene)');
    expect(vn).toContain('storyBranchTargetForLegacyScene(this.session.save.scene, this.session.save.storyChoices)');
    expect(vn).toContain('meetsStoryEndingRequirement(metrics, transition.successRequirement)');
    expect(vn).not.toContain('this.session.save.scene + 1');
    expect(match3).toContain("from '../../data/storyGraph'");
    expect(match3).toContain('storyWinSceneIndexForLevelId(level.id)');
    expect(store).not.toContain('postSceneForLevel');
  });

  it('preserves the existing save schema while final branching is additive', () => {
    expect(SAVE_SCHEMA_VERSION).toBe(2);
  });
});
