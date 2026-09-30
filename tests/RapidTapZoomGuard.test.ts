import { describe, expect, it } from 'vitest';
import { RapidTapZoomGuard } from '../src/platform/RapidTapZoomGuard';

describe('passive-content rapid tap zoom fallback', () => {
  const scope = {};
  const point = (time: number, x = 100, y = 100, screen = scope) => ({ time, x, y, scope: screen });
  const tap = (guard: RapidTapZoomGuard, time: number, x = 100, y = 100, screen = scope) => {
    guard.begin(point(time, x, y, screen));
    return guard.end(point(time + 30, x, y, screen));
  };

  it('allows the first tap, suppresses only a nearby rapid repeat and a triple tap', () => {
    const guard = new RapidTapZoomGuard();
    expect(tap(guard, 1000)).toBe(false);
    expect(tap(guard, 1200)).toBe(true);
    expect(tap(guard, 1400)).toBe(true);
  });

  it('allows separated taps in time or space', () => {
    const guard = new RapidTapZoomGuard();
    tap(guard, 1000);
    expect(tap(guard, 1400)).toBe(false);
    expect(tap(guard, 1500, 150)).toBe(false);
  });

  it('never suppresses taps across different screens or after render/reset', () => {
    const guard = new RapidTapZoomGuard();
    tap(guard, 1000);
    expect(tap(guard, 1100, 100, 100, {})).toBe(false);
    guard.reset();
    expect(tap(guard, 1200)).toBe(false);
  });

  it('allows interactive/board targets and resets the passive tap sequence', () => {
    const guard = new RapidTapZoomGuard();
    tap(guard, 1000);
    guard.begin(null);
    expect(guard.end(point(1100))).toBe(false);
    expect(tap(guard, 1200)).toBe(false);
  });

  it('allows multi-touch pinch, including when one finger lifts before the other', () => {
    const guard = new RapidTapZoomGuard();
    tap(guard, 1000);
    guard.begin(point(1100));
    guard.move(100, 100, 2);
    expect(guard.end(point(1150))).toBe(false);
    expect(tap(guard, 1200)).toBe(false);
  });

  it('allows scrolling even if the finger returns to its starting point', () => {
    const guard = new RapidTapZoomGuard();
    tap(guard, 1000);
    guard.begin(point(1100));
    guard.move(100, 130, 1);
    expect(guard.end(point(1150))).toBe(false);
    expect(tap(guard, 1200)).toBe(false);
  });

  it('allows movement detected only at touchend and long-press text selection', () => {
    const guard = new RapidTapZoomGuard();
    tap(guard, 1000);
    guard.begin(point(1100));
    expect(guard.end(point(1150, 120))).toBe(false);
    guard.begin(point(1200));
    expect(guard.end(point(1600))).toBe(false);
    expect(tap(guard, 1700)).toBe(false);
  });

  it('allows touchcancel and out-of-order timestamps', () => {
    const guard = new RapidTapZoomGuard();
    tap(guard, 1000);
    guard.begin(point(1100));
    guard.reset();
    expect(guard.end(point(1150))).toBe(false);
    expect(tap(guard, 900)).toBe(false);
  });
});
