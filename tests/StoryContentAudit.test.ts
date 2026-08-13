import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import manifestJson from '../src/content/story/ANM003.vertical-slice.story.json';
import {
  auditStoryContent,
  parseStoryContentLines,
  STORY_CONTENT_FORMAT,
  type StoryContentManifest,
} from '../src/content/storyContentFormat';
import { storyGraph } from '../src/data/storyGraph';

const screenplay = readFileSync(resolve(process.cwd(), manifestJson.sourcePath), 'utf8');
const manifest = manifestJson as StoryContentManifest;

describe('ANM-027C story content import and completeness tooling', () => {
  it('audits the current screenplay as a complete import source without changing runtime', () => {
    const audit = auditStoryContent(screenplay, manifest, storyGraph);
    expect(manifest.format).toBe(STORY_CONTENT_FORMAT);
    expect(audit.issues).toEqual([]);
    expect(audit.lines).toHaveLength(262);
    expect(audit.assignedLineIds.size).toBe(261);
    expect([...audit.deferredLineIds]).toEqual(['VN0250']);
  });

  it('makes the current three-way CHOICE_00 branch explicit and complete', () => {
    const lines = parseStoryContentLines(screenplay);
    for (let number = 41; number <= 46; number += 1) {
      const prefix = `VN${String(number).padStart(4, '0')}`;
      expect(lines.filter((line) => line.id.startsWith(prefix)).map((line) => line.id).sort()).toEqual([
        `${prefix}A`,
        `${prefix}B`,
        `${prefix}C`,
      ]);
    }
  });

  it('fails closed on accidental line gaps', () => {
    const broken = screenplay.replace(/`\[VN0100\][^`]+`\n?/, '');
    const issues = auditStoryContent(broken, manifest, storyGraph).issues;
    expect(issues.some((issue) => issue.code === 'base-range-gap' && issue.detail.includes('VN0100'))).toBe(true);
  });

  it('fails closed on incomplete branch variants', () => {
    const broken = screenplay.replace(/`\[VN0043C\][^`]+`\n?/, '');
    const issues = auditStoryContent(broken, manifest, storyGraph).issues;
    expect(issues.some((issue) => issue.code === 'branch-variant' && issue.detail.includes('VN0043'))).toBe(true);
  });

  it('requires content outside runtime graph to be explicitly deferred', () => {
    const withoutDeferred = { ...manifest, deferredLineIds: [] };
    const issues = auditStoryContent(screenplay, withoutDeferred, storyGraph).issues;
    expect(issues).toContainEqual({ code: 'unassigned-line', detail: 'VN0250 is outside graph scenes and not explicitly deferred' });
  });

  it('keeps the audit target available as a focused CI/developer command', () => {
    const packageJson = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as {
      scripts?: Record<string, string>;
    };
    expect(packageJson.scripts?.['story:audit']).toBe('vitest run tests/StoryContentAudit.test.ts');
    expect(packageJson.scripts?.check).toContain('npm run test');
  });
});
