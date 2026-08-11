import './style.css';
import { AnimeDetectiveApp } from './ui/AnimeDetectiveApp';
import { installImageFallbackHandler } from './platform/AssetHealth';
import { scheduleImagePreload } from './platform/AssetPreloader';
import { installGlobalErrorHandlers } from './platform/ErrorLog';
import { createRuntimeServices } from './platform/RuntimeServices';
import { runtimeAssetCatalog } from './platform/RuntimeAssets';

const root = document.querySelector<HTMLElement>('#app');
if (!root) throw new Error('Missing #app');
const services = createRuntimeServices();
services.audio.arm();
installGlobalErrorHandlers(services.errorLog);
installImageFallbackHandler(services.errorLog, services.assetHealth);
scheduleImagePreload(runtimeAssetCatalog, services.assetHealth);
new AnimeDetectiveApp(root, services).mount();
