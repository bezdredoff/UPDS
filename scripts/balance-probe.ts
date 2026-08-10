import { BOARD_SIZE, levels } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';

const adjacentPairs = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, (_, index) => {
  const row = Math.floor(index / BOARD_SIZE);
  const column = index % BOARD_SIZE;
  return [
    column < BOARD_SIZE - 1 ? [index, index + 1] as const : null,
    row < BOARD_SIZE - 1 ? [index, index + BOARD_SIZE] as const : null,
  ].filter((pair): pair is readonly [number, number] => pair !== null);
}).flat();

for (const level of levels) {
  let wins = 0;
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const game = new Match3Game(level, level.seed + attempt * 97);
    let cursor = attempt % adjacentPairs.length;
    while (!game.won && !game.lost) {
      let moved = false;
      for (let offset = 0; offset < adjacentPairs.length; offset += 1) {
        const pair = adjacentPairs[(cursor + offset) % adjacentPairs.length];
        if (!game.attemptSwap(pair[0], pair[1]).valid) continue;
        cursor = (cursor + offset + 11) % adjacentPairs.length;
        moved = true;
        break;
      }
      if (!moved) throw new Error(`${level.id}: board reports playable but no move resolves`);
    }
    if (game.won) wins += 1;
  }
  console.log(`${level.id}: ${wins}/40 baseline wins`);
}
