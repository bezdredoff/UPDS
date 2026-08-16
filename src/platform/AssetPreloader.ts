import type { AssetHealth } from './AssetHealth';

export const IMAGE_PRELOAD_CONCURRENCY = 4;

export const uniqueAssetList = (assets: readonly string[]): string[] => [...new Set(assets.filter(Boolean))];

const requestedAssets = new Set<string>();

type ImageConstructor = new () => HTMLImageElement;

const resolveImageConstructor = (): ImageConstructor | null => {
  const candidate = (globalThis as typeof globalThis & { Image?: ImageConstructor }).Image;
  return typeof candidate === 'function' ? candidate : null;
};

const preloadOne = (asset: string, health: AssetHealth, ImageCtor: ImageConstructor): Promise<void> => new Promise((resolve) => {
  const image = new ImageCtor();
  image.decoding = 'async';
  health.recordPreloadActive(1);
  let finished = false;
  const finish = (): void => {
    if (finished) return;
    finished = true;
    health.recordPreloadActive(-1);
    resolve();
  };
  image.onload = () => {
    health.recordPreloadLoaded();
    finish();
  };
  image.onerror = () => {
    health.recordFailure(asset, 'preload');
    finish();
  };
  try {
    image.src = asset;
  } catch {
    health.recordFailure(asset, 'preload');
    finish();
  }
});

const preloadWithConcurrency = async (
  assets: readonly string[],
  health: AssetHealth,
  ImageCtor: ImageConstructor,
): Promise<void> => {
  let cursor = 0;
  const worker = async (): Promise<void> => {
    while (cursor < assets.length) {
      const asset = assets[cursor];
      cursor += 1;
      await preloadOne(asset, health, ImageCtor);
    }
  };
  const workerCount = Math.min(IMAGE_PRELOAD_CONCURRENCY, assets.length);
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
};

export const preloadImageAssets = async (assets: readonly string[], health: AssetHealth): Promise<void> => {
  // Vitest/Node and other non-browser environments do not expose the DOM Image constructor.
  // Preloading is a presentation optimization only, so degrade to a no-op instead of failing
  // application rendering or headless tests. Do this before mutating requestedAssets so that
  // a later browser-capable environment can still preload the same URLs.
  const ImageCtor = resolveImageConstructor();
  if (!ImageCtor) return;

  const uniqueAssets = uniqueAssetList(assets).filter((asset) => !requestedAssets.has(asset));
  for (const asset of uniqueAssets) requestedAssets.add(asset);
  health.recordPreloadStart(uniqueAssets.length);
  await preloadWithConcurrency(uniqueAssets, health, ImageCtor);
};
