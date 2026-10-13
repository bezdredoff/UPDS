import type { ClockRuntime } from '../contracts/ClockRuntime';

/** Browser implementation of the monotonic feature clock. */
export class BrowserClock implements ClockRuntime {
  now(): number {
    return performance.now();
  }
}
