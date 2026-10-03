import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MAX_OBJECTIVES_PER_LEVEL, levels } from '../src/data/levels';

const productionCss = readFileSync(new URL('../src/match3Production.css', import.meta.url), 'utf8');
const productionUiACss = readFileSync(new URL('../src/match3UiA.css', import.meta.url), 'utf8');
const presentationSource = readFileSync(new URL('../src/features/match3/Match3Presentation.ts', import.meta.url), 'utf8');
const e2eSource = readFileSync(new URL('../e2e/tests/match3.pw.ts', import.meta.url), 'utf8');

describe('ANM-025C1 responsive objectives HUD', () => {
  it('keeps the production objective ceiling at three without changing level content', () => {
    expect(MAX_OBJECTIVES_PER_LEVEL).toBe(3);
    expect(Math.max(...levels.map((level) => level.objectives.length))).toBe(3);
  });

  it('fits icon and count objective items into the compact UI A strip', () => {
    expect(productionUiACss).toContain('.m3-ui-a .objective-board .objectives');
    expect(productionUiACss).toContain('overflow: hidden;');
    expect(productionUiACss).toContain('flex: 0 0 auto;');
    expect(productionCss).toContain('min-width: 0;');
  });

  it('keeps objective names accessible while hiding them visually in gameplay', () => {
    expect(presentationSource).toContain("showProgress ? ' class=\"visually-hidden\"' : ''");
    expect(productionUiACss).not.toContain('.objective-board .objective span { display: none;');
  });

  it('covers the three-objective geometry in the real browser gate', () => {
    expect(e2eSource).toContain('three long objectives fit the production HUD with accessible labels and no horizontal scrolling');
    expect(e2eSource).toContain('card.scrollHeight <= card.clientHeight + 1');
    expect(e2eSource).toContain("label.classList.contains('visually-hidden') && Boolean(label.textContent?.trim())");
  });
});
