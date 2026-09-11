import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { advanceToLine, openQaScene } from '../helpers/vn';

const captureGeometry = async (page: import('@playwright/test').Page) => page.evaluate(() => {
  const rect = (selector: string) => {
    const node = document.querySelector<HTMLElement>(selector);
    if (!node) throw new Error(`Missing VN node: ${selector}`);
    const box = node.getBoundingClientRect();
    return { top: box.top, bottom: box.bottom, width: box.width, height: box.height };
  };
  const host = window as Window & { __updsChromeStableFrame?: Element | null };
  if (!host.__updsChromeStableFrame) {
    host.__updsChromeStableFrame = document.querySelector('[data-vn-frame="shared"][data-frame-context="runtime"]');
  }
  const rootStyle = getComputedStyle(document.documentElement);
  return {
    innerHeight: window.innerHeight,
    frameSame: host.__updsChromeStableFrame === document.querySelector('[data-vn-frame="shared"][data-frame-context="runtime"]'),
    frozenViewportHeight: rootStyle.getPropertyValue('--upds-viewport-height').trim(),
    dialogueToken: rootStyle.getPropertyValue('--upds-vn-dialogue-row').trim(),
    controlsToken: rootStyle.getPropertyValue('--upds-vn-controls-min-height').trim(),
    dialogueFontSize: getComputedStyle(document.querySelector<HTMLElement>('.dialogue-text')!).fontSize,
    shell: rect('.viewport-shell'),
    phone: rect('.phone'),
    stage: rect('.stage'),
    portrait: rect('.portrait'),
    dialogue: rect('.dialogue-shell'),
    controls: rect('.vn-controls'),
  };
});

const expectHeightOnlyViewportAdaptation = (before: Awaited<ReturnType<typeof captureGeometry>>, after: Awaited<ReturnType<typeof captureGeometry>>) => {
  expect(after.frameSame).toBe(true);
  expect(after.frozenViewportHeight).toBe(before.frozenViewportHeight);
  expect(after.dialogueToken).toBe(before.dialogueToken);
  expect(after.controlsToken).toBe(before.controlsToken);
  expect(after.dialogueFontSize).toBe(before.dialogueFontSize);

  for (const area of ['shell', 'phone'] as const) {
    expect(after[area].width, `${area}.width`).toBeCloseTo(before[area].width, 2);
  }

  const heightChange = after.innerHeight - before.innerHeight;
  expect(after.shell.top).toBeCloseTo(before.shell.top, 2);
  expect(after.phone.top).toBeCloseTo(before.phone.top, 2);
  expect(after.shell.bottom).toBeCloseTo(after.innerHeight, 2);
  expect(after.phone.bottom).toBeCloseTo(after.innerHeight, 2);
  expect(after.shell.height - before.shell.height).toBeCloseTo(heightChange, 2);
  expect(after.phone.height - before.phone.height).toBeCloseTo(heightChange, 2);
  expect(after.dialogue.bottom).toBeLessThanOrEqual(after.shell.bottom + 1);
  expect(after.controls.bottom).toBeLessThanOrEqual(after.shell.bottom + 1);
};

test.describe('VN browser chrome stability', () => {
  test('height-only Safari viewport change cannot cross the old compact threshold or rebuild VN', async ({ page }) => {
    const health = observeBrowserHealth(page);

    // Load below the secondary 760px vertical-fit threshold but above the old
    // 650px compact threshold. Crossing 650px must now be presentation-neutral
    // because compact layout is owned by the game container width.
    await page.setViewportSize({ width: 390, height: 700 });
    await openQaScene(page, 0);
    await advanceToLine(page, 'VN0002');

    await page.addStyleTag({
      content: '[data-vn-frame="shared"][data-frame-context="runtime"], [data-vn-frame="shared"][data-frame-context="runtime"] * { animation: none !important; transition: none !important; }',
    });
    await page.waitForTimeout(50);

    const before = await captureGeometry(page);

    await page.setViewportSize({ width: 390, height: 620 });
    await page.waitForTimeout(250);

    const after = await captureGeometry(page);
    expectHeightOnlyViewportAdaptation(before, after);
    health.assertClean();
  });

  test('real game-container narrowing enables compact VN presentation', async ({ page }) => {
    const health = observeBrowserHealth(page);

    await page.setViewportSize({ width: 390, height: 700 });
    await openQaScene(page, 0);
    await advanceToLine(page, 'VN0002');

    const normalFontSize = await page.locator('.dialogue-text').evaluate((node) => getComputedStyle(node).fontSize);
    expect(normalFontSize).toBe('17px');

    await page.setViewportSize({ width: 320, height: 700 });
    await expect.poll(async () => page.locator('.dialogue-text').evaluate((node) => getComputedStyle(node).fontSize)).toBe('14px');

    const gameWidth = await page.locator('.game-viewport').evaluate((node) => node.getBoundingClientRect().width);
    expect(gameWidth).toBeCloseTo(320, 1);
    health.assertClean();
  });
});
