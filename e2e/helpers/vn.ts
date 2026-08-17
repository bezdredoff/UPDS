import { expect, type Locator, type Page } from '@playwright/test';
import { resetBrowserState } from './runtime';
import { qaSelectors } from '../selectors';

export async function openQaScene(page: Page, sceneIndex: number): Promise<void> {
  await resetBrowserState(page);
  await page.locator(qaSelectors.sceneNavigationButton).click();
  await expect(page.locator(qaSelectors.sceneNavigationScreen)).toBeVisible();

  const sceneButton = page.locator(`${qaSelectors.sceneButton}[data-scene="${sceneIndex}"]`);
  await expect(sceneButton).toBeVisible();
  await sceneButton.click();

  await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
  await expect(page.locator(qaSelectors.vnDialogue)).toBeVisible();
}

export async function currentVnLineId(page: Page): Promise<string> {
  const text = (await page.locator(qaSelectors.vnLineId).textContent()) ?? '';
  return text.split(' · ')[0]?.trim() ?? '';
}

export async function advanceToLine(
  page: Page,
  targetLineId: string,
  maxClicks = 120,
): Promise<void> {
  for (let click = 0; click <= maxClicks; click += 1) {
    if (await currentVnLineId(page) === targetLineId) return;
    if (await page.locator(qaSelectors.vnChoiceScreen).isVisible()) {
      throw new Error(`Reached a choice before VN line ${targetLineId}`);
    }
    if (click === maxClicks) break;
    await page.locator(qaSelectors.vnNext).click();
  }
  throw new Error(`VN line ${targetLineId} was not reached within ${maxClicks} advances`);
}

export async function advanceCurrentLineToChoice(page: Page, maxClicks = 12): Promise<void> {
  for (let click = 0; click <= maxClicks; click += 1) {
    if (await page.locator(qaSelectors.vnChoiceScreen).isVisible()) return;
    if (click === maxClicks) break;
    await page.locator(qaSelectors.vnNext).click();
  }
  throw new Error(`VN choice screen was not reached within ${maxClicks} advances`);
}

export async function expectImageLoaded(image: Locator): Promise<void> {
  await expect(image).toBeVisible();
  await expect.poll(async () => image.evaluate((node) => {
    const element = node as HTMLImageElement;
    return element.complete && element.naturalWidth > 0 && element.naturalHeight > 0;
  })).toBe(true);
}
