import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('ANM-023G8B Story completion browser contract', () => {
  it('provides a visible QA entry but keeps victory owned by Match3Game', () => {
    const fixture = read('src/data/storyFlowQa.ts');
    const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');
    const app = read('src/ui/AnimeDetectiveApp.ts');

    expect(diagnostics).toContain('id="story-win-qa"');
    expect(diagnostics).toContain('один настоящий ход → evidence → VN');
    expect(diagnostics).toContain('QA Story win сбросит текущий Story progress');
    expect(app).toContain('this.session.reset()');
    expect(app).toContain('withStoryWinQaLevel((levelIndex) => this.match3.startMatch(levelIndex))');

    expect(fixture).toContain('STORY_WIN_QA_SWAP = { first: 2, second: 10 }');
    expect(fixture).toContain("objectives: [");
    expect(fixture).toContain("{ kind: 'clearBlockers', target: 1");
    expect(fixture).not.toContain('forceWin');
    expect(app).not.toContain('__UPDS_TEST__');
  });

  it('covers evidence, canonical post-win VN and reload Continue in Chromium', () => {
    const spec = read('e2e/tests/story-completion.pw.ts');
    const config = read('e2e/playwright.config.ts');

    expect(spec).toContain('qaSelectors.storyWinQaButton');
    expect(spec).toContain('[data-cell="2"]');
    expect(spec).toContain('[data-cell="10"]');
    expect(spec).toContain('qaSelectors.evidenceTransition');
    expect(spec).toContain("toBe('VN0058')");
    expect(spec).toContain('page.reload()');
    expect(spec).toContain('qaSelectors.continueGame');

    expect(config).not.toContain('/story-completion\\.pw\\.ts/');
    expect(spec).not.toContain('localStorage');
    expect(spec).not.toContain('__UPDS_TEST__');
    expect(spec).not.toContain('forceWin');
  });
});
