/** Monotonic elapsed-time source shared by platform-independent features. */
export interface ClockRuntime {
  /** Returns elapsed milliseconds from an arbitrary, non-wall-clock origin. */
  now(): number;
}
