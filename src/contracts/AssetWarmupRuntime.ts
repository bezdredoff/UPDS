/** Optional presentation-asset preparation requested by feature transitions. */
export interface AssetWarmupRuntime {
  warm(assets: readonly string[]): Promise<void>;
}
