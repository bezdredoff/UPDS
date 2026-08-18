import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { resetBrowserState } from '../helpers/runtime';
import { currentVnLineId } from '../helpers/vn';
import { qaSelectors } from '../selectors';

test.describe('Story completion production boundary', () => {
  test('one real M3_00 move reaches evidence, post-win VN and persisted Continue', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await resetBrowserState(page);

    await page.locator(qaSelectors.supportButton).click();
    await expect(page.locator(qaSelectors.diagnosticsScreen)).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator(qaSelectors.storyWinQaButton).click();

    await expect(page.locator(qaSelectors.match3Screen)).toBeVisible();
    await expect(page.locator(qaSelectors.match3StageId)).toHaveText('M3_00');
    await expect(page.locator(qaSelectors.match3Moves)).toHaveText('1');
    await expect(page.locator(qaSelectors.match3Objectives)).toHaveCount(1);
    await expect(page.locator(qaSelectors.match3ObjectiveValue)).toHaveText('0/1');

    await page.locator(`${qaSelectors.match3Cell}[data-cell="2"]`).click();
    await page.locator(`${qaSelectors.match3Cell}[data-cell="10"]`).click();

    await expect(page.locator(qaSelectors.evidenceTransition)).toBeVisible();
    await expect(page.locator(qaSelectors.evidenceContinue)).toBeVisible();
    await page.locator(qaSelectors.evidenceContinue).click();

    await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
    expect(await currentVnLineId(page)).toBe('VN0058');

    await page.reload();
    await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
    await expect(page.locator(qaSelectors.continueGame)).toBeEnabled();
    await page.locator(qaSelectors.continueGame).click();

    await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
    expect(await currentVnLineId(page)).toBe('VN0058');
    health.assertClean();
  });
});
