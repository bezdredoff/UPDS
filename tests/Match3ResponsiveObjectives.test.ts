import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MAX_OBJECTIVES_PER_LEVEL, levels } from '../src/data/levels';

const productionCss = readFileSync(new URL('../src/match3Production.css', import.meta.url), 'utf8');
const e2eSource = readFileSync(new URL('../e2e/tests/match3.pw.ts', import.meta.url), 'utf8');

describe('ANM-025C1 responsive objectives HUD', () => {
  it('keeps the production objective ceiling at three without changing level content', () => {
    expect(MAX_OBJECTIVES_PER_LEVEL).toBe(3);
    expect(Math.max(...levels.map((level) => level.objectives.length))).toBe(3);
  });

  it('fits objective cards into the available strip instead of relying on horizontal scrolling', () => {
    expect(productionCss).toContain('grid-template-columns: minmax(0, 1fr) 108px;');
    expect(productionCss).toContain('.objective-board .objectives');
    expect(productionCss).toContain('overflow-x: hidden;');
    expect(productionCss).toContain('flex: 1 1 0;');
    expect(productionCss).toContain('min-width: 0;');
  });

  it('gives objective labels the full card width and allows readable wrapping', () => {
    expect(productionCss).toContain('grid-column: 1 / -1;');
    expect(productionCss).toContain('min-width: 0;');
    expect(productionCss).toContain('overflow-wrap: anywhere;');
    expect(productionCss).toContain('white-space: normal;');
    expect(productionCss).toContain('text-overflow: clip;');
  });

  it('covers the three-objective geometry in the real browser gate', () => {
    expect(e2eSource).toContain('three long objectives fit the production HUD without horizontal scrolling or clipped labels');
    expect(e2eSource).toContain('card.scrollHeight <= card.clientHeight + 1');
    expect(e2eSource).toContain('label.scrollWidth <= label.clientWidth + 1');
    expect(e2eSource).toContain("getComputedStyle(label).whiteSpace === 'normal'");
  });
});
