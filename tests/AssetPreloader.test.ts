import { afterEach, describe, expect, it } from 'vitest';
import { AssetHealth } from '../src/platform/AssetHealth';
import {
  IMAGE_PRELOAD_CONCURRENCY,
  preloadImageAssets,
  uniqueAssetList,
} from '../src/platform/AssetPreloader';

type ImageConstructor = new () => HTMLImageElement;

const originalImage = (globalThis as typeof globalThis & { Image?: ImageConstructor }).Image;

afterEach(() => {
  if (originalImage) {
    Object.defineProperty(globalThis, 'Image', { configurable: true, writable: true, value: originalImage });
  } else {
    Reflect.deleteProperty(globalThis, 'Image');
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
      preloadActive: 0,
      preloadPeakActive: 0,
      failures: [],
    });
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
    await preloadImageAssets(['/browser-f4b-success.png'], health);
    expect(health.snapshot()).toMatchObject({
      preloadRequested: 1,
      preloadLoaded: 1,
      preloadFailed: 0,
      preloadActive: 0,
      preloadPeakActive: 1,
    });
  });

  it('bounds concurrent image warming and exposes the measured peak', async () => {
    class FakeImage {
      decoding = '';
      onload: ((this: GlobalEventHandlers, ev: Event) => unknown) | null = null;
      onerror: OnErrorEventHandler = null;

      set src(_value: string) {
        queueMicrotask(() => this.onload?.call(this as unknown as GlobalEventHandlers, new Event('load')));
      }
    }

    Object.defineProperty(globalThis, 'Image', {
      configurable: true,
      writable: true,
      value: FakeImage as unknown as ImageConstructor,
    });

    const health = new AssetHealth();
    const assets = Array.from({ length: IMAGE_PRELOAD_CONCURRENCY * 3 }, (_, index) => `/f4b-bounded-${index}.png`);
    await preloadImageAssets(assets, health);

    expect(health.snapshot()).toMatchObject({
      preloadRequested: assets.length,
      preloadLoaded: assets.length,
      preloadFailed: 0,
      preloadActive: 0,
      preloadPeakActive: IMAGE_PRELOAD_CONCURRENCY,
    });
  });

  it('does not re-request an asset that was already warmed by an earlier transition', async () => {
    let requests = 0;
    class FakeImage {
      decoding = '';
      onload: ((this: GlobalEventHandlers, ev: Event) => unknown) | null = null;
      onerror: OnErrorEventHandler = null;

      set src(_value: string) {
        requests += 1;
        queueMicrotask(() => this.onload?.call(this as unknown as GlobalEventHandlers, new Event('load')));
      }
    }

    Object.defineProperty(globalThis, 'Image', {
      configurable: true,
      writable: true,
      value: FakeImage as unknown as ImageConstructor,
    });

    const health = new AssetHealth();
    await preloadImageAssets(['/f4b-repeat-transition.png'], health);
    await preloadImageAssets(['/f4b-repeat-transition.png'], health);

    expect(requests).toBe(1);
    expect(health.snapshot()).toMatchObject({ preloadRequested: 1, preloadLoaded: 1, preloadPeakActive: 1 });
  });
});
