import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';

const css = readFileSync(new URL('../src/match3BlockerReadability.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');

describe('Match-3 blocker readability', () => {
  it('gives each lean blocker archetype an explicit visual treatment', () => {
    expect(css).toContain('obstacle_locked_cell');
    expect(css).toContain('obstacle_prop_box_2layer');
    expect(css).toContain('obstacle_soap_foam');
    expect(css).toContain('.board-cell:has(.blocker) .blocker b');
  });

  it('keeps the single permeable overlay visually lighter than ordinary blocking overlays', () => {
    const permeable = levels.filter((level) => level.blockerIsPermeable === true);
    expect(permeable).toHaveLength(1);
    expect(permeable[0]?.shortId).toBe('M3_02');
    expect(permeable[0]?.context.narrativeProfile).toBe('pool-laundry');

    expect(css).toContain('.match-screen[data-m3-profile="pool-laundry"]');
    expect(css).toMatch(/obstacle_soap_foam[\s\S]*?opacity:\s*\.72/);
    expect(css).toMatch(/pool-laundry[\s\S]*?obstacle_soap_foam[\s\S]*?opacity:\s*\.46/);
  });

  it('is presentation-only and loaded after the production Match-3 stylesheet', () => {
    expect(main).toContain("import './match3BlockerReadability.css';");
    expect(main.indexOf("import './match3BlockerReadability.css';"))
      .toBeGreaterThan(main.indexOf("import './match3Production.css';"));

    expect(css).not.toContain('pointer-events: auto');
    expect(css).not.toContain('display: none');
  });
});
