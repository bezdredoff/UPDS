import { expect, test, type Page } from '@playwright/test';
import { advanceToLine } from '../helpers/vn';

const readTrace = (page: Page) => page.evaluate(() => JSON.parse(
  (window as Window & { __updsViewportDebug: { exportJSON(): string } }).__updsViewportDebug.exportJSON(),
));
const markedState = (trace) => [...trace.startup, ...trace.recent].find((entry) => entry.id === trace.marks[trace.marks.length - 1].after).state;

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
  const oldNode = markedState(before).elements['.vn-screen'][0].node;

  // Synthetic layout perturbation tests recorder sensitivity, NOT iOS behavior.
  await page.evaluate(() => document.querySelector<HTMLElement>('.viewport-shell')!.style.height = '874px');
  await expect.poll(async () => {
    const trace = await readTrace(page);
    return [...trace.startup, ...trace.recent].some((entry) => entry.detail.changes.some((change) => change.selector === '.viewport-shell[0]' && change.old?.rect.height === 812 && change.new?.rect.height === 874));
  }).toBe(true);
  await page.getByRole('button', { name: 'Mark rescale', exact: true }).click();
  const trace = await readTrace(page);
  const state = markedState(trace);
  expect(state.elements['.vn-screen'][0].node).toBe(oldNode);
  expect(state.elements['.vn-controls button']).toHaveLength(4);
  expect(state.cssHeights.dvh.height).toBe(812);
  expect(state.elements['.viewport-shell'][0].rect.height).toBe(874);
  expect(trace.styles[state.elements['.vn-screen'][0].style.styleRef]['grid-template-rows']).toBeTruthy();
  expect(trace.styles[state.elements['.vn-controls'][0].style.styleRef].background).toBeTruthy();
  expect(state.bottomHits.some((point) => point.outsideLayoutViewport)).toBe(true);
  expect(trace.startup.some((entry) => entry.reason === 'AppShell.render:before' && entry.detail.stack)).toBe(true);
  expect(trace.events.some((entry) => entry.reason === 'ResizeObserver')).toBe(true);

  // Test-only tokens exercise the supplied grid budget; native env probes remain separate.
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--safe-area-top', '62px');
    document.documentElement.style.setProperty('--safe-area-bottom', '34px');
  });
  await page.getByRole('button', { name: 'Mark rescale', exact: true }).click();
  const budget = await readTrace(page);
  const grid = markedState(budget).elements;
  expect(grid['.vn-controls'][0].rect.height).toBeGreaterThanOrEqual(91);
  expect(grid['.vn-topbar'][0].rect.height + grid['.stage'][0].rect.height + grid['.dialogue-shell'][0].rect.height + grid['.vn-controls'][0].rect.height).toBeCloseTo(874, 2);
  expect(markedState(budget).safeArea.bottom).toBe('0px');
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

test('export paints Preparing, copies successfully, and keeps manual JSON accessible after clipboard rejection', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('./?qa=1&viewportdebug=1');
  const panel = page.locator('[data-viewport-debug="overlay"]');
  await expect(panel).toBeVisible();
  await page.evaluate(() => {
    const host = document.querySelector('[data-viewport-debug="overlay"]')!.shadowRoot!;
    const prepare = host.querySelector<HTMLButtonElement>('#prepare')!;
    const observations: unknown[] = [];
    (window as any).__preparing = observations;
    // A synchronous observer and a callback in the following frame both see Preparing.
    prepare.addEventListener('click', () => {
      const observe = () => observations.push({ status: host.querySelector('#status')!.textContent, disabled: prepare.disabled });
      observe(); requestAnimationFrame(observe);
    });
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async (text: string) => { (window as any).__copied = text; } } });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: () => false });
  });
  await panel.getByRole('button', { name: 'Prepare JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Ready ·');
  expect(await page.evaluate(() => (window as any).__preparing)).toEqual([
    { status: 'Preparing JSON…', disabled: true }, { status: 'Preparing JSON…', disabled: true },
  ]);
  await expect(panel.getByRole('button', { name: 'Share JSON', exact: true })).toBeHidden();
  await panel.getByRole('button', { name: 'Copy JSON', exact: true }).click();
  await expect(panel.locator('#status')).toHaveText('Copied');
  const copied = await page.evaluate(() => (window as any).__copied);
  expect(JSON.parse(copied).schema).toBe('upds-viewport-debug-v2');
  expect(JSON.parse(copied).mode).toBe('compact');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => Promise.reject(new Error('clipboard-denied-test')) } }));
  await panel.getByRole('button', { name: 'Copy JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Clipboard failed: Error: clipboard-denied-test');
  const area = panel.getByRole('textbox', { name: 'Debug JSON' });
  await expect(area).toBeVisible();
  expect(await area.inputValue()).toBe(copied);
  await panel.getByRole('button', { name: 'Select All', exact: true }).click();
  expect(await area.evaluate((node: HTMLTextAreaElement) => node.selectionEnd - node.selectionStart)).toBe(copied.length);
  expect(await area.evaluate((node) => {
    const section = node.closest('section')!;
    return getComputedStyle(section).overflowY === 'auto' && node.getBoundingClientRect().bottom <= innerHeight && node.scrollHeight > node.clientHeight;
  })).toBe(true);
  const downloadPromise = page.waitForEvent('download');
  await panel.getByRole('button', { name: 'Download JSON', exact: true }).click();
  expect((await downloadPromise).suggestedFilename()).toMatch(/^upds-viewport-debug-.*\.json$/);
});

