import type { Page } from '@playwright/test';
import { qaSelectors } from '../selectors';

export async function resetBrowserState(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
  });
  await page.reload();
  await page.locator(qaSelectors.mainMenu).waitFor({ state: 'visible' });
}
