import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { godotMatch3Level } from './fixtures/godotMatch3';

const root = resolve(process.cwd());
const readJson = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));

describe('Godot first Match-3 level source parity', () => {
  it('exports the canonical first campaign level and its three locale strings', () => {
    const exported = readJson('godot/data/locker_match3.json');
    expect(exported).toEqual(godotMatch3Level());
    expect(exported.id).toBe('M3_00_LOCKER_TUTORIAL');
    expect(exported.rows).toBe(9);
    expect(exported.columns).toBe(7);
    expect(exported.moves).toBe(24);
    expect(exported.objectiveTile).toBe('pantiesSportWhite');
    expect(exported.target).toBe(12);
    expect(exported.seededOpeningBoard).toHaveLength(exported.rows * exported.columns);
    expect(exported.seededOpeningBoard).toEqual(godotMatch3Level().seededOpeningBoard);
    expect(Object.keys(exported.localized).sort()).toEqual(['be', 'en', 'ru']);
  });

  it('copies each approved tile image byte for byte from the web source', () => {
    const level = godotMatch3Level();
    for (const asset of Object.values(level.assets)) {
      const source = readFileSync(resolve(root, 'public', asset.replace(/^\.\//, '')));
      const ported = readFileSync(resolve(root, 'godot', asset.replace(/^\.\//, '')));
      expect(ported.equals(source), `${asset} changed during export`).toBe(true);
    }
    const evidence = level.evidence;
    const evidenceSource = readFileSync(resolve(root, 'public', evidence.asset.replace(/^\.\//, '')));
    const evidencePort = readFileSync(resolve(root, 'godot', evidence.asset.replace(/^\.\//, '')));
    expect(evidencePort.equals(evidenceSource)).toBe(true);
  });
});
