import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('G2-TOUCH-001 production touch-target contract', () => {
  it('loads the focused accessibility override from the shared player controls bundle', () => {
    const controls = read('src/ui/systemControls.ts');
    expect(controls).toContain("import './accessibilityTouchTargets.css';");
  });

  it('keeps audited compact player controls at the 44px baseline', () => {
    const css = read('src/ui/accessibilityTouchTargets.css');
    for (const selector of [
      '.settings-panel .language-row select',
      '.vn-overlay .audio-preview-actions button',
      '.match3-campaign-screen .campaign-level-card button',
      '.match-screen .hint-button',
    ]) {
      expect(css).toContain(selector);
    }
    expect(css).toContain('min-height: 44px;');
  });

  it('retains the later Match-3 production compact hint hardening as a second line of defence', () => {
    const match3Css = read('src/match3Production.css');
    expect(match3Css).toContain('.hint-button { min-height: 44px; }');
  });

  it('measures the affected production controls in the existing mobile-critical boot spec', () => {
    const boot = read('e2e/tests/boot.pw.ts');
    expect(boot).toContain("page.setViewportSize({ width: 320, height: 568 })");
    expect(boot).toContain('keeps compact production touch targets at least 44px tall');
    expect(boot).toContain('qaSelectors.languageSelect');
    expect(boot).toContain('campaign-level-card button');
    expect(boot).toContain('.vn-overlay .audio-preview-actions button');
    expect(boot).toContain('toBeGreaterThanOrEqual(44)');
  });
});
