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
import { resolveRuntimeLane } from './platform/PlatformIdentity';
import { createRuntimeServices } from './platform/RuntimeServices';
import { runtimeAssetCatalog } from './platform/RuntimeAssets';
import { startViewportDebug, viewportDebugEvent, viewportDebugServices } from './platform/ViewportDebug';
import { installViewportRuntime } from './platform/ViewportRuntime';

const bootstrap = async (): Promise<void> => {
  startViewportDebug();
  const viewportRuntime = installViewportRuntime();
  const pathname = globalThis.location?.pathname ?? '';
  const lane = resolveRuntimeLane(pathname, globalThis.location?.protocol ?? '');
  if (lane === 'preview') {
    document.documentElement.dataset.updsLane = lane;
    document.documentElement.dataset.updsBuild = BUILD_ID;
  }

  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Missing #app');
  const services = createRuntimeServices();
  viewportDebugServices(services);
  viewportDebugEvent('bootstrap:before-services-ready');
  await services.ready;
  viewportDebugEvent('bootstrap:after-services-ready');

  const initialPwa = services.pwa.snapshot();
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

  // Mount standalone only after font metrics are final. ViewportRuntime already
  // froze physical/game geometry before any async service or service-worker work.
  if (viewportRuntime.displayMode === 'standalone' && typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready;
  }

  viewportDebugEvent('bootstrap:before-mount');
  new AnimeDetectiveApp(root, services).mount();
  viewportDebugEvent('bootstrap:after-mount');
};

void bootstrap();
