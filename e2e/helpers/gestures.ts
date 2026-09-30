import { expect, type Page } from '@playwright/test';

/** Audit actual rendered descendants, not just the outer viewport shell. */
export async function expectPlayerGesturePolicy(page: Page): Promise<void> {
  const violations = await page.locator('.viewport-shell, .viewport-shell *').evaluateAll((nodes) =>
    nodes.flatMap((node) => {
      // Native select options are OS UI, not rendered page tap targets.
      if (node.getClientRects().length === 0) return [];
      const dragSurface = node.closest('.board, .scene-studio-actor-slot[data-editor-draggable="true"] .scene-studio-runtime-portrait');
      const expected = dragSurface ? 'none' : 'manipulation';
      const actual = getComputedStyle(node).touchAction;
      return actual === expected ? [] : [{ tag: node.tagName, class: node.getAttribute('class'), actual, expected }];
    }),
  );
  expect(violations).toEqual([]);
  const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
  expect(viewport).not.toMatch(/user-scalable\s*=\s*no|maximum-scale\s*=\s*1(?:\D|$)/);
}

/** Native touch input, deliberately not synthetic click events. */
export async function expectRapidTapsKeepScale(page: Page, selectors: readonly string[]): Promise<void> {
  for (const selector of selectors) {
    const target = page.locator(selector).first();
    await expect(target).toBeVisible();
    await target.scrollIntoViewIfNeeded();
    const box = await target.boundingBox();
    if (!box) throw new Error(`Missing rapid-tap target: ${selector}`);
    const before = await page.evaluate(() => window.visualViewport?.scale ?? 1);
    await target.evaluate((node) => {
      node.setAttribute('data-test-blocked-taps', '0');
      node.addEventListener('touchend', (event) => {
        if (event.defaultPrevented) node.setAttribute('data-test-blocked-taps', String(Number(node.getAttribute('data-test-blocked-taps')) + 1));
      });
    });
    for (let tap = 0; tap < 4; tap += 1) {
      await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
    }
    await page.waitForTimeout(350);
    expect(await page.evaluate(() => window.visualViewport?.scale ?? 1), selector).toBeCloseTo(before, 5);
    expect(Number(await target.getAttribute('data-test-blocked-taps')), `fallback reached: ${selector}`).toBeGreaterThan(0);
  }
}
