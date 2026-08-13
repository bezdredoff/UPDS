import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { levels, tilePresentation, type Match3TileId } from '../src/data/levels';

const locker = levels.find((level) => level.shortId === 'M3_00')!;
const pantiesIds: readonly Match3TileId[] = [
  'pantiesSportWhite',
  'pantiesLacePink',
  'pantiesHighWaistBlack',
  'pantiesBoyshortBlue',
];

const publicPathFor = (asset: string): string => resolve(process.cwd(), 'public', asset.replace(/^\.\//, ''));

describe('ANM-025C2B locker panties production pack', () => {
  it('uses four distinct panties match identities plus two support types', () => {
    expect(locker.activeTiles).toEqual([...pantiesIds, 'sportsBra', 'laundryTag']);
    const activePanties = locker.activeTiles.filter((tile) => tilePresentation[tile].category === 'panties');
    expect(activePanties).toEqual(pantiesIds);
  });

  it('keeps every panties type visually and mechanically distinct', () => {
    const assets = pantiesIds.map((tile) => tilePresentation[tile].asset);
    expect(new Set(assets).size).toBe(pantiesIds.length);
    expect(new Set(pantiesIds).size).toBe(pantiesIds.length);
    for (const asset of assets) expect(existsSync(publicPathFor(asset)), asset).toBe(true);
  });

  it('ships normalized 256x256 RGBA production PNGs', () => {
    for (const tile of pantiesIds) {
      const png = readFileSync(publicPathFor(tilePresentation[tile].asset));
      expect(png.subarray(1, 4).toString('ascii')).toBe('PNG');
      expect(png.readUInt32BE(16)).toBe(256);
      expect(png.readUInt32BE(20)).toBe(256);
      expect(png[24]).toBe(8); // 8-bit channels
      expect(png[25]).toBe(6); // truecolor + alpha
    }
  });

  it('targets exact panties identities rather than the broad category in collection goals', () => {
    const collectTiles = locker.objectives.filter((objective) => objective.kind === 'collect').map((objective) => objective.tile);
    expect(collectTiles).toContain('pantiesSportWhite');
    expect(collectTiles).toContain('pantiesLacePink');
    expect(collectTiles).not.toContain('panties');
  });
});
