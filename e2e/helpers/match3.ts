import { expect, type Locator, type Page } from '@playwright/test';
import { resetBrowserState } from './runtime';
import { qaSelectors } from '../selectors';

export const deterministicLabSeed = 7;
export const deterministicCascadeSeed = 424242;
export const deterministicLabMoves = 12;
export const deterministicInvalidSwap = [4, 5] as const;
export const deterministicFlashSwap = [9, 2] as const;

export const deterministicInitialTiles = [{"index":0,"tile":"pantiesSportWhite"},{"index":1,"tile":"pantiesSportWhite"},{"index":2,"tile":"pantiesLacePink"},{"index":3,"tile":"pantiesSportWhite"},{"index":4,"tile":"sportsBra"},{"index":5,"tile":"laundryTag"},{"index":6,"tile":"pantiesSportWhite"},{"index":7,"tile":"pantiesLacePink"},{"index":8,"tile":"pantiesHighWaistBlack"},{"index":9,"tile":"pantiesSportWhite"},{"index":10,"tile":"pantiesSportWhite"},{"index":11,"tile":"laundryTag"},{"index":12,"tile":"pantiesSportWhite"},{"index":13,"tile":"pantiesLacePink"},{"index":14,"tile":"pantiesHighWaistBlack"},{"index":15,"tile":"pantiesSportOrange"},{"index":16,"tile":"sportsBra"},{"index":17,"tile":"laundryTag"},{"index":18,"tile":"pantiesSportWhite"},{"index":19,"tile":"pantiesLacePink"},{"index":20,"tile":"pantiesHighWaistBlack"},{"index":21,"tile":"pantiesSportOrange"},{"index":22,"tile":"sportsBra"},{"index":23,"tile":"laundryTag"},{"index":24,"tile":"pantiesSportWhite"},{"index":25,"tile":"pantiesLacePink"},{"index":26,"tile":"pantiesHighWaistBlack"},{"index":27,"tile":"pantiesSportOrange"},{"index":28,"tile":"sportsBra"},{"index":29,"tile":"laundryTag"},{"index":30,"tile":"pantiesSportWhite"},{"index":31,"tile":"pantiesLacePink"},{"index":32,"tile":"pantiesHighWaistBlack"},{"index":33,"tile":"pantiesSportOrange"},{"index":34,"tile":"sportsBra"},{"index":35,"tile":"laundryTag"},{"index":36,"tile":"pantiesSportWhite"},{"index":37,"tile":"pantiesLacePink"},{"index":38,"tile":"pantiesHighWaistBlack"},{"index":39,"tile":"pantiesSportOrange"},{"index":40,"tile":"sportsBra"},{"index":41,"tile":"laundryTag"},{"index":42,"tile":"pantiesSportWhite"},{"index":43,"tile":"pantiesLacePink"},{"index":44,"tile":"pantiesHighWaistBlack"},{"index":45,"tile":"pantiesSportOrange"},{"index":46,"tile":"sportsBra"},{"index":47,"tile":"laundryTag"},{"index":48,"tile":"pantiesSportWhite"},{"index":49,"tile":"pantiesLacePink"},{"index":50,"tile":"pantiesHighWaistBlack"},{"index":51,"tile":"pantiesSportOrange"},{"index":52,"tile":"sportsBra"},{"index":53,"tile":"laundryTag"},{"index":54,"tile":"pantiesSportWhite"},{"index":55,"tile":"pantiesLacePink"},{"index":56,"tile":"pantiesHighWaistBlack"},{"index":57,"tile":"pantiesSportOrange"},{"index":58,"tile":"sportsBra"},{"index":59,"tile":"laundryTag"},{"index":60,"tile":"pantiesSportWhite"},{"index":61,"tile":"pantiesLacePink"},{"index":62,"tile":"pantiesHighWaistBlack"}];

const deterministicObjective = [
  { kind: 'collect', tile: 'pantiesSportWhite', target: 10, label: 'Browser white evidence' },
];

