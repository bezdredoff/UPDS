import type { AssetWarmupRuntime } from '../contracts/AssetWarmupRuntime';
import type { AssetHealth } from './AssetHealth';
import { preloadImageAssets } from './AssetPreloader';

/** Browser implementation that warms image URLs and reports diagnostics. */
export class BrowserAssetWarmup implements AssetWarmupRuntime {
  constructor(private readonly health: AssetHealth) {}

  warm(assets: readonly string[]): Promise<void> {
    return preloadImageAssets(assets, this.health);
  }
}
