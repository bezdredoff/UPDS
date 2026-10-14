import { levels, type LevelDefinition } from '../../src/data/levels';
import { Match3Game, type BoardCell, type MoveResult } from '../../src/engine/Match3Game';
import { createSeededRandom } from '../../src/engine/SeededRandom';

const SCENARIO_SEED = 7331;

type MutableCell = { tile: BoardCell['tile']; ingredient: BoardCell['ingredient']; blockerLayers: number; special: BoardCell['special'] };
type MutableInternals = { cells: MutableCell[]; random: () => number; shuffle: () => void };
type ScenarioGoal = (level: LevelDefinition, move: MoveResult, before: readonly BoardCell[], after: readonly BoardCell[]) => boolean;
const serializeBoard = (board: readonly BoardCell[]) => board.map((cell) => ({
  tile: cell.tile ?? '', ingredient: cell.ingredient ?? '', blockerLayers: cell.blockerLayers, special: cell.special ?? '',
}));


function gameWithScenarioRandom(level: LevelDefinition): Match3Game {
  const game = new Match3Game(level);
  (game as unknown as MutableInternals).random = createSeededRandom(SCENARIO_SEED);
  return game;
}

function chooseScenario(name: string, eligible: (level: LevelDefinition) => boolean, goal: ScenarioGoal) {
  for (const level of levels) {
    if (!eligible(level)) continue;
    for (let seedOffset = 0; seedOffset < 30; seedOffset += 1) {
      const randomSeed = SCENARIO_SEED + seedOffset;
      const game = gameWithScenarioRandom(level);
      (game as unknown as MutableInternals).random = createSeededRandom(randomSeed);
      const initialBoard = game.board.map((cell) => ({
        tile: cell.tile ?? '',
        ingredient: cell.ingredient ?? '',
        blockerLayers: cell.blockerLayers,
        special: cell.special ?? '',
      }));
      const initialHint = game.getHintMove();
      const swaps: Array<{ first: number; second: number }> = [];
      const totals = { cleared: 0, cascades: 0, blockersCleared: 0, ingredientsDropped: 0, reshuffled: false };
      for (let turn = 0; turn < 28 && !game.won && !game.lost; turn += 1) {
        const hint = game.getHintMove();
        if (!hint) break;
        const before = game.board.map((cell) => ({ ...cell }));
        const move = game.attemptSwap(hint.first, hint.second);
        if (!move.valid) throw new Error(`${name}: hint returned an invalid move for ${level.shortId}`);
        swaps.push({ first: hint.first, second: hint.second });
        totals.cleared += move.cleared;
        totals.cascades += move.cascades;
        totals.blockersCleared += move.blockersCleared;
        totals.ingredientsDropped += move.ingredientsDropped;
        totals.reshuffled ||= move.reshuffled;
        if (!goal(level, move, before, game.board)) continue;
        return {
          name,
          levelId: level.id,
          randomSeed,
          initialBoard,
          swaps,
          expected: {
            initialHint,
            state: game.won ? 'won' : game.lost ? 'lost' : 'playing',
            movesLeft: game.movesLeft,
            progress: game.progress,
            result: { ...totals, valid: true, won: game.won, lost: game.lost },
            board: game.board.map((cell) => ({
              tile: cell.tile ?? '',
              ingredient: cell.ingredient ?? '',
              blockerLayers: cell.blockerLayers,
              special: cell.special ?? '',
            })),
          },
        };
      }
    }
  }
  throw new Error(`No canonical gameplay move found for Godot parity scenario ${name}`);
}

export function godotMatch3ParityScenarios() {
  return [
    chooseScenario('collect-objective', (level) => level.objectives.some(({ kind }) => kind === 'collect'), (level, move) => level.shortId === 'M3_00' && move.cleared > 0),
    chooseScenario('layered-blocker', (level) => level.blockers.some(({ layers }) => layers === 2), (_level, _move, before, after) => after.some((cell, index) => cell.blockerLayers < before[index].blockerLayers)),
    chooseScenario('ingredient-drop', (level) => level.ingredients.length > 0, (_level, move) => move.ingredientsDropped > 0),
    chooseScenario('group-drop-objective', (level) => level.objectives.some(({ kind }) => kind === 'dropGroup'), (level, move) => level.objectives.some(({ kind }) => kind === 'dropGroup') && move.ingredientsDropped > 0),
    chooseScenario('board-hole-topology', (level) => (level.boardHoles?.length ?? 0) > 0, (_level, move) => move.cleared > 0),
    chooseScenario('overlay-blocker', (level) => level.blocker === 'overlay', (_level, move, before, after) => move.cleared > 0 && after.some((cell, index) => before[index].blockerLayers > 0 && cell.blockerLayers < before[index].blockerLayers)),
  ];
}

export function godotMatch3SpecialActionScenario() {
  const level = levels.find(({ shortId }) => shortId === 'M3_00');
  if (!level) throw new Error('M3_00 is required for the special action parity scenario');
  const game = gameWithScenarioRandom(level);
  const cells = (game as unknown as MutableInternals).cells;
  const specialIndex = cells.findIndex((cell) => cell.tile && cell.blockerLayers === 0);
  if (specialIndex < 0) throw new Error('M3_00 has no available cell for a special action scenario');
  cells[specialIndex].special = 'flash-row';
  const initialBoard = serializeBoard(game.board);
  const hint = game.getHintMove();
  const move = game.attemptSpecialActivation(specialIndex);
  if (!move.valid) throw new Error('TypeScript oracle rejected its special action scenario');
  return {
    name: 'special-activation', levelId: level.id, randomSeed: SCENARIO_SEED, initialBoard, specialIndex, hint,
    expected: {
      state: game.won ? 'won' : game.lost ? 'lost' : 'playing',
      movesLeft: game.movesLeft,
      progress: game.progress,
      result: {
        valid: move.valid, won: move.won, lost: move.lost, cleared: move.cleared, cascades: move.cascades,
        blockersCleared: move.blockersCleared, ingredientsDropped: move.ingredientsDropped, reshuffled: move.reshuffled,
      },
      board: serializeBoard(game.board),
    },
  };
}

export function godotMatch3ReshuffleScenario() {
  const level = levels.find(({ shortId }) => shortId === 'M3_02');
  if (!level) throw new Error('M3_02 is required for the Match-3 reshuffle parity scenario');
  const randomSeed = 18427;
  const game = gameWithScenarioRandom(level);
  (game as unknown as MutableInternals).random = createSeededRandom(randomSeed);
  const cells = (game as unknown as MutableInternals).cells;
  let cursor = 0;
  for (const kind of ['flash-row', 'lead', 'evidence', 'insight'] as const) {
    const index = cells.findIndex((cell, candidate) => candidate >= cursor && cell.tile && cell.blockerLayers === 0 && !cell.ingredient);
    if (index >= 0) {
      cells[index].special = kind;
      cursor = index + 1;
    }
  }
  const initialBoard = serializeBoard(game.board);
  (game as unknown as MutableInternals).shuffle();
  return {
    name: 'playable-reshuffle', action: 'reshuffle', levelId: level.id, randomSeed, initialBoard,
    expected: {
      state: game.won ? 'won' : game.lost ? 'lost' : 'playing',
      movesLeft: game.movesLeft,
      hasImmediateMatches: game.hasImmediateMatches(),
      hasAvailableMove: game.hasAvailableMove(),
      board: serializeBoard(game.board),
    },
  };
}
