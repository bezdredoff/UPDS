import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
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


  test('Scene Studio Composition supports direct mouse drag on the shared production stage', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await page.locator(qaSelectors.sceneStudioButton).click();
    const studio = page.locator(qaSelectors.sceneStudioScreen);
    await expect(studio).toHaveAttribute('data-scene-studio-workspace', 'composition');

    const calibration = page.locator(qaSelectors.sceneStudioPrimaryCalibration);
    await expect(calibration).toHaveAttribute('data-slot-override', 'false');

    const portrait = page.locator(qaSelectors.sceneStudioDraggablePortrait).first();
    await portrait.scrollIntoViewIfNeeded();
    const box = await portrait.boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;

    const startX = box.x + box.width * 0.5;
    const startY = box.y + Math.min(box.height * 0.32, 120);
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + 24, startY + 18, { steps: 4 });
    await page.mouse.up();

    await expect(page.locator(qaSelectors.sceneStudioPrimaryCalibration)).toHaveAttribute('data-slot-override', 'true');
    await expect(page.locator('[data-slot-calibration-field="xPercent"]')).not.toHaveValue('0');
    await expect(page.locator('[data-slot-calibration-field="yPercent"]')).not.toHaveValue('0');
    health.assertClean();
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
