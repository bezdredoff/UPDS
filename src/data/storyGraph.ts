import { levels } from './levels';
import { sceneMeta } from './narrative';

export const storyEpisodeIds = ['EP001_CASE_001'] as const;
export type StoryEpisodeId = (typeof storyEpisodeIds)[number];

export const storyChapterIds = [
  'CH001_PROLOGUE',
  'CH002_LOCKER_SEARCH',
  'CH003_PHOTO_ALIBI',
  'CH004_POOL_LAUNDRY',
  'CH005_ORDERED_INSPECTION',
] as const;
export type StoryChapterId = (typeof storyChapterIds)[number];

export const storySceneIds = [
  'VN_SCENE_00_PROLOGUE',
  'VN_SCENE_01_E0_PRE',
  'VN_SCENE_02_E0_POST',
  'VN_SCENE_03_E1_PRE',
  'VN_SCENE_04_E1_POST',
  'VN_SCENE_05_E2_PRE',
  'VN_SCENE_06_E2_POST',
  'VN_SCENE_07_E3_PRE',
  'VN_SCENE_08_E3_POST',
] as const;
export type StorySceneId = (typeof storySceneIds)[number];

export const storyEndingIds = ['ENDING_CASE_001'] as const;
export type StoryEndingId = (typeof storyEndingIds)[number];

export type StorySourceRange = Readonly<{
  format: 'screenplay-range-v1';
  startLineId: string;
  endLineId: string;
}>;

export type StoryTransition =
  | Readonly<{ kind: 'scene'; targetSceneId: StorySceneId }>
  | Readonly<{ kind: 'match3'; levelId: string; onWinSceneId: StorySceneId }>
  | Readonly<{ kind: 'ending'; endingId: StoryEndingId }>;

export type StorySceneDefinition = Readonly<{
  id: StorySceneId;
  episodeId: StoryEpisodeId;
  chapterId: StoryChapterId;
  legacyIndex: number;
  source: StorySourceRange;
  transition: StoryTransition;
}>;

export type StoryChapterDefinition = Readonly<{
  id: StoryChapterId;
  episodeId: StoryEpisodeId;
  order: number;
  sceneIds: readonly StorySceneId[];
}>;

export type StoryEpisodeDefinition = Readonly<{
  id: StoryEpisodeId;
  order: number;
  chapterIds: readonly StoryChapterId[];
}>;

export type StoryGraph = Readonly<{
  format: 'upds-story-graph-v1';
  entrySceneId: StorySceneId;
  episodes: readonly StoryEpisodeDefinition[];
  chapters: readonly StoryChapterDefinition[];
  scenes: readonly StorySceneDefinition[];
}>;

