import { describe, expect, it } from 'vitest';
import { levels, type LevelDefinition } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const byShortId = (shortId: string) => levels.find((level) => level.shortId === shortId)!;
const blockerLayers = (game: Match3Game): number => game.board.reduce((total, cell) => total + cell.blockerLayers, 0);
const ingredientIndex = (game: Match3Game, kind: 'receipt'): number => game.board.findIndex((cell) => cell.ingredient === kind);
const rowOf = (index: number): number => Math.floor(index / 8);

describe('ANM-025E2 objective-aware Match-3 guidance', () => {
  it.each([
    ['M3_00', 63],
    ['M3_03', 89],
  ] as const)('prefers immediate blocker progress over a larger irrelevant match on %s seed %i', (shortId, seed) => {
    const game = new Match3Game(byShortId(shortId), seed);
    const before = blockerLayers(game);

    const hint = game.getHintMove();

    expect(hint).not.toBeNull();
    if (!hint) return;
    const result = game.attemptSwap(hint.first, hint.second);
    expect(result.valid).toBe(true);
    expect(blockerLayers(game)).toBeLessThan(before);
  });

  it('treats one large collect objective as the primary hint target', () => {
    const source = byShortId('M3_00');
    const collectOnly: LevelDefinition = {
      ...source,
      id: 'M3_GUIDANCE_COLLECT_ONLY',
      shortId: 'M3_GUIDE_COLLECT',
      tutorialConcepts: [],
      moves: 22,
      objectives: [{ kind: 'collect', tile: 'pantiesLacePink', target: 40, label: 'Розовые' }],
      blockers: [],
      ingredients: [],
      boardHoles: undefined,
      initialTiles: undefined,
    };
    const game = new Match3Game(collectOnly, 477);

    const hint = game.getHintMove();

    expect(hint).not.toBeNull();
    if (!hint) return;
    expect(game.attemptSwap(hint.first, hint.second).valid).toBe(true);
    expect(game.objectiveValue(0)).toBeGreaterThan(0);
  });

  it('prefers a move that advances an ingredient down its current gravity segment', () => {
    const source = byShortId('M3_00');
    const dropOnly: LevelDefinition = {
      ...source,
      id: 'M3_GUIDANCE_DROP_ONLY',
      shortId: 'M3_GUIDE_DROP',
      tutorialConcepts: [],
      objectives: [{ kind: 'drop', ingredient: 'receipt', target: 1, label: 'Квитанция' }],
      blockers: [],
      ingredients: [{ index: 3, kind: 'receipt' }],
      boardHoles: undefined,
      initialTiles: undefined,
    };
    const game = new Match3Game(dropOnly, 13);
    const before = ingredientIndex(game, 'receipt');

    const hint = game.getHintMove();

    expect(hint).not.toBeNull();
    if (!hint) return;
    expect(game.attemptSwap(hint.first, hint.second).valid).toBe(true);
    const after = ingredientIndex(game, 'receipt');
    expect(after === -1 || rowOf(after) > rowOf(before)).toBe(true);
  });

  it('keeps hint evaluation read-only even though scoring inspects the swapped board state', () => {
    const game = new Match3Game(byShortId('M3_00'), 63);
    const beforeBoard = game.board.map((cell) => ({ ...cell }));
    const beforeMoves = game.movesLeft;

    expect(game.getHintMove()).not.toBeNull();

    expect(game.board.map((cell) => ({ ...cell }))).toEqual(beforeBoard);
    expect(game.movesLeft).toBe(beforeMoves);
  });
});
