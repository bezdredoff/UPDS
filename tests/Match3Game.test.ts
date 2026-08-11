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

describe('Match3Game', () => {
  it.each(levels.map((level, index) => [index, level] as const))('creates a stable playable board for level %i', (index, level) => {
    const game = new Match3Game(level, level.seed + index);
    expect(game.board).toHaveLength(64);
    expect(game.hasImmediateMatches()).toBe(false);
    expect(game.hasAvailableMove()).toBe(true);
    expect(game.movesLeft).toBe(level.moves);
  });

  it.each(levels.map((level, index) => [index, level] as const))('can resolve a legal move on level %i', (_index, level) => {
    const game = new Match3Game(level, level.seed + 777);
    let madeMove = false;
    for (let index = 0; index < game.board.length && !madeMove; index += 1) {
      for (const neighbour of neighbours(index)) {
        const result = game.attemptSwap(index, neighbour);
        if (!result.valid) continue;
        madeMove = true;
        expect(result.cascades).toBeGreaterThan(0);
        expect(result.cleared).toBeGreaterThanOrEqual(3);
        expect(result.frames[0]?.phase).toBe('swap');
        expect(result.frames.some((frame) => frame.phase === 'clear')).toBe(true);
        expect(result.frames.some((frame) => frame.phase === 'settle')).toBe(true);
        expect(result.frames.every((frame) => frame.board.length === 64)).toBe(true);
        expect(game.movesLeft).toBe(level.moves - 1);
        break;
      }
    }
    expect(madeMove).toBe(true);
  });


  it.each(levels.map((level, index) => [index, level] as const))('returns an objective-aware hint without mutating level %i', (_index, level) => {
    const game = new Match3Game(level, level.seed + 31337);
    const beforeBoard = game.board.map((cell) => ({ ...cell }));
    const beforeMoves = game.movesLeft;

    const hint = game.getHintMove();

    expect(hint).not.toBeNull();
    expect(game.board.map((cell) => ({ ...cell }))).toEqual(beforeBoard);
    expect(game.movesLeft).toBe(beforeMoves);
    const result = game.attemptSwap(hint!.first, hint!.second);
    expect(result.valid).toBe(true);
  });

  it('does not spend a move on an invalid swap', () => {
    const game = new Match3Game(levels[0], 12001);
    const before = game.movesLeft;
    const result = game.attemptSwap(0, 63);
    expect(result.valid).toBe(false);
    expect(result.reason).toBe('not-adjacent');
    expect(game.movesLeft).toBe(before);
  });
});
