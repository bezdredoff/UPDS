import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  ACTIVE_TILE_TYPE_LIMIT,
  MAX_PANTIES_TYPES_PER_LEVEL,
  levels,
  tileKeys,
  tilePresentation,
  type Match3TileId,
} from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const engineSource = readFileSync(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
type MutableCell = {
  tile: Match3TileId | null;
  ingredient: unknown;
  blockerLayers: number;
  special: unknown;
};

describe('ANM-025C2A active tile set contract', () => {
  it('keeps six active match identities per level while allowing narrative-specific production sets', () => {
    expect(ACTIVE_TILE_TYPE_LIMIT).toBe(6);
    expect(MAX_PANTIES_TYPES_PER_LEVEL).toBe(4);
    for (const level of levels) {
      expect(new Set(level.activeTiles).size).toBe(ACTIVE_TILE_TYPE_LIMIT);
      expect(level.activeTiles.every((tile) => tileKeys.includes(tile))).toBe(true);
    }
  });

  it('makes the engine source initial fill, refill and reshuffle from level.activeTiles rather than the global catalog', () => {
    expect(engineSource).toContain('return [...this.level.activeTiles].sort');
    expect(engineSource).toContain('const tiles = this.level.activeTiles;');
    expect(engineSource).not.toContain('return [...tileKeys]');
    expect(engineSource).not.toContain('return tileKeys[');
  });

  it('never produces a tile outside the level active set during construction or a legal resolution', () => {
    for (const level of levels) {
      const game = new Match3Game(level, level.seed + 4242);
      const active = new Set(level.activeTiles);
      expect(game.board.every((cell) => cell.tile === null || active.has(cell.tile))).toBe(true);
      const hint = game.getHintMove();
      expect(hint).not.toBeNull();
      const result = game.attemptSwap(hint!.first, hint!.second);
      expect(result.valid).toBe(true);
      for (const frame of result.frames) {
        expect(frame.board.every((cell) => cell.tile === null || active.has(cell.tile))).toBe(true);
      }
      expect(game.board.every((cell) => cell.tile === null || active.has(cell.tile))).toBe(true);
    }
  });

  it('matches exact tile ids, not broad categories', () => {
    const game = new Match3Game(levels[0], 16001);
    const cells = (game as unknown as { cells: MutableCell[] }).cells;
    cells[0].tile = 'pantiesSportWhite';
    cells[1].tile = 'pantiesSportWhite';
    cells[2].tile = 'pantiesLacePink';
    expect(tilePresentation[cells[0].tile].category).toBe('panties');
    expect(tilePresentation[cells[2].tile].category).toBe('panties');
    expect(game.findMatchGroups().some((group) => group.indices.includes(0) && group.indices.includes(1) && group.indices.includes(2))).toBe(false);
    cells[2].tile = 'pantiesSportWhite';
    expect(game.findMatchGroups().some((group) => group.indices.includes(0) && group.indices.includes(1) && group.indices.includes(2))).toBe(true);
  });

  it('keeps core visual identity attached to the concrete tile id', () => {
    for (const tile of tileKeys) {
      expect(tilePresentation[tile].asset).toMatch(/^\.\/assets\/match3\//);
      expect(tilePresentation[tile].category).toBeTruthy();
    }
    expect(new Set(tileKeys.map((tile) => tilePresentation[tile].asset)).size).toBe(tileKeys.length);
  });
});
