import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { openQaScene } from '../helpers/vn';

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
    portrait: document.querySelector<HTMLElement>('.portrait') ? rect('.portrait') : null,
    dialogue: rect('.dialogue-shell'),
    controls: rect('.vn-controls'),
  };
});

const expectSameGeometry = (before: Awaited<ReturnType<typeof captureGeometry>>, after: Awaited<ReturnType<typeof captureGeometry>>) => {
  expect(after.frameSame).toBe(true);
  for (const area of ['shell', 'phone', 'stage', 'dialogue', 'controls'] as const) {
    for (const field of ['top', 'bottom', 'width', 'height'] as const) {
      expect(after[area][field]).toBeCloseTo(before[area][field], 2);
    }
  }
  if (before.portrait && after.portrait) {
    for (const field of ['top', 'bottom', 'width', 'height'] as const) {
      expect(after.portrait[field]).toBeCloseTo(before.portrait[field], 2);
    }
  }
};

test.describe('VN browser chrome stability', () => {
  test('height-only Safari resize signal cannot rescale or rebuild VN', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openQaScene(page, 0);
    const before = await captureGeometry(page);

    await page.evaluate(() => {
      // Simulate the root dynamic-height update that mobile Safari performs when
      // browser chrome changes. VN browser CSS must ignore it in favour of 100svh.
      document.documentElement.style.setProperty('--upds-viewport-height', '500px');
      window.dispatchEvent(new Event('resize'));
    });
    await page.waitForTimeout(250);

    const after = await captureGeometry(page);
    expectSameGeometry(before, after);
    health.assertClean();
  });
});