export const storyGraph: StoryGraph = {
  format: 'upds-story-graph-v1',
  entrySceneId: 'VN_SCENE_00_PROLOGUE',
  episodes: [
    {
      id: 'EP001_CASE_001',
      order: 0,
      chapterIds: [
        'CH001_PROLOGUE',
        'CH002_LOCKER_SEARCH',
        'CH003_PHOTO_ALIBI',
        'CH004_POOL_LAUNDRY',
        'CH005_ORDERED_INSPECTION',
      ],
    },
  ],
  chapters: [
    { id: 'CH001_PROLOGUE', episodeId: 'EP001_CASE_001', order: 0, sceneIds: ['VN_SCENE_00_PROLOGUE'] },
    { id: 'CH002_LOCKER_SEARCH', episodeId: 'EP001_CASE_001', order: 1, sceneIds: ['VN_SCENE_01_E0_PRE', 'VN_SCENE_02_E0_POST'] },
    { id: 'CH003_PHOTO_ALIBI', episodeId: 'EP001_CASE_001', order: 2, sceneIds: ['VN_SCENE_03_E1_PRE', 'VN_SCENE_04_E1_POST'] },
    { id: 'CH004_POOL_LAUNDRY', episodeId: 'EP001_CASE_001', order: 3, sceneIds: ['VN_SCENE_05_E2_PRE', 'VN_SCENE_06_E2_POST'] },
    { id: 'CH005_ORDERED_INSPECTION', episodeId: 'EP001_CASE_001', order: 4, sceneIds: ['VN_SCENE_07_E3_PRE', 'VN_SCENE_08_E3_POST'] },
  ],
  scenes: [
    {
      id: 'VN_SCENE_00_PROLOGUE',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH001_PROLOGUE',
      legacyIndex: 0,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0001', endLineId: 'VN0022' },
      transition: { kind: 'scene', targetSceneId: 'VN_SCENE_01_E0_PRE' },
    },
    {
      id: 'VN_SCENE_01_E0_PRE',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH002_LOCKER_SEARCH',
      legacyIndex: 1,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0023', endLineId: 'VN0057' },
      transition: { kind: 'match3', levelId: 'M3_00_LOCKER_TUTORIAL', onWinSceneId: 'VN_SCENE_02_E0_POST' },
    },
    {
      id: 'VN_SCENE_02_E0_POST',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH002_LOCKER_SEARCH',
      legacyIndex: 2,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0058', endLineId: 'VN0084' },
      transition: { kind: 'scene', targetSceneId: 'VN_SCENE_03_E1_PRE' },
    },
    {
      id: 'VN_SCENE_03_E1_PRE',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH003_PHOTO_ALIBI',
      legacyIndex: 3,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0085', endLineId: 'VN0113' },
      transition: { kind: 'match3', levelId: 'M3_01_PHOTO_PROPS', onWinSceneId: 'VN_SCENE_04_E1_POST' },
    },
    {
      id: 'VN_SCENE_04_E1_POST',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH003_PHOTO_ALIBI',
      legacyIndex: 4,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0114', endLineId: 'VN0142' },
      transition: { kind: 'scene', targetSceneId: 'VN_SCENE_05_E2_PRE' },
    },
    {
      id: 'VN_SCENE_05_E2_PRE',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH004_POOL_LAUNDRY',
      legacyIndex: 5,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0143', endLineId: 'VN0166' },
      transition: { kind: 'match3', levelId: 'M3_02_POOL_LAUNDRY', onWinSceneId: 'VN_SCENE_06_E2_POST' },
    },
    {
      id: 'VN_SCENE_06_E2_POST',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH004_POOL_LAUNDRY',
      legacyIndex: 6,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0167', endLineId: 'VN0191' },
      transition: { kind: 'scene', targetSceneId: 'VN_SCENE_07_E3_PRE' },
    },
    {
      id: 'VN_SCENE_07_E3_PRE',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH005_ORDERED_INSPECTION',
      legacyIndex: 7,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0192', endLineId: 'VN0216' },
      transition: { kind: 'match3', levelId: 'M3_03_ORDERED_APARTMENT', onWinSceneId: 'VN_SCENE_08_E3_POST' },
    },
    {
      id: 'VN_SCENE_08_E3_POST',
      episodeId: 'EP001_CASE_001',
      chapterId: 'CH005_ORDERED_INSPECTION',
      legacyIndex: 8,
      source: { format: 'screenplay-range-v1', startLineId: 'VN0217', endLineId: 'VN0249' },
      transition: { kind: 'ending', endingId: 'ENDING_CASE_001' },
    },
  ],
};

export type StoryGraphIssue = Readonly<{
  code:
    | 'duplicate-id'
    | 'unknown-reference'
    | 'legacy-index'
    | 'scene-meta-mismatch'
    | 'invalid-source-range'
    | 'unreachable-scene'
    | 'match3-coverage'
    | 'terminal-count';
  detail: string;
}>;

const numericLineId = (lineId: string): number | null => {
  const match = /^VN(\d{4})(?:[ABC])?$/.exec(lineId);
  return match ? Number(match[1]) : null;
};

export const storySceneById = (sceneId: StorySceneId): StorySceneDefinition | undefined =>
  storyGraph.scenes.find((scene) => scene.id === sceneId);

