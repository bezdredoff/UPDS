import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { openDeterministicLab } from '../helpers/match3';

test.describe('Match-3 Help mobile geometry', () => {
  test('centers the Help sheet fully inside the phone viewport without moving the board', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openDeterministicLab(page);

    const board = page.locator('.board[role="grid"]');
    const boardBefore = await board.boundingBox();
    if (!boardBefore) throw new Error('Missing Match-3 board before opening Help');

    await page.locator('.match-help-trigger').click();
    const help = page.locator('.match-help-popover');
    await expect(help).toBeVisible();

    const geometry = await help.evaluate((panel) => {
      const rect = panel.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom,
        centerDelta: Math.abs((rect.left + rect.right) / 2 - viewportWidth / 2),
        insideViewport:
          rect.left >= 0
          && rect.right <= viewportWidth
          && rect.top >= 0
          && rect.bottom <= viewportHeight,
      };
    });

    expect(geometry.centerDelta).toBeLessThanOrEqual(1);
    expect(geometry.insideViewport).toBe(true);

    const boardAfter = await board.boundingBox();
    if (!boardAfter) throw new Error('Missing Match-3 board while Help is open');
    expect(boardAfter).toEqual(boardBefore);
    health.assertClean();
  });
});
