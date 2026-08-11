/** Owns the single-screen DOM shell and disposable UI timers. */
export class AppShell {
  private timers: number[] = [];

  constructor(
    readonly root: HTMLElement,
    private readonly afterRender: () => void,
  ) {}

  render(content: string): void {
    this.clearTimers();
    this.root.innerHTML = `<main class="phone">${content}</main>`;
    this.afterRender();
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
