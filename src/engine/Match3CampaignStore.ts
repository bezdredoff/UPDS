import type { KeyValueStorage } from '../contracts/KeyValueStorage';
import { decodeMatch3CampaignSave, encodeMatch3CampaignSave, freshMatch3CampaignSave } from './Match3CampaignSaveFormat';
import type { Match3CampaignSave } from './Match3CampaignSaveFormat';
import { MATCH3_CAMPAIGN_SAVE_KEY } from './Match3CampaignSaveFormat';

export {
  freshMatch3CampaignSave,
  MATCH3_CAMPAIGN_SAVE_KEY,
  MATCH3_CAMPAIGN_SCHEMA_VERSION,
  normalizeMatch3CampaignSave,
} from './Match3CampaignSaveFormat';
export type { Match3CampaignSave, PersistedMatch3CampaignSave } from './Match3CampaignSaveFormat';

export class Match3CampaignStore {
  constructor(private readonly storage: KeyValueStorage, private readonly key = MATCH3_CAMPAIGN_SAVE_KEY) {}

  load(): Match3CampaignSave {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return freshMatch3CampaignSave();
      const decoded = decodeMatch3CampaignSave(JSON.parse(raw) as unknown);
      return decoded ?? freshMatch3CampaignSave();
    } catch { return freshMatch3CampaignSave(); }
  }

  save(state: Match3CampaignSave): boolean {
    try {
      this.storage.setItem(this.key, JSON.stringify(encodeMatch3CampaignSave(state)));
      return true;
    } catch { return false; }
  }

  reset(): Match3CampaignSave {
    const state = freshMatch3CampaignSave();
    try { this.storage.removeItem(this.key); } catch { /* best effort */ }
    return state;
  }
}
