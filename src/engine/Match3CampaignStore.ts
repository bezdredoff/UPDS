import { levels } from '../data/levels';
import { match3TutorialConceptIds, type Match3TutorialConceptId } from '../data/match3Tutorials';
import type { StorageLike } from '../platform/SafeStorage';

export type Match3CampaignSave = {
  completed: string[];
  attempts: Record<string, number>;
  bestMovesLeft: Record<string, number>;
  tutorialsCompleted: Match3TutorialConceptId[];
};

export const MATCH3_CAMPAIGN_SAVE_KEY = 'seiran-detectives-match3-campaign-v1';
export const MATCH3_CAMPAIGN_SCHEMA_VERSION = 1;

const levelIds = levels.map((level) => level.id);
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export const freshMatch3CampaignSave = (): Match3CampaignSave => ({
  completed: [], attempts: {}, bestMovesLeft: {}, tutorialsCompleted: [],
});

export function normalizeMatch3CampaignSave(value: unknown): Match3CampaignSave {
  if (!isRecord(value)) return freshMatch3CampaignSave();
  const completed = Array.isArray(value.completed)
    ? [...new Set(value.completed.filter((id): id is string => typeof id === 'string' && levelIds.includes(id)))]
    : [];
  const attempts = isRecord(value.attempts)
    ? Object.fromEntries(Object.entries(value.attempts)
      .filter(([id]) => levelIds.includes(id))
      .map(([id, raw]) => [id, Math.max(0, Math.floor(Number(raw) || 0))]))
    : {};
  const bestMovesLeft = isRecord(value.bestMovesLeft)
    ? Object.fromEntries(Object.entries(value.bestMovesLeft)
      .filter(([id]) => levelIds.includes(id))
      .map(([id, raw]) => [id, Math.max(0, Math.floor(Number(raw) || 0))]))
    : {};
  const tutorialsCompleted = Array.isArray(value.tutorialsCompleted)
    ? [...new Set(value.tutorialsCompleted.filter((concept): concept is Match3TutorialConceptId => match3TutorialConceptIds.includes(concept as Match3TutorialConceptId)))]
    : [];
  return { completed, attempts, bestMovesLeft, tutorialsCompleted };
}

export class Match3CampaignStore {
  constructor(private readonly storage: StorageLike, private readonly key = MATCH3_CAMPAIGN_SAVE_KEY) {}

  load(): Match3CampaignSave {
    try {
      const raw = this.storage.getItem(this.key);
      if (!raw) return freshMatch3CampaignSave();
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return freshMatch3CampaignSave();
      const schemaVersion = parsed.schemaVersion === undefined ? 0 : Number(parsed.schemaVersion);
      if (!Number.isInteger(schemaVersion) || schemaVersion < 0 || schemaVersion > MATCH3_CAMPAIGN_SCHEMA_VERSION) return freshMatch3CampaignSave();
      return normalizeMatch3CampaignSave(parsed);
    } catch { return freshMatch3CampaignSave(); }
  }

  save(state: Match3CampaignSave): boolean {
    try {
      this.storage.setItem(this.key, JSON.stringify({
        ...normalizeMatch3CampaignSave(state),
        schemaVersion: MATCH3_CAMPAIGN_SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
      }));
      return true;
    } catch { return false; }
  }

  reset(): Match3CampaignSave {
    const state = freshMatch3CampaignSave();
    try { this.storage.removeItem(this.key); } catch { /* best effort */ }
    return state;
  }
}
