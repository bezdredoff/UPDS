import type { AssetHealth } from './AssetHealth';

export const uniqueAssetList = (assets: readonly string[]): string[] => [...new Set(assets.filter(Boolean))];

const preloadOne = (asset: string, health: AssetHealth): Promise<void> => new Promise((resolve) => {
  const image = new Image();
  image.decoding = 'async';
  image.onload = () => { health.recordPreloadLoaded(); resolve(); };
  image.onerror = () => { health.recordFailure(asset, 'preload'); resolve(); };
  image.src = asset;
});

export const preloadImageAssets = async (assets: readonly string[], health: AssetHealth): Promise<void> => {
  const uniqueAssets = uniqueAssetList(assets);
  health.recordPreloadStart(uniqueAssets.length);
  await Promise.all(uniqueAssets.map((asset) => preloadOne(asset, health)));
};

export const scheduleImagePreload = (assets: readonly string[], health: AssetHealth): void => {
  const run = (): void => { void preloadImageAssets(assets, health); };
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 1200 });
  else window.setTimeout(run, 250);
};
