import { describe, expect, it } from 'vitest';
import { MOBILE_REGRESSION_VIEWPORTS } from '../src/platform/ViewportContract';
import {
  DRAG_COMMIT_RATIO,
  DRAG_TARGET_REACTION_RATIO,
  DRAG_VISUAL_LIMIT_RATIO,
  MIN_TOUCH_TARGET_PX,
  getDragPreview,
  getSwipeDecision,
} from '../src/ui/boardInteraction';


const swipe = (start: number, x: number, y: number, size = 40) => getSwipeDecision(start, x, y, size);

describe('mobile input contract', () => {
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


  it('previews drag displacement, neighbour reaction and commit before release', () => {
    const early = getDragPreview(27, 4, 1, 40);
    expect(early.direction).toBe('right');
    expect(early.targetIndex).toBe(28);
    expect(early.targetReacting).toBe(true);
    expect(early.committed).toBe(false);

    const committed = getDragPreview(27, 16, 1, 40);
    expect(committed.committed).toBe(true);
    expect(committed.targetIndex).toBe(28);
    expect(committed.x).toBeGreaterThan(0);
    expect(committed.targetOffsetX).toBeLessThan(0);

    const capped = getDragPreview(27, 200, 0, 40);
    expect(capped.x).toBeCloseTo(40 * DRAG_VISUAL_LIMIT_RATIO);
    expect(DRAG_COMMIT_RATIO).toBeGreaterThan(DRAG_TARGET_REACTION_RATIO);
  });

  it('never commits drag outside the board even when the finger moves far enough', () => {
    const preview = getDragPreview(0, -30, 0, 40);
    expect(preview.direction).toBe('left');
    expect(preview.targetIndex).toBeNull();
    expect(preview.committed).toBe(false);
  });
});
