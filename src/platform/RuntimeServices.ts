import { AudioManager } from '../audio/AudioManager';
import { CampaignStore } from '../engine/CampaignStore';
import { LocalizationService } from '../localization/LocalizationService';
import { LocaleSettingsStore } from '../localization/LocaleSettingsStore';
import { appCatalogs } from '../localization/catalogs';
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
  localization: LocalizationService;
  localeSettings: LocaleSettingsStore;
}>;

export const createRuntimeServices = (): RuntimeServices => {
  const storage = getSafeStorage(() => window.localStorage);
  const errorLog = new ErrorLog(storage.storage);
  const telemetry = new PlaytestTelemetry(storage.storage);
  const pwa = new PwaController(errorLog, telemetry);
  const localeSettings = new LocaleSettingsStore(storage.storage);
  const localization = new LocalizationService(appCatalogs, localeSettings.load());
  localization.subscribe((locale) => localeSettings.save(locale));
  return {
    storage,
    store: new CampaignStore(storage.storage),
    errorLog,
    assetHealth: new AssetHealth(),
    audio: new AudioManager(storage.storage, errorLog),
    telemetry,
    pwa,
    localization,
    localeSettings,
  };
};
