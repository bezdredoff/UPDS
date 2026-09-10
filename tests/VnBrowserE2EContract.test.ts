import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const selectors = read('e2e/selectors.ts');
const helper = read('e2e/helpers/vn.ts');
const spec = read('e2e/tests/vn-navigation.pw.ts');
const playwrightConfig = read('e2e/playwright.config.ts');

describe('ANM-023G4 VN browser E2E contract', () => {
  it('uses QA Scene Navigation instead of browser-only VN runtime seams', () => {
    expect(helper).toContain('resetBrowserState(page)');
    expect(helper).toContain('sceneNavigationButton');
    expect(helper).toContain('data-scene="${sceneIndex}"');
    expect(helper).toContain('vnRuntimeFrame');
    expect(helper).not.toContain('window.__');
    expect(helper).not.toContain('AnimeDetectiveApp');
    expect(helper).not.toContain('VnController');
    expect(spec).not.toContain('localStorage.setItem');
    expect(spec).not.toContain('__UPDS_TEST__');
  });

  it('keeps the stable VN automation selector API used by the browser journey', () => {
    for (const token of [
      "vnBackgroundFit: '.vn-background-fit'",
      "vnDirectionCard: '.direction-card'",
      "vnLineId: '.qa-line-id'",
      "vnNext: '#next'",
      "vnAuthoredShot: '[data-authored-shot]'",
      "vnAuthoredActor: '.vn-authored-actor-slot'",
      "vnChoiceScreen: '.choice-screen'",
      "vnChoiceButton: '[data-choice]'",
    ]) {
      expect(selectors).toContain(token);
    }
  });

  it('covers measured paging, authored staging and real choice branching in the browser', () => {
    expect(spec).toContain("currentVnLineId(page)).toBe('VN0001')");
    expect(spec).toContain('data-dialogue-pages');
    expect(spec).toContain("endsWith('…')");
    expect(spec).toContain("advanceToLine(page, 'VN0002')");
    expect(spec).toContain('data-character="miku"');
    expect(spec).toContain("advanceToLine(page, 'VN0008')");
    expect(spec).toContain('data-authored-shot="VN0008"');
    expect(spec).toContain("toHaveAttribute('data-scene-preset', 'trio-central-speaker')");
    expect(spec).toContain("advanceToLine(page, 'VN0040')");
    expect(spec).toContain('data-choice="B"');
    expect(spec).toContain("currentVnLineId(page)).toBe('VN0041B')");
  });

  it('keeps VN navigation mobile-critical and proves modal focus through user input', () => {
    expect(playwrightConfig).toContain('/vn-navigation\\.pw\\.ts/');
    expect(spec).toContain("test('traps keyboard focus in VN overlays and restores the opener'");
    expect(spec).toContain("toHaveAttribute('inert', '')");
    expect(spec).toContain("page.keyboard.press('Escape')");
    expect(spec).toContain("page.keyboard.press('Shift+Tab')");
    expect(spec).toContain("await expect(fast).toBeFocused()");
    expect(spec).toContain("test.skip(testInfo.project.name !== 'webkit-mobile'");
  });
});
