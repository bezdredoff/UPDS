import { expect, test } from '@playwright/test';

test('boots the production build into the main menu', async ({ page }) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/');

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('.menu-screen')).toBeVisible();
  await expect(page.locator('#new')).toBeVisible();
  expect(pageErrors).toEqual([]);
});
