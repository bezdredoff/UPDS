import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import { levels } from '../src/data/levels';
import { Match3Game, type SpecialKind } from '../src/engine/Match3Game';

type MutableTestCell = { tile: string | null; ingredient: string | null; blockerLayers: number; special: SpecialKind | null };

const cellsOf = (game: Match3Game): MutableTestCell[] => (game as unknown as { cells: MutableTestCell[] }).cells;

describe('ANM-022F interaction guidance', () => {
  it('activates a special directly and spends exactly one move', () => {
    const game = new Match3Game(levels[0], 22060);
    const cells = cellsOf(game);
    const index = cells.findIndex((cell) => Boolean(cell.tile) && !cell.ingredient && cell.blockerLayers === 0);
    expect(index).toBeGreaterThanOrEqual(0);
    cells[index].special = 'flash-row';
    const beforeMoves = game.movesLeft;

    const result = game.attemptSpecialActivation(index);

    expect(result.valid).toBe(true);
    expect(result.primaryFeedback).toBe('special');
    expect(result.frames[0]?.phase).toBe('clear');
    expect(result.frames.some((frame) => frame.specialsActivated > 0)).toBe(true);
    expect(result.cleared).toBeGreaterThan(0);
    expect(game.movesLeft).toBe(beforeMoves - 1);
  });

  it('does not spend a move when direct activation targets a normal tile', () => {
    const game = new Match3Game(levels[0], 22061);
    const index = game.board.findIndex((cell) => Boolean(cell.tile) && !cell.ingredient && cell.blockerLayers === 0 && !cell.special);
    const beforeMoves = game.movesLeft;

    const result = game.attemptSpecialActivation(index);

    expect(result).toMatchObject({ valid: false, reason: 'no-special' });
    expect(game.movesLeft).toBe(beforeMoves);
  });

  it('locks the inactivity, double-tap and telemetry source contracts', async () => {
    const controller = await readFile(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
    expect(controller).toContain('MATCH_AUTO_HINT_DELAY_MS = 30000');
    expect(controller).toContain('SPECIAL_DOUBLE_TAP_WINDOW_MS = 360');
    expect(controller).toContain("this.showObjectiveHint('inactivity')");
    expect(controller).toContain("source: 'double-tap', activation: 'direct'");
    expect(controller).toContain("this.attemptMatchSwap(pointer.startIndex, targetIndex, false, 'drag')");
    expect(controller).toContain("this.attemptMatchSwap(first, index, true, 'tap')");
    expect(controller).toContain('available: Boolean(hint), source');
  });

  it('documents that ANM-022F changes interaction guidance but not balance', async () => {
    const doc = await readFile(new URL('../docs/features/ANM022F_INTERACTION_GUIDANCE_RU.md', import.meta.url), 'utf8');
    expect(doc).toContain('5 секунд');
    expect(doc).toContain('двойным тапом');
    expect(doc).toContain('никаких изменений move budgets/objectives/spawn rates');
  });
});
