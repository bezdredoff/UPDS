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

  it('records the shared production-controller parity instead of treating QA tools as alternate games', () => {
    const app = read('src/ui/AnimeDetectiveApp.ts');
    const harnessContract = read('tests/BrowserAutomationHarnessContract.test.ts');

    expect(app.match(/new VnController/g)?.length ?? 0).toBe(1);
    expect(app.match(/new Match3Controller/g)?.length ?? 0).toBe(1);
    expect(harnessContract).toContain('keeps QA Scene Navigation on the same production VN controller and frame');
    expect(harnessContract).toContain('keeps Story, Match-3 Campaign and Level Lab on one production Match3Controller');
    expect(audit).toContain('QA Scene Navigation → production VN');
    expect(audit).toContain('Match-3 Campaign / Level Lab / Story → production Match-3');
  });

  it('traces the remaining audited browser-only boundaries to the real production code that owns them', () => {
    const match3 = read('src/features/match3/Match3Controller.ts');
    const flow = read('e2e/helpers/flow.ts');
    const match3Helper = read('e2e/helpers/match3.ts');

    expect(flow).toContain('startFirstStoryMatchAndVerifyResumeBoundary');
    expect(match3).toContain('private completeLevel(): void');
    expect(match3).toContain("this.renderCampaignResult('win')");
    expect(match3).toContain("board.addEventListener('pointerdown'");
    expect(match3).toContain("const cell = target.closest<HTMLElement>('[data-cell]');");
    expect(match3).toContain("board.addEventListener('pointermove'");
    expect(match3).toContain("board.addEventListener('pointerup'");
    expect(match3).toContain("this.attemptMatchSwap(pointer.startIndex, targetIndex, false, 'drag')");
    expect(match3Helper).toContain('export async function tapSwap');

    expect(g8b).toContain('Story Match-3 Completion → Evidence → VN');
    expect(audit).toContain('P0 — Match-3 Campaign completion/progression');
    expect(audit).toContain('P0/P1 — Real pointer drag/swipe input');
  });
});
