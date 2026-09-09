import { describe, expect, it } from 'vitest';
import { ViewportDebugSamples, ViewportDebugStyles, serializeViewportDebug } from '../src/platform/ViewportDebugExport';

function fixture() {
  const styles = new ViewportDebugStyles();
  const make = (id: number, reason = 'sample:500ms') => {
    styles.begin();
    const elements = Array.from({ length: 38 }, (_, index) => {
      // 50 declarations per normal/pseudo style, including long image/font values.
      const declaration = Object.fromEntries(Array.from({ length: 50 }, (_, property) => [`property-${property}`, `${index % 8}-${property}-computed-css-value`]));
      Object.assign(declaration, { background: 'url("https://example.test/assets/backgrounds/scene-school-corridor.webp") center / cover no-repeat', 'font-family': '"Noto Sans", "Apple Color Emoji", sans-serif', transform: `matrix(1, 0, 0, 1, 0, ${id % 4})` });
      return { node: `div.element-${index}@${index}`, rect: { top: 40, left: 0, right: 402, bottom: 812, width: 402, height: 772 },
        client: { width: 402, height: 772 }, scroll: { width: 402, height: 772, top: 0, left: 0 },
        style: styles.intern(declaration), before: styles.intern({ ...declaration, content: 'none' }), after: styles.intern({ ...declaration, content: '""' }), tokens: styles.intern({ '--safe-area-top': '62px', '--safe-area-bottom': '34px' }) };
    });
    return { id, t: id * 500, reason, styleRefs: [...styles.used], state: { inner: { width: 402, height: 812 }, elements }, detail: { stack: reason === 'user:rescale' ? 'Error: render\n at renderVN (app.js:120)' : undefined } };
  };
  const buffer = new ViewportDebugSamples<ReturnType<typeof make>>(0);
  const events: { t: number; reason: string }[] = [];
  for (let id = 0; id < 512; id++) {
    const sample = make(id, id === 250 ? 'user:rescale' : undefined);
    buffer.push(sample);
    events.push({ t: sample.t, reason: sample.reason });
  }
  return { styles, buffer, events, make };
}

describe('compact viewport forensic export', () => {
  it('exports 512 realistic captures quickly, bounds the payload and keeps the marked neighborhood', () => {
    const { buffer, styles, events } = fixture();
    const full = serializeViewportDebug(buffer, styles, { events }, 'full');
    const compact = serializeViewportDebug(buffer, styles, { events });
    const trace = JSON.parse(compact.json);
    const samples = [...trace.startup, ...trace.recent];
    expect(full.metrics.samples).toBe(512);
    expect(compact.metrics.exportMs).toBeLessThan(2000);
    expect(full.metrics.exportMs).toBeLessThan(3000);
    expect(compact.bytes).toBeLessThan(3 * 1024 * 1024);
    expect(compact.bytes).toBeLessThan(full.bytes / 3);
    expect(trace.startup).toHaveLength(31);
    for (let id = 240; id <= 260; id++) expect(samples.some((sample) => sample.id === id)).toBe(true);
    for (let id = 492; id < 512; id++) expect(samples.some((sample) => sample.id === id)).toBe(true);
    expect(samples.find((sample) => sample.id === 250).detail.stack).toContain('renderVN');
    expect(trace.events).toEqual(events);
    expect(new Set(samples.map((sample) => sample.id)).size).toBe(samples.length);
    const referenced = new Set(samples.flatMap((sample) => sample.styleRefs).map(String));
    expect(new Set(Object.keys(trace.styles))).toEqual(referenced);
    console.info('viewport stress metrics', { compact: compact.metrics, full: full.metrics });
  });

  it('preserves trace after serialization exceptions and repeated exports, including evicted marked windows', () => {
    const { buffer, styles, make, events } = fixture();
    const before = serializeViewportDebug(buffer, styles, { events }).json;
    const circular: { self?: unknown } = {}; circular.self = circular;
    expect(() => serializeViewportDebug(buffer, styles, { circular })).toThrow();
    expect(serializeViewportDebug(buffer, styles, { events }).json).toBe(before);
    for (let id = 512; id < 1100; id++) buffer.push(make(id));
    styles.retain(buffer.retainedStyleIds());
    const trace = JSON.parse(serializeViewportDebug(buffer, styles, { events }).json);
    for (let id = 240; id <= 260; id++) expect(trace.recent.some((sample) => sample.id === id)).toBe(true);
    expect(trace.startup).toHaveLength(31);
    expect(trace.recent.slice(-20).map((sample) => sample.id)).toEqual(Array.from({ length: 20 }, (_, index) => 1080 + index));
  });

  it('retains exact style values, prunes unreferenced styles, and bounds marked storms explicitly', () => {
    const styles = new ViewportDebugStyles();
    const first = styles.intern({ color: 'rgb(1, 2, 3)' });
    expect(styles.intern({ color: 'rgb(1, 2, 3)' })).toEqual(first);
    const unused = styles.intern({ color: 'red' });
    styles.retain(new Set([first.styleRef]));
    expect(styles.select([first.styleRef])[first.styleRef].color).toBe('rgb(1, 2, 3)');
    expect(() => styles.select([unused.styleRef])).toThrow('Missing diagnostic style');
    const buffer = new ViewportDebugSamples(0);
    for (let id = 0; id < 1200; id++) buffer.push({ id, t: id, reason: 'user:rescale', styleRefs: [first.styleRef] });
    expect(buffer.markedSamples).toHaveLength(512);
    expect(buffer.marks).toHaveLength(64);
    expect(buffer.droppedMarked).toBeGreaterThan(0);
    expect(buffer.droppedMarks).toBe(1136);
  });
});