export const storySceneFromLegacyIndex = (legacyIndex: number): StorySceneDefinition | undefined =>
  storyGraph.scenes.find((scene) => scene.legacyIndex === legacyIndex);

export const storySceneIdFromLegacyIndex = (legacyIndex: number): StorySceneId | null =>
  storySceneFromLegacyIndex(legacyIndex)?.id ?? null;

export const legacySceneIndexFromStoryId = (sceneId: StorySceneId): number =>
  storySceneById(sceneId)?.legacyIndex ?? -1;

export const storyTransitionForLegacyScene = (legacyIndex: number): StoryTransition | null =>
  storySceneFromLegacyIndex(legacyIndex)?.transition ?? null;

export type StoryMatch3Route = Readonly<{
  sourceSceneId: StorySceneId;
  sourceLegacyIndex: number;
  levelId: string;
  levelIndex: number;
  onWinSceneId: StorySceneId;
  onWinLegacyIndex: number;
}>;

const match3RouteFromScene = (scene: StorySceneDefinition): StoryMatch3Route | null => {
  const transition = scene.transition;
  if (transition.kind !== 'match3') return null;
  return {
    sourceSceneId: scene.id,
    sourceLegacyIndex: scene.legacyIndex,
    levelId: transition.levelId,
    levelIndex: levels.findIndex((level) => level.id === transition.levelId),
    onWinSceneId: transition.onWinSceneId,
    onWinLegacyIndex: legacySceneIndexFromStoryId(transition.onWinSceneId),
  };
};

export const storyMatch3RouteForLegacyScene = (legacyIndex: number): StoryMatch3Route | null => {
  const scene = storySceneFromLegacyIndex(legacyIndex);
  return scene ? match3RouteFromScene(scene) : null;
};

export const storyMatch3RouteForLevelId = (levelId: string): StoryMatch3Route | null => {
  const scene = storyGraph.scenes.find(
    (candidate) => candidate.transition.kind === 'match3' && candidate.transition.levelId === levelId,
  );
  return scene ? match3RouteFromScene(scene) : null;
};

export const storyWinSceneIndexForLevelId = (levelId: string): number =>
  storyMatch3RouteForLevelId(levelId)?.onWinLegacyIndex ?? -1;

