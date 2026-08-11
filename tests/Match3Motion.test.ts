import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { MATCH_MOTION_MS, matchMotionDuration } from '../src/ui/matchMotion';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');

describe('ANM-016 Match-3 motion presentation', () => {
  it('keeps readable full-motion timings and an accessibility fast path', () => {
    expect(MATCH_MOTION_MS.swap).toBe(150);
    expect(MATCH_MOTION_MS.clear).toBe(280);
    expect(MATCH_MOTION_MS.settle).toBe(320);
    expect(MATCH_MOTION_MS.reshuffle).toBe(460);
    expect(matchMotionDuration('clear', true)).toBe(0);
    expect(matchMotionDuration('invalidHold', true)).toBeGreaterThan(0);
  });

  it('animates tile stacks rather than the whole socket/blocker cell', () => {
    expect(appSource).toContain('class="tile-stack"');
    expect(appSource).toContain('getDragPreview');
    expect(appSource).toContain('animateSwapStacks');
    expect(style).toContain('.board-cell.drag-source .tile-stack');
    expect(style).toContain('.phase-clear .board-cell.is-clearing .tile-stack');
    expect(style).toContain('.phase-settle .board-cell.settle-fall .tile-stack');
    expect(style).toContain('.phase-settle .board-cell.settle-spawn .tile-stack');
  });
});
