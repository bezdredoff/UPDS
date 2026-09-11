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

test('keeps compact production touch targets at least 44px tall', async ({ page }) => {
  const health = observeBrowserHealth(page);
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto('./');
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();

  const expectAtLeast44 = async (selector: string): Promise<void> => {
    const heights = await page.locator(selector).evaluateAll((nodes) =>
      nodes.map((node) => (node as HTMLElement).getBoundingClientRect().height),
    );
    expect(heights.length).toBeGreaterThan(0);
    for (const height of heights) expect(height).toBeGreaterThanOrEqual(44);
  };

  await page.locator(qaSelectors.settingsButton).click();
  await expect(page.locator(qaSelectors.settingsScreen)).toBeVisible();
  await expectAtLeast44(qaSelectors.languageSelect);

  await page.locator(qaSelectors.settingsBack).click();
  await page.locator(qaSelectors.match3CampaignButton).click();
  await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();
  await expectAtLeast44(`${qaSelectors.match3CampaignScreen} .campaign-level-card button`);

  const lockedCard = page.locator('.campaign-level-card.locked').first();
  await expect(lockedCard).toBeVisible();
  const lockedPresentation = await lockedCard.evaluate((node) => {
    const heading = node.querySelector<HTMLElement>('.campaign-level-heading b');
    const meta = node.querySelector<HTMLElement>('.campaign-level-meta span');
    const button = node.querySelector<HTMLButtonElement>('button:disabled');
    if (!heading || !meta || !button) throw new Error('Missing locked Campaign presentation node');
    const cardStyle = getComputedStyle(node);
    return {
      opacity: cardStyle.opacity,
      filter: cardStyle.filter,
      headingColor: getComputedStyle(heading).color,
      metaColor: getComputedStyle(meta).color,
      buttonOpacity: getComputedStyle(button).opacity,
      buttonColor: getComputedStyle(button).color,
    };
  });
  expect(lockedPresentation.opacity).toBe('1');
  expect(lockedPresentation.filter).toBe('none');
  expect(lockedPresentation.headingColor).toBe('rgb(55, 51, 69)');
  expect(lockedPresentation.metaColor).toBe('rgb(79, 73, 85)');
  expect(lockedPresentation.buttonOpacity).toBe('1');
  expect(lockedPresentation.buttonColor).toBe('rgb(90, 83, 93)');
  await page.locator('#back').click();

  await page.locator(qaSelectors.newGame).click();
  await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
  await page.locator('#header-settings').click();
  await expect(page.locator('.vn-overlay[role="dialog"]')).toBeVisible();
  await expectAtLeast44('.vn-overlay .audio-preview-actions button');
  health.assertClean();
});

test(
  'bounds installed iPhone player and VN to the layout viewport without UI overflow',
  async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'webkit-mobile', 'iOS/WebKit safe-area regression');
    const health = observeBrowserHealth(page);
    await page.setViewportSize({ width: 440, height: 763 });
    await page.goto('./');
    await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();

    const standaloneTopInset = 0;
    const standaloneBottomInset = 34;
    await page.evaluate(({ topInset, bottomInset }) => {
      document.documentElement.dataset.updsDisplayMode = 'standalone';
      document.documentElement.style.setProperty('--safe-area-top', `${topInset}px`);
      document.documentElement.style.setProperty('--safe-area-bottom', `${bottomInset}px`);
    }, { topInset: standaloneTopInset, bottomInset: standaloneBottomInset });

    const expectViewportBounded = async (activeScreenSelector: string): Promise<void> => {
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
      const layoutBottom = geometry.innerHeight;

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
      expect(geometry.shell.bottom).toBeCloseTo(layoutBottom, 1);
      expect(geometry.phone.bottom).toBeCloseTo(layoutBottom, 1);
      expect(geometry.screen.bottom).toBeCloseTo(layoutBottom, 1);
    };

    await expectViewportBounded(qaSelectors.mainMenu);

    await page.locator(qaSelectors.settingsButton).click();
    const settings = page.locator(qaSelectors.settingsScreen);
    await expect(settings).toBeVisible();
    await settings.evaluate((node) => { node.scrollTop = node.scrollHeight; });
    const panelHeader = settings.locator('.panel-nav');
    const panelAction = panelHeader.locator('.app-header-action').first();
    await expect.poll(async () => (await panelHeader.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
    await expect.poll(async () => (await panelAction.boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(0);
    await expectViewportBounded(qaSelectors.settingsScreen);

    await page.locator(qaSelectors.settingsBack).click();
    await page.locator(qaSelectors.match3CampaignButton).click();
    await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();
    await expectViewportBounded(qaSelectors.match3CampaignScreen);
    await page.locator('#back').click();

    await page.locator(qaSelectors.newGame).click();
    const runtimeVn = page.locator('[data-vn-frame="shared"][data-frame-context="runtime"]');
    await expect(runtimeVn).toBeVisible();
    await expectViewportBounded('[data-vn-frame="shared"][data-frame-context="runtime"]');

    const vnBottom = await page.evaluate((bottomInset) => {
      const controls = document.querySelector<HTMLElement>('.vn-controls');
      const buttons = [...document.querySelectorAll<HTMLElement>('.vn-controls button')];
      if (!controls || buttons.length === 0) throw new Error('Missing VN controls');
      const controlsRect = controls.getBoundingClientRect();
      const highestButtonBottom = Math.max(...buttons.map((button) => button.getBoundingClientRect().bottom));
      return {
        controlsBottom: controlsRect.bottom,
        buttonBottom: highestButtonBottom,
        layoutBottom: window.innerHeight,
        safeTop: controlsRect.bottom - bottomInset,
      };
    }, standaloneBottomInset);

    expect(vnBottom.controlsBottom).toBeCloseTo(vnBottom.layoutBottom, 1);
    expect(vnBottom.buttonBottom).toBeLessThanOrEqual(vnBottom.safeTop + 1);
    health.assertClean();
  },
);
