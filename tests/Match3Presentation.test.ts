import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MATCH_MOTION_MS, matchMotionDuration } from '../src/ui/matchMotion';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');

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
    expect(appSource).toContain('getHintMove()');
    expect(appSource).toContain('playMoveFrames');
    expect(appSource).toContain("frame.phase === 'reshuffle'");
    expect(appSource).toContain('class="tile-stack"');
    expect(style).toContain('.board-cell.hinted');
    expect(style).toContain('.swap-rejected');
    expect(style).toContain('.phase-clear');
    expect(style).toContain('.phase-settle');
    expect(style).toContain('@media (prefers-reduced-motion: reduce)');
  });

  it('keeps the approved cream/green board presentation vocabulary', () => {
    expect(style).toContain('--case-green:');
    expect(style).toContain('--case-cream:');
    expect(style).toContain('.match-case-hud');
    expect(style).toContain('.objective-board');
    expect(style).toContain('.stage-board');
    expect(style).toContain('.match-tooltray');
    expect(style).toContain('.detective-strip');
  });
});
