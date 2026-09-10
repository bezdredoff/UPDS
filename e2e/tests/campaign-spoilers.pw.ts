import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { qaSelectors } from '../selectors';

test('locked Campaign cards hide future case identity and story action', async ({ page }) => {
  const health = observeBrowserHealth(page);
  const response = await page.goto('./');

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload();
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();

  await page.locator(qaSelectors.match3CampaignButton).click();
  await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();

  const firstCard = page.locator('.campaign-level-card').first();
  await expect(firstCard.locator('.campaign-level-heading span')).toHaveText('M3_00');
  await expect(firstCard.locator('p')).toHaveCount(1);

  const lockedCard = page.locator('.campaign-level-card.locked').first();
  await expect(lockedCard).toBeVisible();
  const lockedStatus = (await lockedCard.locator('.campaign-level-meta span').first().innerText()).trim();
  await expect(lockedCard.locator('.campaign-level-heading b')).toHaveText(lockedStatus);
  await expect(lockedCard.locator('.campaign-level-heading span')).not.toHaveText(/M3_/);
  await expect(lockedCard.locator('p')).toHaveCount(0);
  await expect(lockedCard).not.toContainText('M3_01');

  health.assertClean();
});
