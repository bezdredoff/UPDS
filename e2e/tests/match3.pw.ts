import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import {
  activateSpecialByDoubleTap,
  deterministicCascadeSeed,
  deterministicFlashSwap,
  deterministicInvalidSwap,
  deterministicLabMoves,
  firstObjectiveProgress,
  match3Cell,
  movesLeft,
  openCampaignFirstLevel,
  openDeterministicLab,
  tapSwap,
  tileVariant,
} from '../helpers/match3';
import { qaSelectors } from '../selectors';

test.describe('Match-3 through Campaign and Level Lab', () => {
  test('Campaign starts the production first level on the shared board', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openCampaignFirstLevel(page);

    await expect(page.locator(qaSelectors.match3StageId)).toHaveText('M3_00');
    await expect(page.locator(qaSelectors.match3Moves)).toHaveText('24');
    await expect(page.locator(qaSelectors.match3Cell)).toHaveCount(64);
    health.assertClean();
  });

  test('objective-aware Hint resolves a real legal move and spends exactly one move', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openDeterministicLab(page);

    expect(await firstObjectiveProgress(page)).toEqual([0, 10]);
    await page.locator(qaSelectors.match3Hint).click();

    const hinted = page.locator(qaSelectors.match3HintedCell);
    await expect(hinted).toHaveCount(2);
    const indices = await hinted.evaluateAll((cells) =>
      cells.map((cell) => Number((cell as HTMLElement).dataset.cell)),
    );

    await tapSwap(page, indices[0], indices[1]);

    await expect(page.locator(qaSelectors.match3Moves)).toHaveText(String(deterministicLabMoves - 1));
    expect((await firstObjectiveProgress(page))[0]).toBeGreaterThan(0);
    health.assertClean();
  });

  test('a deterministic cascade uses production clear/settle/refill rules', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openDeterministicLab(page, deterministicCascadeSeed);

    await tapSwap(page, deterministicFlashSwap[0], deterministicFlashSwap[1]);

    await expect(page.locator(qaSelectors.match3Moves)).toHaveText(String(deterministicLabMoves - 1));
    expect(await firstObjectiveProgress(page)).toEqual([7, 10]);
    await expect(match3Cell(page, 2).locator(qaSelectors.match3Special)).toHaveCount(0);
    await expect(page.locator(qaSelectors.match3Tile)).toHaveCount(64);
    health.assertClean();
  });

  test('invalid swap is side-effect free, then a four-match creates and activates flash-row', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openDeterministicLab(page);

    expect(await tileVariant(page, 4)).toBe('tile:sportsBra');
    expect(await tileVariant(page, 5)).toBe('tile:laundryTag');

    await tapSwap(page, deterministicInvalidSwap[0], deterministicInvalidSwap[1]);

    expect(await movesLeft(page)).toBe(deterministicLabMoves);
    expect(await firstObjectiveProgress(page)).toEqual([0, 10]);
    expect(await tileVariant(page, 4)).toBe('tile:sportsBra');
    expect(await tileVariant(page, 5)).toBe('tile:laundryTag');

    await tapSwap(page, deterministicFlashSwap[0], deterministicFlashSwap[1]);

    await expect(page.locator(qaSelectors.match3Moves)).toHaveText(String(deterministicLabMoves - 1));
    expect(await firstObjectiveProgress(page)).toEqual([3, 10]);
    await expect(match3Cell(page, 2).locator('.special.flash-row')).toBeVisible();
    await expect(page.locator(qaSelectors.match3Tile)).toHaveCount(64);

    await activateSpecialByDoubleTap(page, 2);

    await expect(page.locator(qaSelectors.match3Moves)).toHaveText(String(deterministicLabMoves - 2));
    expect(await firstObjectiveProgress(page)).toEqual([6, 10]);
    await expect(match3Cell(page, 2).locator(qaSelectors.match3Special)).toHaveCount(0);
    await expect(page.locator(qaSelectors.match3Tile)).toHaveCount(64);
    health.assertClean();
  });
});
