import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  MIN_TOUCH_TARGET_PX,
  MOBILE_REGRESSION_VIEWPORTS,
  getSwipeDecision,
} from '../src/ui/boardInteraction';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');

const swipe = (start: number, x: number, y: number, size = 40) => getSwipeDecision(start, x, y, size);

describe('ANM-012 mobile UX contract', () => {
  it('locks the regression matrix to the supported phone sizes', () => {
    expect(MOBILE_REGRESSION_VIEWPORTS).toEqual([
      { width: 320, height: 568 },
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 393, height: 852 },
      { width: 430, height: 932 },
    ]);
    expect(MIN_TOUCH_TARGET_PX).toBe(44);
  });

  it('commits dominant-axis swipes to the adjacent cell', () => {
    expect(swipe(27, 14, 2)).toMatchObject({ committed: true, direction: 'right', targetIndex: 28 });
    expect(swipe(27, -14, 2)).toMatchObject({ committed: true, direction: 'left', targetIndex: 26 });
    expect(swipe(27, 1, -14)).toMatchObject({ committed: true, direction: 'up', targetIndex: 19 });
    expect(swipe(27, 1, 14)).toMatchObject({ committed: true, direction: 'down', targetIndex: 35 });
  });

  it('keeps taps and ambiguous diagonal gestures uncommitted', () => {
    expect(swipe(27, 5, 2)).toEqual({ committed: false, direction: null, targetIndex: null });
    expect(swipe(27, 12, 12)).toEqual({ committed: false, direction: null, targetIndex: null });
  });

  it('commits an edge swipe without inventing a cell outside the board', () => {
    expect(swipe(0, -14, 0)).toEqual({ committed: true, direction: 'left', targetIndex: null });
    expect(swipe(63, 14, 0)).toEqual({ committed: true, direction: 'right', targetIndex: null });
  });

  it('contains page motion and removes the old 640px viewport floor', () => {
    expect(style).toContain('touch-action: none;');
    expect(style).toContain('overscroll-behavior: none;');
    expect(style).toContain('min-height: 0;');
    expect(style).not.toContain('min-height: 640px;');
    expect(style).toContain('@media (max-height: 650px), (max-width: 340px)');
  });
});
