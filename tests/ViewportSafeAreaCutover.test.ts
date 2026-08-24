import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('ANM-024C/D shared safe-area ownership', () => {
  it('discovers physical insets only in the shared viewport token layer', () => {
    const viewport = read('src/viewport.css');
    const legacy = read('src/style.css');
    const badge = read('src/buildIdentity.css');

    expect(viewport.match(/env\(safe-area-inset-/g)).toHaveLength(4);
    expect(viewport).toContain('--safe-area-top: env(safe-area-inset-top, 0px)');
    expect(viewport).toContain('--safe-area-right: env(safe-area-inset-right, 0px)');
    expect(viewport).toContain('--safe-area-bottom: env(safe-area-inset-bottom, 0px)');
    expect(viewport).toContain('--safe-area-left: env(safe-area-inset-left, 0px)');
    expect(legacy).not.toContain('env(safe-area-inset-');
    expect(badge).not.toContain('env(safe-area-inset-');
  });

  it('keeps screen presentation on shared safe-area tokens without a duplicate override layer', () => {
    const legacy = read('src/style.css');
    const viewport = read('src/viewport.css');

    expect(legacy).toContain('padding: max(42px, var(--safe-area-top)) 28px max(24px, var(--safe-area-bottom))');
    expect(legacy).toContain('bottom: calc(max(72px, 10dvh) + var(--safe-area-bottom))');
    expect(legacy).toContain('padding-bottom: max(6px, var(--safe-area-bottom))');
    expect(legacy).toContain('bottom: max(10px, var(--safe-area-bottom))');
    expect(legacy).toContain('@media (orientation: landscape) and (max-height: 500px)');
    expect(legacy).toContain('padding-bottom: max(8px, var(--safe-area-bottom))');

    for (const selector of [
      '.menu-content',
      '.app-header',
      '.vn-controls',
      '.vn-overlay',
      '.level-card',
      '.match-screen',
      '.result-content',
      '.panel',
      '.support-panel',
      '.panel-nav',
      '.settings-panel',
      '.pwa-update-banner',
      '.match-hint',
    ]) expect(viewport).not.toContain(selector);
  });

  it('keeps the preview QA badge on the same shared geometry contract', () => {
    const badge = read('src/buildIdentity.css');
    expect(badge).toContain('top: calc(var(--safe-area-top) + 6px)');
    expect(badge).toContain('right: calc(var(--safe-area-right) + 6px)');
  });

  it('keeps scrolling panel headers below the top inset and the mobile shell full-bleed', () => {
    const legacy = read('src/style.css');
    const viewport = read('src/viewport.css');
    const panelNavRule = legacy.match(
      /\/\* Panels, dossier and QA \*\/[\s\S]*?\.panel-nav\s*\{([^}]*)\}/,
    )?.[1];

    expect(legacy).toContain(
      '.panel { height: 100%; padding: 0 20px max(30px, var(--safe-area-bottom))',
    );
    expect(legacy).toContain(
      '.phone { width: 100%; height: 100%; max-height: none; box-shadow: none; }',
    );
    expect(legacy).toContain('top: 0;');
    expect(legacy).toContain('margin: 0 -20px 14px;');
    expect(legacy).toContain('padding: max(7px, var(--safe-area-top)) 9px 7px;');
    expect(panelNavRule).toBeDefined();
    expect(panelNavRule).not.toMatch(/(?:^|\n)\s*padding\s*:/);
    expect(legacy).not.toContain('top: calc(-1 * max(20px, var(--safe-area-top)))');
    expect(viewport).toContain('position: fixed');
    expect(viewport).toContain('height: var(--physical-viewport-height)');
    expect(viewport).not.toContain('inset: 0');
  });

  it('uses the physical canvas height only for installed standalone mode', () => {
    const main = read('src/main.ts');
    const viewport = read('src/viewport.css');

    expect(viewport).toContain('--physical-viewport-height: 100dvh');
    expect(viewport).toContain(":root[data-upds-display-mode='standalone']");
    expect(viewport).toContain('--physical-viewport-height: 100lvh');
    expect(main).toContain(
      'document.documentElement.dataset.updsDisplayMode = initialPwa.displayMode',
    );
  });

  it('loads shared token discovery after presentation and preview badge CSS', () => {
    const main = read('src/main.ts');
    const legacy = main.indexOf("import './style.css';");
    const badge = main.indexOf("import './buildIdentity.css';");
    const viewport = main.indexOf("import './viewport.css';");
    expect(legacy).toBeGreaterThanOrEqual(0);
    expect(badge).toBeGreaterThan(legacy);
    expect(viewport).toBeGreaterThan(badge);
  });
});
