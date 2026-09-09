import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('standalone edge-to-edge regression contract', () => {
  it('loads standalone presentation overrides after all feature presentation layers', () => {
    const main = read('src/main.ts');
    const lastFeatureCss = main.indexOf("import './match3BlockerReadability.css';");
    const standaloneCss = main.indexOf("import './standaloneEdgeToEdge.css';");

    expect(lastFeatureCss).toBeGreaterThanOrEqual(0);
    expect(standaloneCss).toBeGreaterThan(lastFeatureCss);
  });

  it('keeps physical height in viewport.css and runtime VN sizing in frozen tokens', () => {
    const viewport = read('src/viewport.css');
    const vn = read('src/vnViewportStability.css');
    const standalone = read('src/standaloneEdgeToEdge.css');

    expect(viewport).toContain('--physical-viewport-height: calc(100dvh + var(--safe-area-top))');
    expect(viewport).toContain('height: 100%');
    expect(vn).toContain('--vn-dialogue-row: var(--upds-vn-dialogue-row, 178px)');
    expect(vn).toContain('--vn-controls-min-height: var(--upds-vn-controls-min-height, 73px)');
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

  it('does not globally swallow standalone resize events', () => {
    const main = read('src/main.ts');

    expect(main).toContain("addEventListener('resize', syncAfterRealWidthChange, { passive: true })");
    expect(main).toContain("addEventListener('orientationchange', syncAfterOrientationChange, { passive: true })");
    expect(main).not.toContain('stopImmediatePropagation()');
    expect(main).not.toContain("visualViewport?.addEventListener('resize'");
  });

  it('waits for final fonts before the standalone application mount', () => {
    const main = read('src/main.ts');
    const fontWait = main.indexOf('await document.fonts.ready');
    const mount = main.indexOf('new AnimeDetectiveApp(root, services).mount()');

    expect(fontWait).toBeGreaterThanOrEqual(0);
    expect(mount).toBeGreaterThan(fontWait);
  });
});
