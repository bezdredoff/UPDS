import { freshSave, type CampaignSave, type CampaignStore } from '../engine/CampaignStore';

/** Shared mutable campaign state. Feature controllers never access storage directly. */
export class AppSession {
  save: CampaignSave = freshSave();

  constructor(
    private readonly store: CampaignStore,
    private readonly reportSaveError: (message: string) => void,
  ) {}

  reload(): CampaignSave {
    this.save = this.store.load();
    return this.save;
  }

  reset(): CampaignSave {
    this.save = freshSave();
    this.persist();
    return this.save;
  }

  clearProgress(): CampaignSave {
    this.save = this.store.reset();
    return this.save;
  }

  persist(): void {
    if (!this.store.save(this.save)) {
      this.reportSaveError('Campaign save failed; runtime progress continues in memory.');
    }
  }
}
