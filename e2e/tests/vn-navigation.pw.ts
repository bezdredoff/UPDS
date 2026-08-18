import { expect, test, type Page } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import { resetBrowserState } from '../helpers/runtime';
import {
  advanceCurrentLineToChoice,
  advanceToLine,
  currentVnLineId,
  expectImageLoaded,
  openQaScene,
} from '../helpers/vn';
import { qaSelectors } from '../selectors';

type VnViewportGeometry = Readonly<{
  innerWidth: number;
  innerHeight: number;
  visualWidth: number;
  visualHeight: number;
  visualScale: number;
  phone: Readonly<{ left: number; top: number; right: number; bottom: number; width: number; height: number }>;
  header: Readonly<{ left: number; top: number; right: number; bottom: number; width: number; height: number }>;
  controls: Readonly<{ left: number; top: number; right: number; bottom: number; width: number; height: number }>;
}>;

async function openBelarusianQaScene(page: Page, sceneIndex: number): Promise<void> {
  await resetBrowserState(page);
  await page.locator(qaSelectors.settingsButton).click();
  await expect(page.locator(qaSelectors.settingsScreen)).toBeVisible();
  await page.locator(qaSelectors.languageSelect).selectOption('be');
  await expect(page.locator(qaSelectors.languageSelect)).toHaveValue('be');
  await expect.poll(() => page.locator('html').getAttribute('lang')).toBe('be');
  await page.locator(qaSelectors.settingsBack).click();
  await expect(page.locator(qaSelectors.mainMenu)).toBeVisible();
  await page.locator(qaSelectors.sceneNavigationButton).click();
  await expect(page.locator(qaSelectors.sceneNavigationScreen)).toBeVisible();
  await page.locator(`${qaSelectors.sceneButton}[data-scene="${sceneIndex}"]`).click();
  await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
}

async function captureVnViewportGeometry(page: Page): Promise<VnViewportGeometry> {
  return page.evaluate(() => {
    const rect = (selector: string) => {
      const node = document.querySelector<HTMLElement>(selector);
      if (!node) throw new Error(`Missing VN geometry node: ${selector}`);
      const box = node.getBoundingClientRect();
      return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
    };
    const visual = window.visualViewport;
    return {
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      visualWidth: visual?.width ?? window.innerWidth,
      visualHeight: visual?.height ?? window.innerHeight,
      visualScale: visual?.scale ?? 1,
      phone: rect('.phone'),
      header: rect('.vn-topbar'),
      controls: rect('.vn-controls'),
    };
  });
}

function expectStableVnViewport(before: VnViewportGeometry, after: VnViewportGeometry): void {
  expect(after.innerWidth).toBe(before.innerWidth);
  expect(after.innerHeight).toBe(before.innerHeight);
  expect(after.visualWidth).toBeCloseTo(before.visualWidth, 3);
  expect(after.visualHeight).toBeCloseTo(before.visualHeight, 3);
  expect(after.visualScale).toBeCloseTo(before.visualScale, 5);
  for (const area of ['phone', 'header', 'controls'] as const) {
    for (const edge of ['left', 'top', 'right', 'bottom', 'width', 'height'] as const) {
      expect(after[area][edge]).toBeCloseTo(before[area][edge], 3);
    }
  }
  expect(after.header.top).toBeGreaterThanOrEqual(after.phone.top - 0.5);
  expect(after.controls.bottom).toBeLessThanOrEqual(after.phone.bottom + 0.5);
}

async function expectStableDialoguePageAdvance(page: Page, lineId: string): Promise<void> {
  await advanceToLine(page, lineId, 80);
  const dialogue = page.locator(qaSelectors.vnDialogue);
  await expect.poll(async () => Number((await dialogue.getAttribute('data-dialogue-pages')) ?? '0')).toBeGreaterThan(1);
  await expect(dialogue).toHaveAttribute('data-dialogue-page', '1');

  await page.evaluate(() => {
    const host = window as Window & { __updsVnFrameNode?: Element | null };
    host.__updsVnFrameNode = document.querySelector('[data-vn-frame="shared"][data-frame-context="runtime"]');
  });
  const before = await captureVnViewportGeometry(page);

  await page.locator(qaSelectors.vnNext).click();

  await expect(dialogue).toHaveAttribute('data-dialogue-page', '2');
  expect(await currentVnLineId(page)).toBe(lineId);
  expect(await page.evaluate(() => {
    const host = window as Window & { __updsVnFrameNode?: Element | null };
    return host.__updsVnFrameNode === document.querySelector('[data-vn-frame="shared"][data-frame-context="runtime"]');
  })).toBe(true);
  expectStableVnViewport(before, await captureVnViewportGeometry(page));
}

