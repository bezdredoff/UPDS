import { describe, expect, it } from 'vitest';
import { levelBoardDimensions, levels, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const byShortId = (shortId: string) => levels.find((level) => level.shortId === shortId)!;
const moveRow = (first: number, second: number, columns: number): number => (
  (Math.floor(first / columns) + Math.floor(second / columns)) / 2
);

describe('ANM-025G3B spatially neutral hint ranking', () => {
  it('does not resolve an equal-score choice through the earliest top-board index', () => {
    const game = new Match3Game(byShortId('M3_00'), 64434);
    const before = game.board.map((cell) => ({ ...cell }));

    const hints = Array.from({ length: 3 }, () => game.getHintMove());

    expect(hints[0]).not.toBeNull();
    expect(hints[1]).toEqual(hints[0]);
    expect(hints[2]).toEqual(hints[0]);
    expect(game.board.map((cell) => ({ ...cell }))).toEqual(before);
  });

  it('keeps equal-strength hints spatially balanced across deterministic boards', () => {
    const source = byShortId('M3_00');
    const { rows } = levelBoardDimensions(source);
    const neutralActiveTiles: LevelDefinition['activeTiles'] = [
      'pantiesSportWhite', 'pantiesLacePink', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'sportsBra', 'laundryTag',
    ];
    const neutralTieLevel: LevelDefinition = {
      ...source,
      id: 'M3_HINT_TIE_NEUTRAL',
      shortId: 'M3_HINT_TIE_NEUTRAL',
      objectives: [{ kind: 'collect', tile: 'pantiesLacePink', target: 40, label: 'Absent target' }],
      activeTiles: neutralActiveTiles.filter((tile) => tile !== 'pantiesLacePink'),
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
      if (hint && moveRow(hint.first, hint.second, levelBoardDimensions(source).columns) < rows / 2) upperHalfHints += 1;
    }

    expect(upperHalfHints).toBeGreaterThanOrEqual(58);
    expect(upperHalfHints).toBeLessThanOrEqual(70);
  });
});
