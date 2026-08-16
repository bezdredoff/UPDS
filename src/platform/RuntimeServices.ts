import { AudioManager } from '../audio/AudioManager';
import { CampaignStore } from '../engine/CampaignStore';
import { Match3CampaignStore } from '../engine/Match3CampaignStore';
import { DEFAULT_LOCALE } from '../localization/Locale';
import { LocalizationService } from '../localization/LocalizationService';
import { LocaleSettingsStore } from '../localization/LocaleSettingsStore';
import { initialAppCatalogs, loadRuntimeLocaleCatalog } from '../localization/catalogs';
import { AssetHealth } from './AssetHealth';
import { ErrorLog } from './ErrorLog';
import { PlaytestTelemetry } from './PlaytestTelemetry';
import { PwaController } from './PwaController';
import { getSafeStorage, type SafeStorageHandle } from './SafeStorage';

export type RuntimeServices = Readonly<{
  storage: SafeStorageHandle;
  store: CampaignStore;
  match3CampaignStore: Match3CampaignStore;
  errorLog: ErrorLog;
  assetHealth: AssetHealth;
  audio: AudioManager;
  telemetry: PlaytestTelemetry;
  pwa: PwaController;
  localization: LocalizationService;
  localeSettings: LocaleSettingsStore;
  ready: Promise<void>;
}>;

export const createRuntimeServices = (): RuntimeServices => {
  const storage = getSafeStorage(() => window.localStorage);
  const errorLog = new ErrorLog(storage.storage);
  const telemetry = new PlaytestTelemetry(storage.storage);
  const pwa = new PwaController(errorLog, telemetry);
  const localeSettings = new LocaleSettingsStore(storage.storage);
  const localization = new LocalizationService(
    initialAppCatalogs,
    DEFAULT_LOCALE,
    DEFAULT_LOCALE,
    loadRuntimeLocaleCatalog,
  );
  localization.subscribe((locale) => localeSettings.save(locale));

  const requestedLocale = localeSettings.load();
  const ready = localization.activateLocale(requestedLocale).catch((error) => {
    errorLog.record('application', `Locale load failed for ${requestedLocale}: ${String(error)}`);
    if (localization.locale !== DEFAULT_LOCALE) localization.setLocale(DEFAULT_LOCALE);
  }).then(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = localization.locale;
  });

  return {
    storage,
    store: new CampaignStore(storage.storage),
    match3CampaignStore: new Match3CampaignStore(storage.storage),
    errorLog,
    assetHealth: new AssetHealth(),
    audio: new AudioManager(storage.storage, errorLog),
    telemetry,
    pwa,
    localization,
    localeSettings,
    ready,
  };
};
