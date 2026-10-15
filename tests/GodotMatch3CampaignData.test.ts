import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { godotCampaignBundle } from './fixtures/godotMatch3';
import { levels } from '../src/data/levels';
import { backgroundAssets } from '../src/data/narrative';

const root = resolve(process.cwd());

describe('Godot campaign Match-3 data export', () => {
  it('exports the complete canonical campaign and gameplay contract without manual edits', () => {
    const exported = JSON.parse(readFileSync(resolve(root, 'godot/data/campaign_match3_levels.json'), 'utf8'));
    expect(exported).toEqual(godotCampaignBundle());
    expect(exported.schemaVersion).toBe(1);
    expect(exported.levels).toHaveLength(22);
    expect(exported.levels.map((level: { shortId: string }) => level.shortId)).toEqual(levels.map(({ shortId }) => shortId));
    expect(exported.levels.map((level: { pageBackground: string }) => level.pageBackground)).toEqual(levels.map(({ context }) => context.pageBackground));
    const backgroundKeys = [...new Set(levels.map(({ context }) => context.pageBackground))];
    expect(exported.assets.backgrounds).toEqual(Object.fromEntries(backgroundKeys.map((key) => [key, backgroundAssets[key]])));
    for (const level of exported.levels) {
      expect(level.openingBoard).toHaveLength(level.rows * level.columns);
      expect(level.activeTiles).toHaveLength(6);
      expect(level.objectives.length).toBeGreaterThan(0);
      expect(level).toHaveProperty('spawnWeights');
      expect(level).toHaveProperty('boardHoles');
      expect(level).toHaveProperty('initialTiles');
      expect(level).toHaveProperty('blockers');
      expect(level).toHaveProperty('ingredients');
    }
    expect(exported.levels.some((level: { boardHoles: unknown[] }) => level.boardHoles.length > 0)).toBe(true);
    expect(exported.levels.some((level: { ingredients: unknown[] }) => level.ingredients.length > 0)).toBe(true);
    expect(exported.levels.some((level: { blockers: Array<{ layers: number }> }) => level.blockers.some(({ layers }) => layers === 2))).toBe(true);
    expect(exported.levels.every((level: { spawnWeights: Record<string, number> }) => level.spawnWeights !== null && typeof level.spawnWeights === 'object')).toBe(true);
  });

  it('copies every asset referenced by campaign gameplay data byte for byte', () => {
    const bundle = godotCampaignBundle();
    for (const asset of Object.values(bundle.assets).flatMap((group) => Object.values(group))) {
      const source = readFileSync(resolve(root, 'public', asset.replace(/^\.\//, '')));
      const ported = readFileSync(resolve(root, 'godot', asset.replace(/^\.\//, '')));
      expect(ported.equals(source), `${asset} changed during campaign export`).toBe(true);
    }
  });
});
