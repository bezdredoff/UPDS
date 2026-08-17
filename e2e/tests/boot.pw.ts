import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';

test('boots the production build into the main menu', async ({ page }) => {
  const health = observeBrowserHealth(page);
  const response = await page.goto('./');

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('.menu-screen')).toBeVisible();
  await expect(page.locator('#new')).toBeVisible();
  health.assertClean();
});
