import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../src/app/AppShell';

class FakeRoot {
  innerHTML = '';
}

describe('ANM-024B shared game viewport shell', () => {
  it('renders every scene inside one physical shell and one game viewport', () => {
    const root = new FakeRoot();
    let afterRenderCount = 0;
    const shell = new AppShell(root as unknown as HTMLElement, () => {
      afterRenderCount += 1;
    });

    shell.render('<section class="screen">scene</section>');

    expect(root.innerHTML).toContain('class="viewport-shell"');
    expect(root.innerHTML).toContain('data-viewport-shell="physical"');
    expect(root.innerHTML).toContain('class="phone game-viewport"');
    expect(root.innerHTML).toContain('data-game-viewport="compat-edge-to-edge"');
    expect(root.innerHTML).toContain('<section class="screen">scene</section>');
    expect(afterRenderCount).toBe(1);
  });

  it('centralizes safe-area discovery as shared CSS tokens without double-applying it yet', () => {
    const css = readFileSync(new URL('../src/viewport.css', import.meta.url), 'utf8');

    expect(css).toContain('--safe-area-top: env(safe-area-inset-top, 0px)');
    expect(css).toContain('--safe-area-right: env(safe-area-inset-right, 0px)');
    expect(css).toContain('--safe-area-bottom: env(safe-area-inset-bottom, 0px)');
    expect(css).toContain('--safe-area-left: env(safe-area-inset-left, 0px)');
    expect(css).toContain('--game-viewport-max-width: 430px');
    expect(css).toContain('--game-viewport-max-height: 932px');
    expect(css).toContain('position: fixed');
    expect(css).toContain('inset: 0');
    expect(css).not.toContain('height: 100dvh');
    expect(css).not.toContain('padding: var(--safe-area');
  });

  it('loads the viewport layer after legacy presentation CSS for controlled migration', () => {
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    const legacyCss = main.indexOf("import './style.css';");
    const viewportCss = main.indexOf("import './viewport.css';");

    expect(legacyCss).toBeGreaterThanOrEqual(0);
    expect(viewportCss).toBeGreaterThan(legacyCss);
  });
});
