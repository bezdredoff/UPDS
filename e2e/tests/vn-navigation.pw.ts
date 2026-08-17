import { expect, test } from '@playwright/test';
import { observeBrowserHealth } from '../helpers/browserHealth';
import {
  advanceCurrentLineToChoice,
  advanceToLine,
  currentVnLineId,
  expectImageLoaded,
  openQaScene,
} from '../helpers/vn';
import { qaSelectors } from '../selectors';

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
