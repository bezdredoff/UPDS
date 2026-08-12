import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GAME_VIEWPORT_LIMITS,
  MOBILE_REGRESSION_VIEWPORTS,
  normalizeSafeAreaInsets,
  resolveViewportGeometry,
  scenePointToViewport,
  viewportPointToScene,
} from '../src/platform/ViewportContract';

describe('ANM-024A viewport and safe-area contract', () => {
  it('owns the portrait regression matrix outside Match-3 input code', () => {
    expect(MOBILE_REGRESSION_VIEWPORTS).toEqual([
      { width: 320, height: 568 },
      { width: 375, height: 667 },
      { width: 390, height: 844 },
      { width: 393, height: 852 },
      { width: 430, height: 932 },
    ]);
    expect(GAME_VIEWPORT_LIMITS).toEqual({ maxWidth: 430, maxHeight: 932 });
  });

  it('resolves physical, safe, game and scene geometry deterministically', () => {
    const geometry = resolveViewportGeometry(
      { width: 390, height: 844 },
      { top: 47, right: 0, bottom: 34, left: 0 },
    );

    expect(geometry.physical).toEqual({ x: 0, y: 0, width: 390, height: 844 });
    expect(geometry.safe).toEqual({ x: 0, y: 47, width: 390, height: 763 });
    expect(geometry.game).toEqual({ x: 0, y: 47, width: 390, height: 763 });
    expect(geometry.scene).toEqual({ width: 390, height: 763 });
    expect(geometry.orientation).toBe('portrait');
  });

  it('centres a bounded game viewport and remains orientation-neutral', () => {
    const desktop = resolveViewportGeometry({ width: 1440, height: 900 });
    expect(desktop.game).toEqual({ x: 505, y: 0, width: 430, height: 900 });

    const landscape = resolveViewportGeometry(
      { width: 844, height: 390 },
      { left: 59, right: 59 },
    );
    expect(landscape.safe).toEqual({ x: 59, y: 0, width: 726, height: 390 });
    expect(landscape.game).toEqual({ x: 207, y: 0, width: 430, height: 390 });
    expect(landscape.orientation).toBe('landscape');
  });

  it('normalizes impossible insets without producing negative safe geometry', () => {
    expect(normalizeSafeAreaInsets(
      { width: 320, height: 568 },
      { top: Number.POSITIVE_INFINITY, right: -20, bottom: 700, left: 400 },
    )).toEqual({ top: 0, right: 0, bottom: 568, left: 320 });

    const geometry = resolveViewportGeometry(
      { width: 320, height: 568 },
      { bottom: 700, left: 400 },
    );
    expect(geometry.safe.width).toBe(0);
    expect(geometry.safe.height).toBe(0);
    expect(geometry.game.width).toBe(0);
    expect(geometry.game.height).toBe(0);
  });

  it('translates scene and viewport points without embedding portrait assumptions', () => {
    const geometry = resolveViewportGeometry(
      { width: 844, height: 390 },
      { left: 59, right: 59 },
    );
    const viewportPoint = scenePointToViewport({ x: 25, y: 30 }, geometry);
    expect(viewportPoint).toEqual({ x: 232, y: 30 });
    expect(viewportPointToScene(viewportPoint, geometry)).toEqual({ x: 25, y: 30 });
  });

  it('keeps edge-to-edge safe-area discovery enabled in the HTML shell', () => {
    const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
    expect(html).toContain('width=device-width, initial-scale=1, viewport-fit=cover');
  });
});
