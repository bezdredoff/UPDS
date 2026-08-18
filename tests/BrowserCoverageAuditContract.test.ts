import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = process.cwd();
const read = (path: string): string => readFileSync(resolve(root, path), 'utf8');
const audit = read('docs/features/ANM023G8A_PLAYWRIGHT_COVERAGE_AUDIT_RU.md');

describe('ANM-023G8A Playwright coverage audit contract', () => {
  it('inventories every current Playwright spec without creating a second browser stack', () => {
    const specs = readdirSync(resolve(root, 'e2e/tests'))
      .filter((name) => name.endsWith('.pw.ts'))
      .sort();

    expect(specs.length).toBeGreaterThan(0);
    for (const spec of specs) expect(audit).toContain(`\`${spec}\``);

    expect(audit).toContain('21 Chromium cases');
    expect(audit).toContain('15 Mobile WebKit critical cases');
    expect(audit).toContain('No current spec is recommended for deletion');
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

  it('traces the audited browser-only boundaries to the real production code that owns them', () => {
    const match3 = read('src/features/match3/Match3Controller.ts');
    const flow = read('e2e/helpers/flow.ts');
    const match3Helper = read('e2e/helpers/match3.ts');

    expect(flow).toContain('startFirstStoryMatchAndVerifyResumeBoundary');
    expect(match3).toContain('private completeLevel(): void');
    expect(match3).toContain("this.renderCampaignResult('win')");
    expect(match3).toContain("cell.addEventListener('pointerdown'");
    expect(match3).toContain("board.addEventListener('pointermove'");
    expect(match3).toContain("board.addEventListener('pointerup'");
    expect(match3).toContain("this.attemptMatchSwap(pointer.startIndex, targetIndex, false, 'drag')");
    expect(match3Helper).toContain('export async function tapSwap');

    expect(audit).toContain('P0 — Story Match-3 completion → evidence → post-win VN');
    expect(audit).toContain('P0 — Match-3 Campaign completion/progression');
    expect(audit).toContain('P0/P1 — Real pointer drag/swipe input');
  });
});
