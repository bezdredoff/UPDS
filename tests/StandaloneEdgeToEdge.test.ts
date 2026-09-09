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

  it('uses physical vh for standalone inner sizing without device-specific inset constants', () => {
    const css = read('src/standaloneEdgeToEdge.css');

    expect(css).toContain(":root[data-upds-display-mode='standalone'] .vn-screen");
    expect(css).toContain('--vn-dialogue-row: clamp(154px, 22vh, 198px)');
    expect(css).toContain('--vn-controls-min-height: clamp(60px, 9vh, 82px)');
    expect(css).toContain('bottom: calc(max(72px, 10vh) + var(--safe-area-bottom))');
    expect(css).not.toMatch(/\b62px\b/);
    expect(css).not.toMatch(/\b34px\b/);
  });

  it('keeps bottom safe-area non-interactive while painting game content edge-to-edge', () => {
    const css = read('src/standaloneEdgeToEdge.css');

    expect(css).toContain('transparent calc(100% - var(--safe-area-bottom)) 100%');
    expect(css).toContain(":root[data-upds-display-mode='standalone'] .match-screen");
    expect(css).toContain('padding-bottom: 0');
    expect(css).toContain(":root[data-upds-display-mode='standalone'] .match-tooltray");
    expect(css).toContain('margin-bottom: var(--safe-area-bottom)');
  });

  it('suppresses transient standalone resize re-renders but keeps orientation handling available', () => {
    const main = read('src/main.ts');
    const standaloneElse = main.indexOf('} else {');
    const suppressor = main.indexOf("addEventListener('resize', (event) => event.stopImmediatePropagation(), { capture: true })");
    const browserOrientation = main.indexOf("addEventListener('orientationchange', syncBrowserAfterOrientationChange)");

    expect(standaloneElse).toBeGreaterThanOrEqual(0);
    expect(suppressor).toBeGreaterThan(standaloneElse);
    expect(browserOrientation).toBeGreaterThanOrEqual(0);
  });

  it('waits for final fonts before the standalone application mount', () => {
    const main = read('src/main.ts');
    const fontWait = main.indexOf('await document.fonts.ready');
    const mount = main.indexOf('new AnimeDetectiveApp(root, services).mount()');

    expect(fontWait).toBeGreaterThanOrEqual(0);
    expect(mount).toBeGreaterThan(fontWait);
  });
});
