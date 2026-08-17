import { expect, test } from '@playwright/test';
import { resetBrowserState } from '../helpers/runtime';
import { qaSelectors } from '../selectors';

test.describe('production QA harness routing', () => {
  test.beforeEach(async ({ page }) => {
    await resetBrowserState(page);
  });

  test('QA Scene Navigation opens the shared production VN frame', async ({ page }) => {
    await page.locator(qaSelectors.sceneNavigationButton).click();
    await expect(page.locator(qaSelectors.sceneNavigationScreen)).toBeVisible();

    const firstScene = page.locator(qaSelectors.sceneButton).first();
    await expect(firstScene).toBeVisible();
    await firstScene.click();

    await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
    await expect(page.locator(qaSelectors.vnDialogue)).toBeVisible();
  });

  test('Match-3 Campaign opens the shared production Match-3 board', async ({ page }) => {
    await page.locator(qaSelectors.match3CampaignButton).click();
    await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();

    const firstLevel = page.locator(qaSelectors.match3CampaignLevelButton).first();
    await expect(firstLevel).toBeEnabled();
    await firstLevel.click();

    await expect(page.locator(qaSelectors.match3Screen)).toBeVisible();
    await expect(page.locator(qaSelectors.match3Board)).toBeVisible();
    expect(await page.locator(qaSelectors.match3Cell).count()).toBeGreaterThan(0);
  });

  test('Level Lab launches an exact seed through the shared production Match-3 board', async ({ page }) => {
    await page.locator(qaSelectors.levelLabButton).click();
    await expect(page.locator(qaSelectors.levelLabScreen)).toBeVisible();
    await expect(page.locator(qaSelectors.levelLabLevel)).toBeVisible();

    await page.locator(qaSelectors.levelLabSeed).fill('424242');
    await expect(page.locator(qaSelectors.levelLabPlay)).toBeEnabled();
    await page.locator(qaSelectors.levelLabPlay).click();

    await expect(page.locator(qaSelectors.match3Screen)).toBeVisible();
    await expect(page.locator(qaSelectors.match3Board)).toBeVisible();
    await expect(page.locator('.stage-meta b')).toHaveText('SEED 424242');
  });
});
