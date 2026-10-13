import { APP_VERSION } from '../appVersion';
import type { ChoiceId } from '../data/narrative';
import { levels, type ClueId } from '../data/levels';
import { storySceneIds } from '../data/storyGraph';
import { storyChoiceGateIds, type StoryChoiceGateId, type StoryChoiceSelections } from '../data/storyChoices';
import { match3TutorialConceptIds, type Match3TutorialConceptId } from '../data/match3Tutorials';

export type CampaignSave = {
  scene: number;
  line: number;
  choice: ChoiceId;
  clues: ClueId[];
  completed: number[];
  attempts: Record<string, number>;
  readLines: string[];
  tutorialsCompleted: Match3TutorialConceptId[];
  storyChoices: StoryChoiceSelections;
};

export type PersistedSaveMetadata = Readonly<{ schemaVersion: number; savedAt: string; appVersion: string }>;
export type SaveExportBundle = Readonly<{
  format: 'upds-campaign-save';
  exportVersion: 1;
  saveKey: string;
  schemaVersion: number;
  appVersion: string;
  exportedAt: string;
  state: CampaignSave;
}>;
export type SaveImportResult = Readonly<{ ok: true; state: CampaignSave; schemaVersion: number }> | Readonly<{ ok: false; error: string }>;

export const ANM009_SAVE_KEY = 'seiran-detectives-anm009-v1';
export const SAVE_SCHEMA_VERSION = 2;
export const SAVE_RECOVERY_KEY = `${ANM009_SAVE_KEY}:recovery-v1`;
export const MANUAL_SAVE_KEY = `${ANM009_SAVE_KEY}:manual-v1`;

export const freshSave = (): CampaignSave => ({ scene: 0, line: 0, choice: 'A', clues: [], completed: [], attempts: {}, readLines: [], tutorialsCompleted: [], storyChoices: {} });

const isChoice = (value: unknown): value is ChoiceId => value === 'A' || value === 'B' || value === 'C';
const clueIds: readonly ClueId[] = levels.map((level) => level.clueId);
const isRecord = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const campaignFields = ['scene', 'line', 'choice', 'clues', 'completed', 'attempts', 'readLines', 'tutorialsCompleted', 'storyChoices'] as const;
const looksLikeCampaignSave = (value: Record<string, unknown>): boolean => campaignFields.some((field) => field in value);

export function normalizeSave(value: unknown): CampaignSave {
  if (!isRecord(value)) return freshSave();
  const candidate = value as Partial<CampaignSave>;
  const scene = Number(candidate.scene);
  const line = Number(candidate.line);
  const attempts = candidate.attempts && typeof candidate.attempts === 'object' && !Array.isArray(candidate.attempts)
    ? Object.fromEntries(Object.entries(candidate.attempts).map(([key, count]) => [key, Math.max(0, Math.floor(Number(count) || 0))]))
    : {};

  const storyChoices: StoryChoiceSelections = isRecord(candidate.storyChoices)
    ? Object.fromEntries(Object.entries(candidate.storyChoices).filter(([gate, option]) =>
        storyChoiceGateIds.includes(gate as StoryChoiceGateId) && (option === 'A' || option === 'B' || option === 'C'))) as StoryChoiceSelections
    : {};

  return {
    scene: Number.isInteger(scene) ? Math.max(0, Math.min(storySceneIds.length - 1, scene)) : 0,
    line: Number.isInteger(line) ? Math.max(0, line) : 0,
    choice: isChoice(candidate.choice) ? candidate.choice : 'A',
    clues: Array.isArray(candidate.clues) ? [...new Set(candidate.clues.filter((clue): clue is ClueId => clueIds.includes(clue as ClueId)))] : [],
    completed: Array.isArray(candidate.completed) ? [...new Set(candidate.completed.map(Number).filter((index) => Number.isInteger(index) && index >= 0 && index < levels.length))] : [],
    attempts,
    readLines: Array.isArray(candidate.readLines) ? [...new Set(candidate.readLines.filter((lineId): lineId is string => typeof lineId === 'string' && /^VN\d{4}[ABC]?$/.test(lineId)))] : [],
    tutorialsCompleted: Array.isArray(candidate.tutorialsCompleted)
      ? [...new Set(candidate.tutorialsCompleted.filter((concept): concept is Match3TutorialConceptId => match3TutorialConceptIds.includes(concept as Match3TutorialConceptId)))]
      : [],
    storyChoices,
  };
}

export const persistedSave = (state: CampaignSave, savedAt = new Date().toISOString()): CampaignSave & PersistedSaveMetadata => ({
  ...normalizeSave(state), schemaVersion: SAVE_SCHEMA_VERSION, savedAt, appVersion: APP_VERSION,
});

export const decodeCampaignSave = (value: unknown): { state: CampaignSave; schemaVersion: number } | null => {
  if (!isRecord(value)) return null;
  if (value.format === 'upds-campaign-save') {
    if (value.saveKey !== ANM009_SAVE_KEY) return null;
    const schemaVersion = Number(value.schemaVersion);
    if (!Number.isInteger(schemaVersion) || schemaVersion < 0 || schemaVersion > SAVE_SCHEMA_VERSION || !isRecord(value.state)) return null;
    return { state: normalizeSave(value.state), schemaVersion };
  }
  if (value.saveKey !== undefined && value.saveKey !== ANM009_SAVE_KEY) return null;
  if (!looksLikeCampaignSave(value)) return null;
  const schemaVersion = value.schemaVersion === undefined ? 0 : Number(value.schemaVersion);
  if (!Number.isInteger(schemaVersion) || schemaVersion < 0 || schemaVersion > SAVE_SCHEMA_VERSION) return null;
  return { state: normalizeSave(value), schemaVersion };
};

export const createSaveExportBundle = (state: CampaignSave, exportedAt = new Date().toISOString()): SaveExportBundle => ({
  format: 'upds-campaign-save', exportVersion: 1, saveKey: ANM009_SAVE_KEY, schemaVersion: SAVE_SCHEMA_VERSION,
  appVersion: APP_VERSION, exportedAt, state: normalizeSave(state),
});

export const decodeSaveImportText = (text: string): SaveImportResult => {
  let parsed: unknown;
  try { parsed = JSON.parse(text); }
  catch { return { ok: false, error: 'Файл не содержит корректный JSON.' }; }
  const candidate = decodeCampaignSave(parsed);
  if (!candidate) return { ok: false, error: 'Это не совместимое сохранение UPDS или его schema слишком новая.' };
  return { ok: true, state: candidate.state, schemaVersion: candidate.schemaVersion };
};
