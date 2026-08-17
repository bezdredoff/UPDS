import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { specialAssets } from '../src/data/levels';

describe('ANM-022D R1 narrative special assets', () => {
  it('maps every production special to a dedicated transparent SVG overlay', () => {
    expect(Object.keys(specialAssets)).toEqual(['flash-row', 'flash-column', 'evidence', 'lead', 'insight']);
    for (const asset of Object.values(specialAssets)) expect(asset).toMatch(/\/specials\/.+\.svg$/);
  });

  it('ships SVGs with a common 128 square viewBox', async () => {
    for (const asset of Object.values(specialAssets)) {
      const relative = asset.replace('./assets/', '../public/assets/');
      const svg = await readFile(new URL(relative, import.meta.url), 'utf8');
      expect(svg).toContain('viewBox="0 0 128 128"');
      expect(svg).toContain('<svg');
    }
  });

  it('does not retain RavenManor special vocabulary in the engine', async () => {
    const source = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(source).not.toContain("'raven'");
    expect(source).not.toContain("'prism'");
    expect(source).toContain('leadTargets');
  });
  it('flattens all dedicated special overlays into the image preloader', async () => {
    const controller = await readFile(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
    expect(controller).toContain('...Object.values(specialAssets)');
    const preload = controller.slice(controller.indexOf('const assets = ['), controller.indexOf('void preloadImageAssets'));
    expect(preload).not.toContain('\n  specialAssets,\n');
  });


  it('locks the ANM-030B0A1 production visual contract to the five runtime mechanics without importing art', async () => {
    const contract = JSON.parse(
      await readFile(new URL('../src/content/art/ANM030B0A1.match3-special-visual-contract.json', import.meta.url), 'utf8'),
    ) as {
      format: string;
      status: string;
      runtimeContract: {
        mechanicIds: string[];
        requiredProductionVisualCount: number;
        sharedAcrossAllLevels: boolean;
        perLevelSpecialPacks: boolean;
        baseTileRemainsReadable: boolean;
      };
      delivery: { runtimeFormat: string; runtimeCanvasPx: number; transparentBackground: boolean };
      visuals: Array<{ id: string; currentFallback: string; productionAsset: string }>;
      nextFeature: string;
    };

    expect(contract.format).toBe('upds-match3-special-visual-contract-v1');
    expect(contract.status).toBe('planning-only');
    expect(contract.runtimeContract.mechanicIds).toEqual(Object.keys(specialAssets));
    expect(contract.runtimeContract.requiredProductionVisualCount).toBe(5);
    expect(contract.runtimeContract.sharedAcrossAllLevels).toBe(true);
    expect(contract.runtimeContract.perLevelSpecialPacks).toBe(false);
    expect(contract.runtimeContract.baseTileRemainsReadable).toBe(true);
    expect(contract.delivery).toMatchObject({ runtimeFormat: 'png', runtimeCanvasPx: 256, transparentBackground: true });
    expect(contract.visuals.map((visual) => visual.currentFallback)).toEqual(Object.values(specialAssets));
    expect(contract.visuals.every((visual) => visual.productionAsset.endsWith(`${visual.id}.png`))).toBe(true);
    expect(contract.nextFeature).toBe('ANM-030B0A2');
  });

});
