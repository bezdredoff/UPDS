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

const bootstrap = async (): Promise<void> => {
  const pathname = globalThis.location?.pathname ?? '';
  if (/\/preview(?:\/|$)/.test(pathname)) {
    document.documentElement.dataset.updsLane = 'preview';
    document.documentElement.dataset.updsBuild = BUILD_ID;
  }

  // Resolve standalone mode before async locale/storage/PWA work. Geometry for
  // installed iOS is intentionally CSS-owned: WebKit can report innerHeight,
  // visualViewport.height and dynamic viewport units without the cover safe-area.
  const navigatorStandalone = (globalThis.navigator as Navigator & { standalone?: boolean } | undefined)?.standalone === true;
  const mediaStandalone = typeof globalThis.matchMedia === 'function' && globalThis.matchMedia('(display-mode: standalone)').matches;
  const standaloneMode = navigatorStandalone || mediaStandalone;
  document.documentElement.dataset.updsDisplayMode = standaloneMode ? 'standalone' : 'browser';

  const syncBrowserViewportHeight = (): void => {
    const viewportHeight = globalThis.visualViewport?.height ?? globalThis.innerHeight;
    if (Number.isFinite(viewportHeight) && viewportHeight > 0) {
      document.documentElement.style.setProperty('--upds-viewport-height', `${viewportHeight}px`);
    }
  };

  const syncBrowserAfterOrientationChange = (): void => {
    globalThis.requestAnimationFrame(() => {
      globalThis.requestAnimationFrame(syncBrowserViewportHeight);
    });
  };

  if (!standaloneMode) {
    // Browser tabs still follow dynamic browser chrome / keyboard geometry.
    // Installed PWAs never write a JS pixel height: their physical shell uses
    // the standalone 100vh contract in viewport.css from the first CSS paint.
    syncBrowserViewportHeight();
    globalThis.visualViewport?.addEventListener('resize', syncBrowserViewportHeight);
    globalThis.addEventListener('resize', syncBrowserViewportHeight);
    globalThis.addEventListener('orientationchange', syncBrowserAfterOrientationChange);
  } else {
    // Installed iOS can emit transient resize events while network/UI/font state
    // settles even though the physical PWA screen did not change. Feature-level
    // resize listeners must not turn those events into a full scene re-render.
    // A real rotation still arrives through orientationchange and remains usable.
    globalThis.addEventListener('resize', (event) => event.stopImmediatePropagation(), { capture: true });
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

  // In standalone, mount once the final web fonts are known. VnController keeps
  // its normal font-ready paging hook, but it can no longer produce a visibly
  // late first-layout rescale because the app was painted with fallback fonts.
  if (standaloneMode && typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  new AnimeDetectiveApp(root, services).mount();
};

void bootstrap();
