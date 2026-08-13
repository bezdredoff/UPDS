import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions, type LevelDefinition, type Match3TileId } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

describe('ANM-026B1 Match-3 spawn weights', () => {
  it('keeps production levels on the legacy uniform path when no weights are configured', () => {
    const level = levels[0];
    const first = new Match3Game(level, 9001).board.map((cell) => cell.tile ?? cell.ingredient ?? '-');
    const clone: LevelDefinition = { ...level, spawnWeights: undefined };
    const second = new Match3Game(clone, 9001).board.map((cell) => cell.tile ?? cell.ingredient ?? '-');
    expect(second).toEqual(first);
  });

  it('uses deterministic relative weights for initial fill and refill selection', () => {
    const level = levels[0];
    const favored: Match3TileId = 'pantiesSportWhite';
    const spawnWeights = Object.fromEntries(level.activeTiles.map((tile) => [tile, tile === favored ? 100 : 1])) as Partial<Record<Match3TileId, number>>;
    const weighted: LevelDefinition = { ...level, spawnWeights };

    let favoredFirstCells = 0;
    for (let seed = 1; seed <= 40; seed += 1) {
      if (new Match3Game(weighted, seed).board[0].tile === favored) favoredFirstCells += 1;
    }
    expect(favoredFirstCells).toBeGreaterThan(30);
    expect(new Match3Game(weighted, 17).board).toEqual(new Match3Game(weighted, 17).board);
  });

  it('rejects non-positive weights and weights for inactive identities', () => {
    const level = levels[0];
    expect(validateLevelDefinitions([{ ...level, spawnWeights: { pantiesSportWhite: 0 } }])).toContain(`${level.id}: spawn weight for pantiesSportWhite must be a finite positive number`);
    expect(validateLevelDefinitions([{ ...level, spawnWeights: { towel: 2 } }])).toContain(`${level.id}: spawn weight for inactive tile towel`);
  });
});
