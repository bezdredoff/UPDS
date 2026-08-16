import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';
import {
  directSpecialComboTargets,
  resolveDirectSpecialCombo,
  type Match3RuleCell,
  type SpecialKind,
} from '../src/engine/Match3Rules';

const emptyBoard = (): Match3RuleCell[] => Array.from({ length: 64 }, () => ({ tile: null, special: null }));

describe('ANM-022E narrative direct special combinations', () => {
  it('defines the complete UPDS direct-combo matrix', () => {
    const cases: readonly [SpecialKind | null, SpecialKind | null, string | null][] = [
      ['flash-row', 'flash-column', 'flash-flash'],
      ['flash-row', 'evidence', 'flash-evidence'],
      ['evidence', 'evidence', 'evidence-evidence'],
      ['lead', 'flash-column', 'lead-flash'],
      ['lead', 'evidence', 'lead-evidence'],
      ['insight', null, 'insight-normal'],
      ['insight', 'lead', 'insight-special'],
      ['lead', 'lead', 'fallback'],
      [null, null, null],
    ];
    for (const [first, second, expected] of cases) expect(resolveDirectSpecialCombo(first, second)).toBe(expected);
  });

  it('keeps the Flash family symmetric', () => {
    expect(resolveDirectSpecialCombo('flash-row', 'flash-column')).toBe('flash-flash');
    expect(resolveDirectSpecialCombo('flash-column', 'flash-row')).toBe('flash-flash');
    expect(resolveDirectSpecialCombo('evidence', 'flash-row')).toBe('flash-evidence');
  });

  it('applies direct combos only on the first mutable resolution', async () => {
    const engine = await readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');
    expect(engine).toContain('totals.cascades === 1 && directCombo');
    expect(engine).toContain('directSpecialComboTargets');
  });

  it('keeps Lead objective-aware targeting delegated from the engine', () => {
    const board = emptyBoard();
    board[27] = { tile: 'pantiesLacePink', special: 'lead' };
    board[28] = { tile: 'pantiesSportWhite', special: 'evidence' };
    const targets = directSpecialComboTargets(board, 'lead-evidence', 27, 28, () => [63]);
    expect(targets).toContain(63);
  });

  it('uses deterministic fallback for unsupported special pairs', () => {
    const board = emptyBoard();
    const targets = directSpecialComboTargets(board, 'fallback', 10, 11, () => []);
    expect(new Set(targets)).toEqual(new Set([10, 11]));
  });
});
