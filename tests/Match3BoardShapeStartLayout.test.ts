import { describe, expect, it } from 'vitest';
import { isLevelBoardCellActive, levels, validateLevelDefinitions, type LevelDefinition, type Match3TileId } from '../src/data/levels';
import { Match3Game, type SpecialKind } from '../src/engine/Match3Game';
import { applyLevelLabDraft, createLevelLabDraft, exportLevelLabDraft, validateLevelLabDraft } from '../src/features/levelLab/LevelLabController';

type MutableTestCell = { tile: Match3TileId | null; ingredient: 'receipt' | 'memoryCard' | 'serviceKey' | 'damagedTowel' | null; blockerLayers: number; special: SpecialKind | null };
type Match3Internals = { cells: MutableTestCell[]; settleBoard: () => unknown };

const shapedLevel = (): LevelDefinition => ({
  ...levels[0],
  id: 'M3_TEST_SHAPED',
  shortId: 'TEST',
  boardHoles: [0, 7, 8, 15, 48, 55, 56, 63],
  initialTiles: [
    { index: 1, tile: 'pantiesSportWhite' },
    { index: 2, tile: 'pantiesLacePink' },
  ],
});

describe('ANM-026B2 board shape and deterministic start layout', () => {
  it('keeps production topology adoption bounded to the approved E4B cohort', () => {
    const adopted = new Set(['M3_00', 'M3_02', 'M3_04', 'M3_06']);
    const legacy = levels.filter((level) => !adopted.has(level.shortId));

    expect(validateLevelDefinitions(levels)).toEqual([]);
    expect(legacy).toHaveLength(18);
    expect(legacy.every((level) => level.boardHoles === undefined)).toBe(true);
    expect(legacy.every((level) => level.initialTiles === undefined)).toBe(true);

    expect(levels[0].shortId).toBe('M3_00');
    expect(levels[0].boardHoles).toBeUndefined();
    expect(levels[0].initialTiles?.length).toBeGreaterThan(0);
    for (const shortId of ['M3_02', 'M3_04', 'M3_06']) {
      const level = levels.find((candidate) => candidate.shortId === shortId);
      expect(level?.boardHoles?.length).toBeGreaterThan(0);
      expect(level?.initialTiles).toBeUndefined();
    }
  });

  it('keeps holes empty, preserves fixed start tiles and rejects swaps into holes', () => {
    const level = shapedLevel();
    expect(validateLevelDefinitions([level])).toEqual([]);
    const first = new Match3Game(level, 1234);
    const second = new Match3Game(level, 1234);
    expect(first.board).toEqual(second.board);
    for (const hole of level.boardHoles ?? []) {
      expect(isLevelBoardCellActive(level, hole)).toBe(false);
      expect(first.board[hole].tile).toBeNull();
      expect(first.board[hole].ingredient).toBeNull();
      expect(first.board[hole].blockerLayers).toBe(0);
    }
    expect(first.board[1].tile).toBe('pantiesSportWhite');
    expect(first.board[2].tile).toBe('pantiesLacePink');
    expect(first.attemptSwap(0, 1).reason).toBe('not-adjacent');
  });

  it('compacts tiles through hole rows while never filling the hole itself', () => {
    const level: LevelDefinition = { ...levels[0], id: 'M3_TEST_GRAVITY', boardHoles: [16], initialTiles: [{ index: 8, tile: 'pantiesSportWhite' }] };
    const game = new Match3Game(level, 77);
    const internals = game as unknown as Match3Internals;
    internals.cells[8].special = 'lead';
    internals.cells[56].tile = null;
    internals.cells[56].special = null;
    internals.settleBoard();
    expect(internals.cells[16].tile).toBeNull();
    expect(internals.cells[16].ingredient).toBeNull();
    expect(internals.cells[24].special).toBe('lead');
  });

  it('drops an ingredient from the lowest active cell when the physical bottom is a hole', () => {
    const level: LevelDefinition = { ...levels[0], id: 'M3_TEST_EXIT', boardHoles: [56] };
    const game = new Match3Game(level, 88);
    const internals = game as unknown as Match3Internals;
    internals.cells[48].tile = null;
    internals.cells[48].special = null;
    internals.cells[48].ingredient = 'receipt';
    internals.settleBoard();
    expect(game.progress.ingredientsDropped.receipt).toBe(1);
    expect(internals.cells[56].tile).toBeNull();
    expect(internals.cells[56].ingredient).toBeNull();
  });

  it('rejects placements in holes and exports shape/start-layout through Level Lab v2', () => {
    const base = levels[0];
    expect(validateLevelDefinitions([{ ...base, boardHoles: [18] }])).toContain(`${base.id}: blocker placed in board hole`);
    expect(validateLevelDefinitions([{ ...base, initialTiles: [{ index: base.ingredients[0].index, tile: 'pantiesSportWhite' }] }])).toContain(`${base.id}: initial tile overlaps ingredient`);

    const draft = {
      ...createLevelLabDraft(base),
      boardHoles: [0, 7],
      initialTiles: [{ index: 1, tile: 'pantiesSportWhite' as const }],
    };
    expect(validateLevelLabDraft(base, draft)).toEqual([]);
    const applied = applyLevelLabDraft(base, draft);
    expect(applied.boardHoles).toEqual([0, 7]);
    expect(applied.initialTiles).toEqual([{ index: 1, tile: 'pantiesSportWhite' }]);
    const exported = JSON.parse(exportLevelLabDraft(base, draft)) as Record<string, unknown>;
    expect(exported.format).toBe('upds-level-lab-v2');
    expect(exported.boardHoles).toEqual([0, 7]);
    expect(exported.initialTiles).toEqual([{ index: 1, tile: 'pantiesSportWhite' }]);
  });
});
