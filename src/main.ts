import './style.css';
import './viewport.css';
import { AnimeDetectiveApp } from './ui/AnimeDetectiveApp';
import { installImageFallbackHandler } from './platform/AssetHealth';
import { scheduleImagePreload } from './platform/AssetPreloader';
import { installGlobalErrorHandlers } from './platform/ErrorLog';
import { createRuntimeServices } from './platform/RuntimeServices';
import { runtimeAssetCatalog } from './platform/RuntimeAssets';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing #app');
const services = createRuntimeServices();
const initialPwa = services.pwa.snapshot();
services.telemetry.startSession({
  path: globalThis.location?.pathname ?? 'unknown',
  online: globalThis.navigator?.onLine ?? true,
  installed: initialPwa.installed,
  displayMode: initialPwa.displayMode,
  lane: initialPwa.lane,
});
services.audio.arm();
installGlobalErrorHandlers(services.errorLog);
installImageFallbackHandler(services.errorLog, services.assetHealth);
scheduleImagePreload(runtimeAssetCatalog, services.assetHealth);
void services.pwa.start(runtimeAssetCatalog);
new AnimeDetectiveApp(root, services).mount();
