import { describe, expect, it } from 'vitest';
import { ViewportDebugBuffer } from '../src/platform/ViewportDebugBuffer';

describe('viewport evidence retention', () => {
  it('keeps startup evidence after a late rescale evicts the recent window', () => {
    const buffer = new ViewportDebugBuffer<{ t: number; height: number }>(100, 4);
    buffer.push({ t: 100, height: 812 });
    buffer.push({ t: 15100, height: 874 });
    for (let t = 20000; t <= 60000; t += 10000) buffer.push({ t, height: 874 });
    expect(buffer.startup).toEqual([{ t: 100, height: 812 }, { t: 15100, height: 874 }]);
    expect(buffer.recent.map((entry) => entry.t)).toEqual([30000, 40000, 50000, 60000]);
    expect(buffer.droppedRecent).toBe(3);
  });

  it('bounds an event storm and reports loss instead of claiming a complete trace', () => {
    const buffer = new ViewportDebugBuffer<{ t: number }>(0, 3);
    for (let t = 0; t < 20; t += 1) buffer.push({ t });
    expect(buffer.startup).toHaveLength(3);
    expect(buffer.recent).toEqual([{ t: 17 }, { t: 18 }, { t: 19 }]);
    expect(buffer.droppedStartup).toBe(17);
    expect(buffer.droppedRecent).toBe(17);
  });
});
