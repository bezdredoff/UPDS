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

  it('gives every campaign level at least two visually distinct underwear tiles', () => {
    for (const level of levels) {
      const panties = level.activeTiles.filter((tile) => tilePresentation[tile].category === 'panties');
      expect(panties.length, level.shortId).toBeGreaterThanOrEqual(2);
      expect(new Set(panties.map((tile) => tilePresentation[tile].asset)).size, level.shortId).toBe(panties.length);
    }
  });

  it('replaces blue boyshorts with orange sports bikini across the campaign', () => {
    expect(levels.every((level) => !level.activeTiles.includes('pantiesBoyshortBlue'))).toBe(true);
    expect(levels.some((level) => level.activeTiles.includes('pantiesSportOrange'))).toBe(true);
    expect(tilePresentation.pantiesSportOrange.asset).toBe('./assets/match3/tile_panties_sport_orange.png');
  });

  it('shapes M3_04 as a symmetric H with the crossbar open across the middle', () => {
    const level = byShortId('M3_04');
    const holes = new Set(level.boardHoles ?? []);
    expect([...holes].sort((a, b) => a - b)).toEqual([3, 10, 17, 45, 52, 59]);
    for (const hole of holes) {
      const row = Math.floor(hole / 7);
      const column = hole % 7;
      expect(holes.has((8 - row) * 7 + column)).toBe(true);
      expect(holes.has(row * 7 + (6 - column))).toBe(true);
    }
    expect(level.blockers.every(({ index }) => !holes.has(index))).toBe(true);
    expect(level.ingredients.every(({ index }) => !holes.has(index))).toBe(true);
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
      'pantiesSportOrange',
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
      'pantiesSportOrange',
      'camisole',
      'socks',
      'laundryTag',
    ]);
    expect(ordered.activeTiles).not.toContain('towel');
    expect(ordered.activeTiles).not.toContain('pantiesBoyshortBlue');
    expect(ordered.activeTiles).toContain('pantiesSportOrange');
    expect(ordered.ingredients.some((ingredient) => ingredient.kind === 'damagedTowel')).toBe(true);
    for (const objective of ordered.objectives) {
      if (objective.kind === 'collect') expect(ordered.activeTiles).toContain(objective.tile);
    }
  });
});
