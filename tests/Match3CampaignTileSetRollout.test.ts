import { describe, expect, it } from 'vitest';
import { levels, tilePresentation, type Match3TileId } from '../src/data/levels';

const byShortId = (shortId: string) => levels.find((level) => level.shortId === shortId)!;
const pantiesCount = (tiles: readonly Match3TileId[]) => tiles.filter((tile) => tilePresentation[tile].category === 'panties').length;

describe('ANM-025C2C campaign tile-set rollout', () => {
  it('reuses one shared tile catalog while varying underwear emphasis by narrative', () => {
    expect(pantiesCount(byShortId('M3_00').activeTiles)).toBe(4);
    expect(pantiesCount(byShortId('M3_01').activeTiles)).toBe(3);
    expect(pantiesCount(byShortId('M3_02').activeTiles)).toBe(2);
    expect(pantiesCount(byShortId('M3_03').activeTiles)).toBe(3);

    const allUsed = levels.flatMap((level) => level.activeTiles);
    const reused = [...new Set(allUsed)].filter((tile) => levels.filter((level) => level.activeTiles.includes(tile)).length > 1);
    expect(reused.length).toBeGreaterThanOrEqual(6);
  });

  it('gives the photo-props level a styled three-panties set plus prop-support items', () => {
    expect(byShortId('M3_01').activeTiles).toEqual([
      'pantiesLacePink',
      'pantiesHighWaistBlack',
      'panties',
      'camisole',
      'sportsBra',
      'laundryTag',
    ]);
  });

  it('gives the pool-service level a sporty two-panties set plus wet-laundry support items', () => {
    expect(byShortId('M3_02').activeTiles).toEqual([
      'pantiesSportWhite',
      'pantiesBoyshortBlue',
      'sportsBra',
      'towel',
      'laundryTag',
      'socks',
    ]);
  });

  it('keeps ordered-return readable by separating the damaged-towel ingredient from generic tile clutter', () => {
    const ordered = byShortId('M3_03');
    expect(ordered.activeTiles).toEqual([
      'pantiesSportWhite',
      'pantiesHighWaistBlack',
      'pantiesBoyshortBlue',
      'camisole',
      'socks',
      'laundryTag',
    ]);
    expect(ordered.activeTiles).not.toContain('towel');
    expect(ordered.ingredients.some((ingredient) => ingredient.kind === 'damagedTowel')).toBe(true);
    for (const objective of ordered.objectives) {
      if (objective.kind === 'collect') expect(ordered.activeTiles).toContain(objective.tile);
    }
  });
});
