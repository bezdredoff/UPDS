import { AudioManager } from '../audio/AudioManager';
import { CampaignStore } from '../engine/CampaignStore';
import { AssetHealth } from './AssetHealth';
import { ErrorLog } from './ErrorLog';
import { PlaytestTelemetry } from './PlaytestTelemetry';
import { PwaController } from './PwaController';
import { getSafeStorage, type SafeStorageHandle } from './SafeStorage';

export type RuntimeServices = Readonly<{
  storage: SafeStorageHandle;
  store: CampaignStore;
  errorLog: ErrorLog;
  assetHealth: AssetHealth;
  audio: AudioManager;
  telemetry: PlaytestTelemetry;
  pwa: PwaController;
}>;

export const createRuntimeServices = (): RuntimeServices => {
  const storage = getSafeStorage(() => window.localStorage);
  const errorLog = new ErrorLog(storage.storage);
  const telemetry = new PlaytestTelemetry(storage.storage);
  const pwa = new PwaController(errorLog, telemetry);
  return {
    storage,
    store: new CampaignStore(storage.storage),
    errorLog,
    assetHealth: new AssetHealth(),
    audio: new AudioManager(storage.storage, errorLog),
    telemetry,
    pwa,
  };
};
