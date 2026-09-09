/** Bounded evidence: preserve startup separately from the recent timeline. */
export class ViewportDebugBuffer<T extends { t: number }> {
  readonly startup: T[] = [];
  readonly recent: T[] = [];
  droppedStartup = 0;
  droppedRecent = 0;

  constructor(private readonly start: number, private readonly capacity = 512) {}

  push(entry: T): void {
    if (entry.t - this.start <= 15_000) {
      if (this.startup.length < this.capacity) this.startup.push(entry);
      else this.droppedStartup += 1;
    }
    this.recent.push(entry);
    if (this.recent.length > this.capacity) {
      this.recent.shift();
      this.droppedRecent += 1;
    }
  }
}
