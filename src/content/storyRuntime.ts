import verticalSliceScreenplay from './ANM-003_Vertical_Slice_Screenplay.md?raw';
import episodes0406Screenplay from './ANM-027G_Episodes_04_06_Screenplay.md?raw';
import verticalSliceManifestJson from './story/ANM003.vertical-slice.story.json';
import episodes0406ManifestJson from './story/ANM027G.episodes-04-06.story.json';
import { storyGraph } from '../data/storyGraph';
import {
  auditStoryContent,
  type StoryContentAudit,
  type StoryContentLine,
  type StoryContentManifest,
} from './storyContentFormat';

export const canonicalStoryManifest = verticalSliceManifestJson as StoryContentManifest;
export const canonicalStoryManifests = [
  canonicalStoryManifest,
  episodes0406ManifestJson as StoryContentManifest,
] as const;

const sources = [verticalSliceScreenplay, episodes0406Screenplay] as const;
const canonicalStoryAudits: readonly StoryContentAudit[] = canonicalStoryManifests.map((manifest, index) =>
  auditStoryContent(sources[index], manifest, storyGraph),
);

const issues = canonicalStoryAudits.flatMap((audit, index) =>
  audit.issues.map((issue) => `${canonicalStoryManifests[index].sourceId}: ${issue.code}: ${issue.detail}`),
);
if (issues.length > 0) throw new Error(`Canonical story content failed audit: ${issues.join('; ')}`);

/** Audited normalized screenplay lines from every canonical production batch. */
export const canonicalStoryLines: readonly StoryContentLine[] = canonicalStoryAudits.flatMap((audit) => audit.lines);
export const canonicalStoryLineCount = canonicalStoryLines.length;
export const canonicalRuntimeStoryLineCount = canonicalStoryAudits.reduce((sum, audit) => sum + audit.assignedLineIds.size, 0);
export const canonicalDeferredStoryLineIds = canonicalStoryAudits.flatMap((audit) => [...audit.deferredLineIds]) as readonly string[];
