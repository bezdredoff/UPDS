import type { ErrorLog } from './ErrorLog';

export type AssetFailure = Readonly<{ timestamp: string; asset: string; context: 'runtime' | 'preload' }>;
export type AssetHealthSnapshot = Readonly<{
  preloadRequested: number;
  preloadLoaded: number;
  preloadFailed: number;
  preloadActive: number;
  preloadPeakActive: number;
  failures: readonly AssetFailure[];
}>;
const MAX_FAILURES = 30;

export class AssetHealth {
  private preloadRequested = 0;
  private preloadLoaded = 0;
  private preloadFailed = 0;
  private preloadActive = 0;
  private preloadPeakActive = 0;
  private failures: AssetFailure[] = [];

  recordPreloadStart(count: number): void { this.preloadRequested += Math.max(0, count); }
  recordPreloadLoaded(): void { this.preloadLoaded += 1; }
  recordPreloadActive(delta: 1 | -1): void {
    this.preloadActive = Math.max(0, this.preloadActive + delta);
    this.preloadPeakActive = Math.max(this.preloadPeakActive, this.preloadActive);
  }
  recordFailure(asset: string, context: AssetFailure['context']): void {
    if (context === 'preload') this.preloadFailed += 1;
    this.failures.push({ timestamp: new Date().toISOString(), asset, context });
    this.failures = this.failures.slice(-MAX_FAILURES);
  }
  snapshot(): AssetHealthSnapshot {
    return {
      preloadRequested: this.preloadRequested,
      preloadLoaded: this.preloadLoaded,
      preloadFailed: this.preloadFailed,
      preloadActive: this.preloadActive,
      preloadPeakActive: this.preloadPeakActive,
      failures: [...this.failures],
    };
  }
}

const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" fill="#171A33"/><path d="M96 160h320v192H96z" fill="#35203B" stroke="#C9A45C" stroke-width="8"/><path d="m128 320 72-72 56 56 64-80 64 96" fill="none" stroke="#7DDFD8" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/><circle cx="176" cy="208" r="22" fill="#E56F68"/></svg>`;
export const ASSET_FALLBACK_DATA_URI = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(fallbackSvg)}`;

export const installImageFallbackHandler = (log: ErrorLog, health: AssetHealth, target: Document = document): (() => void) => {
  const onError = (event: Event): void => {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset.assetFallbackApplied === '1') return;
    const failedAsset = image.currentSrc || image.src || image.getAttribute('src') || '(unknown image)';
    health.recordFailure(failedAsset, 'runtime');
    log.record('asset', `Failed image: ${failedAsset}`);
    image.dataset.assetFallbackApplied = '1';
    if (image.classList.contains('portrait-face')) {
      image.classList.add('is-hidden');
      image.removeAttribute('src');
      return;
    }
    image.src = ASSET_FALLBACK_DATA_URI;
  };
  target.addEventListener('error', onError, true);
  return () => target.removeEventListener('error', onError, true);
};
