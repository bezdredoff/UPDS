import { expect, test, type Page } from '@playwright/test';
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

const shortDragRatio = 0.1;
const committedDragRatio = 0.42;

async function holdPointerDrag(
  page: Page,
  sourceIndex: number,
  targetIndex: number,
  distanceRatio: number,
): Promise<void> {
  const sourceBox = await match3Cell(page, sourceIndex).boundingBox();
  const targetBox = await match3Cell(page, targetIndex).boundingBox();
  if (!sourceBox || !targetBox) throw new Error(`Missing rendered cells for drag ${sourceIndex} -> ${targetIndex}`);

  const startX = sourceBox.x + sourceBox.width / 2;
  const startY = sourceBox.y + sourceBox.height / 2;
  const targetX = targetBox.x + targetBox.width / 2;
  const targetY = targetBox.y + targetBox.height / 2;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(
    startX + (targetX - startX) * distanceRatio,
    startY + (targetY - startY) * distanceRatio,
    { steps: 4 },
  );
}

async function rememberMatch3Dom(page: Page): Promise<void> {
  await page.evaluate(() => {
    const host = window as Window & { __updsMatch3Screen?: Element | null; __updsMatch3Board?: Element | null };
    host.__updsMatch3Screen = document.querySelector('.match-screen');
    host.__updsMatch3Board = document.querySelector('.board[role="grid"]');
  });
}

async function expectMatch3DomStable(page: Page): Promise<void> {
  expect(await page.evaluate(() => {
    const host = window as Window & { __updsMatch3Screen?: Element | null; __updsMatch3Board?: Element | null };
    return host.__updsMatch3Screen === document.querySelector('.match-screen')
      && host.__updsMatch3Board === document.querySelector('.board[role="grid"]');
  })).toBe(true);
}

test.describe('Match-3 through Campaign and Level Lab', () => {
  test('Campaign starts the production first level on the shared board', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openCampaignFirstLevel(page);

    await expect(page.locator(qaSelectors.match3StageId)).toHaveText('M3_00');
    await expect(page.locator(qaSelectors.match3Moves)).toHaveText('24');
    await expect(page.locator(qaSelectors.match3Cell)).toHaveCount(64);
    health.assertClean();
  });

  test('inactivity hint updates the stable Match-3 screen and board in place', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openDeterministicLab(page);
    await rememberMatch3Dom(page);

    expect(await movesLeft(page)).toBe(deterministicLabMoves);
    await expect(page.locator(qaSelectors.match3HintedCell)).toHaveCount(2, { timeout: 7_000 });
    await expect(page.locator(qaSelectors.match3Bark)).toBeVisible();
    expect(await movesLeft(page)).toBe(deterministicLabMoves);
    await expectMatch3DomStable(page);
    health.assertClean();
  });

  test('reaction bark appears and dismisses without replacing the Match-3 screen or board', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openDeterministicLab(page);
    await rememberMatch3Dom(page);

    await tapSwap(page, deterministicFlashSwap[0], deterministicFlashSwap[1]);

    const reaction = page.locator(`${qaSelectors.match3Bark}[data-reaction-id="special-created"]`);
    await expect(reaction).toBeVisible();
    await expectMatch3DomStable(page);
    await expect(reaction).toHaveCount(0, { timeout: 4_000 });
    await expectMatch3DomStable(page);
    health.assertClean();
  });

  test('real pointer drag previews threshold state, keeps a short drag inert and commits the deterministic swap', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openDeterministicLab(page);

    const [sourceIndex, targetIndex] = deterministicFlashSwap;
    const sourceCell = match3Cell(page, sourceIndex);
    const targetCell = match3Cell(page, targetIndex);
    const sourceBefore = await tileVariant(page, sourceIndex);
    const targetBefore = await tileVariant(page, targetIndex);

    await holdPointerDrag(page, sourceIndex, targetIndex, shortDragRatio);

    await expect(sourceCell).toHaveClass(/drag-source/);
    await expect(targetCell).toHaveClass(/drag-target/);
    await expect(targetCell).not.toHaveClass(/drag-target--commit/);
    expect(
      await sourceCell.locator('.tile-stack').evaluate((stack) =>
        (stack as HTMLElement).style.getPropertyValue('--drag-y').trim(),
      ),
    ).not.toBe('');

    await page.mouse.up();

    await expect(sourceCell).not.toHaveClass(/drag-source/);
    await expect(targetCell).not.toHaveClass(/drag-target/);
    expect(await movesLeft(page)).toBe(deterministicLabMoves);
    expect(await firstObjectiveProgress(page)).toEqual([0, 10]);
    expect(await tileVariant(page, sourceIndex)).toBe(sourceBefore);
    expect(await tileVariant(page, targetIndex)).toBe(targetBefore);

    await holdPointerDrag(page, sourceIndex, targetIndex, committedDragRatio);

    await expect(sourceCell).toHaveClass(/drag-source/);
    await expect(targetCell).toHaveClass(/drag-target/);
    await expect(targetCell).toHaveClass(/drag-target--commit/);

    await page.mouse.up();

    await expect(page.locator(qaSelectors.match3Moves)).toHaveText(String(deterministicLabMoves - 1));
    expect(await firstObjectiveProgress(page)).toEqual([3, 10]);
    await expect(match3Cell(page, 2).locator('.special.flash-row')).toBeVisible();
    await expect(page.locator(qaSelectors.match3Tile)).toHaveCount(64);
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
    await rememberMatch3Dom(page);

    await tapSwap(page, deterministicFlashSwap[0], deterministicFlashSwap[1]);

    await expectMatch3DomStable(page);
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

    const progressBeforeActivation = (await firstObjectiveProgress(page))[0];
    await activateSpecialByDoubleTap(page, 2);

    await expect(page.locator(qaSelectors.match3Moves)).toHaveText(String(deterministicLabMoves - 2));
    expect((await firstObjectiveProgress(page))[0]).toBeGreaterThan(progressBeforeActivation);
    await expect(match3Cell(page, 2).locator(qaSelectors.match3Special)).toHaveCount(0);
    await expect(page.locator(qaSelectors.match3Tile)).toHaveCount(64);
    health.assertClean();
  });
});
