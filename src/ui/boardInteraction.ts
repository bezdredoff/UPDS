import { BOARD_SIZE } from '../data/levels';

export const MIN_TOUCH_TARGET_PX = 44;
export const SWIPE_COMMIT_RATIO = 0.24;
export const SWIPE_AXIS_BIAS = 1.08;
export const DRAG_COMMIT_RATIO = 0.24;
export const DRAG_TARGET_REACTION_RATIO = 0.035;
export const DRAG_VISUAL_LIMIT_RATIO = 0.94;

// Compatibility re-export. Viewport support belongs to the platform contract, not Match-3 input.
export { MOBILE_REGRESSION_VIEWPORTS } from '../platform/ViewportContract';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export type SwipeDecision = Readonly<{
  committed: boolean;
  direction: SwipeDirection | null;
  targetIndex: number | null;
}>;

export type DragPreview = Readonly<{
  x: number;
  y: number;
  direction: SwipeDirection | null;
  targetIndex: number | null;
  targetOffsetX: number;
  targetOffsetY: number;
  targetReacting: boolean;
  committed: boolean;
}>;

const rowOf = (index: number): number => Math.floor(index / BOARD_SIZE);
const colOf = (index: number): number => index % BOARD_SIZE;

export function neighbourIndex(startIndex: number, direction: SwipeDirection): number | null {
  const row = rowOf(startIndex);
  const column = colOf(startIndex);
  const targetRow = row + (direction === 'up' ? -1 : direction === 'down' ? 1 : 0);
  const targetColumn = column + (direction === 'left' ? -1 : direction === 'right' ? 1 : 0);
  if (targetRow < 0 || targetRow >= BOARD_SIZE || targetColumn < 0 || targetColumn >= BOARD_SIZE) return null;
  return targetRow * BOARD_SIZE + targetColumn;
}

function dominantDirection(deltaX: number, deltaY: number): SwipeDirection | null {
  const horizontalDistance = Math.abs(deltaX);
  const verticalDistance = Math.abs(deltaY);
  const horizontal = horizontalDistance >= verticalDistance * SWIPE_AXIS_BIAS;
  const vertical = verticalDistance >= horizontalDistance * SWIPE_AXIS_BIAS;
  if (!horizontal && !vertical) return null;
  if (horizontal) return deltaX < 0 ? 'left' : 'right';
  return deltaY < 0 ? 'up' : 'down';
}

export function getDragPreview(
  startIndex: number,
  deltaX: number,
  deltaY: number,
  cellSize: number,
): DragPreview {
  const safeCellSize = Math.max(1, cellSize);
  const direction = dominantDirection(deltaX, deltaY);
  if (!direction) {
    return { x: 0, y: 0, direction: null, targetIndex: null, targetOffsetX: 0, targetOffsetY: 0, targetReacting: false, committed: false };
  }

  const horizontal = direction === 'left' || direction === 'right';
  const signedDistance = horizontal ? deltaX : deltaY;
  const visualLimit = safeCellSize * DRAG_VISUAL_LIMIT_RATIO;
  const clampedDistance = Math.max(-visualLimit, Math.min(visualLimit, signedDistance));
  const distance = Math.abs(signedDistance);
  const targetIndex = neighbourIndex(startIndex, direction);
  const targetReacting = targetIndex !== null && distance >= safeCellSize * DRAG_TARGET_REACTION_RATIO;
  const committed = targetIndex !== null && distance >= safeCellSize * DRAG_COMMIT_RATIO;
  const reactionDistance = targetReacting ? Math.min(safeCellSize * 0.18, distance * 0.18) : 0;
  const reactionSign = signedDistance < 0 ? 1 : -1;

  return {
    x: horizontal ? clampedDistance : 0,
    y: horizontal ? 0 : clampedDistance,
    direction,
    targetIndex,
    targetOffsetX: horizontal ? reactionDistance * reactionSign : 0,
    targetOffsetY: horizontal ? 0 : reactionDistance * reactionSign,
    targetReacting,
    committed,
  };
}

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

  const direction = dominantDirection(deltaX, deltaY);
  if (!direction) return { committed: false, direction: null, targetIndex: null };

  return {
    committed: true,
    direction,
    targetIndex: neighbourIndex(startIndex, direction),
  };
}
