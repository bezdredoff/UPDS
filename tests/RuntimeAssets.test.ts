import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { characterRigs } from '../src/data/characterRigs';
import { backgroundAssets } from '../src/data/narrative';
import { blockerPresentation, cluePresentation, ingredientPresentation, specialAsset, tilePresentation } from '../src/data/levels';

const localPath = (asset: string): string => resolve(process.cwd(), 'public', asset.replace(/^\.\//, ''));

describe('runtime asset contract', () => {
  it('contains every referenced background, board and clue asset', () => {
    const assets = [
      ...Object.values(backgroundAssets),
      ...Object.values(tilePresentation).map((item) => item.asset),
      ...Object.values(ingredientPresentation).map((item) => item.asset),
      ...Object.values(blockerPresentation).map((item) => item.asset),
      ...Object.values(cluePresentation).map((item) => item.asset),
      specialAsset,
    ];
    for (const asset of assets) expect(existsSync(localPath(asset)), asset).toBe(true);
  });

  it('contains a base, six face overlays, pose B and medallion for every finished rig', () => {
    for (const rig of Object.values(characterRigs)) {
      const assets = [rig.base, ...Object.values(rig.faces), rig.poseB, rig.medallion];
      for (const asset of assets) expect(existsSync(localPath(asset)), asset).toBe(true);
    }
  });
});
