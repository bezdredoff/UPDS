import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  GAME_VIEWPORT_LIMITS,
  MOBILE_REGRESSION_VIEWPORTS,
  resolveViewportGeometry,
} from '../src/platform/ViewportContract';

const inside = (inner: { x: number; y: number; width: number; height: number }, outer: { x: number; y: number; width: number; height: number }): boolean =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;

describe('ANM-024D viewport regression matrix', () => {
  it('keeps every supported portrait viewport inside non-zero safe-area geometry', () => {
    for (const viewport of MOBILE_REGRESSION_VIEWPORTS) {
      const geometry = resolveViewportGeometry(viewport, { top: 47, right: 0, bottom: 34, left: 0 });
      expect(geometry.orientation).toBe('portrait');
      expect(inside(geometry.game, geometry.safe)).toBe(true);
      expect(geometry.game.width).toBeLessThanOrEqual(GAME_VIEWPORT_LIMITS.maxWidth);
      expect(geometry.game.height).toBeLessThanOrEqual(GAME_VIEWPORT_LIMITS.maxHeight);
      expect(geometry.scene).toEqual({ width: geometry.game.width, height: geometry.game.height });
    }
  });

  it('keeps the same device matrix valid when rotated into low-height landscape', () => {
    for (const portrait of MOBILE_REGRESSION_VIEWPORTS) {
      const viewport = { width: portrait.height, height: portrait.width };
      const geometry = resolveViewportGeometry(viewport, { top: 0, right: 59, bottom: 21, left: 59 });
      expect(geometry.orientation).toBe('landscape');
      expect(viewport.height).toBeLessThanOrEqual(430);
      expect(inside(geometry.game, geometry.safe)).toBe(true);
      expect(geometry.game.width).toBeLessThanOrEqual(GAME_VIEWPORT_LIMITS.maxWidth);
      expect(geometry.game.height).toBeLessThanOrEqual(GAME_VIEWPORT_LIMITS.maxHeight);
      expect(geometry.game.x).toBeCloseTo(geometry.safe.x + (geometry.safe.width - geometry.game.width) / 2);
      expect(geometry.game.y).toBeCloseTo(geometry.safe.y + (geometry.safe.height - geometry.game.height) / 2);
    }
  });

  it('uses the same safe-area presentation contract in browser and standalone PWA modes', () => {
    const viewportCss = readFileSync(new URL('../src/viewport.css', import.meta.url), 'utf8');
    const styleCss = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
    const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

    expect(indexHtml).toContain('viewport-fit=cover');
    expect(viewportCss).not.toContain('display-mode:');
    expect(styleCss).not.toContain('display-mode:');
    expect(styleCss).toContain('@media (orientation: landscape) and (max-height: 500px)');
  });
});
