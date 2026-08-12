export type ViewportSize = Readonly<{
  width: number;
  height: number;
}>;

export type ViewportInsets = Readonly<{
  top: number;
  right: number;
  bottom: number;
  left: number;
}>;

export type ViewportRect = Readonly<{
  x: number;
  y: number;
  width: number;
  height: number;
}>;

export type ViewportPoint = Readonly<{
  x: number;
  y: number;
}>;

export type ViewportOrientation = 'portrait' | 'landscape';

export type ViewportGeometry = Readonly<{
  physical: ViewportRect;
  safe: ViewportRect;
  game: ViewportRect;
  scene: ViewportSize;
  orientation: ViewportOrientation;
}>;

export const GAME_VIEWPORT_LIMITS = Object.freeze({
  maxWidth: 430,
  maxHeight: 932,
});

export const ZERO_SAFE_AREA_INSETS: ViewportInsets = Object.freeze({
  top: 0,
  right: 0,
  bottom: 0,
  left: 0,
});

export const MOBILE_REGRESSION_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 375, height: 667 },
  { width: 390, height: 844 },
  { width: 393, height: 852 },
  { width: 430, height: 932 },
] as const satisfies readonly ViewportSize[];

const nonNegativeFinite = (value: number | undefined): number =>
  Number.isFinite(value) ? Math.max(0, value ?? 0) : 0;

const normalizeExtent = (value: number): number => nonNegativeFinite(value);

export function normalizeSafeAreaInsets(
  viewport: ViewportSize,
  insets: Partial<ViewportInsets> = ZERO_SAFE_AREA_INSETS,
): ViewportInsets {
  const width = normalizeExtent(viewport.width);
  const height = normalizeExtent(viewport.height);

  const top = Math.min(height, nonNegativeFinite(insets.top));
  const bottom = Math.min(height - top, nonNegativeFinite(insets.bottom));
  const left = Math.min(width, nonNegativeFinite(insets.left));
  const right = Math.min(width - left, nonNegativeFinite(insets.right));

  return { top, right, bottom, left };
}

export function resolveViewportGeometry(
  viewport: ViewportSize,
  insets: Partial<ViewportInsets> = ZERO_SAFE_AREA_INSETS,
): ViewportGeometry {
  const width = normalizeExtent(viewport.width);
  const height = normalizeExtent(viewport.height);
  const normalizedInsets = normalizeSafeAreaInsets({ width, height }, insets);

  const physical: ViewportRect = { x: 0, y: 0, width, height };
  const safe: ViewportRect = {
    x: normalizedInsets.left,
    y: normalizedInsets.top,
    width: Math.max(0, width - normalizedInsets.left - normalizedInsets.right),
    height: Math.max(0, height - normalizedInsets.top - normalizedInsets.bottom),
  };

  const gameWidth = Math.min(safe.width, GAME_VIEWPORT_LIMITS.maxWidth);
  const gameHeight = Math.min(safe.height, GAME_VIEWPORT_LIMITS.maxHeight);
  const game: ViewportRect = {
    x: safe.x + (safe.width - gameWidth) / 2,
    y: safe.y + (safe.height - gameHeight) / 2,
    width: gameWidth,
    height: gameHeight,
  };

  return {
    physical,
    safe,
    game,
    scene: { width: game.width, height: game.height },
    orientation: width > height ? 'landscape' : 'portrait',
  };
}

export function viewportPointToScene(point: ViewportPoint, geometry: ViewportGeometry): ViewportPoint {
  return {
    x: point.x - geometry.game.x,
    y: point.y - geometry.game.y,
  };
}

export function scenePointToViewport(point: ViewportPoint, geometry: ViewportGeometry): ViewportPoint {
  return {
    x: point.x + geometry.game.x,
    y: point.y + geometry.game.y,
  };
}
