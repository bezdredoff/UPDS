import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const selectors = read('e2e/selectors.ts');
const resetHelper = read('e2e/helpers/runtime.ts');
const harness = read('e2e/tests/harness.pw.ts');

describe('ANM-023G2 browser automation harness contract', () => {
  it('keeps Scene Navigation on the shared VN browser surface', () => {
    for (const token of [
      'qaSelectors.sceneNavigationButton',
      'qaSelectors.sceneNavigationScreen',
      'qaSelectors.sceneButton',
      'qaSelectors.vnRuntimeFrame',
      'qaSelectors.vnDialogue',
    ]) {
      expect(harness).toContain(token);
    }

    expect(harness).not.toContain('VnController');
    expect(harness).not.toContain('QAVnController');
  });

  it('keeps Campaign and Level Lab on the shared Match-3 browser surface', () => {
    for (const token of [
      'qaSelectors.match3CampaignButton',
      'qaSelectors.match3CampaignScreen',
      'qaSelectors.match3CampaignLevelButton',
      'qaSelectors.levelLabButton',
      'qaSelectors.levelLabSeed',
      'qaSelectors.levelLabPlay',
      'qaSelectors.match3Screen',
      'qaSelectors.match3Board',
      'qaSelectors.match3Cell',
    ]) {
      expect(harness).toContain(token);
    }

    expect(harness).not.toContain('Match3Controller');
    expect(harness).not.toContain('QAMatch3Controller');
    expect(harness).not.toContain('Match3Game');
  });

  it('keeps the QA/product selectors as the browser automation API', () => {
    for (const selector of [
      "sceneNavigationButton: '#episodes'",
      "sceneNavigationScreen: '.scene-select'",
      "sceneButton: '[data-scene]'",
      "sceneStudioButton: '#scene-studio'",
      "vnRuntimeFrame: '[data-vn-frame=\"shared\"][data-frame-context=\"runtime\"]'",
      "match3CampaignButton: '#match3-campaign'",
      "match3CampaignLevelButton: '[data-campaign-level]'",
      "levelLabSeed: '#lab-seed'",
      "levelLabPlay: '#lab-play'",
      "match3Board: '.board[role=\"grid\"]'",
      "match3Cell: '[data-cell]'",
    ]) {
      expect(selectors).toContain(selector);
    }
  });

  it('keeps browser reset and harness setup free of runtime shortcuts', () => {
    expect(resetHelper).toContain('window.localStorage.clear()');
    expect(resetHelper).toContain('window.sessionStorage.clear()');
    expect(resetHelper).not.toContain('__UPDS');
    expect(resetHelper).not.toContain('CampaignStore');
    expect(resetHelper).not.toContain('Match3Game');

    expect(harness).toContain('resetBrowserState(page)');
    expect(harness).toContain('qaSelectors.sceneStudioButton');
    expect(harness).toContain('qaSelectors.sceneStudioDraggablePortrait');
    expect(harness).toContain('page.mouse.down()');
    expect(harness).not.toContain('localStorage');
    expect(harness).not.toContain('sessionStorage');
    expect(harness).not.toContain('__UPDS');
  });
});
