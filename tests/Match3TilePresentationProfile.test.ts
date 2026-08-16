import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { levels, tileKeys, tilePresentation } from '../src/data/levels';
import {
  match3TilePresentationProfiles,
  resolveMatch3TilePresentation,
  tilePresentationAssetsForActiveSet,
} from '../src/data/match3TilePresentation';

const controllerSource = readFileSync(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
const presentationSource = readFileSync(new URL('../src/features/match3/Match3Presentation.ts', import.meta.url), 'utf8');
const engineSource = readFileSync(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');

const publicPathFor = (asset: string): string => resolve(process.cwd(), 'public', asset.replace(/^\.\//, ''));

describe('ANM-025C tile presentation profile contract', () => {
  it('keeps narrative presentation profiles on every current level without allowing asset overrides', () => {
    expect(new Set(levels.map((level) => level.context.tilePresentationProfile)).size).toBe(levels.length);
    for (const level of levels) {
      const profile = match3TilePresentationProfiles[level.context.tilePresentationProfile];
      expect(profile).toBeTruthy();
      expect(profile.artDirectionTags.length).toBeGreaterThan(0);
      expect(profile).not.toHaveProperty('overrides');
    }
  });

  it('resolves one core asset from the concrete match identity in every profile', () => {
    for (const level of levels) {
      const profile = level.context.tilePresentationProfile;
      expect(tilePresentationAssetsForActiveSet(profile, level.activeTiles)).toHaveLength(level.activeTiles.length);
      for (const tile of level.activeTiles) {
        const resolved = resolveMatch3TilePresentation(profile, tile);
        expect(resolved.tileId).toBe(tile);
        expect(resolved.variantId).toBe(`tile:${tile}`);
        expect(resolved.asset).toBe(tilePresentation[tile].asset);
        expect(resolved.category).toBe(tilePresentation[tile].category);
        expect(existsSync(publicPathFor(resolved.asset)), `${profile}/${tile}: ${resolved.asset}`).toBe(true);
      }
    }
  });

  it('cannot make one match identity look like a different item by switching profiles', () => {
    for (const tile of tileKeys) {
      const assets = levels.map((level) => resolveMatch3TilePresentation(level.context.tilePresentationProfile, tile).asset);
      expect(new Set(assets)).toEqual(new Set([tilePresentation[tile].asset]));
    }
  });

  it('routes board, objective and preload art through the concrete-id resolver and active set', () => {
    expect(presentationSource).toContain('resolveMatch3TilePresentation(level.context.tilePresentationProfile, cell.tile)');
    expect(presentationSource).toContain('resolveMatch3TilePresentation(level.context.tilePresentationProfile, objective.tile)');
    expect(controllerSource).toContain('tilePresentationAssetsForActiveSet(level.context.tilePresentationProfile, level.activeTiles)');
    expect(presentationSource).toContain('data-m3-tile-profile');
    expect(presentationSource).toContain('data-tile-variant');
    expect(presentationSource).not.toContain('tilePresentation[cell.tile]');
  });

  it('keeps presentation profiles out of Match3Game rules', () => {
    expect(engineSource).not.toContain('tilePresentationProfile');
    expect(engineSource).not.toContain('match3TilePresentation');
  });
});
