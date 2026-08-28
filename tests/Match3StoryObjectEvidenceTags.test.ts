import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import type { BoardCell } from '../src/engine/Match3Game';
import {
  match3BoardCellsMarkup,
  match3ObjectiveMarkup,
  type Match3Translate,
} from '../src/features/match3/Match3Presentation';

const t: Match3Translate = (key) => key;
const emptyCell = (): BoardCell => ({ tile: null, ingredient: null, blockerLayers: 0, special: null });

describe('Match-3 story-object identity readability', () => {
  it('renders story objects without unexplained numeric identity tags on the board', () => {
    const level = levels.find((candidate) => candidate.shortId === 'M3_03');
    expect(level).toBeDefined();
    if (!level) return;

    const board = Array.from({ length: 64 }, emptyCell);
    board[50] = { tile: null, ingredient: 'receipt', blockerLayers: 0, special: null };
    board[53] = { tile: null, ingredient: 'damagedTowel', blockerLayers: 0, special: null };
    const markup = match3BoardCellsMarkup({
      level,
      board,
      selectedCell: null,
      hintedCells: new Set<number>(),
      t,
    });

    expect(markup).toContain('ingredient');
    expect(markup).not.toContain('data-evidence-tag');
    expect(markup).not.toContain('story-object-evidence-tag');
  });

  it('keeps both M3_03 objective images while removing the confusing 01/04 badges', () => {
    const level = levels.find((candidate) => candidate.shortId === 'M3_03');
    expect(level).toBeDefined();
    if (!level) return;
    const objective = level.objectives.find((candidate) => candidate.kind === 'dropGroup');
    expect(objective).toBeDefined();
    if (!objective) return;

    const markup = match3ObjectiveMarkup(level, objective, 'Улики', 0, true, 1);
    expect(markup.match(/<img /g)).toHaveLength(2);
    expect(markup).toContain('0/2');
    expect(markup).not.toContain('data-evidence-tag');
    expect(markup).not.toContain('>04<');
  });
});
