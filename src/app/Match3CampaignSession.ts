import { freshMatch3CampaignSave, type Match3CampaignSave, type Match3CampaignStore } from '../engine/Match3CampaignStore';

export class Match3CampaignSession {
  save: Match3CampaignSave = freshMatch3CampaignSave();

  constructor(
    private readonly store: Match3CampaignStore,
    private readonly reportSaveError: (message: string) => void,
  ) {}

  reload(): Match3CampaignSave {
    this.save = this.store.load();
    return this.save;
  }

  persist(): void {
    if (!this.store.save(this.save)) this.reportSaveError('Match-3 campaign save failed; runtime progress continues in memory.');
  }

  reset(): Match3CampaignSave {
    this.save = this.store.reset();
    return this.save;
  }
}
