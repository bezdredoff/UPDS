import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import {
  persistAtVn0002AndReload,
  startFirstStoryMatchAndVerifyResumeBoundary,
  switchLocaleAndReload,
} from '../helpers/flow';
import { resetBrowserState } from '../helpers/runtime';
import { advanceToLine, currentVnLineId } from '../helpers/vn';
import { qaSelectors } from '../selectors';

test.describe('Persistence, localization and short main-flow journeys', () => {
  test('campaign progress survives reload and Continue resumes the exact VN line', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await persistAtVn0002AndReload(page);

    await expect(page.locator(qaSelectors.vnLineId)).toContainText('VN0002');
    health.assertClean();
  });

  test('language selection rerenders immediately and survives a full reload', async ({ page }) => {
    const health = observeBrowserHealth(page);
    const labels = await switchLocaleAndReload(page, 'en');

    expect(labels.before.length).toBeGreaterThan(0);
    expect(labels.after.length).toBeGreaterThan(0);
    expect(labels.after).not.toBe(labels.before);
    health.assertClean();
  });

  test('keeps localized multi-page VN paging stable in Russian, Belarusian and English', async ({ page }) => {
    test.slow();
    const health = observeBrowserHealth(page);

    for (const locale of ['ru', 'be', 'en'] as const) {
      await resetBrowserState(page);
      await page.locator(qaSelectors.settingsButton).click();
      await expect(page.locator(qaSelectors.settingsScreen)).toBeVisible();
      await page.locator(qaSelectors.languageSelect).selectOption(locale);
      await expect(page.locator(qaSelectors.languageSelect)).toHaveValue(locale);
      await expect.poll(() => page.locator('html').getAttribute('lang')).toBe(locale);
      await page.locator(qaSelectors.settingsBack).click();

      await page.locator(qaSelectors.sceneNavigationButton).click();
      await expect(page.locator(qaSelectors.sceneNavigationScreen)).toBeVisible();
      await page.locator(`${qaSelectors.sceneButton}[data-scene="24"]`).click();
      await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
      await advanceToLine(page, 'VN0555', 40);

      const dialogue = page.locator(qaSelectors.vnDialogue);
      await expect.poll(async () => Number((await dialogue.getAttribute('data-dialogue-pages')) ?? '0')).toBeGreaterThan(1);
      await expect(dialogue).toHaveAttribute('data-dialogue-page', '1');
      expect(await currentVnLineId(page)).toBe('VN0555');

      await page.evaluate(() => {
        const host = window as Window & { __updsLocalizedVnFrame?: Element | null };
        host.__updsLocalizedVnFrame = document.querySelector('[data-vn-frame="shared"][data-frame-context="runtime"]');
      });
      const visualScale = await page.evaluate(() => window.visualViewport?.scale ?? 1);

      await page.locator(qaSelectors.vnNext).click();

      await expect(dialogue).toHaveAttribute('data-dialogue-page', '2');
      expect(await currentVnLineId(page)).toBe('VN0555');
      expect(await page.evaluate(() => {
        const host = window as Window & { __updsLocalizedVnFrame?: Element | null };
        return host.__updsLocalizedVnFrame === document.querySelector('[data-vn-frame="shared"][data-frame-context="runtime"]');
      })).toBe(true);
      expect(await page.evaluate(() => window.visualViewport?.scale ?? 1)).toBeCloseTo(visualScale, 5);
    }

    health.assertClean();
  });

  test('New Game reaches the first story Match-3 and Continue restores its story boundary', async ({ page }) => {
    test.slow();
    const health = observeBrowserHealth(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await startFirstStoryMatchAndVerifyResumeBoundary(page);

    await expect(page.locator(qaSelectors.matchIntro)).toBeVisible();
    health.assertClean();
  });
});
