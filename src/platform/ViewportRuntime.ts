import { resolveDisplayMode, type RuntimeDisplayMode } from './PlatformIdentity';
import { viewportDebugEvent } from './ViewportDebug';

export type ViewportDisplayMode = RuntimeDisplayMode;
export type ViewportRuntimeChangeReason = 'width' | 'orientation';

export type ViewportGeometryInput = Readonly<{
  displayMode: ViewportDisplayMode;
  innerWidth: number;
  innerHeight: number;
  visualViewportHeight?: number | null;
  screenWidth?: number | null;
  screenHeight?: number | null;
}>;

export type ViewportGeometry = Readonly<{
  displayMode: ViewportDisplayMode;
  width: number;
  dynamicHeight: number;
  layoutHeight: number;
  physicalHeight: number | null;
}>;

export type ViewportLayoutTokens = Readonly<{
  physicalViewportHeight: string | null;
  browserViewportHeight: string | null;
  vnDialogueRow: string;
  vnControlsMinHeight: string;
  vnStatusOffset: string;
}>;

export type ViewportRuntimeListener = (geometry: ViewportGeometry, reason: ViewportRuntimeChangeReason) => void;

const listeners = new Set<ViewportRuntimeListener>();

const positiveNumber = (value: number | null | undefined): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

export const subscribeViewportRuntime = (listener: ViewportRuntimeListener): (() => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const publishViewportRuntimeChange = (geometry: ViewportGeometry, reason: ViewportRuntimeChangeReason): void => {
  for (const listener of listeners) listener(geometry, reason);
};

export const resolveViewportGeometry = (input: ViewportGeometryInput): ViewportGeometry => {
  const width = positiveNumber(input.innerWidth) ? input.innerWidth : 1;
  const innerHeight = positiveNumber(input.innerHeight) ? input.innerHeight : 1;
  const dynamicHeight = positiveNumber(input.visualViewportHeight) ? input.visualViewportHeight : innerHeight;

  let physicalHeight: number | null = null;
  if (
    input.displayMode === 'standalone' &&
    positiveNumber(input.screenWidth) &&
    positiveNumber(input.screenHeight) &&
    Math.abs(input.screenWidth - width) < 2
  ) {
    physicalHeight = Math.max(innerHeight, input.screenHeight);
  }

  return {
    displayMode: input.displayMode,
    width,
    dynamicHeight,
    layoutHeight: input.displayMode === 'standalone' && physicalHeight !== null ? physicalHeight : dynamicHeight,
    physicalHeight,
  };
};

export const viewportLayoutTokens = (geometry: ViewportGeometry): ViewportLayoutTokens => {
  const height = geometry.layoutHeight;
  return {
    physicalViewportHeight:
      geometry.displayMode === 'standalone' && geometry.physicalHeight !== null
        ? `${geometry.physicalHeight}px`
        : null,
    browserViewportHeight: geometry.displayMode === 'browser' ? `${height}px` : null,
    vnDialogueRow: `${clamp(height * 0.22, 154, 198)}px`,
    vnControlsMinHeight: `${clamp(height * 0.09, 60, 82)}px`,
    vnStatusOffset: `${Math.max(72, height * 0.1)}px`,
  };
};

const sampleViewportGeometry = (displayMode: ViewportDisplayMode): ViewportGeometry =>
  resolveViewportGeometry({
    displayMode,
    innerWidth: globalThis.innerWidth,
    innerHeight: globalThis.innerHeight,
    visualViewportHeight: globalThis.visualViewport?.height,
    screenWidth: globalThis.screen?.width,
    screenHeight: globalThis.screen?.height,
  });

const applyViewportGeometry = (geometry: ViewportGeometry): void => {
  const root = document.documentElement;
  const tokens = viewportLayoutTokens(geometry);
  root.dataset.updsDisplayMode = geometry.displayMode;

  if (tokens.physicalViewportHeight === null) root.style.removeProperty('--physical-viewport-height');
  else root.style.setProperty('--physical-viewport-height', tokens.physicalViewportHeight);

  if (tokens.browserViewportHeight === null) root.style.removeProperty('--upds-viewport-height');
  else root.style.setProperty('--upds-viewport-height', tokens.browserViewportHeight);

  root.style.setProperty('--upds-vn-dialogue-row', tokens.vnDialogueRow);
  root.style.setProperty('--upds-vn-controls-min-height', tokens.vnControlsMinHeight);
  root.style.setProperty('--upds-vn-status-offset', tokens.vnStatusOffset);
  viewportDebugEvent(
    'viewport:tokens-written',
    {
      displayMode: geometry.displayMode,
      dynamicHeight: geometry.dynamicHeight,
      layoutHeight: geometry.layoutHeight,
      physicalHeight: geometry.physicalHeight,
    },
    true,
  );
};

export type InstalledViewportRuntime = Readonly<{
  displayMode: ViewportDisplayMode;
  snapshot: () => ViewportGeometry;
  dispose: () => void;
}>;

/**
 * Sole runtime owner of window/screen viewport sampling, browser viewport
 * events and layout tokens. Height-only Safari changes are ignored after the
 * initial snapshot; a real width/orientation change refreshes the snapshot and
 * is then published to feature subscribers.
 */
export const installViewportRuntime = (): InstalledViewportRuntime => {
  const displayMode = resolveDisplayMode();
  let current = sampleViewportGeometry(displayMode);
  let stableLayoutWidth = Math.round(current.width);

  const sync = (reason?: ViewportRuntimeChangeReason): void => {
    current = sampleViewportGeometry(displayMode);
    applyViewportGeometry(current);
    if (reason) publishViewportRuntimeChange(current, reason);
  };

  const syncAfterOrientationChange = (): void => {
    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(() => {
        current = sampleViewportGeometry(displayMode);
        stableLayoutWidth = Math.round(current.width);
        applyViewportGeometry(current);
        publishViewportRuntimeChange(current, 'orientation');
      });
    });
  };

  const syncAfterRealWidthChange = (): void => {
    const nextWidth = Math.round(globalThis.innerWidth);
    if (Math.abs(nextWidth - stableLayoutWidth) < 2) return;
    stableLayoutWidth = nextWidth;
    globalThis.requestAnimationFrame(() => sync('width'));
  };

  sync();
  globalThis.addEventListener('resize', syncAfterRealWidthChange, { passive: true });
  globalThis.addEventListener('orientationchange', syncAfterOrientationChange, { passive: true });

  return {
    displayMode,
    snapshot: () => current,
    dispose: () => {
      globalThis.removeEventListener('resize', syncAfterRealWidthChange);
      globalThis.removeEventListener('orientationchange', syncAfterOrientationChange);
    },
  };
};
