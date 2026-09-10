import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const selectors = read('e2e/selectors.ts');
const helper = read('e2e/helpers/match3.ts');
const spec = read('e2e/tests/match3.pw.ts');
const playwrightConfig = read('e2e/playwright.config.ts');

describe('ANM-023G5 Match-3 browser E2E contract', () => {
  it('uses visible Campaign and Level Lab routes without browser-only gameplay shortcuts', () => {
    expect(helper).toContain('resetBrowserState(page)');
    expect(helper).toContain('match3CampaignButton');
    expect(helper).toContain('levelLabButton');
    expect(helper).toContain('levelLabPlay');
    expect(helper).toContain('match3Screen');
    expect(helper).toContain('match3Board');

    for (const source of [helper, spec]) {
      expect(source).not.toContain('Match3Controller');
      expect(source).not.toContain('Match3Game');
      expect(source).not.toContain('localStorage.setItem');
      expect(source).not.toContain('__UPDS_TEST__');
      expect(source).not.toContain('forceWin');
    }
  });

  it('keeps the Match-3 automation selector API explicit', () => {
    for (const token of [
      "match3Moves: '.moves-left b'",
      "match3StageId: '.stage-meta b'",
      "match3ObjectiveValue: '.objectives .objective b'",
      "match3Hint: '#hint'",
      "match3HintedCell: '.board-cell.hinted[data-cell]'",
      "match3Tile: '.tile[data-tile-variant]'",
      "match3Special: '.special'",
      "match3Feedback: '#match-feedback'",
      "match3Bark: '.field-bark'",
      "levelLabInitialTiles: '#lab-initial-tiles-json'",
      "levelLabObjectives: '#lab-objectives-json'",
      "levelLabApply: '#lab-apply'",
      "levelLabPlay: '#lab-play'",
    ]) {
      expect(selectors).toContain(token);
    }
  });

  it('builds deterministic browser fixtures only through the visible Level Lab editor', () => {
    for (const token of [
      'levelLabInitialTiles',
      'levelLabBlockers',
      'levelLabIngredients',
      'levelLabObjectives',
      'levelLabApply',
      'levelLabValidation',
      'levelLabPlay',
    ]) {
      expect(helper).toContain(token);
    }

    expect(helper).toContain('deterministicLabSeed = 7');
    expect(helper).toContain('deterministicCascadeSeed = 424242');
    expect(helper).toContain("fill(JSON.stringify(deterministicInitialTiles))");
    expect(helper).toContain("fill(JSON.stringify(objectives))");
  });

  it('keeps representative mechanics journeys executable in Chromium and mobile WebKit', () => {
    for (const token of [
      'Campaign starts the production first level on the shared board',
      'inactivity hint updates the stable Match-3 screen and board in place',
      'real pointer drag previews threshold state',
      'objective-aware Hint resolves a real legal move',
      'a deterministic cascade uses production clear/settle/refill rules',
      'invalid swap is side-effect free',
      'activates flash-row',
    ]) {
      expect(spec).toContain(token);
    }

    expect(spec).toContain('toHaveCount(64)');
    expect(spec).toContain('progressBeforeActivation');
    expect(spec).toContain('toBeGreaterThan(progressBeforeActivation)');
    expect(playwrightConfig).toContain('/match3\\.pw\\.ts/');
  });
});
