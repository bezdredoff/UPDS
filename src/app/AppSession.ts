import { freshSave, type CampaignSave } from '../engine/CampaignStore';
import type { RuntimeServices } from '../platform/RuntimeServices';

/** Shared mutable campaign state. Feature controllers never access storage directly. */
export class AppSession {
  save: CampaignSave = freshSave();

  constructor(private readonly services: RuntimeServices) {}

  reload(): CampaignSave {
    this.save = this.services.store.load();
    return this.save;
  }

  reset(): CampaignSave {
    this.save = freshSave();
    this.persist();
    return this.save;
  }

  clearProgress(): CampaignSave {
    this.save = this.services.store.reset();
    return this.save;
  }

  persist(): void {
    if (!this.services.store.save(this.save)) {
      this.services.errorLog.record('application', 'Campaign save failed; runtime progress continues in memory.');
    }
  }
}
