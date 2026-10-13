/** Timer and frame scheduling operations consumed by application features. */
export interface SchedulerRuntime {
  setTimeout(callback: () => void, milliseconds: number): number;
  clearTimeout(timerId: number): void;
  requestFrame(callback: () => void): number;
}
