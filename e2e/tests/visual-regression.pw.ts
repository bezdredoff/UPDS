import { expect, test, type Page } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { openDeterministicLab } from '../helpers/match3';
import { resetBrowserState } from '../helpers/runtime';
import {
  advanceCurrentLineToChoice,
  advanceToLine,
  expectImageLoaded,
  openQaScene,
} from '../helpers/vn';
import { qaSelectors } from '../selectors';

test.use({
  colorScheme: 'light',
  locale: 'ru-RU',
  reducedMotion: 'reduce',
});

const goldenOptions = {
  animations: 'disabled',
  caret: 'hide',
  scale: 'css',
  maxDiffPixelRatio: 0.002,
} as const;

async function waitForVisualIdle(page: Page): Promise<void> {
  await expect.poll(async () => page.locator('img').evaluateAll((images) =>
    images.every((image) => {
      const element = image as HTMLImageElement;
      return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0;
    }),
  )).toBe(true);

  await page.evaluate(async () => {
    await document.fonts.ready;
  });
}

test.describe('ANM-023G7B mobile Golden Samples', () => {
  test.skip(({ browserName }) => browserName !== 'webkit', 'Golden Samples target the mobile WebKit lane.');

  test('main menu Golden Sample', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await resetBrowserState(page);
    await expectImageLoaded(page.locator('.menu-background'));
    await waitForVisualIdle(page);

    // BUILD_LABEL intentionally changes for every candidate and is not a visual-layout contract.
    await page.addStyleTag({ content: '.menu-screen footer { visibility: hidden !important; }' });

    await expect(page).toHaveScreenshot('golden-main-menu.png', goldenOptions);
    health.assertClean();
  });

  test('VN0008 authored trio Golden Sample', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openQaScene(page, 0);
    await advanceToLine(page, 'VN0008');

    const shot = page.locator(`${qaSelectors.vnAuthoredShot}[data-authored-shot="VN0008"]`);
    await expect(shot).toBeVisible();
    await expect(shot.locator(qaSelectors.vnAuthoredActor)).toHaveCount(3);
    await expectImageLoaded(page.locator(qaSelectors.vnBackgroundFit));
    await waitForVisualIdle(page);

    await expect(page).toHaveScreenshot('golden-vn0008-trio.png', goldenOptions);
    health.assertClean();
  });

  test('CHOICE_00 Golden Sample', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openQaScene(page, 1);
    await advanceToLine(page, 'VN0040');
    await advanceCurrentLineToChoice(page);

    await expect(page.locator(qaSelectors.vnChoiceScreen)).toBeVisible();
    await expect(page.locator(qaSelectors.vnChoiceButton)).toHaveCount(3);
    await expectImageLoaded(page.locator(qaSelectors.vnChoiceBackgroundFit));
    await waitForVisualIdle(page);

    await expect(page).toHaveScreenshot('golden-choice-00.png', goldenOptions);
    health.assertClean();
  });

  test('deterministic Match-3 seed 7 Golden Sample', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openDeterministicLab(page);

    await expect(page.locator(qaSelectors.match3Board)).toBeVisible();
    await expect(page.locator(qaSelectors.match3Cell)).toHaveCount(64);
    await waitForVisualIdle(page);

    await expect(page).toHaveScreenshot('golden-match3-seed7.png', goldenOptions);
    health.assertClean();
  });
});
