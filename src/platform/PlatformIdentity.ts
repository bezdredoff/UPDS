export type RuntimeDisplayMode = 'standalone' | 'browser';
export type RuntimeLane = 'stable' | 'preview' | 'local';

export type DisplayModeSignals = Readonly<{
  navigatorStandalone: boolean;
  mediaStandalone: boolean;
}>;

const sampleDisplayModeSignals = (): DisplayModeSignals => ({
  navigatorStandalone:
    (globalThis.navigator as Navigator & { standalone?: boolean } | undefined)?.standalone === true,
  mediaStandalone:
    typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(display-mode: standalone)').matches,
});

/** Single runtime resolver for installed-PWA vs browser identity. */
export const resolveDisplayMode = (signals: DisplayModeSignals = sampleDisplayModeSignals()): RuntimeDisplayMode =>
  signals.navigatorStandalone || signals.mediaStandalone ? 'standalone' : 'browser';

/** Single runtime resolver for stable Pages, preview Pages and non-HTTP local execution. */
export const resolveRuntimeLane = (
  pathname = globalThis.location?.pathname ?? '',
  protocol = globalThis.location?.protocol ?? '',
): RuntimeLane => {
  if (/\/preview(?:\/|$)/.test(pathname)) return 'preview';
  if (protocol === 'http:' || protocol === 'https:') return 'stable';
  return 'local';
};