test('export shares a JSON File with a fresh gesture and exposes the entire manual payload', async ({ page }) => {
  await page.goto('./?qa=1&viewportdebug=1');
  const panel = page.locator('[data-viewport-debug="overlay"]');
  await expect(panel).toBeVisible();
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: ({ files }) => files.length === 1 && files[0] instanceof File });
    Object.defineProperty(navigator, 'share', { configurable: true, value: async ({ files }) => {
      (window as any).__shared = { name: files[0].name, type: files[0].type, active: navigator.userActivation.isActive, text: await files[0].text() };
    } });
  });
  await panel.getByRole('button', { name: 'Prepare JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Ready ·');
  await panel.getByRole('button', { name: 'Share JSON', exact: true }).click();
  await expect(panel.locator('#status')).toHaveText('Share opened');
  await expect.poll(() => page.evaluate(() => Boolean((window as any).__shared))).toBe(true);
  const shared = await page.evaluate(() => (window as any).__shared);
  expect(shared.name).toMatch(/^upds-viewport-debug-.*\.json$/);
  expect(shared.type).toBe('application/json');
  expect(shared.active).toBe(true);
  await panel.getByRole('button', { name: 'Show JSON', exact: true }).click();
  expect(await panel.getByRole('textbox', { name: 'Debug JSON' }).inputValue()).toBe(shared.text);
});

test('generation failure displays error and stack and retries preserve startup and marked evidence', async ({ page }) => {
  await page.goto('./?qa=1&viewportdebug=1');
  const panel = page.locator('[data-viewport-debug="overlay"]');
  await panel.getByRole('button', { name: 'Mark rescale', exact: true }).click();
  const original = await readTrace(page);
  await panel.getByRole('button', { name: 'Prepare JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Ready ·');
  await panel.getByRole('button', { name: 'Show JSON', exact: true }).click();
  const previousPayload = await panel.getByRole('textbox', { name: 'Debug JSON' }).inputValue();
  await page.evaluate(() => {
    const stringify = JSON.stringify;
    JSON.stringify = function(value, ...args) {
      if (value?.schema === 'upds-viewport-debug-v2') throw new Error('export-generation-test');
      return stringify(value, ...args);
    } as typeof JSON.stringify;
    (window as any).__restoreStringify = () => { JSON.stringify = stringify; };
  });
  await panel.getByRole('button', { name: 'Prepare JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Export failed: Error: export-generation-test');
  await expect(panel.locator('#status')).toContainText('at JSON.stringify');
  await expect(panel.getByRole('button', { name: 'Prepare JSON', exact: true })).toBeEnabled();
  expect(await panel.getByRole('textbox', { name: 'Debug JSON' }).inputValue()).toBe(previousPayload);
  await expect(panel.getByRole('button', { name: 'Copy JSON', exact: true })).toBeEnabled();
  await page.evaluate(() => (window as any).__restoreStringify());
  for (const button of ['Prepare JSON', 'Full export', 'Prepare JSON']) {
    await panel.getByRole('button', { name: button, exact: true }).click();
    await expect(panel.locator('#status')).toContainText('Ready ·');
    await panel.getByRole('button', { name: 'Show JSON', exact: true }).click();
    const trace = JSON.parse(await panel.getByRole('textbox', { name: 'Debug JSON' }).inputValue());
    expect(trace.startup.slice(0, original.startup.length)).toEqual(original.startup);
    expect(trace.marks).toEqual(original.marks);
    expect(markedState(trace)).toEqual(markedState(original));
  }
});

test('File and object URL failures cannot remove Copy and Show JSON', async ({ page }) => {
  await page.goto('./?qa=1&viewportdebug=1');
  await page.evaluate(() => {
    (window as any).File = class { constructor() { throw new Error('File unavailable'); } };
    URL.createObjectURL = () => { throw new Error('object URL unavailable'); };
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  });
  const panel = page.locator('[data-viewport-debug="overlay"]');
  await panel.getByRole('button', { name: 'Prepare JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Ready ·');
  await expect(panel.getByRole('button', { name: 'Share JSON', exact: true })).toBeHidden();
  await panel.getByRole('button', { name: 'Copy JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Clipboard failed: Error: Clipboard API unavailable');
  const area = panel.getByRole('textbox', { name: 'Debug JSON' });
  await expect(area).toBeVisible();
  const json = await area.inputValue();
  await panel.getByRole('button', { name: 'Download JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Download failed: Error: object URL unavailable');
  expect(await area.inputValue()).toBe(json);
});

test('a pending clipboard promise times out visibly without blocking manual extraction', async ({ page }) => {
  await page.goto('./?qa=1&viewportdebug=1');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: () => new Promise(() => {}) } }));
  const panel = page.locator('[data-viewport-debug="overlay"]');
  await panel.getByRole('button', { name: 'Prepare JSON', exact: true }).click();
  await expect(panel.locator('#status')).toContainText('Ready ·');
  await panel.getByRole('button', { name: 'Copy JSON', exact: true }).click();
  await panel.getByRole('button', { name: 'Show JSON', exact: true }).click();
  await expect(panel.getByRole('textbox', { name: 'Debug JSON' })).toBeVisible();
  await expect(panel.locator('#status')).toContainText('Clipboard failed: Error: Clipboard did not respond', { timeout: 12000 });
  await expect(panel.getByRole('button', { name: 'Copy JSON', exact: true })).toBeEnabled();
});
