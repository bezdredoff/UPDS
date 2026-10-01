import { describe, expect, it } from 'vitest';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { specialAssets, specialFallbackAssets } from '../src/data/levels';

const expectedProductionDigests = {
  'flash-row': '0311032777ebf96509e50f3275a4800464b85a4e12b010d44aebdf8203d8c6a7',
  'flash-column': '15f87e326e76bcd15f7a09b84e40346d81b7abdfea1b53e7257c95a0603a785e',
  evidence: '9a7858a430ccec501fc70ebc38cccac4d2033a652516fb4a72945fe49ecf37f5',
  lead: '565f7783cce7b4ba7d060a41112430405881ba189ebc74ae2ca3729b40de7351',
  insight: '2d3e29d7afaec2b23630c5b9556f287227b0faab8cbb620b0036bcfb0fa77b61',
} as const;

describe('ANM-022D R1 narrative special assets', () => {
  it('maps every production special to its dedicated PNG while retaining the five SVG fallbacks', () => {
    expect(Object.keys(specialAssets)).toEqual(['flash-row', 'flash-column', 'evidence', 'lead', 'insight']);
    expect(Object.keys(specialFallbackAssets)).toEqual(Object.keys(specialAssets));
    for (const asset of Object.values(specialAssets)) expect(asset).toMatch(/\/specials\/.+\.png$/);
    for (const asset of Object.values(specialFallbackAssets)) expect(asset).toMatch(/\/specials\/.+\.svg$/);
  });

  it('ships five genuine 256 square RGBA production overlays and common 128 square SVG fallbacks', async () => {
    for (const [special, asset] of Object.entries(specialAssets)) {
      const relative = asset.replace('./assets/', '../public/assets/');
      const png = await readFile(new URL(relative, import.meta.url));
      expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
      expect(png.readUInt32BE(16)).toBe(256);
      expect(png.readUInt32BE(20)).toBe(256);
      expect(png[25]).toBe(6);
      expect(createHash('sha256').update(png).digest('hex')).toBe(expectedProductionDigests[special as keyof typeof expectedProductionDigests]);
    }
    for (const asset of Object.values(specialFallbackAssets)) {
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
    expect(controller).toContain('...Object.values(specialFallbackAssets)');
    const preload = controller.slice(controller.indexOf('const assets = ['), controller.indexOf('void preloadImageAssets'));
    expect(preload).not.toContain('\n  specialAssets,\n');
  });

  it('falls back from a missing production PNG to the matching semantic SVG before the generic asset placeholder', async () => {
    const presentation = await readFile(new URL('../src/features/match3/Match3Presentation.ts', import.meta.url), 'utf8');
    const assetHealth = await readFile(new URL('../src/platform/AssetHealth.ts', import.meta.url), 'utf8');
    expect(presentation).toContain('data-asset-fallback-src');
    expect(presentation).toContain('specialFallbackAssets[special]');
    expect(assetHealth).toContain('image.dataset.assetFallbackSrc');
    expect(assetHealth).toContain("image.dataset.assetFallbackSourceApplied = '1'");
    expect(assetHealth.indexOf('image.src = assetFallback')).toBeLessThan(assetHealth.indexOf('image.src = ASSET_FALLBACK_DATA_URI'));
  });


  it('records B0A2 production adoption against the original five-mechanic visual contract', async () => {
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
    expect(contract.status).toBe('implemented');
    expect(contract.runtimeContract.mechanicIds).toEqual(Object.keys(specialAssets));
    expect(contract.runtimeContract.requiredProductionVisualCount).toBe(5);
    expect(contract.runtimeContract.sharedAcrossAllLevels).toBe(true);
    expect(contract.runtimeContract.perLevelSpecialPacks).toBe(false);
    expect(contract.runtimeContract.baseTileRemainsReadable).toBe(true);
    expect(contract.delivery).toMatchObject({ runtimeFormat: 'png', runtimeCanvasPx: 256, transparentBackground: true });
    expect(contract.visuals.map((visual) => visual.currentFallback)).toEqual(Object.values(specialFallbackAssets));
    expect(contract.visuals.every((visual) => visual.productionAsset.endsWith(`${visual.id}.png`))).toBe(true);
    expect(contract.nextFeature).toBe('optional-activation-fx-after-playtest');
  });

});
