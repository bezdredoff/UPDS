import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const selectors = read('e2e/selectors.ts');
const helper = read('e2e/helpers/match3.ts');
const spec = read('e2e/tests/match3.pw.ts');
const app = read('src/ui/AnimeDetectiveApp.ts');
const controller = read('src/features/match3/Match3Controller.ts');
const presentation = read('src/features/match3/Match3Presentation.ts');
const levelLab = read('src/features/levelLab/LevelLabController.ts');
const engineTests = read('tests/Match3Game.test.ts');

describe('ANM-023G5 Match-3 browser E2E contract', () => {
  it('keeps Campaign and Level Lab on the one production Match3Controller', () => {
    expect(app.match(/new Match3Controller/g)?.length ?? 0).toBe(1);
    expect(app).toContain('this.match3.startCampaignMatch');
    expect(app).toContain('this.match3.startLabMatch');
    expect(controller).toContain("if (this.labRun) return 'lab';");
    expect(controller).toContain("if (this.campaignRun) return 'campaign';");
    expect(helper).not.toContain('Match3Game');
    expect(helper).not.toContain('window.__');
    expect(spec).not.toContain('localStorage.setItem');
  });

  it('freezes the existing production DOM hooks used to observe Match-3 mechanics', () => {
    for (const token of [
      "match3Moves: '.moves-left b'",
      "match3StageId: '.stage-meta b'",
      "match3ObjectiveValue: '.objectives .objective b'",
      "match3Hint: '#hint'",
      "match3HintedCell: '.board-cell.hinted[data-cell]'",
      "match3Tile: '.tile[data-tile-variant]'",
      "match3Special: '.special'",
    ]) {
      expect(selectors).toContain(token);
    }

    expect(presentation).toContain('data-tile-variant="${escapeHtml(tile.variantId)}"');
    expect(presentation).toContain('class="moves-left"><b>${movesLeft}</b>');
    expect(presentation).toContain('class="stage-meta"');
    expect(presentation).toContain('id="hint"');
  });

  it('builds the deterministic fixture only through the visible Level Lab draft editor', () => {
    expect(helper).toContain('levelLabInitialTiles');
    expect(helper).toContain('levelLabBlockers');
    expect(helper).toContain('levelLabIngredients');
    expect(helper).toContain('levelLabObjectives');
    expect(helper).toContain('levelLabApply');
    expect(helper).toContain('deterministicLabSeed = 7');
    expect(helper).toContain('deterministicCascadeSeed = 424242');
    expect(levelLab).toContain('id="lab-initial-tiles-json"');
    expect(levelLab).toContain('id="lab-objectives-json"');
    expect(levelLab).toContain("this.root.querySelector('#lab-apply')");
    expect(levelLab).toContain("this.root.querySelector('#lab-play')");
  });

  it('covers legal hint moves, invalid swaps, deterministic cascades, refill, objectives and special activation', () => {
    expect(spec).toContain('objective-aware Hint resolves a real legal move');
    expect(spec).toContain('a deterministic cascade uses production clear/settle/refill rules');
    expect(spec).toContain('invalid swap is side-effect free');
    expect(spec).toContain("toEqual([7, 10])");
    expect(spec).toContain("toEqual([3, 10])");
    expect(spec).toContain("'.special.flash-row'");
    expect(spec).toContain("toEqual([6, 10])");
    expect(controller).toContain('const result = game.attemptSwap(first, second)');
    expect(controller).toContain('const result = game.attemptSpecialActivation(index)');
  });

  it('uses the same engine legality contract already protected by unit tests', () => {
    expect(engineTests).toContain('getHintMove()');
    expect(engineTests).toContain('expect(result.valid).toBe(true)');
    expect(engineTests).toContain("reason).toBe('not-adjacent')");
    expect(engineTests).toContain('expect(game.movesLeft).toBe(before)');
  });
});
