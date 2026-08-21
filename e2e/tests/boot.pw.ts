import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { qaSelectors } from '../selectors';

test('boots the production build into the player menu without QA tools', async ({ page }) => {
  const health = observeBrowserHealth(page);
  const response = await page.goto('./');

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await expect(page.locator(qaSelectors.appRoot)).toBeVisible();
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
  await expect(page.locator(qaSelectors.mainMenu)).toHaveAttribute('data-qa-surface', 'hidden');
  await expect(page.locator(qaSelectors.newGame)).toBeVisible();
  await expect(page.locator(qaSelectors.match3CampaignButton)).toBeVisible();
  await expect(page.locator(qaSelectors.sceneNavigationButton)).toHaveCount(0);
  await expect(page.locator(qaSelectors.levelLabButton)).toHaveCount(0);
  await expect(page.locator(qaSelectors.sceneStudioButton)).toHaveCount(0);
  await expect(page.locator(qaSelectors.supportButton)).toHaveCount(0);
  health.assertClean();
});
