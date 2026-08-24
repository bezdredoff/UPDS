import './style.css';
import './buildIdentity.css';
import './viewport.css';
import './vnViewportStability.css';
import './match3Production.css';
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

  const root = document.querySelector<HTMLElement>('#app');
  if (!root) throw new Error('Missing #app');
  const services = createRuntimeServices();
  await services.ready;

  const initialPwa = services.pwa.snapshot();
  document.documentElement.dataset.updsDisplayMode = initialPwa.displayMode;
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
