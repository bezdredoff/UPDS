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
  return {
    frameSame: host.__updsChromeStableFrame === document.querySelector('[data-vn-frame="shared"][data-frame-context="runtime"]'),
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
  for (const area of ['shell', 'phone', 'stage', 'portrait', 'dialogue', 'controls'] as const) {
    for (const field of ['top', 'bottom', 'width', 'height'] as const) {
      expect(after[area][field]).toBeCloseTo(before[area][field], 2);
    }
  }
};

test.describe('VN browser chrome stability', () => {
  test('height-only Safari resize signal cannot rescale or rebuild VN', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openQaScene(page, 0);
    await advanceToLine(page, 'VN0002');
    const before = await captureGeometry(page);

    await page.evaluate(() => {
      // Safari emits resize while its browser chrome changes. The global browser
      // viewport handler may run, but VN must remain on its stable 100svh frame.
      window.dispatchEvent(new Event('resize'));
      document.documentElement.style.setProperty('--upds-viewport-height', '500px');
    });
    await page.waitForTimeout(250);

    const after = await captureGeometry(page);
    expectSameGeometry(before, after);
    health.assertClean();
  });
});
