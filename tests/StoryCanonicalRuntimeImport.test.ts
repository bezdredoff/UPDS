import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canonicalDeferredStoryLineIds,
  canonicalRuntimeStoryLineCount,
  canonicalStoryLineCount,
  canonicalStoryLines,
  canonicalStoryManifest,
  canonicalStoryManifests,
} from '../src/content/storyRuntime';
import { getScene, sceneMeta, type ChoiceId } from '../src/data/narrative';
import {
  storyGraph,
  storySceneFromLegacyIndex,
  storyMatch3RouteForLegacyScene,
  validateStoryGraph,
} from '../src/data/storyGraph';
import type { StoryChoiceOptionId } from '../src/data/storyChoices';

const numeric = (id: string): number => Number(id.slice(2, 6));

const walkPlayableStory = (finalStrategy: StoryChoiceOptionId): Readonly<{ scenes: readonly string[]; levels: readonly string[]; endingId: string | null }> => {
  const scenes: string[] = [];
  const levels: string[] = [];
  let sceneId: (typeof storyGraph.scenes)[number]['id'] | null = storyGraph.entrySceneId;
  let endingId: string | null = null;
  const visited = new Set<string>();

  while (sceneId) {
    if (visited.has(sceneId)) throw new Error(`story transition cycle at ${sceneId}`);
    visited.add(sceneId);
    scenes.push(sceneId);
    const scene = storyGraph.scenes.find((candidate) => candidate.id === sceneId);
    if (!scene) throw new Error(`missing graph scene ${sceneId}`);
    const transition = scene.transition;
    if (transition.kind === 'scene') { sceneId = transition.targetSceneId; continue; }
    if (transition.kind === 'match3') { levels.push(transition.levelId); sceneId = transition.onWinSceneId; continue; }
    if (transition.kind === 'branch') { sceneId = transition.routes[finalStrategy]; continue; }
    endingId = transition.endingId;
    sceneId = null;
  }
  return { scenes, levels, endingId };
};

describe('ANM-027D canonical story runtime import and transition QA', () => {
  it('combines all seven audited canonical screenplay sources into one normalized runtime collection', () => {
    expect(canonicalStoryManifest.sourceId).toBe('ANM003_VERTICAL_SLICE');
    expect(canonicalStoryManifests.map((manifest) => manifest.sourceId)).toEqual([
      'ANM003_VERTICAL_SLICE', 'ANM027G_EPISODES_04_06', 'ANM027G_EPISODES_07_09',
      'ANM027G_EPISODES_10_12', 'ANM027G_EPISODES_13_15', 'ANM027G_EPISODES_16_18', 'ANM027G_EPISODES_19_21',
    ]);
    expect(canonicalStoryLineCount).toBe(976);
    expect(canonicalRuntimeStoryLineCount).toBe(976);
    expect(canonicalDeferredStoryLineIds).toEqual([]);
    expect(canonicalStoryLines[0]?.id).toBe('VN0001');
    expect(canonicalStoryLines.at(-1)?.id).toBe('VN0964');
  });

  it('cuts narrative runtime over to the audited parser and graph ranges with no duplicate parser/range tables', () => {
    const narrative = readFileSync(resolve(process.cwd(), 'src/data/narrative.ts'), 'utf8');
    const graph = readFileSync(resolve(process.cwd(), 'src/data/storyGraph.ts'), 'utf8');
    expect(narrative).toContain("from '../content/storyRuntime'");
    expect(narrative).toContain("from './storyGraph'");
    expect(narrative).toContain('storySceneFromLegacyIndex(index)');
    expect(narrative).not.toContain('sceneStarts');
    expect(narrative).not.toContain('sceneEnds');
    expect(graph).not.toContain("from './narrative'");
  });

  it('keeps presentation metadata aligned 1:1 with canonical graph scene ids', () => {
    expect(sceneMeta.map((scene) => scene.id)).toEqual(storyGraph.scenes.map((scene) => scene.id));
    expect(validateStoryGraph()).toEqual([]);
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('imports every authored scene boundary for initial branch %s', (choice) => {
    for (const graphScene of storyGraph.scenes) {
      const scene = getScene(graphScene.legacyIndex, choice);
      expect(scene.length).toBeGreaterThan(0);
      expect(numeric(scene[0].id)).toBe(numeric(graphScene.source.startLineId));
      expect(numeric(scene.at(-1)!.id)).toBe(numeric(graphScene.source.endLineId));
    }
  });

  it.each([
    ['A', 'M3_19_PRIVATE_RETURN', 'ENDING_B_CASE_CLOSED', ['VN_SCENE_39_E19_PRE', 'VN_SCENE_40_E19_POST']],
    ['B', 'M3_20_SERVER_CONSENT_LOGS', 'ENDING_A_FULL_TRUTH', ['VN_SCENE_41_E20_PRE', 'VN_SCENE_42_E20_POST']],
    ['C', 'M3_21_CONVENIENT_CASE', 'ENDING_C_PERFECT_SUSPECT', ['VN_SCENE_43_E21_PRE', 'VN_SCENE_44_E21_POST']],
  ] as const)('walks final-strategy %s through its own VN/Match-3 route to %s', (strategy, finalLevel, endingId, finalScenes) => {
    const path = walkPlayableStory(strategy);
    expect(path.scenes.slice(0, 39)).toEqual(storyGraph.scenes.slice(0, 39).map((scene) => scene.id));
    expect(path.scenes.slice(-2)).toEqual(finalScenes);
    const commonLevels = storyGraph.scenes.slice(0, 39).flatMap((scene) => scene.transition.kind === 'match3' ? [scene.transition.levelId] : []);
    expect(path.levels.slice(0, 19)).toEqual(commonLevels);
    expect(path.levels).toHaveLength(20);
    expect(path.levels.at(-1)).toBe(finalLevel);
    expect(path.endingId).toBe(endingId);
  });

  it('proves every Match-3 source scene and win scene has canonical runtime content', () => {
    for (const scene of storyGraph.scenes) {
      if (scene.transition.kind !== 'match3') continue;
      const route = storyMatch3RouteForLegacyScene(scene.legacyIndex);
      expect(route).not.toBeNull();
      const before = getScene(scene.legacyIndex, 'A');
      const after = getScene(route!.onWinLegacyIndex, 'A');
      expect(before.at(-1)?.id).toBe(scene.source.endLineId);
      expect(after[0]?.id).toBe(storySceneFromLegacyIndex(route!.onWinLegacyIndex)?.source.startLineId);
    }
  });
});
