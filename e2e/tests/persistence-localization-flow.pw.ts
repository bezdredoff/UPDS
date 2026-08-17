import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import {
  persistAtVn0002AndReload,
  startFirstStoryMatchAndVerifyResumeBoundary,
  switchLocaleAndReload,
} from '../helpers/flow';
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

  test('New Game reaches the first story Match-3 and Continue restores its story boundary', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });

    await startFirstStoryMatchAndVerifyResumeBoundary(page);

    await expect(page.locator(qaSelectors.matchIntro)).toBeVisible();
    health.assertClean();
  });
});
