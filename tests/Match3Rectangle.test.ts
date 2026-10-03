import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions, type LevelDefinition } from '../src/data/levels';
import { createBoardGeometry } from '../src/engine/BoardGeometry';
import { Match3Game } from '../src/engine/Match3Game';
import { createMatch3Rules, type Match3RuleCell } from '../src/engine/Match3Rules';
import { tutorialRevealEventsForBoard } from '../src/data/match3Tutorials';
import { neighbourIndex, getDragPreview } from '../src/ui/boardInteraction';
import { createLevelLabDraft, exportLevelLabDraft, applyLevelLabDraft } from '../src/features/levelLab/LevelLabController';
import { workshopRectanglePrototype } from './fixtures/match3Rectangle';

const size = { rows: 9, columns: 7 } as const;
const emptyBoard = (): Match3RuleCell[] => Array.from({ length: 63 }, () => ({ tile: null, special: null }));

describe('G5b-M3-RECT-001 rectangular board contract', () => {
  it('preserves legacy seeded games while using the M3_06 production pilot as its rectangle reference', () => {
    const legacy = new Match3Game(levels[0], 7);
    const before = JSON.stringify(legacy.board);
    const rectangle = new Match3Game(workshopRectanglePrototype(), 7);
    expect(rectangle.board).toHaveLength(63);
    expect(legacy.board).toHaveLength(64);
    expect(JSON.stringify(legacy.board)).toBe(before);
    expect(new Match3Game({ ...levels[0], boardSize: { rows: 8, columns: 8 } }, 7).board).toEqual(legacy.board);
    expect(levels.find((level) => level.shortId === 'M3_06')?.boardSize).toEqual(size);
    expect(levels.filter((level) => level.shortId !== 'M3_06').every((level) => level.boardSize === undefined)).toBe(true);
    expect(validateLevelDefinitions([workshopRectanglePrototype()])).toEqual([]);
  });

  it('rejects invalid dimensions and positions without interpreting them as legacy data', () => {
    expect(() => createBoardGeometry({ rows: 0, columns: 7 })).toThrow();
    expect(() => createBoardGeometry({ rows: 9, columns: 7.5 })).toThrow();
    const source = workshopRectanglePrototype();
    expect(validateLevelDefinitions([{ ...source, boardHoles: [63] }])).toContain(`${source.id}: board hole outside board`);
    expect(validateLevelDefinitions([{ ...source, blockers: [{ index: 1.5, layers: 1 }] }])).toContain(`${source.id}: blocker outside board`);
    expect(validateLevelDefinitions([{ ...source, boardSize: { rows: 9, columns: 0 } }])).toContain(`${source.id}: invalid board dimensions`);
  });

  it('does not match, hint, or accept input from tiles hidden beneath a blocking obstacle', () => {
    const source = levels[0];
    const hiddenMatch: LevelDefinition = {
      ...source,
      id: 'M3_HIDDEN_BLOCKER_MATCH',
      shortId: 'M3_HIDDEN_BLOCKER_MATCH',
      boardHoles: undefined,
      blockers: [{ index: 1, layers: 1 }],
      initialTiles: [
        { index: 0, tile: 'sportsBra' },
        { index: 1, tile: 'sportsBra' },
        { index: 2, tile: 'sportsBra' },
      ],
    };
    const game = new Match3Game(hiddenMatch, 7);

    expect(game.board[1].tile).toBe('sportsBra');
    expect(game.findMatchGroups().flatMap((group) => group.indices)).not.toContain(1);
    expect(game.hasImmediateMatches()).toBe(false);
    expect(game.isCellBlocked(1)).toBe(true);
    expect(game.getHintMove()).not.toMatchObject({ first: 1 });
    expect(game.getHintMove()).not.toMatchObject({ second: 1 });
  });

  it('keeps neighbours and tutorial reveals within rectangular edges including the ninth row', () => {
    expect(neighbourIndex(6, 'right', size)).toBeNull();
    expect(neighbourIndex(7, 'left', size)).toBeNull();
    expect(neighbourIndex(62, 'down', size)).toBeNull();
    expect(neighbourIndex(62, 'up', size)).toBe(55);
    expect(getDragPreview(55, 0, 30, 44, size).targetIndex).toBe(62);
    const board = emptyBoard();
    board[6] = board[7] = { tile: 'sportsBra', special: 'lead' };
    expect(tutorialRevealEventsForBoard(board, 9, 7)).toEqual([]);
    board[55] = board[62] = { tile: 'sportsBra', special: 'lead' };
    expect(tutorialRevealEventsForBoard(board, 9, 7)).toEqual(['special-combo-ready']);
  });

  it('finds last-row, last-column and corner-square matches without wrapping rows', () => {
    const rules = createMatch3Rules(size);
    const row = emptyBoard();
    for (const index of [60, 61, 62]) row[index] = { tile: 'sportsBra', special: null };
    expect(rules.findMatchGroups(row)).toEqual([{ orientation: 'row', indices: [60, 61, 62] }]);
    const column = emptyBoard();
    for (const index of [48, 55, 62]) column[index] = { tile: 'sportsBra', special: null };
    expect(rules.findMatchGroups(column)).toEqual([{ orientation: 'column', indices: [48, 55, 62] }]);
    const square = emptyBoard();
    for (const index of [54, 55, 61, 62]) square[index] = { tile: 'sportsBra', special: null };
    expect(rules.findSquareMatchGroups(square)).toEqual([{ orientation: 'square', indices: [54, 55, 61, 62] }]);
    const edge = emptyBoard();
    for (const index of [6, 7, 8]) edge[index] = { tile: 'sportsBra', special: null };
    expect(rules.findMatchGroups(edge)).toEqual([]);
  });

  it('expands row and column specials to seven and nine positions with bounded edge combos', () => {
    const rules = createMatch3Rules(size);
    const board = emptyBoard();
    board[62] = { tile: 'sportsBra', special: 'flash-row' };
    expect([...rules.expandSpecialClearTargets(board, new Set([62]), () => [])].sort((a, b) => a - b)).toEqual([56, 57, 58, 59, 60, 61, 62]);
    board[62] = { tile: 'sportsBra', special: 'flash-column' };
    expect([...rules.expandSpecialClearTargets(board, new Set([62]), () => [])].sort((a, b) => a - b)).toEqual([6, 13, 20, 27, 34, 41, 48, 55, 62]);
    const targets = rules.directSpecialComboTargets(board, 'evidence-evidence', 61, 62, () => []);
    expect(new Set(targets)).toEqual(new Set([46, 47, 48, 53, 54, 55, 60, 61, 62]));
  });

  it('resolves blockers and drops at the last active cell above a bottom hole', () => {
    const level: LevelDefinition = {
      ...workshopRectanglePrototype(), boardHoles: [60],
      blockers: [{ index: 46, layers: 1 }],
      ingredients: [{ index: 39, kind: 'warrantyCard' }],
      objectives: [
        { kind: 'clearBlockers', target: 1, label: 'blocker' },
        { kind: 'drop', ingredient: 'warrantyCard', target: 1, label: 'ingredient' },
      ],
    };
    const game = new Match3Game(level, 7);
    Object.assign(game.board[4], { special: 'flash-column' });
    const result = game.attemptSpecialActivation(4);
    expect(result.valid).toBe(true);
    expect(result.blockersCleared).toBe(1);
    // Breaking the cover does not clear its underlying tile in the same resolution.
    expect(result.ingredientsDropped).toBe(0);
    const clearFrame = result.frames.find((frame) => frame.phase === 'clear');
    expect(clearFrame?.board[46].blockerLayers).toBe(1);
    expect(clearFrame?.board[46].tile).not.toBeNull();
    expect(game.board[46].blockerLayers).toBe(0);
    Object.assign(game.board[4], { special: 'flash-column' });
    const drop = game.attemptSpecialActivation(4);
    expect(drop.valid).toBe(true);
    expect(drop.ingredientsDropped).toBe(1);
    expect(game.board[60]).toEqual({ tile: null, ingredient: null, blockerLayers: 0, special: null });
    const frames = [...result.frames, ...drop.frames];
    expect(frames.every((frame) => frame.board.length === 63)).toBe(true);
    expect(frames.flatMap((frame) => frame.motions ?? []).every((motion) => motion.index >= 0 && motion.index <= 62 && motion.rows > 0)).toBe(true);
  });

  it('plays legal hinted moves and cascades on the isolated workbench across seeds', () => {
    let cascadeCount = 0;
    for (const seed of [7, 9007, 120000]) {
      const game = new Match3Game(workshopRectanglePrototype(), seed);
      expect(game.hasImmediateMatches()).toBe(false);
      while (!game.won && !game.lost) {
        const hint = game.getHintMove();
        expect(hint).not.toBeNull();
        if (!hint) throw new Error(`No move at seed ${seed}`);
        const result = game.attemptSwap(hint.first, hint.second);
        expect(result.valid).toBe(true);
        cascadeCount += result.cascades;
        for (const frame of result.frames) {
          expect(frame.board).toHaveLength(63);
          expect((frame.clearedIndices ?? []).every((index) => index >= 0 && index <= 62)).toBe(true);
          for (const index of [3, 10, 17]) expect(frame.board[index].tile).toBeNull();
        }
      }
    }
    expect(cascadeCount).toBeGreaterThan(0);
  });

  it('exports explicit rectangular dimensions while retaining the legacy Level Lab format', () => {
    const prototype = workshopRectanglePrototype();
    const draft = createLevelLabDraft(prototype);
    expect(applyLevelLabDraft(prototype, draft).boardSize).toEqual(size);
    expect(JSON.parse(exportLevelLabDraft(prototype, draft))).toMatchObject({ format: 'upds-level-lab-v3', boardSize: size });
    expect(JSON.parse(exportLevelLabDraft(levels[0], createLevelLabDraft(levels[0]))).format).toBe('upds-level-lab-v2');
  });
});
