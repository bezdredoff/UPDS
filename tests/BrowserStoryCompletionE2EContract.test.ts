import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('ANM-023G8B Story completion browser contract', () => {
  it('provides a visible QA entry while keeping victory owned by Match3Game', () => {
    const fixture = read('src/data/storyFlowQa.ts');
    const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');
    const app = read('src/ui/AnimeDetectiveApp.ts');
    const match3 = read('src/features/match3/Match3Controller.ts');

    expect(diagnostics).toContain('id="story-win-qa"');
    expect(diagnostics).toContain('нажми Hint и сделай подсвеченный ход → evidence → VN');
    expect(diagnostics).toContain('QA Story win сбросит текущий Story progress');
    expect(app).toContain('this.session.reset()');
    expect(app).toContain('this.match3.startMatch(STORY_WIN_QA_LEVEL_INDEX, storyWinQaLevel)');

    expect(match3).toContain('startMatch(levelIndex: number, levelOverride?: LevelDefinition): void');
    expect(match3).toContain('const level = levelOverride ?? levels[levelIndex];');
    expect(fixture).toContain('STORY_WIN_QA_SWAP = { first: 2, second: 10 }');
    expect(fixture).toContain("{ kind: 'clearBlockers', target: 1");
    expect(fixture).toContain('production `levels` registry is never mutated');
    expect(fixture).not.toContain('withStoryWinQaLevel');
    expect(fixture).not.toContain('mutableLevels');
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
