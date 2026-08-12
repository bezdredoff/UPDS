import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('ANM-024C shared safe-area ownership', () => {
  it('discovers physical insets only in the shared viewport token layer', () => {
    const viewport = read('src/viewport.css');
    expect(viewport.match(/env\(safe-area-inset-/g)).toHaveLength(4);
    expect(viewport).toContain('--safe-area-top: env(safe-area-inset-top, 0px)');
    expect(viewport).toContain('--safe-area-right: env(safe-area-inset-right, 0px)');
    expect(viewport).toContain('--safe-area-bottom: env(safe-area-inset-bottom, 0px)');
    expect(viewport).toContain('--safe-area-left: env(safe-area-inset-left, 0px)');
  });

  it('owns current menu, VN, Match-3, panel and PWA inset geometry through shared tokens', () => {
    const viewport = read('src/viewport.css');
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
    ]) expect(viewport).toContain(selector);

    expect(viewport).toContain('var(--safe-area-top)');
    expect(viewport).toContain('var(--safe-area-bottom)');
    expect(viewport).toContain('@media (orientation: landscape) and (max-height: 500px)');
  });

  it('keeps the preview QA badge on the same shared geometry contract', () => {
    const badge = read('src/buildIdentity.css');
    expect(badge).not.toContain('env(safe-area-inset-');
    expect(badge).toContain('top: calc(var(--safe-area-top) + 6px)');
    expect(badge).toContain('right: calc(var(--safe-area-right) + 6px)');
  });

  it('loads the viewport ownership layer after legacy presentation and preview badge CSS', () => {
    const main = read('src/main.ts');
    const legacy = main.indexOf("import './style.css';");
    const badge = main.indexOf("import './buildIdentity.css';");
    const viewport = main.indexOf("import './viewport.css';");
    expect(legacy).toBeGreaterThanOrEqual(0);
    expect(badge).toBeGreaterThan(legacy);
    expect(viewport).toBeGreaterThan(badge);
  });

  it('documents legacy env declarations as inert fallback pending ANM-024D cleanup', () => {
    const legacy = read('src/style.css');
    const viewport = read('src/viewport.css');
    expect(legacy).toContain('env(safe-area-inset-');
    expect(viewport).toContain('Legacy env(...) declarations in style.css remain as pre-cutover fallback');
  });
});
