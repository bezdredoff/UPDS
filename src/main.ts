import './style.css';
import './buildIdentity.css';
import './viewport.css';
import './vnViewportStability.css';
import './match3Production.css';
import './match3Help.css';
import './match3StoryObjectGuidance.css';
import './match3SpecialImpact.css';
import './match3BlockerReadability.css';
import './standaloneEdgeToEdge.css';
import { BUILD_ID } from './appVersion';
import { AnimeDetectiveApp } from './ui/AnimeDetectiveApp';
import { installImageFallbackHandler } from './platform/AssetHealth';
import { installGlobalErrorHandlers } from './platform/ErrorLog';
import { createRuntimeServices } from './platform/RuntimeServices';
import { runtimeAssetCatalog } from './platform/RuntimeAssets';
import { startViewportDebug, viewportDebugEvent, viewportDebugServices } from './platform/ViewportDebug';

const clamp = (value: number, minimum: number, maximum: number): number =>
  Math.min(maximum, Math.max(minimum, value));

const bootstrap = async (): Promise<void> => {
  startViewportDebug();
  const pathname = globalThis.location?.pathname ?? '';
  if (/\/preview(?:\/|$)/.test(pathname)) {
    document.documentElement.dataset.updsLane = 'preview';
    document.documentElement.dataset.updsBuild = BUILD_ID;
  }

  const navigatorStandalone = (globalThis.navigator as Navigator & { standalone?: boolean } | undefined)?.standalone === true;
  const mediaStandalone = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(display-mode: standalone)').matches;
  const standaloneMode = navigatorStandalone || mediaStandalone;
  document.documentElement.dataset.updsDisplayMode = standaloneMode ? 'standalone' : 'browser';

  /*
   * One geometry snapshot owns a visible orientation. Mobile Safari is allowed
   * to change visualViewport/innerHeight while browser chrome, networking or UI
   * settles, but those height-only events must not resize the game or VN rows.
   * A genuine width/orientation change refreshes the snapshot explicitly.
   */
  let stableLayoutWidth = Math.round(globalThis.innerWidth);
  const syncStableLayoutMetrics = (): void => {
    const usableHeight = globalThis.visualViewport?.height ?? globalThis.innerHeight;
    if (!Number.isFinite(usableHeight) || usableHeight <= 0) return;

    const rootStyle = document.documentElement.style;
    if (!standaloneMode) rootStyle.setProperty('--upds-viewport-height', `${usableHeight}px`);
    rootStyle.setProperty('--upds-vn-dialogue-row', `${clamp(usableHeight * 0.22, 154, 198)}px`);
    rootStyle.setProperty('--upds-vn-controls-min-height', `${clamp(usableHeight * 0.09, 60, 82)}px`);
    rootStyle.setProperty('--upds-vn-status-offset', `${Math.max(72, usableHeight * 0.10)}px`);
    viewportDebugEvent('viewport:tokens-written', { usableHeight }, true);
  };

  const syncAfterOrientationChange = (): void => {
    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(() => {
        stableLayoutWidth = Math.round(globalThis.innerWidth);
        syncStableLayoutMetrics();
      });
    });
  };

  const syncAfterRealWidthChange = (): void => {
    const nextWidth = Math.round(globalThis.innerWidth);
    if (Math.abs(nextWidth - stableLayoutWidth) < 2) return;
    stableLayoutWidth = nextWidth;
    globalThis.requestAnimationFrame(syncStableLayoutMetrics);
  };

  syncStableLayoutMetrics();
  globalThis.addEventListener('resize', syncAfterRealWidthChange, { passive: true });
  globalThis.addEventListener('orientationchange', syncAfterOrientationChange, { passive: true });

  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Missing #app');
  const services = createRuntimeServices();
  viewportDebugServices(services);
  viewportDebugEvent('bootstrap:before-services-ready');
  await services.ready;
  viewportDebugEvent('bootstrap:after-services-ready');

  const initialPwa = services.pwa.snapshot();
  document.documentElement.dataset.updsDisplayMode = standaloneMode ? 'standalone' : initialPwa.displayMode;
  services.telemetry.startSession({
    path: pathname || 'unknown',
    online: globalThis.navigator?.onLine ?? true,
    installed: initialPwa.installed,
    displayMode: initialPwa.displayMode,
    lane: initialPwa.lane,
  });
  services.audio.arm();
  installGlobalErrorHandlers(services.errorLog);
  installImageFallbackHandler(services.errorLog, services.assetHealth);
  viewportDebugEvent('bootstrap:before-pwa-start');
  void services.pwa.start(runtimeAssetCatalog);

  // Mount standalone only after font metrics are final. Geometry tokens above
  // were already frozen before any async service or service-worker work began.
  if (standaloneMode && typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  viewportDebugEvent('bootstrap:before-mount');
  new AnimeDetectiveApp(root, services).mount();
  viewportDebugEvent('bootstrap:after-mount');
};

void bootstrap();
