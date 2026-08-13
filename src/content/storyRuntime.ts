import screenplay from './ANM-003_Vertical_Slice_Screenplay.md?raw';
import manifestJson from './story/ANM003.vertical-slice.story.json';
import { storyGraph } from '../data/storyGraph';
import {
  auditStoryContent,
  type StoryContentAudit,
  type StoryContentLine,
  type StoryContentManifest,
} from './storyContentFormat';

export const canonicalStoryManifest = manifestJson as StoryContentManifest;

const canonicalStoryAudit: StoryContentAudit = auditStoryContent(
  screenplay,
  canonicalStoryManifest,
  storyGraph,
);

if (canonicalStoryAudit.issues.length > 0) {
  throw new Error(
    `Canonical story content failed audit: ${canonicalStoryAudit.issues
      .map((issue) => `${issue.code}: ${issue.detail}`)
      .join('; ')}`,
  );
}

/**
 * The only normalized screenplay line collection consumed by the VN runtime.
 * Source Markdown, manifest and graph ranges are audited together before export.
 */
export const canonicalStoryLines: readonly StoryContentLine[] = canonicalStoryAudit.lines;

export const canonicalStoryLineCount = canonicalStoryLines.length;
export const canonicalRuntimeStoryLineCount = canonicalStoryAudit.assignedLineIds.size;
export const canonicalDeferredStoryLineIds = [...canonicalStoryAudit.deferredLineIds] as readonly string[];
