import { expect, test, type Page } from '@playwright/test';
import { advanceToLine } from '../helpers/vn';

const readTrace = (page: Page) => page.evaluate(() => JSON.parse(
  (window as Window & { __updsViewportDebug: { exportJSON(): string } }).__updsViewportDebug.exportJSON(),
));

test('recorder is opt-in, records replaced nodes and geometry changes, and survives reload/offline', async ({ page, context }) => {
  await page.setViewportSize({ width: 402, height: 812 });
  await page.goto('./?qa=1&viewportdebug=0');
  await expect(page.locator('.menu-screen')).toBeVisible();
  expect(await page.evaluate(() => '__updsViewportDebug' in window)).toBe(false);
  await expect(page.locator('[data-viewport-debug]')).toHaveCount(0);
  const baseline = await page.locator('.phone').boundingBox();

  await page.goto('./?qa=1&viewportdebug=1');
  await expect(page.locator('[data-viewport-debug="overlay"]')).toBeVisible();
  expect(await page.locator('.phone').boundingBox()).toEqual(baseline);
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute('href', './viewport-debug.webmanifest');
  const manifest = await page.evaluate(async () => (await fetch('./viewport-debug.webmanifest')).json());
  expect(manifest.start_url).toContain('viewportdebug=1');
  await page.locator('#episodes').click();
  await page.locator('[data-scene="0"]').click();
  await advanceToLine(page, 'VN0002');
  await page.screenshot({ path: test.info().outputPath('recorder.png') });
  await page.getByRole('button', { name: 'Mark rescale', exact: true }).click();
  const before = await readTrace(page);
  expect(before.errors).toEqual([]);
  expect(before.early[0].reason).toBe('html:bootstrap');
  const reasons = before.startup.map((entry: { reason: string }) => entry.reason);
  for (const reason of ['bootstrap:immediate', 'bootstrap:before-services-ready', 'bootstrap:after-services-ready', 'bootstrap:before-mount', 'bootstrap:after-mount', 'AppShell.render:before', 'VnController.renderVN', 'VnController.measureDialogue:after']) expect(reasons).toContain(reason);
  const oldNode = before.marked.after.state.elements['.vn-screen'][0].node;

  // Synthetic layout perturbation tests recorder sensitivity, NOT iOS behavior.
  await page.evaluate(() => document.querySelector<HTMLElement>('.viewport-shell')!.style.height = '874px');
  await expect.poll(async () => {
    const trace = await readTrace(page);
    return [...trace.startup, ...trace.recent].some((entry) => entry.detail.changes.some((change) => change.selector === '.viewport-shell[0]' && change.old?.rect.height === 812 && change.new?.rect.height === 874));
  }).toBe(true);
  await page.getByRole('button', { name: 'Mark rescale', exact: true }).click();
  const trace = await readTrace(page);
  const state = trace.marked.after.state;
  expect(state.elements['.vn-screen'][0].node).toBe(oldNode);
  expect(state.elements['.vn-controls button']).toHaveLength(4);
  expect(state.cssHeights.dvh.height).toBe(812);
  expect(state.elements['.viewport-shell'][0].rect.height).toBe(874);
  expect(trace.styles[state.elements['.vn-screen'][0].style.styleRef]['grid-template-rows']).toBeTruthy();
  expect(trace.styles[state.elements['.vn-controls'][0].style.styleRef].background).toBeTruthy();
  expect(state.bottomHits.some((point) => point.outsideLayoutViewport)).toBe(true);
  expect(trace.startup.some((entry) => entry.reason === 'AppShell.render:before' && entry.detail.stack)).toBe(true);
  expect(trace.events.recent.some((entry) => entry.reason === 'ResizeObserver')).toBe(true);

  // Test-only tokens exercise the supplied grid budget; native env probes remain separate.
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--safe-area-top', '62px');
    document.documentElement.style.setProperty('--safe-area-bottom', '34px');
  });
  await page.getByRole('button', { name: 'Mark rescale', exact: true }).click();
  const budget = await readTrace(page);
  const grid = budget.marked.after.state.elements;
  expect(grid['.vn-controls'][0].rect.height).toBeGreaterThanOrEqual(91);
  expect(grid['.vn-topbar'][0].rect.height + grid['.stage'][0].rect.height + grid['.dialogue-shell'][0].rect.height + grid['.vn-controls'][0].rect.height).toBeCloseTo(874, 2);
  expect(budget.marked.after.state.safeArea.bottom).toBe('0px');
  await test.info().attach('synthetic-recorder-evidence.json', { body: JSON.stringify(budget), contentType: 'application/json' });

  // The opted-in preference also survives a launch URL without the query.
  await page.goto('./?qa=1');
  await expect(page.locator('[data-viewport-debug="overlay"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('.menu-screen')).toBeVisible();
  await expect(page.locator('[data-viewport-debug="overlay"]')).toBeVisible();
  const offline = await readTrace(page);
  const reportedOnline = await page.evaluate(() => navigator.onLine);
  expect([...offline.startup, ...offline.recent].some((entry) => entry.state.online === reportedOnline)).toBe(true);
  await context.setOffline(false);
  await page.goto('./?qa=1&viewportdebug=0');
  await expect(page.locator('.menu-screen')).toBeVisible();
  await expect(page.locator('[data-viewport-debug]')).toHaveCount(0);
});
