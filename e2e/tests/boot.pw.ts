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
    // iPhone 16/17 Pro Max use a 440px CSS viewport. This deliberately exceeds
    // the legacy 430px desktop-frame cap that caused the installed-PWA gap.
    await page.setViewportSize({ width: 440, height: 763 });
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
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          shell: { top: shell.top, right: shell.right, bottom: shell.bottom, left: shell.left },
          phone: { top: phone.top, right: phone.right, bottom: phone.bottom, left: phone.left },
          screen: { top: screen.top, right: screen.right, bottom: screen.bottom, left: screen.left },
        };
      }, activeScreenSelector);
      const physicalBottom = geometry.innerHeight + standaloneTopInset;

      expect(geometry.innerWidth).toBe(440);
      expect(geometry.shell.top).toBeCloseTo(0, 1);
      expect(geometry.phone.top).toBeCloseTo(0, 1);
      expect(geometry.screen.top).toBeCloseTo(0, 1);
      expect(geometry.shell.left).toBeCloseTo(0, 1);
      expect(geometry.phone.left).toBeCloseTo(0, 1);
      expect(geometry.screen.left).toBeCloseTo(0, 1);
      expect(geometry.shell.right).toBeCloseTo(geometry.innerWidth, 1);
      expect(geometry.phone.right).toBeCloseTo(geometry.innerWidth, 1);
      expect(geometry.screen.right).toBeCloseTo(geometry.innerWidth, 1);
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
