import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MATCH_MOTION_MS, matchMotionDuration } from '../src/ui/matchMotion';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const productionStyle = readFileSync(new URL('../src/match3Production.css', import.meta.url), 'utf8');
const matchSource = readFileSync(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');

describe('current Match-3 presentation contract', () => {
  it('keeps readable motion timings with a reduced-motion fast path', () => {
    expect(MATCH_MOTION_MS.swap).toBe(150);
    expect(MATCH_MOTION_MS.clear).toBe(280);
    expect(MATCH_MOTION_MS.settle).toBe(320);
    expect(MATCH_MOTION_MS.reshuffle).toBe(460);
    expect(matchMotionDuration('clear', true)).toBe(0);
    expect(matchMotionDuration('invalidHold', true)).toBeGreaterThan(0);
  });

  it('keeps objective-aware hints and staged move feedback', () => {
    expect(matchSource).toContain('getHintMove()');
    expect(matchSource).toContain('playMoveFrames');
    expect(matchSource).toContain("frame.phase === 'reshuffle'");
    expect(matchSource).toContain('class="tile-stack"');
    expect(style).toContain('.board-cell.hinted');
    expect(style).toContain('.swap-rejected');
    expect(style).toContain('.phase-clear');
    expect(style).toContain('.phase-settle');
    expect(style).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps the approved Golden Sample case-file hierarchy around the playable board', () => {
    expect(productionStyle).toContain('.level-intro, .match-screen');
    expect(productionStyle).toContain('--case-green:');
    expect(productionStyle).toContain('--case-cream:');
    expect(productionStyle).toContain('--case-navy:');
    expect(productionStyle).toContain('--case-socket:');
    expect(style).toContain('.match-case-hud');
    expect(style).toContain('.objective-board');
    expect(style).toContain('.stage-board');
    expect(productionStyle).toContain('.board {');
    expect(style).toContain('.match-tooltray');
    expect(style).toContain('.detective-strip');
    expect(matchSource).toContain('class="board" role="grid"');
  });

  it('keeps Golden Sample parity presentation-only and responsive', () => {
    expect(productionStyle).toContain('background: var(--case-green);');
    expect(productionStyle).toContain('background: linear-gradient(145deg, var(--case-socket), #293550 74%);');
    expect(productionStyle).toContain('.board { width: min(calc(100% - 16px), 358px); }');
    expect(productionStyle).toContain('.board { width: min(56dvh, 318px); }');
    expect(matchSource).toContain('getHintMove()');
    expect(matchSource).toContain('new Match3Game(level, level.seed + attempt * 101)');
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    expect(main.indexOf("import './match3Production.css';")).toBeGreaterThan(main.indexOf("import './viewport.css';"));
  });
});
