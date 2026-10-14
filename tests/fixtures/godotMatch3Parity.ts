import { levels, type LevelDefinition } from '../../src/data/levels';
import { Match3Game, type BoardCell, type MoveResult } from '../../src/engine/Match3Game';
import { createSeededRandom } from '../../src/engine/SeededRandom';

const SCENARIO_SEED = 7331;

type MutableCell = { tile: BoardCell['tile']; ingredient: BoardCell['ingredient']; blockerLayers: number; special: BoardCell['special'] };
type MutableInternals = { cells: MutableCell[]; random: () => number };
type ScenarioGoal = (level: LevelDefinition, move: MoveResult, before: readonly BoardCell[], after: readonly BoardCell[]) => boolean;

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
      const swaps: Array<{ first: number; second: number }> = [];
      const totals = { cleared: 0, cascades: 0, blockersCleared: 0, ingredientsDropped: 0 };
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
        if (!goal(level, move, before, game.board)) continue;
        return {
          name,
          levelId: level.id,
          randomSeed,
          initialBoard,
          swaps,
          expected: {
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
