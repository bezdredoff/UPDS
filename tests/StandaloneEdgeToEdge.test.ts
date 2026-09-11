import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('standalone edge-to-edge regression contract', () => {
  it('loads standalone feature safe-area overrides after feature presentation layers', () => {
    const main = read('src/main.ts');
    const lastFeatureCss = main.indexOf("import './match3BlockerReadability.css';");
    const standaloneCss = main.indexOf("import './standaloneEdgeToEdge.css';");

    expect(lastFeatureCss).toBeGreaterThanOrEqual(0);
    expect(standaloneCss).toBeGreaterThan(lastFeatureCss);
  });

  it('uses the ViewportRuntime dataset as the sole standalone CSS activation signal', () => {
    const runtime = read('src/platform/ViewportRuntime.ts');
    const viewport = read('src/viewport.css');
    const standalone = read('src/standaloneEdgeToEdge.css');

    expect(runtime).toContain('root.dataset.updsDisplayMode = geometry.displayMode;');
    expect(viewport).toContain(":root[data-upds-display-mode='standalone']");
    expect(standalone).toContain(":root[data-upds-display-mode='standalone']");
    expect(viewport).not.toContain('@media (display-mode: standalone)');
    expect(standalone).not.toContain('@media (display-mode: standalone)');
    expect(standalone).not.toContain('matchMedia(');
    expect(standalone).not.toContain('navigator.standalone');
  });

  it('keeps shell geometry viewport-bound and runtime VN sizing in frozen tokens', () => {
    const viewport = read('src/viewport.css');
    const vn = read('src/vnViewportStability.css');
    const standalone = read('src/standaloneEdgeToEdge.css');

    expect(viewport).toContain('inset: 0');
    expect(viewport).toContain('height: auto');
    expect(viewport).toContain('height: 100%');
    expect(vn).toContain('--vn-dialogue-row: var(--upds-vn-dialogue-row, 178px)');
    expect(vn).toContain('--vn-controls-min-height: var(--upds-vn-controls-min-height, 73px)');
    expect(viewport).not.toContain('--physical-viewport-height');
    expect(viewport).not.toContain('--upds-physical-screen-height');
    expect(standalone).not.toContain('--vn-dialogue-row: clamp');
    expect(standalone).not.toContain('--vn-controls-min-height: clamp');
    expect(standalone).not.toMatch(/\b62px\b/);
    expect(standalone).not.toMatch(/\b34px\b/);
  });

  it('keeps bottom safe-area non-interactive while painting the controls surface edge-to-edge', () => {
    const css = read('src/standaloneEdgeToEdge.css');

    expect(css).toContain('background: #f3e8d2;');
    expect(css).not.toContain('transparent calc(100% - var(--safe-area-bottom)) 100%');
    expect(css).toContain(":root[data-upds-display-mode='standalone'] .match-screen");
    expect(css).toContain('padding-bottom: 0');
    expect(css).toContain(":root[data-upds-display-mode='standalone'] .match-tooltray");
    expect(css).toContain('margin-bottom: var(--safe-area-bottom)');
  });

  it('retires root-canvas camouflage instead of neutralizing it later', () => {
    const style = read('src/style.css');
    const standalone = read('src/standaloneEdgeToEdge.css');

    expect(style).toContain('background: #171a2f;');
    expect(style).not.toContain('--upds-system-canvas-color');
    expect(style).not.toContain(":root[data-upds-display-mode='standalone']:has(");
    expect(standalone).not.toContain('Compatibility containment for the historical per-screen root-color bridge');
    expect(standalone).not.toContain(":root[data-upds-display-mode='standalone'] body");
  });

  it('does not globally swallow standalone resize events', () => {
    const runtime = read('src/platform/ViewportRuntime.ts');

    expect(runtime).toContain("globalThis.addEventListener('resize', syncAfterRealWidthChange, { passive: true })");
    expect(runtime).toContain("globalThis.addEventListener('orientationchange', syncAfterOrientationChange, { passive: true })");
    expect(runtime).not.toContain('stopImmediatePropagation()');
    expect(runtime).not.toContain("visualViewport?.addEventListener('resize'");
  });

  it('waits for final fonts before the standalone application mount', () => {
    const main = read('src/main.ts');
    const fontWait = main.indexOf('await document.fonts.ready');
    const mount = main.indexOf('new AnimeDetectiveApp(root, services).mount()');

    expect(fontWait).toBeGreaterThanOrEqual(0);
    expect(mount).toBeGreaterThan(fontWait);
  });
});
