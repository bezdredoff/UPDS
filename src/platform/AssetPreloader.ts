import type { AssetHealth } from './AssetHealth';

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
  image.onload = () => { health.recordPreloadLoaded(); resolve(); };
  image.onerror = () => { health.recordFailure(asset, 'preload'); resolve(); };
  image.src = asset;
});

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
  await Promise.all(uniqueAssets.map((asset) => preloadOne(asset, health, ImageCtor)));
};

export const scheduleImagePreload = (assets: readonly string[], health: AssetHealth): void => {
  if (typeof window === 'undefined') return;
  const run = (): void => { void preloadImageAssets(assets, health); };
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 1200 });
  else window.setTimeout(run, 250);
};
