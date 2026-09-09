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

  it('restores the real-device R4/R7 physical-height formula for standalone iOS', () => {
    const css = readFileSync(new URL('../src/viewport.css', import.meta.url), 'utf8');

    expect(css).toContain('--safe-area-top: env(safe-area-inset-top, 0px)');
    expect(css).toContain('--safe-area-right: env(safe-area-inset-right, 0px)');
    expect(css).toContain('--safe-area-bottom: env(safe-area-inset-bottom, 0px)');
    expect(css).toContain('--safe-area-left: env(safe-area-inset-left, 0px)');
    expect(css).toContain('--upds-viewport-height: 100dvh');
    expect(css).toContain('--physical-viewport-height: var(--upds-viewport-height)');
    expect(css).toContain('@media (display-mode: standalone)');
    expect(css).toContain('--physical-viewport-height: calc(100dvh + var(--safe-area-top))');
    expect(css).toContain(
      '@media (display-mode: standalone) and (orientation: portrait) and (max-width: 520px)',
    );
    expect(css).toContain(
      ":root[data-upds-display-mode='standalone'] .phone.game-viewport",
    );
    expect(css).toContain('width: 100%');
    expect(css).toContain('height: 100%');
    expect(css).toContain('height: var(--physical-viewport-height)');
    expect(css).not.toContain('--physical-viewport-height: 100vh');
    expect(css).not.toContain('--physical-viewport-height: 100lvh');
    expect(css).toContain('height: var(--physical-viewport-height)');
  });

  it('freezes height-only Safari changes and refreshes geometry only for width/orientation changes', () => {
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');

    expect(main).toContain('const syncStableLayoutMetrics = (): void =>');
    expect(main).toContain('const usableHeight = globalThis.visualViewport?.height ?? globalThis.innerHeight;');
    expect(main).toContain('const syncStandalonePhysicalHeight = (): void =>');
    expect(main).toContain("--physical-viewport-height");
    expect(main).toContain('Math.abs(screenWidth - viewportWidth) < 2');
    expect(main).toContain('Math.max(globalThis.innerHeight, screenHeight)');
    expect(main).toContain("rootStyle.setProperty('--upds-viewport-height', `${usableHeight}px`)");
    expect(main).toContain('if (Math.abs(nextWidth - stableLayoutWidth) < 2) return;');
    expect(main).toContain("addEventListener('resize', syncAfterRealWidthChange, { passive: true })");
    expect(main).toContain("addEventListener('orientationchange', syncAfterOrientationChange, { passive: true })");
    expect(main).not.toContain("visualViewport?.addEventListener('resize'");
    expect(main).not.toContain('stopImmediatePropagation()');
  });

  it('loads the viewport layer after legacy presentation CSS for controlled migration', () => {
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    const legacyCss = main.indexOf("import './style.css';");
    const viewportCss = main.indexOf("import './viewport.css';");

    expect(legacyCss).toBeGreaterThanOrEqual(0);
    expect(viewportCss).toBeGreaterThan(legacyCss);
    expect(main).toContain(
      "document.documentElement.dataset.updsDisplayMode = standaloneMode ? 'standalone' : initialPwa.displayMode",
    );
  });

  it('sets standalone mode and frozen layout tokens before async services can paint', () => {
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    const initialMode = main.indexOf('document.documentElement.dataset.updsDisplayMode = standaloneMode');
    const initialGeometry = main.indexOf('syncStableLayoutMetrics();');
    const servicesReady = main.indexOf('await services.ready');

    expect(initialMode).toBeGreaterThanOrEqual(0);
    expect(initialGeometry).toBeGreaterThan(initialMode);
    expect(servicesReady).toBeGreaterThan(initialGeometry);
  });
});
