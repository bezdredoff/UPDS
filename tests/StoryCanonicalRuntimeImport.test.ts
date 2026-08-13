import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  canonicalDeferredStoryLineIds,
  canonicalRuntimeStoryLineCount,
  canonicalStoryLineCount,
  canonicalStoryLines,
  canonicalStoryManifest,
} from '../src/content/storyRuntime';
import { getScene, sceneMeta, type ChoiceId } from '../src/data/narrative';
import {
  storyGraph,
  storySceneFromLegacyIndex,
  storyMatch3RouteForLegacyScene,
  validateStoryGraph,
} from '../src/data/storyGraph';

const numeric = (id: string): number => Number(id.slice(2, 6));

const walkPlayableStory = (): Readonly<{ scenes: readonly string[]; levels: readonly string[]; endingId: string | null }> => {
  const scenes: string[] = [];
  const levels: string[] = [];
  let sceneId: typeof storyGraph.entrySceneId | null = storyGraph.entrySceneId;
  let endingId: string | null = null;
  const visited = new Set<string>();

  while (sceneId) {
    if (visited.has(sceneId)) throw new Error(`story transition cycle at ${sceneId}`);
    visited.add(sceneId);
    scenes.push(sceneId);
    const scene = storyGraph.scenes.find((candidate) => candidate.id === sceneId);
    if (!scene) throw new Error(`missing graph scene ${sceneId}`);

    if (scene.transition.kind === 'scene') {
      sceneId = scene.transition.targetSceneId;
      continue;
    }
    if (scene.transition.kind === 'match3') {
      levels.push(scene.transition.levelId);
      sceneId = scene.transition.onWinSceneId;
      continue;
    }
    endingId = scene.transition.endingId;
    sceneId = null;
  }

  return { scenes, levels, endingId };
};

describe('ANM-027D canonical story runtime import and transition QA', () => {
  it('makes the audited ANM-003 source the single normalized line collection used by runtime', () => {
    expect(canonicalStoryManifest.sourceId).toBe('ANM003_VERTICAL_SLICE');
    expect(canonicalStoryManifest.sourcePath).toBe('src/content/ANM-003_Vertical_Slice_Screenplay.md');
    expect(canonicalStoryLineCount).toBe(262);
    expect(canonicalRuntimeStoryLineCount).toBe(261);
    expect(canonicalDeferredStoryLineIds).toEqual(['VN0250']);
    expect(canonicalStoryLines[0]?.id).toBe('VN0001');
    expect(canonicalStoryLines.at(-1)?.id).toBe('VN0250');
  });

  it('cuts narrative runtime over to the audited parser and graph ranges with no duplicate parser/range tables', () => {
    const narrative = readFileSync(resolve(process.cwd(), 'src/data/narrative.ts'), 'utf8');
    const graph = readFileSync(resolve(process.cwd(), 'src/data/storyGraph.ts'), 'utf8');

    expect(narrative).toContain("from '../content/storyRuntime'");
    expect(narrative).toContain("from './storyGraph'");
    expect(narrative).toContain('storySceneFromLegacyIndex(index)');
    expect(narrative).not.toContain('sceneStarts');
    expect(narrative).not.toContain('sceneEnds');
    expect(narrative).not.toContain('screenplay.matchAll');
    expect(narrative).not.toContain('const linePattern');

    expect(graph).not.toContain("from './narrative'");
    expect(graph).not.toContain('sceneMeta[');
  });

  it('keeps presentation metadata aligned 1:1 with canonical graph scene ids', () => {
    expect(sceneMeta.map((scene) => scene.id)).toEqual(storyGraph.scenes.map((scene) => scene.id));
    expect(validateStoryGraph()).toEqual([]);
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('imports every playable scene boundary for branch %s', (choice) => {
    for (const graphScene of storyGraph.scenes) {
      const scene = getScene(graphScene.legacyIndex, choice);
      expect(scene.length).toBeGreaterThan(0);
      expect(numeric(scene[0].id)).toBe(numeric(graphScene.source.startLineId));
      expect(numeric(scene.at(-1)!.id)).toBe(numeric(graphScene.source.endLineId));
    }
  });

  it('walks the complete authored playable path through all VN and Match-3 handoffs exactly once', () => {
    const path = walkPlayableStory();
    expect(path.scenes).toEqual(storyGraph.scenes.map((scene) => scene.id));
    expect(path.levels).toEqual([
      'M3_00_LOCKER_TUTORIAL',
      'M3_01_PHOTO_PROPS',
      'M3_02_POOL_LAUNDRY',
      'M3_03_ORDERED_APARTMENT',
    ]);
    expect(path.endingId).toBe('ENDING_CASE_001');
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
