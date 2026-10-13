import { describe, expect, it, vi } from 'vitest';
import { BrowserScheduler } from '../src/platform/BrowserScheduler';

describe('BrowserScheduler', () => {
  it('adapts browser timers and frame requests', () => {
    const originalWindow = globalThis.window;
    const setTimeout = vi.fn(() => 11);
    const clearTimeout = vi.fn();
    const requestAnimationFrame = vi.fn((callback: FrameRequestCallback) => {
      callback(0);
      return 12;
    });
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: { setTimeout, clearTimeout, requestAnimationFrame },
    });

    try {
      const scheduler = new BrowserScheduler();
      const callback = vi.fn();
      expect(scheduler.setTimeout(callback, 80)).toBe(11);
      scheduler.clearTimeout(11);
      expect(scheduler.requestFrame(callback)).toBe(12);
      expect(setTimeout).toHaveBeenCalledWith(callback, 80);
      expect(clearTimeout).toHaveBeenCalledWith(11);
      expect(requestAnimationFrame).toHaveBeenCalledOnce();
      expect(callback).toHaveBeenCalledOnce();
    } finally {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    }
  });

  it('is safe when no browser window exists', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', { configurable: true, value: undefined });
    try {
      const scheduler = new BrowserScheduler();
      expect(scheduler.setTimeout(() => undefined, 1)).toBe(-1);
      expect(scheduler.requestFrame(() => undefined)).toBe(-1);
      expect(() => scheduler.clearTimeout(-1)).not.toThrow();
    } finally {
      Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
    }
  });
});