export function validateStoryGraph(graph: StoryGraph = storyGraph): readonly StoryGraphIssue[] {
  const issues: StoryGraphIssue[] = [];
  const seenIds = new Set<string>();
  const register = (id: string, scope: string): void => {
    if (seenIds.has(id)) issues.push({ code: 'duplicate-id', detail: `${scope}: duplicate id ${id}` });
    seenIds.add(id);
  };

  for (const episode of graph.episodes) register(episode.id, 'episode');
  for (const chapter of graph.chapters) register(chapter.id, 'chapter');
  for (const scene of graph.scenes) register(scene.id, 'scene');

  const episodeIds = new Set(graph.episodes.map((episode) => episode.id));
  const chapterIds = new Set(graph.chapters.map((chapter) => chapter.id));
  const sceneIds = new Set(graph.scenes.map((scene) => scene.id));
  const productionLevelIds = new Set(levels.map((level) => level.id));

  for (const episode of graph.episodes) {
    for (const chapterId of episode.chapterIds) {
      if (!chapterIds.has(chapterId)) issues.push({ code: 'unknown-reference', detail: `${episode.id}: unknown chapter ${chapterId}` });
    }
  }

  for (const chapter of graph.chapters) {
    if (!episodeIds.has(chapter.episodeId)) issues.push({ code: 'unknown-reference', detail: `${chapter.id}: unknown episode ${chapter.episodeId}` });
    for (const sceneId of chapter.sceneIds) {
      if (!sceneIds.has(sceneId)) issues.push({ code: 'unknown-reference', detail: `${chapter.id}: unknown scene ${sceneId}` });
    }
  }

  const legacyIndices = graph.scenes.map((scene) => scene.legacyIndex).sort((left, right) => left - right);
  const expectedLegacyIndices = Array.from({ length: graph.scenes.length }, (_, index) => index);
  if (legacyIndices.join(',') !== expectedLegacyIndices.join(',')) {
    issues.push({ code: 'legacy-index', detail: `legacy scene indices must stay contiguous: ${legacyIndices.join(',')}` });
  }

  for (const scene of graph.scenes) {
    if (!episodeIds.has(scene.episodeId)) issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown episode ${scene.episodeId}` });
    if (!chapterIds.has(scene.chapterId)) issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown chapter ${scene.chapterId}` });

    const meta = sceneMeta[scene.legacyIndex];
    if (!meta || meta.id !== scene.id) {
      issues.push({ code: 'scene-meta-mismatch', detail: `${scene.id}: legacy sceneMeta[${scene.legacyIndex}] does not match` });
    }

    const start = numericLineId(scene.source.startLineId);
    const end = numericLineId(scene.source.endLineId);
    if (start === null || end === null || start > end) {
      issues.push({ code: 'invalid-source-range', detail: `${scene.id}: invalid source range ${scene.source.startLineId}..${scene.source.endLineId}` });
    }

    const transition = scene.transition;
    if (transition.kind === 'scene' && !sceneIds.has(transition.targetSceneId)) {
      issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown next scene ${transition.targetSceneId}` });
    }
    if (transition.kind === 'match3') {
      if (!productionLevelIds.has(transition.levelId)) {
        issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown Match-3 level ${transition.levelId}` });
      }
      if (!sceneIds.has(transition.onWinSceneId)) {
        issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown Match-3 win scene ${transition.onWinSceneId}` });
      }
    }
  }

  const sortedScenes = [...graph.scenes].sort((left, right) => left.legacyIndex - right.legacyIndex);
  for (let index = 1; index < sortedScenes.length; index += 1) {
    const previousEnd = numericLineId(sortedScenes[index - 1].source.endLineId);
    const currentStart = numericLineId(sortedScenes[index].source.startLineId);
    if (previousEnd === null || currentStart === null || currentStart !== previousEnd + 1) {
      issues.push({
        code: 'invalid-source-range',
        detail: `${sortedScenes[index - 1].id} -> ${sortedScenes[index].id}: screenplay ranges must stay contiguous`,
      });
    }
  }

  const reachable = new Set<StorySceneId>();
  let cursor: StorySceneId | null = graph.entrySceneId;
  while (cursor && !reachable.has(cursor)) {
    reachable.add(cursor);
    const scene = graph.scenes.find((candidate) => candidate.id === cursor);
    if (!scene) break;
    cursor = scene.transition.kind === 'scene'
      ? scene.transition.targetSceneId
      : scene.transition.kind === 'match3'
        ? scene.transition.onWinSceneId
        : null;
  }
  for (const scene of graph.scenes) {
    if (!reachable.has(scene.id)) issues.push({ code: 'unreachable-scene', detail: `${scene.id}: unreachable from ${graph.entrySceneId}` });
  }

  const match3Transitions = graph.scenes
    .map((scene) => scene.transition)
    .filter((transition): transition is Extract<StoryTransition, { kind: 'match3' }> => transition.kind === 'match3');
  const routedLevelIds = match3Transitions.map((transition) => transition.levelId).sort();
  const expectedLevelIds = levels.map((level) => level.id).sort();
  if (routedLevelIds.join(',') !== expectedLevelIds.join(',')) {
    issues.push({ code: 'match3-coverage', detail: `story Match-3 routes=${routedLevelIds.join(',')} production=${expectedLevelIds.join(',')}` });
  }

  const terminalCount = graph.scenes.filter((scene) => scene.transition.kind === 'ending').length;
  if (terminalCount !== 1) issues.push({ code: 'terminal-count', detail: `expected exactly one ending transition, got ${terminalCount}` });

  return issues;
}
