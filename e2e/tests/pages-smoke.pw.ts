import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { qaSelectors } from '../selectors';

const lanes = [
  { name: 'stable-root', path: './' },
  { name: 'candidate-preview', path: './preview/' },
] as const;

for (const lane of lanes) {
  test(`${lane.name} boots with clean critical assets and QA navigation`, async ({ page }) => {
    const health = observeBrowserHealth(page);
    const response = await page.goto(lane.path);

    expect(response).not.toBeNull();
    expect(response?.ok()).toBe(true);
    await expect(page.locator(qaSelectors.appRoot)).toBeVisible();
    await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();

    await page.locator(qaSelectors.sceneNavigationButton).click();
    await expect(page.locator(qaSelectors.sceneNavigationScreen)).toBeVisible();
    await page.locator('#back').click();
    await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();

    await page.locator(qaSelectors.match3CampaignButton).click();
    await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();
    await page.locator('#back').click();
    await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();

    await page.locator(qaSelectors.levelLabButton).click();
    await expect(page.locator(qaSelectors.levelLabScreen)).toBeVisible();

    expect(new URL(page.url()).pathname.endsWith(lane.path === './preview/' ? '/preview/' : '/')).toBe(true);
    health.assertClean();
  });
}
