import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const impactCss = readFileSync(new URL('../src/match3SpecialImpact.css', import.meta.url), 'utf8');
const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const engineSource = readFileSync(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');

describe('ANM-025D1 Match-3 special impact tracing', () => {
  it('derives special causality from the existing clear-frame DOM instead of new gameplay state', () => {
    expect(impactCss).toContain(
      '.phase-clear:has(.board-cell.is-clearing .special) .board-cell.is-clearing',
    );
    expect(impactCss).toContain('.board-cell.is-clearing:has(.special)');
    expect(impactCss).toContain('.board-cell.is-clearing:has(.special.flash-row)');
    expect(impactCss).toContain('.board-cell.is-clearing:has(.special.flash-column)');

    expect(engineSource).not.toContain('impactIndices');
    expect(engineSource).not.toContain('specialImpactTrace');
  });

  it('keeps ordinary clears outside the special impact treatment', () => {
    expect(impactCss).not.toMatch(/\.phase-clear\s+\.board-cell\.is-clearing\s*\{/);
    expect(impactCss).toContain(':has(.board-cell.is-clearing .special)');
  });

  it('keeps the source visually stronger than the affected target set', () => {
    expect(impactCss).toContain('outline: 3px solid #fff2a8;');
    expect(impactCss).toContain('animation: special-impact-source');
    expect(impactCss).toContain('animation: special-impact-target');
    expect(impactCss).toContain('animation: special-impact-icon');
  });

  it('respects reduced-motion and is loaded by the production entry point', () => {
    expect(impactCss).toContain('@media (prefers-reduced-motion: reduce)');
    expect(impactCss).toContain('animation: none;');
    expect(mainSource).toContain("import './match3SpecialImpact.css';");
  });
});
