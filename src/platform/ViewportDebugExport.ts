import { ViewportDebugBuffer } from './ViewportDebugBuffer';

export type StyleRef = { styleRef: number };
type Style = Readonly<Record<string, string>>;

/** Exact declarations are shared at capture time, never re-interned by the exporter. */
export class ViewportDebugStyles {
  private nextId = 0;
  private readonly ids = new Map<string, number>();
  private readonly records = new Map<number, { key: string; value: Style }>();
  readonly used = new Set<number>();
  durationMs = 0;

  begin(): void { this.used.clear(); this.durationMs = 0; }

  intern(value: Style): StyleRef {
    const start = performance.now();
    const key = JSON.stringify(value);
    let id = this.ids.get(key);
    if (id === undefined) {
      id = this.nextId++;
      this.ids.set(key, id);
      this.records.set(id, { key, value });
    }
    this.used.add(id);
    this.durationMs += performance.now() - start;
    return { styleRef: id };
  }

  select(ids: Iterable<number>): Record<number, Style> {
    const result: Record<number, Style> = {};
    for (const id of ids) {
      const record = this.records.get(id);
      if (!record) throw new Error(`Missing diagnostic style ${id}`);
      result[id] = record.value;
    }
    return result;
  }

  retain(ids: Set<number>): void {
    for (const [id, record] of this.records) {
      if (ids.has(id)) continue;
      this.records.delete(id);
      this.ids.delete(record.key);
    }
  }
}

export type DebugSample = { id: number; t: number; reason: string; styleRefs: number[] };
export type ExportMode = 'compact' | 'full';

/** Startup + bounded marked windows + rolling history; each sample is emitted once. */
export class ViewportDebugSamples<T extends DebugSample> extends ViewportDebugBuffer<T> {
  readonly markedSamples: T[] = [];
  readonly marks: { t: number; before?: number; after: number }[] = [];
  droppedMarked = 0;
  droppedMarks = 0;
  private until = -Infinity;

  override push(entry: T): void {
    if (entry.reason === 'user:rescale') {
      this.marks.push({ t: entry.t, before: this.recent[this.recent.length - 1]?.id, after: entry.id });
      if (this.marks.length > 64) { this.marks.shift(); this.droppedMarks++; }
      this.until = entry.t + 5000;
      for (const sample of this.recent) {
        if (sample.t >= entry.t - 5000) this.pin(sample);
      }
    }
    if (entry.t <= this.until) this.pin(entry);
    super.push(entry);
  }

  private pin(entry: T): void {
    if (this.markedSamples.includes(entry)) return;
    this.markedSamples.push(entry);
    if (this.markedSamples.length > 512) { this.markedSamples.shift(); this.droppedMarked++; }
  }

  select(mode: ExportMode): { startup: T[]; recent: T[] } {
    const startup = new Set(this.startup);
    const selected = new Set([...this.markedSamples, ...(mode === 'full' ? this.recent : this.recent.slice(-20))]);
    return { startup: this.startup, recent: [...selected].filter((entry) => !startup.has(entry)).sort((a, b) => a.id - b.id) };
  }

  retainedStyleIds(): Set<number> {
    return new Set([...this.startup, ...this.recent, ...this.markedSamples].flatMap((entry) => entry.styleRefs));
  }
}

export function serializeViewportDebug<T extends DebugSample>(buffer: ViewportDebugSamples<T>, styles: ViewportDebugStyles, metadata: Record<string, unknown>, mode: ExportMode = 'compact') {
  const start = performance.now();
  const samples = buffer.select(mode);
  const selected = [...samples.startup, ...samples.recent];
  const styleStart = performance.now();
  const declarations = styles.select(new Set(selected.flatMap((entry) => entry.styleRefs)));
  const styleSelectionMs = performance.now() - styleStart;
  const payload = {
    ...metadata, schema: 'upds-viewport-debug-v2', mode, ...samples,
    marks: buffer.marks, styles: declarations,
    retention: { startupLimit: 512, recentLimit: 512, markedLimit: 512, markWindowMs: 5000, latestSamples: 20,
      droppedStartup: buffer.droppedStartup, droppedRecent: buffer.droppedRecent,
      droppedMarked: buffer.droppedMarked, droppedMarks: buffer.droppedMarks },
  };
  const stringifyStart = performance.now();
  const json = JSON.stringify(payload);
  const stringifyMs = performance.now() - stringifyStart;
  const bytes = new Blob([json]).size;
  return { json, bytes, metrics: { exportMs: performance.now() - start, stringifyMs, styleSelectionMs, styleInterningMs: 0, bytes, samples: selected.length } };
}
