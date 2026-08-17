import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const visualSpec = read('e2e/tests/visual-regression.pw.ts');
const playwrightConfig = read('e2e/playwright.config.ts');
const e2ePackage = JSON.parse(read('e2e/package.json')) as { scripts: Record<string, string> };
const menuController = read('src/features/menu/MainMenuController.ts');

const snapshotDir = resolve(process.cwd(), 'e2e/tests/visual-regression.pw.ts-snapshots');
const expectedSnapshots = [
  'golden-choice-00-webkit-mobile-linux.png',
  'golden-main-menu-webkit-mobile-linux.png',
  'golden-match3-seed7-webkit-mobile-linux.png',
  'golden-vn0008-trio-webkit-mobile-linux.png',
] as const;

describe('ANM-023G7B mobile visual regression Golden Sample contract', () => {
  it('ships exactly four reviewed Linux WebKit baselines', () => {
    for (const file of expectedSnapshots) {
      expect(existsSync(resolve(snapshotDir, file)), `${file} must be committed`).toBe(true);
    }

    const committedPngs = readdirSync(snapshotDir)
      .filter((file) => file.endsWith('.png'))
      .sort();
    expect(committedPngs).toEqual([...expectedSnapshots].sort());
  });

  it('keeps visual comparison on the mobile WebKit lane with a narrow tolerance', () => {
    expect(playwrightConfig).toContain('/visual-regression\\.pw\\.ts/');
    expect(playwrightConfig).toContain("use: { ...devices['iPhone 13'] }");
    expect(visualSpec).toContain("browserName !== 'webkit'");
    expect(visualSpec).toContain("reducedMotion: 'reduce'");
    expect(visualSpec).toContain("scale: 'css'");
    expect(visualSpec).toContain('maxDiffPixelRatio: 0.002');
    expect(visualSpec).toContain("animations: 'disabled'");
  });

  it('captures only stable production surfaces rather than a test-only renderer', () => {
    expect(visualSpec).toContain('openQaScene(page, 0)');
    expect(visualSpec).toContain("advanceToLine(page, 'VN0008')");
    expect(visualSpec).toContain('toHaveCount(3)');
    expect(visualSpec).toContain('openQaScene(page, 1)');
    expect(visualSpec).toContain("advanceToLine(page, 'VN0040')");
    expect(visualSpec).toContain('advanceCurrentLineToChoice(page)');
    expect(visualSpec).toContain('openDeterministicLab(page)');
    expect(visualSpec).toContain('toHaveCount(64)');
    expect(visualSpec).not.toContain('window.__');
    expect(visualSpec).not.toContain('localStorage.setItem');
    expect(visualSpec).not.toContain('Match3Game');
  });

  it('excludes only the intentionally dynamic build footer from the menu baseline', () => {
    expect(menuController).toContain('${BUILD_LABEL}');
    expect(visualSpec).toContain('.menu-screen footer { visibility: hidden !important; }');
  });

  it('exposes a focused visual command without moving Playwright into npm run check', () => {
    expect(e2ePackage.scripts['test:visual']).toBe(
      'playwright test visual-regression.pw.ts --project=webkit-mobile',
    );
  });
});
