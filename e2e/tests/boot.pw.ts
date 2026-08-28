import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { qaSelectors } from '../selectors';

test('boots the production build into the player menu without QA tools', async ({ page }) => {
  const health = observeBrowserHealth(page);
  const response = await page.goto('./');

  expect(response).not.toBeNull();
  expect(response?.ok()).toBe(true);
  await expect(page.locator(qaSelectors.appRoot)).toBeVisible();
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
  await expect(page.locator(qaSelectors.mainMenu)).toHaveAttribute('data-qa-surface', 'hidden');
  await expect(page.locator(qaSelectors.newGame)).toBeVisible();
  await expect(page.locator(qaSelectors.match3CampaignButton)).toBeVisible();
  await expect(page.locator(qaSelectors.sceneNavigationButton)).toHaveCount(0);
  await expect(page.locator(qaSelectors.levelLabButton)).toHaveCount(0);
  await expect(page.locator(qaSelectors.sceneStudioButton)).toHaveCount(0);
  await expect(page.locator(qaSelectors.supportButton)).toHaveCount(0);
  health.assertClean();
});

test(
  'keeps iPhone panels safe and extends installed player screens to the physical bottom',
  async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'webkit-mobile', 'iOS/WebKit safe-area regression');
    const health = observeBrowserHealth(page);
    await page.goto('./');
    await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();

    const standaloneTopInset = 59;
    await page.evaluate((topInset) => {
      document.documentElement.dataset.updsDisplayMode = 'standalone';
      document.documentElement.style.setProperty('--safe-area-top', `${topInset}px`);
      document.documentElement.style.setProperty('--safe-area-bottom', '34px');
    }, standaloneTopInset);

    const expectPhysicalFullBleed = async (activeScreenSelector: string): Promise<void> => {
      const geometry = await page.evaluate((selector) => {
        const rect = (target: string) => {
          const node = document.querySelector<HTMLElement>(target);
          if (!node) throw new Error(`Missing safe-area geometry node: ${target}`);
          return node.getBoundingClientRect();
        };
        const shell = rect('.viewport-shell');
        const phone = rect('.phone');
        const screen = rect(selector);
        return {
          innerHeight: window.innerHeight,
          shell: { top: shell.top, bottom: shell.bottom },
          phone: { top: phone.top, bottom: phone.bottom },
          screen: { top: screen.top, bottom: screen.bottom },
        };
      }, activeScreenSelector);
      const physicalBottom = geometry.innerHeight + standaloneTopInset;

      expect(geometry.shell.top).toBeCloseTo(0, 1);
      expect(geometry.phone.top).toBeCloseTo(0, 1);
      expect(geometry.screen.top).toBeCloseTo(0, 1);
      expect(geometry.shell.bottom).toBeCloseTo(physicalBottom, 1);
      expect(geometry.phone.bottom).toBeCloseTo(physicalBottom, 1);
      expect(geometry.screen.bottom).toBeCloseTo(physicalBottom, 1);
    };

    await expectPhysicalFullBleed(qaSelectors.mainMenu);
    await page.locator(qaSelectors.settingsButton).click();
    const settings = page.locator(qaSelectors.settingsScreen);
    await expect(settings).toBeVisible();
    await settings.evaluate((node) => {
      node.scrollTop = node.scrollHeight;
    });

    const panelHeader = settings.locator('.panel-nav');
    const panelAction = panelHeader.locator('.app-header-action').first();
    await expect
      .poll(async () => (await panelHeader.boundingBox())?.y ?? -1)
      .toBeGreaterThanOrEqual(0);
    await expect
      .poll(async () => (await panelAction.boundingBox())?.y ?? -1)
      .toBeGreaterThanOrEqual(46);
    await expectPhysicalFullBleed(qaSelectors.settingsScreen);

    await page.locator(qaSelectors.settingsBack).click();
    await page.locator(qaSelectors.match3CampaignButton).click();
    await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();
    await expectPhysicalFullBleed(qaSelectors.match3CampaignScreen);
    health.assertClean();
  },
);
