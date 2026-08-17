import { expect, type Page } from '@playwright/test';
import { qaSelectors } from '../selectors';
import {
  advanceCurrentLineToChoice,
  advanceToLine,
  currentVnLineId,
} from './vn';
import { resetBrowserState } from './runtime';

export async function startNewStory(page: Page): Promise<void> {
  await resetBrowserState(page);
  await page.locator(qaSelectors.newGame).click();
  await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
  expect(await currentVnLineId(page)).toBe('VN0001');
}

export async function persistAtVn0002AndReload(page: Page): Promise<void> {
  await startNewStory(page);
  await advanceToLine(page, 'VN0002');

  await page.reload();
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
  await expect(page.locator(qaSelectors.continueGame)).toBeEnabled();

  await page.locator(qaSelectors.continueGame).click();
  await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
  expect(await currentVnLineId(page)).toBe('VN0002');
}

export async function switchLocaleAndReload(page: Page, locale: 'en' | 'be'): Promise<{
  before: string;
  after: string;
}> {
  await resetBrowserState(page);
  const before = (await page.locator(qaSelectors.newGame).textContent())?.trim() ?? '';

  await page.locator(qaSelectors.settingsButton).click();
  await expect(page.locator(qaSelectors.settingsScreen)).toBeVisible();
  await page.locator(qaSelectors.languageSelect).selectOption(locale);

  await expect(page.locator(qaSelectors.languageSelect)).toHaveValue(locale);
  await expect.poll(() => page.locator('html').getAttribute('lang')).toBe(locale);

  await page.locator(qaSelectors.settingsBack).click();
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
  const after = (await page.locator(qaSelectors.newGame).textContent())?.trim() ?? '';
  expect(after).not.toBe(before);

  await page.reload();
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
  await expect.poll(() => page.locator('html').getAttribute('lang')).toBe(locale);
  await expect(page.locator(qaSelectors.newGame)).toHaveText(after);

  await page.locator(qaSelectors.settingsButton).click();
  await expect(page.locator(qaSelectors.languageSelect)).toHaveValue(locale);
  return { before, after };
}

export async function reachFirstStoryMatch(page: Page): Promise<void> {
  await startNewStory(page);

  await advanceToLine(page, 'VN0040', 240);
  await advanceCurrentLineToChoice(page);
  await expect(page.locator(qaSelectors.vnChoiceButton)).toHaveCount(3);
  await page.locator(`${qaSelectors.vnChoiceButton}[data-choice="B"]`).click();

  await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
  expect(await currentVnLineId(page)).toBe('VN0041B');

  await advanceToLine(page, 'VN0057', 180);

  for (let click = 0; click < 16; click += 1) {
    if (await page.locator(qaSelectors.matchIntro).isVisible()) break;
    await page.locator(qaSelectors.vnNext).click();
  }

  await expect(page.locator(qaSelectors.matchIntro)).toBeVisible();
  await expect(page.locator(qaSelectors.matchIntroId)).toHaveText('M3_00_LOCKER_TUTORIAL');
}

export async function startFirstStoryMatchAndVerifyResumeBoundary(page: Page): Promise<void> {
  await reachFirstStoryMatch(page);

  const start = page.locator(qaSelectors.matchStart);
  await expect(start).toBeVisible();
  await expect(start).toBeEnabled();
  await start.scrollIntoViewIfNeeded();
  await start.click({ force: true });
  await expect(page.locator(qaSelectors.match3Screen)).toBeVisible();
  await expect(page.locator(qaSelectors.match3StageId)).toHaveText('M3_00');
  await expect(page.locator(qaSelectors.match3Moves)).toHaveText('24');

  await page.reload();
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
  await expect(page.locator(qaSelectors.continueGame)).toBeEnabled();
  await page.locator(qaSelectors.continueGame).click();

  await expect(page.locator(qaSelectors.matchIntro)).toBeVisible();
  await expect(page.locator(qaSelectors.matchIntroId)).toHaveText('M3_00_LOCKER_TUTORIAL');
}
