import type { StoryGraph, StorySceneDefinition } from '../data/storyGraph';

export const STORY_CONTENT_FORMAT = 'upds-story-content-v1' as const;
export type StoryContentFormat = typeof STORY_CONTENT_FORMAT;

export type StoryContentManifest = Readonly<{
  format: StoryContentFormat;
  sourceId: string;
  episodeId: string;
  sourcePath: string;
  expectedBaseRange: Readonly<{ startLineId: string; endLineId: string }>;
  sceneIds?: readonly string[];
  branchVariants: readonly Readonly<{
    startLineId: string;
    endLineId: string;
    variants: readonly string[];
  }>[];
  deferredLineIds: readonly string[];
}>;

export type StoryContentLine = Readonly<{
  id: string;
  speaker: string;
  emotion: string;
  text: string;
}>;

export type StoryContentIssueCode =
  | 'manifest-format'
  | 'invalid-line-id'
  | 'duplicate-line-id'
  | 'base-range-gap'
  | 'branch-variant'
  | 'scene-range'
  | 'unassigned-line'
  | 'deferred-line'
  | 'episode-mismatch';

export type StoryContentIssue = Readonly<{
  code: StoryContentIssueCode;
  detail: string;
}>;

export type StoryContentAudit = Readonly<{
  lines: readonly StoryContentLine[];
  assignedLineIds: ReadonlySet<string>;
  deferredLineIds: ReadonlySet<string>;
  issues: readonly StoryContentIssue[];
}>;

const linePattern = /`\[(VN\d{4}[A-Z]?)\]\s*([^|]+)\|\s*([^|]+)\|\s*([^`]+)`/g;
const lineIdPattern = /^VN(\d{4})([A-Z]?)$/;

const parseId = (lineId: string): Readonly<{ number: number; suffix: string }> | null => {
  const match = lineIdPattern.exec(lineId);
  return match ? { number: Number(match[1]), suffix: match[2] } : null;
};

export function parseStoryContentLines(source: string): readonly StoryContentLine[] {
  const lines: StoryContentLine[] = [];
  for (const match of source.matchAll(linePattern)) {
    lines.push({
      id: match[1],
      speaker: match[2].trim(),
      emotion: match[3].trim(),
      text: match[4].trim(),
    });
  }
  return lines;
}

const sceneContainsLine = (scene: StorySceneDefinition, lineId: string): boolean => {
  const value = parseId(lineId)?.number;
  const start = parseId(scene.source.startLineId)?.number;
  const end = parseId(scene.source.endLineId)?.number;
  return value !== undefined && start !== undefined && end !== undefined && value >= start && value <= end;
};

export function auditStoryContent(
  source: string,
  manifest: StoryContentManifest,
  graph: StoryGraph,
): StoryContentAudit {
  const issues: StoryContentIssue[] = [];
  const lines = parseStoryContentLines(source);
  const lineIds = new Set<string>();
  const byNumber = new Map<number, StoryContentLine[]>();

  if (manifest.format !== STORY_CONTENT_FORMAT) {
    issues.push({ code: 'manifest-format', detail: `expected ${STORY_CONTENT_FORMAT}, got ${manifest.format}` });
  }
  if (!graph.episodes.some((episode) => episode.id === manifest.episodeId)) {
    issues.push({ code: 'episode-mismatch', detail: `${manifest.episodeId} is not present in story graph` });
  }

  for (const line of lines) {
    const parsed = parseId(line.id);
    if (!parsed) {
      issues.push({ code: 'invalid-line-id', detail: `invalid line id ${line.id}` });
      continue;
    }
    if (lineIds.has(line.id)) issues.push({ code: 'duplicate-line-id', detail: `duplicate line id ${line.id}` });
    lineIds.add(line.id);
    const group = byNumber.get(parsed.number) ?? [];
    group.push(line);
    byNumber.set(parsed.number, group);
  }

  const baseStart = parseId(manifest.expectedBaseRange.startLineId)?.number;
  const baseEnd = parseId(manifest.expectedBaseRange.endLineId)?.number;
  if (baseStart === undefined || baseEnd === undefined || baseStart > baseEnd) {
    issues.push({ code: 'invalid-line-id', detail: 'manifest expectedBaseRange is invalid' });
  } else {
    for (let number = baseStart; number <= baseEnd; number += 1) {
      if (!byNumber.has(number)) {
        issues.push({ code: 'base-range-gap', detail: `missing base line VN${String(number).padStart(4, '0')}` });
      }
    }
  }

  for (const branch of manifest.branchVariants) {
    const start = parseId(branch.startLineId)?.number;
    const end = parseId(branch.endLineId)?.number;
    if (start === undefined || end === undefined || start > end || branch.variants.length === 0) {
      issues.push({ code: 'branch-variant', detail: `invalid branch range ${branch.startLineId}..${branch.endLineId}` });
      continue;
    }
    const expectedVariants = [...branch.variants].sort().join(',');
    for (let number = start; number <= end; number += 1) {
      const variants = (byNumber.get(number) ?? [])
        .map((line) => parseId(line.id)?.suffix ?? '')
        .filter(Boolean)
        .sort()
        .join(',');
      if (variants !== expectedVariants) {
        issues.push({
          code: 'branch-variant',
          detail: `VN${String(number).padStart(4, '0')} variants=${variants || 'none'} expected=${expectedVariants}`,
        });
      }
    }
  }

  const sourceScenes = manifest.sceneIds?.length
    ? graph.scenes.filter((scene) => manifest.sceneIds!.includes(scene.id))
    : graph.scenes;

  for (const scene of sourceScenes) {
    const sceneLines = lines.filter((line) => sceneContainsLine(scene, line.id));
    if (sceneLines.length === 0) {
      issues.push({ code: 'scene-range', detail: `${scene.id} has no content lines` });
      continue;
    }
    const firstNumber = Math.min(...sceneLines.map((line) => parseId(line.id)!.number));
    const lastNumber = Math.max(...sceneLines.map((line) => parseId(line.id)!.number));
    const expectedStart = parseId(scene.source.startLineId)!.number;
    const expectedEnd = parseId(scene.source.endLineId)!.number;
    if (firstNumber !== expectedStart || lastNumber !== expectedEnd) {
      issues.push({
        code: 'scene-range',
        detail: `${scene.id} content=${firstNumber}..${lastNumber} expected=${expectedStart}..${expectedEnd}`,
      });
    }
  }

  const deferred = new Set(manifest.deferredLineIds);
  for (const lineId of deferred) {
    if (!lineIds.has(lineId)) issues.push({ code: 'deferred-line', detail: `deferred line ${lineId} does not exist` });
    if (sourceScenes.some((scene) => sceneContainsLine(scene, lineId))) {
      issues.push({ code: 'deferred-line', detail: `deferred line ${lineId} is already assigned to a runtime scene` });
    }
  }

  const assigned = new Set(
    lines
      .filter((line) => sourceScenes.some((scene) => sceneContainsLine(scene, line.id)))
      .map((line) => line.id),
  );

  for (const line of lines) {
    if (!assigned.has(line.id) && !deferred.has(line.id)) {
      issues.push({ code: 'unassigned-line', detail: `${line.id} is outside graph scenes and not explicitly deferred` });
    }
  }

  return { lines, assignedLineIds: assigned, deferredLineIds: deferred, issues };
}
