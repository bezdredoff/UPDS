import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');
const spec = read('e2e/tests/story-completion.pw.ts');
const selectors = read('e2e/selectors.ts');
const config = read('e2e/playwright.config.ts');
const fixtureTest = read('tests/StoryWinQaFixture.test.ts');

describe('ANM-023G8B Story completion browser contract', () => {
  it('keeps the deterministic setup backed by a real Match3Game result instead of browser shortcuts', () => {
    expect(fixtureTest).toContain("import { Match3Game } from '../src/engine/Match3Game';");
    expect(fixtureTest).toContain('new Match3Game(');
    expect(fixtureTest).toContain('.attemptSwap(');
    expect(fixtureTest).toContain('expect(result.won).toBe(true)');
    expect(fixtureTest).toContain('expect(levels[STORY_WIN_QA_LEVEL_INDEX]).toBe(canonical)');

    expect(spec).toContain('qaSelectors.storyWinQaButton');
    for (const shortcut of ['localStorage', '__UPDS_TEST__', 'forceWin', 'Match3Controller']) {
      expect(spec).not.toContain(shortcut);
    }
  });

  it('keeps the player-visible completion journey and reload boundary in the browser suite', () => {
    for (const selector of [
      'storyWinQaButton',
      'match3Screen',
      'match3StageId',
      'match3Moves',
      'match3Objectives',
      'match3Cell',
      'evidenceTransition',
      'evidenceContinue',
      'vnRuntimeFrame',
      'mainMenu',
      'continueGame',
    ]) {
      expect(spec).toContain(`qaSelectors.${selector}`);
    }

    expect(spec).toContain("toBe('VN0058')");
    expect(spec).toContain('page.reload()');
    expect(selectors).toContain("storyWinQaButton: '#story-win-qa'");
    expect(config).toContain('testMatch: /.*\\.pw\\.ts/');
    expect(config).not.toContain('/story-completion\\.pw\\.ts/');
  });
});
