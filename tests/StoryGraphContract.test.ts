import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import { sceneMeta } from '../src/data/narrative';
import {
  legacySceneIndexFromStoryId,
  storyEndingIds,
  storyGraph,
  storySceneIdFromLegacyIndex,
  storyTransitionForLegacyScene,
  validateStoryGraph,
  type StorySceneId,
} from '../src/data/storyGraph';

const numeric = (id: string): number => Number(id.slice(2, 6));

describe('ANM-027A story graph contract', () => {
  it('describes the complete authored 22-slot story as one canonical reachable branched graph', () => {
    expect(storyGraph.format).toBe('upds-story-graph-v1');
    expect(storyGraph.entrySceneId).toBe('VN_SCENE_00_PROLOGUE');
    expect(storyGraph.episodes).toHaveLength(1);
    expect(storyGraph.chapters).toHaveLength(23);
    expect(storyGraph.scenes).toHaveLength(45);
    expect(storyEndingIds).toEqual(['ENDING_A_FULL_TRUTH', 'ENDING_B_CASE_CLOSED', 'ENDING_C_PERFECT_SUSPECT']);
    expect(validateStoryGraph()).toEqual([]);
  });

  it('preserves the numeric save scene mapping without changing save schema', () => {
    const expectedIds = sceneMeta.map((scene) => scene.id);
    expect(storyGraph.scenes.map((scene) => scene.id)).toEqual(expectedIds);
    for (let legacyIndex = 0; legacyIndex < expectedIds.length; legacyIndex += 1) {
      const sceneId = storySceneIdFromLegacyIndex(legacyIndex);
      expect(sceneId).toBe(expectedIds[legacyIndex]);
      expect(legacySceneIndexFromStoryId(sceneId as StorySceneId)).toBe(legacyIndex);
    }
    expect(readFileSync(resolve(process.cwd(), 'src/engine/CampaignStore.ts'), 'utf8')).toContain('export const SAVE_SCHEMA_VERSION = 2');
  });

  it('models every VN -> Match-3 -> VN handoff explicitly by stable level id', () => {
    const routes = storyGraph.scenes
      .filter((scene) => scene.transition.kind === 'match3')
      .map((scene) => scene.transition.kind === 'match3' ? [scene.transition.levelId, scene.transition.onWinSceneId] : []);
    expect(routes).toHaveLength(22);
    expect(routes.map(([levelId]) => levelId)).toEqual(levels.map((level) => level.id));
    expect(routes.slice(-3)).toEqual([
      ['M3_19_PRIVATE_RETURN', 'VN_SCENE_40_E19_POST'],
      ['M3_20_SERVER_CONSENT_LOGS', 'VN_SCENE_42_E20_POST'],
      ['M3_21_CONVENIENT_CASE', 'VN_SCENE_44_E21_POST'],
    ]);
  });

  it('keeps screenplay ranges contiguous while making the final-strategy branch and three terminal endings explicit', () => {
    const ranges = storyGraph.scenes.map((scene) => scene.source);
    expect(ranges[0]).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0001', endLineId: 'VN0022' });
    expect(ranges.at(-1)).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0945', endLineId: 'VN0964' });
    for (let index = 1; index < ranges.length; index += 1) {
      expect(numeric(ranges[index].startLineId)).toBe(numeric(ranges[index - 1].endLineId) + 1);
    }
    expect(storyTransitionForLegacyScene(38)).toEqual({
      kind: 'branch', gateId: 'final-strategy',
      routes: { A: 'VN_SCENE_39_E19_PRE', B: 'VN_SCENE_41_E20_PRE', C: 'VN_SCENE_43_E21_PRE' },
    });
    expect(storyTransitionForLegacyScene(40)).toEqual({ kind: 'ending', endingId: 'ENDING_B_CASE_CLOSED' });
    expect(storyTransitionForLegacyScene(42)).toEqual({
      kind: 'ending', endingId: 'ENDING_A_FULL_TRUTH', fallbackEndingId: 'ENDING_B_CASE_CLOSED',
      successRequirement: { evidence: 7, teamTrust: 2, sourceTrust: 2 },
    });
    expect(storyTransitionForLegacyScene(44)).toEqual({ kind: 'ending', endingId: 'ENDING_C_PERFECT_SUSPECT' });
  });

  it('is pure data/validation and does not pull runtime controllers or storage into the contract', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/data/storyGraph.ts'), 'utf8');
    for (const forbidden of ['VnController', 'Match3Controller', 'CampaignStore', 'RuntimeServices', 'document.', 'window.']) expect(source).not.toContain(forbidden);
  });
});
