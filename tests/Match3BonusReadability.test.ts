import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels, specialAssets } from '../src/data/levels';
import { Match3Game } from '../src/engine/Match3Game';
import { match3BoardCellsMarkup, match3HelpMarkup } from '../src/features/match3/Match3Presentation';
import { decodeRgbaPng } from './helpers/pngRgba';

const approved = {
  'flash-row': '0311032777ebf96509e50f3275a4800464b85a4e12b010d44aebdf8203d8c6a7',
  'flash-column': '15f87e326e76bcd15f7a09b84e40346d81b7abdfea1b53e7257c95a0603a785e',
  evidence: '9a7858a430ccec501fc70ebc38cccac4d2033a652516fb4a72945fe49ecf37f5',
  lead: '565f7783cce7b4ba7d060a41112430405881ba189ebc74ae2ca3729b40de7351',
  insight: '2d3e29d7afaec2b23630c5b9556f287227b0faab8cbb620b0036bcfb0fa77b61',
} as const;

describe('approved square Match-3 bonus art', () => {
  for (const [id, hash] of Object.entries(approved)) {
    it(`retains the approved ${id} PNG and transparent 256px canvas`, () => {
      const bytes = readFileSync(new URL(`../public/assets/match3/specials/${id}.png`, import.meta.url));
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(hash);
      const png = decodeRgbaPng(bytes);
      expect([png.width, png.height]).toEqual([256, 256]);
      expect(png.pixels[3]).toBe(0);
      expect(png.pixels.some((value, index) => index % 4 === 3 && value > 0)).toBe(true);
    });
  }

  it('uses the same PNG and separate directional cue on the board and in Help', () => {
    const level = levels[0];
    const game = new Match3Game(level, level.seed);
    const ids = Object.keys(approved) as (keyof typeof approved)[];
    const board = game.board.map((cell, index) => index < ids.length ? { ...cell, special: ids[index] } : cell);
    const t = (key: string) => key;
    for (const markup of [match3BoardCellsMarkup({ level, board, selectedCell: null, hintedCells: new Set(), t }), match3HelpMarkup(t)]) {
      for (const id of ids) expect(markup).toContain(`src="${specialAssets[id]}"`);
      if (markup.includes('data-cell=')) expect(markup).not.toContain('special-base-marker');
      expect(markup.match(/class="special-direction-marker"/g)).toHaveLength(2);
      expect(markup).toContain('data-special-direction="row" aria-hidden="true">↔');
      expect(markup).toContain('data-special-direction="column" aria-hidden="true">↕');
    }
  });
});
