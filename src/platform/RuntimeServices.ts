import { CampaignStore } from '../engine/CampaignStore';
import { AssetHealth } from './AssetHealth';
import { ErrorLog } from './ErrorLog';
import { getSafeStorage, type SafeStorageHandle } from './SafeStorage';

export type RuntimeServices = Readonly<{
  storage: SafeStorageHandle;
  store: CampaignStore;
  errorLog: ErrorLog;
  assetHealth: AssetHealth;
}>;

export const createRuntimeServices = (): RuntimeServices => {
  const storage = getSafeStorage(() => window.localStorage);
  return { storage, store: new CampaignStore(storage.storage), errorLog: new ErrorLog(storage.storage), assetHealth: new AssetHealth() };
};
