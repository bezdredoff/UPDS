import { BOARD_SIZE } from '../data/levels';

export const MIN_TOUCH_TARGET_PX = 44;
export const SWIPE_COMMIT_RATIO = 0.22;
export const SWIPE_AXIS_BIAS = 1.08;

export const MOBILE_REGRESSION_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
] as const;

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export type SwipeDecision = Readonly<{
  committed: boolean;
  direction: SwipeDirection | null;
  targetIndex: number | null;
}>;

const rowOf = (index: number): number => Math.floor(index / BOARD_SIZE);
const colOf = (index: number): number => index % BOARD_SIZE;

export function getSwipeDecision(
  startIndex: number,
  deltaX: number,
  deltaY: number,
  cellSize: number,
): SwipeDecision {
  const safeCellSize = Math.max(1, cellSize);
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);
  const threshold = safeCellSize * SWIPE_COMMIT_RATIO;

  if (Math.max(horizontalDistance, verticalDistance) < threshold) {
    return { committed: false, direction: null, targetIndex: null };
  }

  const horizontal = horizontalDistance >= verticalDistance * SWIPE_AXIS_BIAS;
  const vertical = verticalDistance >= horizontalDistance * SWIPE_AXIS_BIAS;
  if (!horizontal && !vertical) {
    return { committed: false, direction: null, targetIndex: null };
  }

  const row = rowOf(startIndex);
  const column = colOf(startIndex);
  let targetRow = row;
  let targetColumn = column;
  let direction: SwipeDirection;

  if (horizontal) {
    direction = deltaX < 0 ? 'left' : 'right';
    targetColumn += deltaX < 0 ? -1 : 1;
  } else {
    direction = deltaY < 0 ? 'up' : 'down';
    targetRow += deltaY < 0 ? -1 : 1;
  }

  if (targetRow < 0 || targetRow >= BOARD_SIZE || targetColumn < 0 || targetColumn >= BOARD_SIZE) {
    return { committed: true, direction, targetIndex: null };
  }

  return {
    committed: true,
    direction,
    targetIndex: targetRow * BOARD_SIZE + targetColumn,
  };
}
