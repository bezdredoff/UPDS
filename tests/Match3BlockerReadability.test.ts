import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { blockerPresentation, levels } from '../src/data/levels';

const css = readFileSync(new URL('../src/match3BlockerReadability.css', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');

describe('Match-3 blocker readability', () => {
  it('gives each lean blocker archetype an explicit visual treatment', () => {
    expect(css).toContain('obstacle_locked_cell');
    expect(css).toContain('.board-cell:has(.blocker[data-style="solid"])');
    expect(css).toContain('obstacle_soap_foam');
    expect(blockerPresentation.solid.asset).toBe('./assets/match3/obstacle_zip_bag.png');
    expect(blockerPresentation.locked.asset).toBe('./assets/match3/obstacle_locked_cell_redraw.png');
    expect(css).toContain('scale: .64;');
    expect(css).not.toContain('.blocker::before');
    expect(css).not.toContain('.blocker::after');
    expect(css).toContain('.board-cell:has(.blocker[data-style="locked"][data-layers="1"])');
    expect(css).toMatch(/\.board-cell:has\(\.blocker\[data-style="locked"\]\) \.tile-stack \{\s*opacity:\s*\.84;/);
    expect(css).toMatch(/\.board-cell:has\(\.blocker img\[src\*="obstacle_locked_cell"\]\) \.blocker img \{\s*opacity:\s*1;\s*filter:\s*none;/);
    expect(css).toMatch(/\.board-cell:has\(\.blocker\[data-style="locked"\]\[data-layers="1"\]\) \.blocker img \{\s*opacity:\s*1;\s*filter:\s*none;/);
    expect(css).not.toContain('.blocker b');
  });

  it('keeps foam presentation and interaction consistent across wet/laundry levels', () => {
    const overlayLevels = levels.filter((level) => level.blocker === 'overlay');
    expect(overlayLevels.map((level) => level.shortId)).toEqual(['M3_02', 'M3_15']);
    expect(css).not.toContain('pool-laundry');
    expect(css).toMatch(/obstacle_soap_foam[\s\S]*?opacity:\s*\.72/);
  });

  it('is presentation-only and loaded after the production Match-3 stylesheet', () => {
    expect(main).toContain("import './match3BlockerReadability.css';");
    expect(main.indexOf("import './match3BlockerReadability.css';"))
      .toBeGreaterThan(main.indexOf("import './match3Production.css';"));

    expect(css).not.toContain('pointer-events: auto');
    expect(css).not.toContain('display: none');
  });
});
