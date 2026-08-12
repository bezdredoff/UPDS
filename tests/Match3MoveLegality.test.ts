import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, levels } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const neighbours = (index: number): number[] => {
  const row = Math.floor(index / BOARD_SIZE);
  const column = index % BOARD_SIZE;
  return [
    column < BOARD_SIZE - 1 ? index + 1 : -1,
    row < BOARD_SIZE - 1 ? index + BOARD_SIZE : -1,
  ].filter((candidate) => candidate >= 0);
};

describe('ANM-022B shared move legality', () => {
  it.each(levels.map((level, index) => [index, level] as const))(
    'keeps hint, available-move and actual move consistent on level %i',
    (index, level) => {
      const game = new Match3Game(level, level.seed + 22000 + index);
      const before = game.board.map((cell) => ({ ...cell }));

      expect(game.hasAvailableMove()).toBe(true);
      const hint = game.getHintMove();
      expect(hint).not.toBeNull();
      expect(game.board.map((cell) => ({ ...cell }))).toEqual(before);

      const result = game.attemptSwap(hint!.first, hint!.second);
      expect(result.valid).toBe(true);
    },
  );

  it('keeps invalid structural swaps side-effect free', () => {
    const game = new Match3Game(levels[0], 22022);
    const beforeBoard = game.board.map((cell) => ({ ...cell }));
    const beforeMoves = game.movesLeft;

    expect(game.attemptSwap(0, 63)).toMatchObject({ valid: false, reason: 'not-adjacent' });
    expect(game.board.map((cell) => ({ ...cell }))).toEqual(beforeBoard);
    expect(game.movesLeft).toBe(beforeMoves);
  });

  it('uses one evaluation path in attempt, hint and dead-board detection', async () => {
    const source = await import('node:fs/promises').then(({ readFile }) =>
      readFile(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8'),
    );
    expect(source).toContain('private evaluateSwap(');
    expect(source.match(/this\.evaluateSwap\(/g)?.length ?? 0).toBeGreaterThanOrEqual(3);
  });
});
