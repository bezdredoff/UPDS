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

});
