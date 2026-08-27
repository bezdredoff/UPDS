import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels, type IngredientKey } from '../src/data/levels';
import { storyObjectEvidenceTags } from '../src/data/match3StoryObjectPresentation';
import type { BoardCell } from '../src/engine/Match3Game';
import {
  match3BoardCellsMarkup,
  match3ObjectiveMarkup,
  type Match3Translate,
} from '../src/features/match3/Match3Presentation';

const css = readFileSync(new URL('../src/match3StoryObjectEvidenceTags.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const t: Match3Translate = (key) => key;

const emptyCell = (): BoardCell => ({
  tile: null,
  ingredient: null,
  blockerLayers: 0,
  special: null,
});

describe('Match-3 story-object evidence tags', () => {
  it('assigns one stable two-digit tag to every story-object identity', () => {
    const entries = Object.entries(storyObjectEvidenceTags) as [IngredientKey, string][];
    expect(entries).toHaveLength(27);
    expect(new Set(entries.map(([, tag]) => tag)).size).toBe(27);
    expect(entries.every(([, tag]) => /^\d{2}$/.test(tag))).toBe(true);
    expect(entries.map(([, tag]) => tag)).toEqual(
      Array.from({ length: 27 }, (_, index) => String(index + 1).padStart(2, '0')),
    );
  });

  it('renders the same evidence tag on a board ingredient and its objective icon', () => {
    const level = levels.find((candidate) => candidate.shortId === 'M3_00');
    expect(level).toBeDefined();
    if (!level) return;

    const board = Array.from({ length: 64 }, emptyCell);
    board[51] = { tile: null, ingredient: 'receipt', blockerLayers: 0, special: null };

    const boardMarkup = match3BoardCellsMarkup({
      level,
      board,
      selectedCell: null,
      hintedCells: new Set<number>(),
      t,
    });
    expect(boardMarkup).toContain('class="story-object-evidence-tag" data-evidence-tag="01"');
    expect(boardMarkup).toContain('aria-hidden="true">01</i>');

    const objective = level.objectives.find((candidate) => candidate.kind === 'drop');
    expect(objective).toBeDefined();
    if (!objective) return;
    const objectiveMarkup = match3ObjectiveMarkup(level, objective, 'Квитанция', 0, true, 1);
    expect(objectiveMarkup).toContain('class="objective-evidence-icon" data-evidence-tag="01"');
    expect(objectiveMarkup).toContain('aria-hidden="true">01</i>');
  });

  it('keeps independent tags for every icon in a grouped story-object objective', () => {
    const level = levels.find((candidate) => candidate.shortId === 'M3_03');
    expect(level).toBeDefined();
    if (!level) return;

    const objective = level.objectives.find((candidate) => candidate.kind === 'dropGroup');
    expect(objective).toBeDefined();
    if (!objective) return;

    const markup = match3ObjectiveMarkup(level, objective, 'Улики', 0, true, 1);
    expect(markup).toContain('data-evidence-tag="01"');
    expect(markup).toContain('data-evidence-tag="04"');
    expect(markup.match(/objective-evidence-icon/g)).toHaveLength(2);
  });

  it('does not tag ordinary collect or blocker objectives', () => {
    const level = levels.find((candidate) => candidate.shortId === 'M3_04');
    expect(level).toBeDefined();
    if (!level) return;

    for (const objective of level.objectives.filter((candidate) => candidate.kind === 'collect' || candidate.kind === 'clearBlockers')) {
      expect(match3ObjectiveMarkup(level, objective, objective.label, 0, true)).not.toContain('story-object-evidence-tag');
    }
  });

  it('keeps tags motion-coupled and loads the presentation stylesheet after base Match-3 CSS', () => {
    expect(css).toContain('.tile-stack > .story-object-evidence-tag');
    expect(css).toContain('.objective-evidence-icon');
    expect(css).toContain('pointer-events: none');
    expect(main).toContain("import './match3StoryObjectEvidenceTags.css';");
    expect(main.indexOf("import './match3StoryObjectEvidenceTags.css';"))
      .toBeGreaterThan(main.indexOf("import './match3Production.css';"));
  });
});
