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
    frameSame: host.__updsChromeStableFrame === document.querySelector('[data-vn-frame="shared"][data-frame-context="runtime"]'),
    frozenViewportHeight: rootStyle.getPropertyValue('--upds-viewport-height').trim(),
    dialogueToken: rootStyle.getPropertyValue('--upds-vn-dialogue-row').trim(),
    controlsToken: rootStyle.getPropertyValue('--upds-vn-controls-min-height').trim(),
    shell: rect('.viewport-shell'),
    phone: rect('.phone'),
    stage: rect('.stage'),
    portrait: rect('.portrait'),
    dialogue: rect('.dialogue-shell'),
    controls: rect('.vn-controls'),
  };
});

const expectSameGeometry = (before: Awaited<ReturnType<typeof captureGeometry>>, after: Awaited<ReturnType<typeof captureGeometry>>) => {
  expect(after.frameSame).toBe(true);
  expect(after.frozenViewportHeight).toBe(before.frozenViewportHeight);
  expect(after.dialogueToken).toBe(before.dialogueToken);
  expect(after.controlsToken).toBe(before.controlsToken);
  for (const area of ['shell', 'phone', 'stage', 'portrait', 'dialogue', 'controls'] as const) {
    for (const field of ['top', 'bottom', 'width', 'height'] as const) {
      expect(after[area][field]).toBeCloseTo(before[area][field], 2);
    }
  }
};

test.describe('VN browser chrome stability', () => {
  test('height-only Safari viewport change cannot rescale or rebuild VN', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openQaScene(page, 0);
    await advanceToLine(page, 'VN0002');

    await page.addStyleTag({
      content: '[data-vn-frame="shared"][data-frame-context="runtime"], [data-vn-frame="shared"][data-frame-context="runtime"] * { animation: none !important; transition: none !important; }',
    });
    await page.waitForTimeout(50);

    const before = await captureGeometry(page);
    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Missing Playwright viewport');

    // This changes window.innerHeight and CSS dynamic viewport units while
    // keeping width identical, matching Safari chrome movement much more closely
    // than manually mutating a production CSS variable.
    await page.setViewportSize({ width: viewport.width, height: viewport.height - 100 });
    await page.waitForTimeout(250);

    const after = await captureGeometry(page);
    expectSameGeometry(before, after);
    health.assertClean();
  });
});
