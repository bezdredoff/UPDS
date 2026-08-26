import { describe, expect, it } from 'vitest';
import { BOARD_SIZE, levels, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const byShortId = (shortId: string) => levels.find((level) => level.shortId === shortId)!;
const moveRow = (first: number, second: number): number => (
  (Math.floor(first / BOARD_SIZE) + Math.floor(second / BOARD_SIZE)) / 2
);

describe('ANM-025G3B spatially neutral hint ranking', () => {
  it('does not resolve an equal-score choice through the earliest top-board index', () => {
    const game = new Match3Game(byShortId('M3_00'), 64434);
    const before = game.board.map((cell) => ({ ...cell }));

    const hints = Array.from({ length: 3 }, () => game.getHintMove());

    expect(hints).toEqual([
      { first: 49, second: 50, score: 30112 },
      { first: 49, second: 50, score: 30112 },
      { first: 49, second: 50, score: 30112 },
    ]);
    expect(game.board.map((cell) => ({ ...cell }))).toEqual(before);
  });

  it('keeps equal-strength hints spatially balanced across deterministic boards', () => {
    const source = byShortId('M3_00');
    const neutralTieLevel: LevelDefinition = {
      ...source,
      id: 'M3_HINT_TIE_NEUTRAL',
      shortId: 'M3_HINT_TIE_NEUTRAL',
      objectives: [{ kind: 'collect', tile: 'pantiesLacePink', target: 40, label: 'Absent target' }],
      activeTiles: source.activeTiles.filter((tile) => tile !== 'pantiesLacePink'),
      blockers: [],
      ingredients: [],
      boardHoles: undefined,
      initialTiles: undefined,
      tutorialConcepts: [],
    };
    let upperHalfHints = 0;
    const cohortSize = 128;
    for (let seed = 0; seed < cohortSize; seed += 1) {
      const game = new Match3Game(neutralTieLevel, 1000 + seed * 7919);
      const hint = game.getHintMove();
      expect(hint).not.toBeNull();
      if (hint && moveRow(hint.first, hint.second) < BOARD_SIZE / 2) upperHalfHints += 1;
    }

    expect(upperHalfHints).toBeGreaterThanOrEqual(58);
    expect(upperHalfHints).toBeLessThanOrEqual(70);
  });
});
