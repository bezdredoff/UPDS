import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { characterRigs } from '../src/data/characterRigs';
import { backgroundAssets } from '../src/data/narrative';
import { blockerPresentation, cluePresentation, ingredientPresentation, specialAsset, specialAssets, specialFallbackAssets, tilePresentation } from '../src/data/levels';
import { runtimeAssetCatalog } from '../src/platform/RuntimeAssets';

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
      ...Object.values(specialAssets),
      ...Object.values(specialFallbackAssets),
    ];
    for (const asset of assets) expect(existsSync(localPath(asset)), asset).toBe(true);
  });


  it('contains every asset registered for runtime distribution/offline caching', () => {
    for (const asset of runtimeAssetCatalog) expect(existsSync(localPath(asset)), asset).toBe(true);
  });

  it('keeps the full catalog for offline distribution without globally warming it through Image at bootstrap', () => {
    const main = readFileSync(resolve(process.cwd(), 'src/main.ts'), 'utf8');
    expect(main).toContain('services.pwa.start(runtimeAssetCatalog)');
    expect(main).not.toContain('scheduleImagePreload');
    expect(main).not.toContain('preloadImageAssets(runtimeAssetCatalog');
  });

  it('contains five precomposed expression frames, pose B and medallion for every finished rig', () => {
    for (const rig of Object.values(characterRigs)) {
      const assets = [...Object.values(rig.frames), rig.poseB, rig.medallion];
      for (const asset of assets) expect(existsSync(localPath(asset)), asset).toBe(true);
    }
  });
});
