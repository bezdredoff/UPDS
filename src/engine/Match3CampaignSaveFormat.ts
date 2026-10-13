import { levels } from '../data/levels';
import { match3TutorialConceptIds, type Match3TutorialConceptId } from '../data/match3Tutorials';

export type Match3CampaignSave = {
  completed: string[];
  attempts: Record<string, number>;
  bestMovesLeft: Record<string, number>;
  tutorialsCompleted: Match3TutorialConceptId[];
};

export type PersistedMatch3CampaignSave = Match3CampaignSave & Readonly<{ schemaVersion: number; savedAt: string }>;

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

export function decodeMatch3CampaignSave(value: unknown): Match3CampaignSave | null {
  if (!isRecord(value)) return null;
  const schemaVersion = value.schemaVersion === undefined ? 0 : Number(value.schemaVersion);
  if (!Number.isInteger(schemaVersion) || schemaVersion < 0 || schemaVersion > MATCH3_CAMPAIGN_SCHEMA_VERSION) return null;
  return normalizeMatch3CampaignSave(value);
}

export function encodeMatch3CampaignSave(state: Match3CampaignSave, savedAt = new Date().toISOString()): PersistedMatch3CampaignSave {
  return {
    ...normalizeMatch3CampaignSave(state),
    schemaVersion: MATCH3_CAMPAIGN_SCHEMA_VERSION,
    savedAt,
  };
}
