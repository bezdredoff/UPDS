import { afterEach, describe, expect, it } from 'vitest';
import { AssetHealth } from '../src/platform/AssetHealth';
import { preloadImageAssets, scheduleImagePreload, uniqueAssetList } from '../src/platform/AssetPreloader';

type ImageConstructor = new () => HTMLImageElement;

const originalImage = (globalThis as typeof globalThis & { Image?: ImageConstructor }).Image;
const originalWindow = globalThis.window;

afterEach(() => {
  if (originalImage) {
    Object.defineProperty(globalThis, 'Image', { configurable: true, writable: true, value: originalImage });
  } else {
    Reflect.deleteProperty(globalThis, 'Image');
  }
  if (originalWindow) {
    Object.defineProperty(globalThis, 'window', { configurable: true, writable: true, value: originalWindow });
  } else {
    Reflect.deleteProperty(globalThis, 'window');
  }
});

describe('asset preloader platform safety', () => {
  it('deduplicates asset URLs without changing their order', () => {
    expect(uniqueAssetList(['/a.png', '', '/b.png', '/a.png'])).toEqual(['/a.png', '/b.png']);
  });

  it('is a clean no-op when the Image constructor is unavailable', async () => {
    Reflect.deleteProperty(globalThis, 'Image');
    const health = new AssetHealth();

    await expect(preloadImageAssets(['/headless.png'], health)).resolves.toBeUndefined();

    expect(health.snapshot()).toEqual({
      preloadRequested: 0,
      preloadLoaded: 0,
      preloadFailed: 0,
      failures: [],
    });
  });

  it('does not schedule browser preloading when window is unavailable', () => {
    Reflect.deleteProperty(globalThis, 'window');
    const health = new AssetHealth();
    expect(() => scheduleImagePreload(['/headless-scheduled.png'], health)).not.toThrow();
    expect(health.snapshot().preloadRequested).toBe(0);
  });

  it('records successful preloads when a browser Image implementation exists', async () => {
    class FakeImage {
      decoding = '';
      onload: ((this: GlobalEventHandlers, ev: Event) => unknown) | null = null;
      onerror: OnErrorEventHandler = null;
      private value = '';

      set src(value: string) {
        this.value = value;
        queueMicrotask(() => this.onload?.call(this as unknown as GlobalEventHandlers, new Event('load')));
      }

      get src(): string { return this.value; }
    }

    Object.defineProperty(globalThis, 'Image', {
      configurable: true,
      writable: true,
      value: FakeImage as unknown as ImageConstructor,
    });

    const health = new AssetHealth();
    await preloadImageAssets(['/browser-r2.png'], health);
    expect(health.snapshot()).toMatchObject({ preloadRequested: 1, preloadLoaded: 1, preloadFailed: 0 });
  });
});
