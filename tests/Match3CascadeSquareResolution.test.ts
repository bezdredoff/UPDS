import { describe, expect, it } from 'vitest';
import { levels, type Match3TileId } from '../src/data/levels';
import { findResolutionMatchGroups } from '../src/engine/Match3Rules';
import {
  Match3Game,
  type Match3Frame,
  type MatchFeedbackKind,
  type MatchGroup,
  type SpecialKind,
} from '../src/engine/Match3Game';

type MutableCell = {
  tile: Match3TileId | null;
  ingredient: null;
  blockerLayers: number;
  special: SpecialKind | null;
};

type ResolveTotals = {
  cleared: number;
  cascades: number;
  specialsCreated: number;
  blockersCleared: number;
  ingredientsDropped: number;
};

type Match3Internals = {
  cells: MutableCell[];
  resolve: (
    initialGroups: readonly MatchGroup[],
    activatedSpecials: readonly number[],
    playerCreations: readonly never[],
    directCombo: null,
    first: number,
    second: number,
    frames: Match3Frame[],
    primaryFeedback: MatchFeedbackKind,
  ) => ResolveTotals;
};

describe('ANM-025F4 cascade square resolution', () => {
  it('consumes a 2x2 square created outside a player-authored swap without creating a Lead', () => {
    const game = new Match3Game(levels[0], 250401);
    const internals = game as unknown as Match3Internals;

    for (let index = 0; index < internals.cells.length; index += 1) {
      const row = Math.floor(index / 8);
      const column = index % 8;
      internals.cells[index].tile = (row + column) % 2 === 0 ? 'towel' : 'socks';
      internals.cells[index].ingredient = null;
      internals.cells[index].blockerLayers = 0;
      internals.cells[index].special = null;
    }
    for (const index of [0, 1, 8, 9]) internals.cells[index].tile = 'pantiesLacePink';

    const groups = findResolutionMatchGroups(internals.cells);
    expect(groups).toContainEqual({ orientation: 'square', indices: [0, 1, 8, 9] });

    const frames: Match3Frame[] = [];
    const totals = internals.resolve(groups, [], [], null, 0, 0, frames, 'chain');
    const firstClear = frames.find((frame) => frame.phase === 'clear');

    expect(firstClear?.clearedIndices).toEqual(expect.arrayContaining([0, 1, 8, 9]));
    expect(totals.cleared).toBeGreaterThanOrEqual(4);
    expect(totals.specialsCreated).toBe(0);
  });
});