test.describe('VN through QA Scene Navigation', () => {
  test('uses real browser-measured paging on the production VN frame', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openQaScene(page, 0);

    expect(await currentVnLineId(page)).toBe('VN0001');
    await expect(page.locator(qaSelectors.vnDirectionCard)).toBeVisible();
    await expectImageLoaded(page.locator(qaSelectors.vnBackgroundFit));

    const dialogue = page.locator(qaSelectors.vnDialogue);
    await expect.poll(async () =>
      Number((await dialogue.getAttribute('data-dialogue-pages')) ?? '0'),
    ).toBeGreaterThan(1);

    await expect(dialogue).toHaveAttribute('data-dialogue-page', '1');
    expect((await dialogue.textContent())?.trim().endsWith('…')).toBe(true);

    await page.locator(qaSelectors.vnNext).click();

    await expect(dialogue).toHaveAttribute('data-dialogue-page', '2');
    expect(await currentVnLineId(page)).toBe('VN0001');
    health.assertClean();
  });

  test('keeps Belarusian multi-page dialogue on one stable iOS viewport across the story', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'webkit-mobile', 'iOS/WebKit-specific paging corpus');
    test.slow();
    const health = observeBrowserHealth(page);
    const regressionGroups = [
      { scene: 0, lines: ['VN0001'] },
      { scene: 5, lines: ['VN0156', 'VN0158', 'VN0160'] },
      { scene: 13, lines: ['VN0340'] },
      { scene: 26, lines: ['VN0595'] },
      { scene: 33, lines: ['VN0732'] },
      { scene: 44, lines: ['VN0964'] },
    ] as const;

    for (const group of regressionGroups) {
      await openBelarusianQaScene(page, group.scene);
      for (const lineId of group.lines) await expectStableDialoguePageAdvance(page, lineId);
    }

    health.assertClean();
  });

  test('resolves fallback and authored multi-actor production staging with loaded assets', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openQaScene(page, 0);

    await advanceToLine(page, 'VN0002');
    const fallbackCharacter = page.locator(`${qaSelectors.vnCharacter}[data-character="miku"]`);
    await expect(fallbackCharacter).toBeVisible();
    await expectImageLoaded(fallbackCharacter.locator('img'));

    await advanceToLine(page, 'VN0008');

    const shot = page.locator(`${qaSelectors.vnAuthoredShot}[data-authored-shot="VN0008"]`);
    await expect(shot).toBeVisible();
    await expect(shot).toHaveAttribute('data-scene-preset', 'trio-central-speaker');

    const actors = shot.locator(qaSelectors.vnAuthoredActor);
    await expect(actors).toHaveCount(3);
    await expect(shot.locator(`${qaSelectors.vnAuthoredActor}[data-speaking="true"]`)).toHaveCount(1);
    await expect(actors.locator('[data-vertical-anchor="background-focal-eye-line"]')).toHaveCount(3);

    for (let index = 0; index < 3; index += 1) {
      await expectImageLoaded(actors.nth(index).locator('img'));
    }
    await expectImageLoaded(page.locator(qaSelectors.vnBackgroundFit));
    health.assertClean();
  });

  test('reaches CHOICE_00 through the real scene flow and resumes the selected branch', async ({ page }) => {
    const health = observeBrowserHealth(page);
    await openQaScene(page, 1);

    expect(await currentVnLineId(page)).toBe('VN0023');
    await advanceToLine(page, 'VN0040');
    await advanceCurrentLineToChoice(page);

    await expect(page.locator(qaSelectors.vnChoiceScreen)).toBeVisible();
    await expect(page.locator(qaSelectors.vnChoiceButton)).toHaveCount(3);
    await expectImageLoaded(page.locator(qaSelectors.vnChoiceBackgroundFit));

    await page.locator(`${qaSelectors.vnChoiceButton}[data-choice="B"]`).click();

    await expect(page.locator(qaSelectors.vnRuntimeFrame)).toBeVisible();
    expect(await currentVnLineId(page)).toBe('VN0041B');
    health.assertClean();
  });
});
