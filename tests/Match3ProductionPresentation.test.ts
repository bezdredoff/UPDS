import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const mainSource = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
const styleSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const productionCss = readFileSync(new URL('../src/match3Production.css', import.meta.url), 'utf8');
const matchSource = readFileSync(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
const engineSource = readFileSync(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');

describe('ANM-025A Match-3 Golden Sample production presentation', () => {
  it('loads the dedicated production layer after shared viewport styling', () => {
    expect(mainSource.indexOf("import './match3Production.css';")).toBeGreaterThan(mainSource.indexOf("import './viewport.css';"));
  });

  it('creates an unmistakable case-board hierarchy without new markup dependencies', () => {
    expect(productionCss).toContain('--m3-paper:');
    expect(productionCss).toContain('--m3-gold:');
    expect(productionCss).toContain('--m3-navy:');
    expect(productionCss).toContain('.stage-board .case-tab');
    expect(productionCss).toContain('.moves-left');
    expect(productionCss).toContain('border: 5px solid var(--m3-paper)');
    expect(productionCss).toContain('.board-cell:nth-child(even)');
    expect(productionCss).toContain('.match-tooltray');
    expect(productionCss).toContain('@container upds-game (max-width: 340px)');
    expect(productionCss).not.toContain('@media (max-height: 650px)');
  });

  it('keeps Match-3 primary variants stronger than the shared modifier without important flags', () => {
    expect(styleSource).toContain('.phone button.primary {');
    expect(styleSource).not.toContain('background: var(--coral) !important;');
    expect(productionCss).toContain('.level-intro .level-card > button.primary {');
    expect(productionCss).toContain('.level-intro .level-card > button.primary:hover');
    expect(productionCss).toContain('.match-tutorial-overlay .match-tutorial-card button.primary {');
    expect(productionCss).not.toContain('button.primary:hover { background: var(--m3-green-dark) !important; }');
    const introPrimary = productionCss.match(/\.level-intro \.level-card > button\.primary\s*\{([\s\S]*?)\}/)?.[1];
    expect(introPrimary).toBeDefined();
    expect(introPrimary).not.toContain('!important');
  });

  it('keeps gameplay/controller contracts outside the production stylesheet', () => {
    expect(productionCss).not.toContain('getHintMove');
    expect(productionCss).not.toContain('attemptSwap');
    expect(matchSource).toContain('playMoveFrames');
    expect(matchSource).toContain('getHintMove()');
    expect(engineSource).toContain('export class Match3Game');
  });
});
