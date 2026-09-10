import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8');
const audit = read('docs/features/ANM023G8A_PLAYWRIGHT_COVERAGE_AUDIT_RU.md');
const g8b = read('docs/features/ANM023G8B_STORY_COMPLETION_FLOW_RU.md');
const playwrightConfig = read('e2e/playwright.config.ts');

const historicalG8aSpecs = [
  ['boot.pw.ts', 1],
  ['pages-smoke.pw.ts', 2],
  ['harness.pw.ts', 3],
  ['vn-navigation.pw.ts', 3],
  ['match3.pw.ts', 4],
  ['persistence-localization-flow.pw.ts', 3],
  ['visual-regression.pw.ts', 4],
] as const;

describe('ANM-023G8A Playwright coverage audit contract', () => {
  it('preserves the completed G8A historical baseline without coupling it to the live spec inventory', () => {
    for (const [spec, cases] of historicalG8aSpecs) {
      expect(audit).toContain(`| \`${spec}\` | ${cases} |`);
    }

    expect(audit).toContain('7 Playwright spec-файлов и 20 Chromium cases');
    expect(audit).toContain('15 cases');
    expect(audit).toContain('No current spec is recommended for deletion in G8A.');
    expect(audit).not.toContain('Selenium is recommended');
    expect(playwrightConfig).toContain("testMatch: /.*\\.pw\\.ts/");
  });

  it('preserves the historical QA-to-production parity decisions without rechecking current source shape', () => {
    expect(audit).toContain('QA Scene Navigation → production VN');
    expect(audit).toContain('Match-3 Campaign / Level Lab / Story → production Match-3');
    expect(audit).toContain('there is no `QAVnController` or browser-only VN implementation');
    expect(audit).toContain('mode differences are explicit state/lifecycle differences');
  });

  it('preserves the audited browser gaps and traces completed Story completion separately', () => {
    expect(g8b).toContain('Story Match-3 Completion → Evidence → VN');
    expect(g8b).toContain('StoryWinQaFixture.test.ts');
    expect(g8b).toContain('BrowserStoryCompletionE2EContract.test.ts');
    expect(audit).toContain('P0 — Match-3 Campaign completion/progression');
    expect(audit).toContain('P0/P1 — Real pointer drag/swipe input');
  });
});
