import type { SchedulerRuntime } from '../contracts/SchedulerRuntime';

/** Browser implementation of feature timers and frame scheduling. */
export class BrowserScheduler implements SchedulerRuntime {
  setTimeout(callback: () => void, milliseconds: number): number {
    if (typeof window === 'undefined') return -1;
    return window.setTimeout(callback, milliseconds);
  }

  clearTimeout(timerId: number): void {
    if (timerId < 0 || typeof window === 'undefined') return;
    window.clearTimeout(timerId);
  }

  requestFrame(callback: () => void): number {
    if (typeof window === 'undefined') return -1;
    return window.requestAnimationFrame(callback);
  }
}
