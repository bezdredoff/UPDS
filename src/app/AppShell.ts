import { viewportDebugEvent } from '../platform/ViewportDebug';

const persistentShellMarkup = '<div class="viewport-shell" data-viewport-shell="physical"><main class="phone game-viewport" data-game-viewport="compat-edge-to-edge"><div class="app-screen-host" data-screen-host="primary"></div></main></div>';
const fallbackShellMarkup = (content: string): string => `<div class="viewport-shell" data-viewport-shell="physical"><main class="phone game-viewport" data-game-viewport="compat-edge-to-edge">${content}</main></div>`;

/** Owns the persistent viewport DOM shell and disposable UI timers. */
export class AppShell {
  private timers: number[] = [];
  private screenHost: HTMLElement | null = null;
  private gameViewport: HTMLElement | null = null;

  constructor(
    readonly root: HTMLElement,
    private readonly afterRender: () => void,
  ) {}

  private ensureScreenHost(): HTMLElement | null {
    if (this.screenHost && this.gameViewport) return this.screenHost;
    if (typeof this.root.querySelector !== 'function') return null;

    this.root.innerHTML = persistentShellMarkup;
    this.screenHost = this.root.querySelector<HTMLElement>('[data-screen-host="primary"]');
    this.gameViewport = this.root.querySelector<HTMLElement>('[data-game-viewport="compat-edge-to-edge"]');

    if (!this.screenHost || !this.gameViewport) {
      this.screenHost = null;
      this.gameViewport = null;
      return null;
    }
    return this.screenHost;
  }

  private clearTransientViewportChildren(): void {
    if (!this.screenHost || !this.gameViewport) return;
    for (const child of Array.from(this.gameViewport.children)) {
      if (child !== this.screenHost) child.remove();
    }
  }

  render(content: string): void {
    viewportDebugEvent('AppShell.render:before', { screen: content.match(/<section\b[^>]*class="([^"]+)"/)?.[1] ?? 'unknown' }, true);
    this.clearTimers();

    const screenHost = this.ensureScreenHost();
    if (!screenHost) {
      // Lightweight unit/QA fakes may expose only innerHTML. Production DOM always
      // resolves the persistent host; this fallback preserves those harnesses.
      this.root.innerHTML = fallbackShellMarkup(content);
    } else {
      this.clearTransientViewportChildren();
      screenHost.innerHTML = content;
    }

    this.afterRender();
    viewportDebugEvent('AppShell.render:after');
  }

  clearTimers(): void {
    if (typeof window !== 'undefined') {
      for (const timer of this.timers) window.clearTimeout(timer);
    }
    this.timers = [];
  }

  schedule(callback: () => void, milliseconds: number): number {
    if (typeof window === 'undefined') return -1;
    const timer = window.setTimeout(callback, milliseconds);
    this.timers.push(timer);
    return timer;
  }
}
