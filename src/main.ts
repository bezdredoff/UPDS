import './style.css';
import './buildIdentity.css';
import './viewport.css';
import './vnViewportStability.css';
import './match3Production.css';
import './match3Help.css';
import './match3StoryObjectGuidance.css';
import './match3SpecialImpact.css';
import './match3BlockerReadability.css';
import { BUILD_ID } from './appVersion';
import { AnimeDetectiveApp } from './ui/AnimeDetectiveApp';
import { installImageFallbackHandler } from './platform/AssetHealth';
import { installGlobalErrorHandlers } from './platform/ErrorLog';
import { createRuntimeServices } from './platform/RuntimeServices';
import { runtimeAssetCatalog } from './platform/RuntimeAssets';

const bootstrap = async (): Promise<void> => {
  const pathname = globalThis.location?.pathname ?? '';
  if (/\/preview(?:\/|$)/.test(pathname)) {
    document.documentElement.dataset.updsLane = 'preview';
    document.documentElement.dataset.updsBuild = BUILD_ID;
  }

  // Resolve standalone mode synchronously before async locale/storage/PWA work.
  // Connectivity, service-worker state and cache warmup must never change the
  // player geometry after the installed app has painted.
  const navigatorStandalone = (globalThis.navigator as Navigator & { standalone?: boolean } | undefined)?.standalone === true;
  const mediaStandalone = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(display-mode: standalone)').matches;
  const standaloneMode = navigatorStandalone || mediaStandalone;
  document.documentElement.dataset.updsDisplayMode = standaloneMode ? 'standalone' : 'browser';

  const syncViewportHeight = (): void => {
    // Installed iOS PWAs need a stable layout viewport. visualViewport can emit
    // transient resize values during zoom/compositor/service-worker transitions,
    // which previously shrank the entire game and exposed a bottom strip.
    const viewportHeight = standaloneMode
      ? globalThis.innerHeight
      : (globalThis.visualViewport?.height ?? globalThis.innerHeight);
    if (Number.isFinite(viewportHeight) && viewportHeight > 0) {
      document.documentElement.style.setProperty('--upds-viewport-height', `${viewportHeight}px`);
    }
  };

  const syncAfterOrientationChange = (): void => {
    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(syncViewportHeight);
    });
  };

  syncViewportHeight();
  if (standaloneMode) {
    // Keep portrait gameplay stable online and offline. Only a real orientation
    // change is allowed to recalculate the installed-app viewport height.
    globalThis.addEventListener('orientationchange', syncAfterOrientationChange);
  } else {
    // Browser tabs still follow dynamic browser chrome / keyboard geometry.
    globalThis.visualViewport?.addEventListener('resize', syncViewportHeight);
    globalThis.addEventListener('resize', syncViewportHeight);
    globalThis.addEventListener('orientationchange', syncAfterOrientationChange);
  }

  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Missing #app');
  const services = createRuntimeServices();
  await services.ready;

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
  void services.pwa.start(runtimeAssetCatalog);
  new AnimeDetectiveApp(root, services).mount();
};

void bootstrap();
