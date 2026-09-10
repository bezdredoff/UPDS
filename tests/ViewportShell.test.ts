import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { AppShell } from '../src/app/AppShell';
import { resolveViewportGeometry, viewportLayoutTokens } from '../src/platform/ViewportRuntime';

class FakeElement {
  innerHTML = '';
  removed = false;

  constructor(private readonly onRemove: () => void = () => undefined) {}

  remove(): void {
    this.removed = true;
    this.onRemove();
  }
}

class FakeGameViewport extends FakeElement {
  children: FakeElement[];

  constructor(private readonly screenHost: FakeElement) {
    super();
    this.children = [screenHost];
  }

  resetChildren(): void {
    this.children = [this.screenHost];
  }

  appendTransientChild(): FakeElement {
    let transient: FakeElement;
    transient = new FakeElement(() => {
      this.children = this.children.filter((child) => child !== transient);
    });
    this.children.push(transient);
    return transient;
  }
}

class FakeRoot {
  private markup = '';
  private mounted = false;
  readonly screenHost = new FakeElement();
  readonly gameViewport = new FakeGameViewport(this.screenHost);
  shellMounts = 0;

  set innerHTML(value: string) {
    this.markup = value;
    if (value.includes('data-screen-host="primary"')) {
      if (!this.mounted) this.shellMounts += 1;
      this.mounted = true;
      this.screenHost.innerHTML = '';
      this.gameViewport.resetChildren();
    }
  }

  get innerHTML(): string {
    return `${this.markup}${this.screenHost.innerHTML}`;
  }

  querySelector<T>(selector: string): T | null {
    if (!this.mounted) return null;
    if (selector === '[data-screen-host="primary"]') return this.screenHost as T;
    if (selector === '[data-game-viewport="compat-edge-to-edge"]') return this.gameViewport as T;
    return null;
  }
}

describe('ANM-024B shared game viewport shell', () => {
  it('mounts one persistent physical shell and replaces only screen content', () => {
    const root = new FakeRoot();
    let afterRenderCount = 0;
    const shell = new AppShell(root as unknown as HTMLElement, () => {
      afterRenderCount += 1;
    });

    shell.render('<section class="screen first">first</section>');
    const persistentScreenHost = root.screenHost;
    const transientOverlay = root.gameViewport.appendTransientChild();
    shell.render('<section class="screen second">second</section>');

    expect(root.shellMounts).toBe(1);
    expect(root.screenHost).toBe(persistentScreenHost);
    expect(root.innerHTML).toContain('class="viewport-shell"');
    expect(root.innerHTML).toContain('data-viewport-shell="physical"');
    expect(root.innerHTML).toContain('class="phone game-viewport"');
    expect(root.innerHTML).toContain('data-game-viewport="compat-edge-to-edge"');
    expect(root.innerHTML).toContain('data-screen-host="primary"');
    expect(root.screenHost.innerHTML).toContain('<section class="screen second">second</section>');
    expect(root.screenHost.innerHTML).not.toContain('first');
    expect(transientOverlay.removed).toBe(true);
    expect(afterRenderCount).toBe(2);
  });

  it('restores the real-device R4/R7 physical-height formula for standalone iOS', () => {
    const css = readFileSync(new URL('../src/viewport.css', import.meta.url), 'utf8');

    expect(css).toContain('--safe-area-top: env(safe-area-inset-top, 0px)');
    expect(css).toContain('--safe-area-right: env(safe-area-inset-right, 0px)');
    expect(css).toContain('--safe-area-bottom: env(safe-area-inset-bottom, 0px)');
    expect(css).toContain('--safe-area-left: env(safe-area-inset-left, 0px)');
    expect(css).toContain('--upds-viewport-height: 100dvh');
    expect(css).toContain('--upds-physical-screen-height: 0px');
    expect(css).toContain('--physical-viewport-height: var(--upds-viewport-height)');
    expect(css).toContain('@media (display-mode: standalone)');
    expect(css).toContain('--physical-viewport-height: calc(100dvh + var(--safe-area-top))');
    expect(css).toContain('max(calc(100dvh + var(--safe-area-top)), var(--upds-physical-screen-height))');
    expect(css).toContain(
      '@media (display-mode: standalone) and (orientation: portrait) and (max-width: 520px)',
    );
    expect(css).toContain(":root[data-upds-display-mode='standalone'] .phone.game-viewport");
    expect(css).toContain('width: 100%');
    expect(css).toContain('height: 100%');
    expect(css).toContain('height: var(--physical-viewport-height)');
    expect(css).toContain('.app-screen-host');
    expect(css).not.toContain('--physical-viewport-height: 100vh');
    expect(css).not.toContain('--physical-viewport-height: 100lvh');
  });

  it('keeps standalone game geometry identical when WebKit exposes shortened or full dynamic height', () => {
    const online = resolveViewportGeometry({
      displayMode: 'standalone',
      innerWidth: 402,
      innerHeight: 812,
      visualViewportHeight: 812,
      screenWidth: 402,
      screenHeight: 874,
    });
    const offline = resolveViewportGeometry({
      displayMode: 'standalone',
      innerWidth: 402,
      innerHeight: 874,
      visualViewportHeight: 874,
      screenWidth: 402,
      screenHeight: 874,
    });

    expect(online.dynamicHeight).toBe(812);
    expect(online.physicalHeight).toBe(874);
    expect(online.layoutHeight).toBe(874);
    expect(offline.layoutHeight).toBe(874);
    expect(viewportLayoutTokens(online)).toEqual(viewportLayoutTokens(offline));
    expect(viewportLayoutTokens(online).physicalViewportHeight).toBe('874px');
    expect(viewportLayoutTokens(online).browserViewportHeight).toBeNull();
  });

  it('keeps browser geometry based on the dynamic viewport instead of the physical screen', () => {
    const compact = resolveViewportGeometry({
      displayMode: 'browser',
      innerWidth: 402,
      innerHeight: 812,
      visualViewportHeight: 780,
      screenWidth: 402,
      screenHeight: 874,
    });
    const expanded = resolveViewportGeometry({
      displayMode: 'browser',
      innerWidth: 402,
      innerHeight: 874,
      visualViewportHeight: 850,
      screenWidth: 402,
      screenHeight: 874,
    });

    expect(compact.physicalHeight).toBeNull();
    expect(compact.layoutHeight).toBe(780);
    expect(expanded.layoutHeight).toBe(850);
    expect(viewportLayoutTokens(compact).browserViewportHeight).toBe('780px');
    expect(viewportLayoutTokens(expanded).browserViewportHeight).toBe('850px');
  });

  it('delegates bootstrap geometry ownership to ViewportRuntime before async services', () => {
    const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
    const installRuntime = main.indexOf('const viewportRuntime = installViewportRuntime();');
    const servicesReady = main.indexOf('await services.ready');

    expect(main).toContain("import { installViewportRuntime } from './platform/ViewportRuntime';");
    expect(installRuntime).toBeGreaterThanOrEqual(0);
    expect(servicesReady).toBeGreaterThan(installRuntime);
    expect(main).not.toContain('globalThis.visualViewport?.height');
    expect(main).not.toContain("rootStyle.setProperty('--upds-vn-dialogue-row'");
    expect(main).not.toContain("visualViewport?.addEventListener('resize'");
    expect(main).not.toContain('stopImmediatePropagation()');
  });
});