export async function openCampaignFirstLevel(page: Page): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await resetBrowserState(page);
  await page.locator(qaSelectors.match3CampaignButton).click();
  await expect(page.locator(qaSelectors.match3CampaignScreen)).toBeVisible();

  const firstLevel = page.locator(`${qaSelectors.match3CampaignLevelButton}[data-campaign-level="0"]`);
  await expect(firstLevel).toBeEnabled();
  await firstLevel.click();

  await expect(page.locator(qaSelectors.match3Screen)).toBeVisible();
  await expect(page.locator(qaSelectors.match3Board)).toBeVisible();
}

export async function openDeterministicLab(
  page: Page,
  seed = deterministicLabSeed,
  objectives: readonly unknown[] = deterministicObjective,
  ingredients: readonly unknown[] = [],
  initialTiles: readonly { index: number; tile: string }[] = deterministicInitialTiles,
): Promise<void> {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await resetBrowserState(page);
  await page.locator(qaSelectors.levelLabButton).click();
  await expect(page.locator(qaSelectors.levelLabScreen)).toBeVisible();

  await page.locator(qaSelectors.levelLabLevel).selectOption('0');
  await page.locator(qaSelectors.levelLabSeed).fill(String(seed));
  await page.locator(qaSelectors.levelLabPreview).click();
  await expect(page.locator(qaSelectors.levelLabSeed)).toHaveValue(String(seed));

  await page.locator(qaSelectors.levelLabMoves).fill(String(deterministicLabMoves));
  const ingredientIndices = new Set(ingredients.flatMap((ingredient) => {
    if (!ingredient || typeof ingredient !== 'object' || !('index' in ingredient)) return [];
    return [Number((ingredient as { index: unknown }).index)];
  }));
  await page.locator(qaSelectors.levelLabInitialTiles).fill(JSON.stringify(
    initialTiles.filter(({ index }) => !ingredientIndices.has(index)),
  ));
  await page.locator(qaSelectors.levelLabBlockers).fill('[]');
  await page.locator(qaSelectors.levelLabIngredients).fill(JSON.stringify(ingredients));
  await page.locator(qaSelectors.levelLabObjectives).fill(JSON.stringify(objectives));
  await page.locator(qaSelectors.levelLabApply).click();

  await expect(page.locator(qaSelectors.levelLabValidation)).toHaveClass(/\bvalid\b/);
  await expect(page.locator(qaSelectors.levelLabPlay)).toBeEnabled();
  await page.locator(qaSelectors.levelLabPlay).click();

  await expect(page.locator(qaSelectors.match3Screen)).toBeVisible();
  await expect(page.locator(qaSelectors.match3StageId)).toHaveText(`SEED ${seed}`);
  await expect(page.locator(qaSelectors.match3Moves)).toHaveText(String(deterministicLabMoves));
  await expect(page.locator(qaSelectors.match3Cell)).toHaveCount(63);
}

export function match3Cell(page: Page, index: number): Locator {
  return page.locator(`${qaSelectors.match3Cell}[data-cell="${index}"]`);
}

export async function tileVariant(page: Page, index: number): Promise<string> {
  return (await match3Cell(page, index).locator(qaSelectors.match3Tile).getAttribute('data-tile-variant')) ?? '';
}

export async function movesLeft(page: Page): Promise<number> {
  return Number((await page.locator(qaSelectors.match3Moves).textContent())?.trim() ?? 'NaN');
}

export async function firstObjectiveProgress(page: Page): Promise<readonly [number, number]> {
  const text = (await page.locator(qaSelectors.match3ObjectiveValue).first().textContent())?.trim() ?? '';
  const match = /^(\d+)\/(\d+)$/.exec(text);
  if (!match) throw new Error(`Unexpected objective progress: ${text}`);
  return [Number(match[1]), Number(match[2])] as const;
}

export async function tapSwap(page: Page, first: number, second: number): Promise<void> {
  await match3Cell(page, first).click();
  await match3Cell(page, second).click();
}

export async function activateSpecialByDoubleTap(page: Page, index: number): Promise<void> {
  await page.evaluate((cellIndex) => {
    document.querySelector<HTMLElement>(`[data-cell="${cellIndex}"]`)?.click();
    document.querySelector<HTMLElement>(`[data-cell="${cellIndex}"]`)?.click();
  }, index);
}
