import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const app = read('src/ui/AnimeDetectiveApp.ts');
const menu = read('src/features/menu/MainMenuController.ts');
const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');
const campaign = read('src/features/match3Campaign/Match3CampaignController.ts');
const levelLab = read('src/features/levelLab/LevelLabController.ts');
const match3 = read('src/features/match3/Match3Controller.ts');
const match3Presentation = read('src/features/match3/Match3Presentation.ts');
const vnFrame = read('src/ui/vnFrameMarkup.ts');
const selectors = read('e2e/selectors.ts');
const resetHelper = read('e2e/helpers/runtime.ts');
const harness = read('e2e/tests/harness.pw.ts');

const occurrences = (source: string, token: string): number => source.split(token).length - 1;

describe('ANM-023G2 browser automation harness contract', () => {
  it('keeps QA Scene Navigation on the same production VN controller and frame', () => {
    expect(occurrences(app, 'new VnController')).toBe(1);
    expect(app).toContain('showSceneSelect: () => this.diagnostics.renderSceneSelect()');
    expect(diagnostics).toContain('this.navigation.openScene(Number(button.dataset.scene), 0)');
    expect(vnFrame).toContain('data-vn-frame="shared"');
    expect(vnFrame).toContain('data-frame-context="${input.frameContext}"');
    expect(selectors).toContain('[data-vn-frame="shared"][data-frame-context="runtime"]');
    expect(app).not.toContain('QAVnController');
  });

  it('keeps Story, Match-3 Campaign and Level Lab on one production Match3Controller', () => {
    expect(occurrences(app, 'new Match3Controller')).toBe(1);
    expect(app).toContain('this.match3.startCampaignMatch(levelIndex, this.match3CampaignSession');
    expect(app).toContain('this.match3.startLabMatch(levelIndex, seed');
    expect(match3).toContain("if (this.labRun) return 'lab';");
    expect(match3).toContain("if (this.campaignRun) return 'campaign';");
    expect(match3).toContain("return 'story';");
    expect(match3Presentation).toContain('class="match-screen');
    expect(match3Presentation).toContain('class="board" role="grid"');
    expect(match3Presentation).toContain('data-cell="${index}"');
    expect(app).not.toContain('QAMatch3Controller');
  });

  it('freezes the existing QA/product selectors as the browser automation API', () => {
    for (const token of [
      'id="episodes"',
      'id="match3-campaign"',
      'id="level-lab"',
    ]) {
      expect(menu).toContain(token);
    }

    expect(diagnostics).toContain('class="panel scene-select"');
    expect(diagnostics).toContain('data-scene="${index}"');
    expect(campaign).toContain('class="match3-campaign-screen"');
    expect(campaign).toContain('data-campaign-level="${index}"');

    for (const token of [
      'id="lab-level"',
      'id="lab-seed"',
      'id="lab-preview"',
      'id="lab-play"',
    ]) {
      expect(levelLab).toContain(token);
    }

    for (const selector of [
      "sceneNavigationButton: '#episodes'",
      "sceneButton: '[data-scene]'",
      "match3CampaignLevelButton: '[data-campaign-level]'",
      "levelLabSeed: '#lab-seed'",
      "levelLabPlay: '#lab-play'",
      "match3Cell: '[data-cell]'",
    ]) {
      expect(selectors).toContain(selector);
    }
  });

  it('resets browser persistence outside the game runtime and exercises all three harness routes', () => {
    expect(resetHelper).toContain('window.localStorage.clear()');
    expect(resetHelper).toContain('window.sessionStorage.clear()');
    expect(resetHelper).not.toContain('__UPDS');
    expect(resetHelper).not.toContain('CampaignStore');
    expect(resetHelper).not.toContain('Match3Game');

    expect(harness).toContain('QA Scene Navigation opens the shared production VN frame');
    expect(harness).toContain('Match-3 Campaign opens the shared production Match-3 board');
    expect(harness).toContain('Level Lab launches an exact seed through the shared production Match-3 board');
    expect(harness).toContain("fill('424242')");
  });
});
