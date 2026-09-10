import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8');
const audit = read('docs/features/ANM023G8A_PLAYWRIGHT_COVERAGE_AUDIT_RU.md');
const g8b = read('docs/features/ANM023G8B_STORY_COMPLETION_FLOW_RU.md');
const g8e3 = read('docs/features/ANM023G8E3_VN_LAYOUT_STABILITY_RU.md');

describe('ANM-023G8A Playwright coverage audit contract', () => {
  it('preserves the completed G8A baseline while tracing post-audit Playwright additions', () => {
    const specs = readdirSync(resolve(root, 'e2e/tests'))
      .filter((name) => name.endsWith('.pw.ts'))
      .sort();
    const postAuditSpecs = new Set([
      'campaign-spoilers.pw.ts',
      'story-completion.pw.ts',
      'vn-browser-chrome-stability.pw.ts',
      'viewport-recorder.pw.ts',
    ]);
    const g8aBaseline = specs.filter((name) => !postAuditSpecs.has(name));

    expect(g8aBaseline).toHaveLength(7);
    for (const spec of g8aBaseline) expect(audit).toContain(`\`${spec}\``);
    expect(g8b).toContain('`story-completion.pw.ts`');
    expect(g8e3).toContain('`e2e/tests/vn-browser-chrome-stability.pw.ts`');
    expect(read('docs/features/IOS_VIEWPORT_CAPTURE_RU.md')).toContain('`e2e/tests/viewport-recorder.pw.ts`');

    expect(audit).toContain('20 Chromium cases');
    expect(audit).toContain('15 cases');
    expect(g8b).toContain('8 specs / 21 Chromium cases / 15 Mobile WebKit critical cases');
    expect(audit).toContain('No current spec is recommended for deletion in G8A.');
    expect(audit).not.toContain('Selenium is recommended');
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
