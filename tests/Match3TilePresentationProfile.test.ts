import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { levels, tileKeys } from '../src/data/levels';
import {
  match3TilePresentationProfiles,
  resolveMatch3TilePresentation,
  tilePresentationAssetsForProfile,
} from '../src/data/match3TilePresentation';

const controllerSource = readFileSync(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
const engineSource = readFileSync(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');

const publicPathFor = (asset: string): string => resolve(process.cwd(), 'public', asset.replace(/^\.\//, ''));

describe('ANM-025C1 Match-3 tile presentation profiles', () => {
  it('keeps exactly six gameplay tile identities while every current level owns a presentation profile', () => {
    expect(tileKeys).toHaveLength(6);
    expect(new Set(tileKeys).size).toBe(6);
    expect(new Set(levels.map((level) => level.context.tilePresentationProfile)).size).toBe(levels.length);
    for (const level of levels) expect(match3TilePresentationProfiles[level.context.tilePresentationProfile]).toBeTruthy();
  });

  it('resolves a stable art asset per logical tile and profile without changing its gameplay identity', () => {
    for (const level of levels) {
      const profile = level.context.tilePresentationProfile;
      expect(tilePresentationAssetsForProfile(profile)).toHaveLength(tileKeys.length);
      for (const tile of tileKeys) {
        const first = resolveMatch3TilePresentation(profile, tile);
        const second = resolveMatch3TilePresentation(profile, tile);
        expect(second).toEqual(first);
        expect(first.variantId).toBe(`base:${tile}`);
        expect(existsSync(publicPathFor(first.asset)), `${profile}/${tile}: ${first.asset}`).toBe(true);
      }
    }
  });

  it('routes board, objective and preload art through the presentation resolver', () => {
    expect(controllerSource).toContain('resolveMatch3TilePresentation(level.context.tilePresentationProfile, cell.tile)');
    expect(controllerSource).toContain('resolveMatch3TilePresentation(level.context.tilePresentationProfile, objective.tile)');
    expect(controllerSource).toContain('tilePresentationAssetsForProfile(level.context.tilePresentationProfile)');
    expect(controllerSource).toContain('data-m3-tile-profile');
    expect(controllerSource).toContain('data-tile-variant');
    expect(controllerSource).not.toContain('tilePresentation[cell.tile]');
  });

  it('keeps presentation profiles out of Match3Game rules and spawn selection', () => {
    expect(engineSource).not.toContain('tilePresentationProfile');
    expect(engineSource).not.toContain('Match3TileArtVariant');
    expect(engineSource).not.toContain('match3TilePresentation');
  });
});
