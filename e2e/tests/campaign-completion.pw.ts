import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import {
  completeFirstCampaignLevel,
  firstCampaignLevelId,
  firstCampaignWinMovesLeft,
  readMatch3CampaignSave,
  secondCampaignLevelId,
} from '../helpers/match3';
import { qaSelectors } from '../selectors';

test.describe('Match-3 Campaign completion and progression', () => {
  test('persists first-level completion and best score, unlocks hub progression and supports replay', async ({ page }) => {
    test.slow();
    const health = observeBrowserHealth(page);
    await completeFirstCampaignLevel(page);

    const completedSave = await readMatch3CampaignSave(page);
    expect(completedSave.completed).toEqual([firstCampaignLevelId]);
    expect(completedSave.attempts[firstCampaignLevelId]).toBe(1);
    expect(completedSave.bestMovesLeft[firstCampaignLevelId]).toBe(firstCampaignWinMovesLeft);

    await page.locator(qaSelectors.match3CampaignHub).click();
    await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();

    const levelCards = page.locator(qaSelectors.match3CampaignLevelCard);
    await expect(levelCards.nth(0)).toHaveClass(/completed/);
    await expect(page.locator(`${qaSelectors.match3CampaignLevelButton}[data-campaign-level="0"]`)).toBeEnabled();
    await expect(page.locator(`${qaSelectors.match3CampaignLevelButton}[data-campaign-level="1"]`)).toBeEnabled();

    await page.locator(`${qaSelectors.match3CampaignLevelButton}[data-campaign-level="0"]`).click();
    await expect(page.locator(qaSelectors.match3StageId)).toHaveText('M3_00');
    await page.locator(qaSelectors.match3Quit).click();
    await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();

    await page.reload();
    await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
    await page.locator(qaSelectors.match3CampaignButton).click();
    await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();
    await expect(page.locator(qaSelectors.match3CampaignLevelCard).nth(0)).toHaveClass(/completed/);
    await expect(page.locator(`${qaSelectors.match3CampaignLevelButton}[data-campaign-level="1"]`)).toBeEnabled();

    const reloadedSave = await readMatch3CampaignSave(page);
    expect(reloadedSave.completed).toEqual([firstCampaignLevelId]);
    expect(reloadedSave.attempts[firstCampaignLevelId]).toBe(2);
    expect(reloadedSave.bestMovesLeft[firstCampaignLevelId]).toBe(firstCampaignWinMovesLeft);
    health.assertClean();
  });

  test('campaign Next starts the newly unlocked canonical second level', async ({ page }) => {
    test.slow();
    const health = observeBrowserHealth(page);
    await completeFirstCampaignLevel(page);

    await expect(page.locator(qaSelectors.match3CampaignNext)).toBeVisible();
    await page.locator(qaSelectors.match3CampaignNext).click();

    await expect(page.locator(qaSelectors.match3Screen)).toBeVisible();
    await expect(page.locator(qaSelectors.match3StageId)).toHaveText('M3_01');
    const progressedSave = await readMatch3CampaignSave(page);
    expect(progressedSave.completed).toEqual([firstCampaignLevelId]);
    expect(progressedSave.attempts[firstCampaignLevelId]).toBe(1);
    expect(progressedSave.attempts[secondCampaignLevelId]).toBe(1);
    expect(progressedSave.bestMovesLeft[firstCampaignLevelId]).toBe(firstCampaignWinMovesLeft);

    await page.locator(qaSelectors.match3Quit).click();
    await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();
    await expect(page.locator(`${qaSelectors.match3CampaignLevelButton}[data-campaign-level="1"]`)).toBeEnabled();
    health.assertClean();
  });
});
