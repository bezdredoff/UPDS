import { APP_VERSION } from '../appVersion';
import type { ChoiceId } from '../data/narrative';
import { levels, type ClueId } from '../data/levels';
import { storySceneIds } from '../data/storyGraph';
import { storyChoiceGateIds, type StoryChoiceGateId, type StoryChoiceSelections } from '../data/storyChoices';
import { match3TutorialConceptIds, type Match3TutorialConceptId } from '../data/match3Tutorials';
import type { StorageLike } from '../platform/SafeStorage';

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
export type SaveLoadReport = Readonly<{ status: 'fresh' | 'loaded' | 'recovered-corrupt'; detail: string }>;
export type SaveImportResult = Readonly<{ ok: true; state: CampaignSave }> | Readonly<{ ok: false; error: string }>;

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

const persistedSave = (state: CampaignSave): CampaignSave & PersistedSaveMetadata => ({
  ...normalizeSave(state), schemaVersion: SAVE_SCHEMA_VERSION, savedAt: new Date().toISOString(), appVersion: APP_VERSION,
});

const importStateFromUnknown = (value: unknown): { state: CampaignSave; schemaVersion: number } | null => {
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

export class CampaignStore {
  private lastLoadReport: SaveLoadReport = { status: 'fresh', detail: 'not-loaded' };
  constructor(private readonly storage: StorageLike, private readonly key = ANM009_SAVE_KEY) {}

  load(): CampaignSave {
    let raw: string | null;
    try { raw = this.storage.getItem(this.key); }
    catch { this.lastLoadReport = { status: 'fresh', detail: 'storage-read-failed' }; return freshSave(); }
    if (!raw) { this.lastLoadReport = { status: 'fresh', detail: 'no-save' }; return freshSave(); }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) {
        this.backupRecovery(raw, 'save-root-not-object');
        this.lastLoadReport = { status: 'recovered-corrupt', detail: 'save-root-not-object' };
        const recovered = freshSave();
        this.save(recovered);
        return recovered;
      }
      const schemaVersion = parsed.schemaVersion === undefined ? 0 : Number(parsed.schemaVersion);
      if (!Number.isInteger(schemaVersion) || schemaVersion < 0 || schemaVersion > SAVE_SCHEMA_VERSION) {
        this.backupRecovery(raw, 'unsupported-schema');
        this.lastLoadReport = { status: 'recovered-corrupt', detail: 'unsupported-schema' };
        return freshSave();
      }
      const normalized = normalizeSave(parsed);
      this.lastLoadReport = { status: 'loaded', detail: schemaVersion === 0 ? 'legacy-save' : `schema-${schemaVersion}` };
      return normalized;
    } catch {
      this.backupRecovery(raw, 'invalid-json');
      this.lastLoadReport = { status: 'recovered-corrupt', detail: 'invalid-json' };
      const recovered = freshSave();
      this.save(recovered);
      return recovered;
    }
  }

  save(state: CampaignSave): boolean {
    try { this.storage.setItem(this.key, JSON.stringify(persistedSave(state))); return true; }
    catch { return false; }
  }


  saveManual(state: CampaignSave): boolean {
    try { this.storage.setItem(MANUAL_SAVE_KEY, JSON.stringify(persistedSave(state))); return true; }
    catch { return false; }
  }

  loadManual(): CampaignSave | null {
    try {
      const raw = this.storage.getItem(MANUAL_SAVE_KEY);
      if (!raw) return null;
      const parsed: unknown = JSON.parse(raw);
      if (!isRecord(parsed)) return null;
      const schemaVersion = parsed.schemaVersion === undefined ? 0 : Number(parsed.schemaVersion);
      if (!Number.isInteger(schemaVersion) || schemaVersion < 0 || schemaVersion > SAVE_SCHEMA_VERSION) return null;
      return normalizeSave(parsed);
    } catch { return null; }
  }

  reset(): CampaignSave {
    const state = freshSave();
    try { this.storage.removeItem(this.key); } catch { /* SafeStorage normally prevents this */ }
    return state;
  }

  getLastLoadReport(): SaveLoadReport { return this.lastLoadReport; }

  getRecoveryBackup(): unknown | null {
    try { const raw = this.storage.getItem(SAVE_RECOVERY_KEY); return raw ? JSON.parse(raw) : null; }
    catch { return null; }
  }

  createExportBundle(state: CampaignSave): SaveExportBundle {
    return {
      format: 'upds-campaign-save', exportVersion: 1, saveKey: ANM009_SAVE_KEY, schemaVersion: SAVE_SCHEMA_VERSION,
      appVersion: APP_VERSION, exportedAt: new Date().toISOString(), state: normalizeSave(state),
    };
  }

  importFromText(text: string): SaveImportResult {
    let parsed: unknown;
    try { parsed = JSON.parse(text); }
    catch { return { ok: false, error: 'Файл не содержит корректный JSON.' }; }
    const candidate = importStateFromUnknown(parsed);
    if (!candidate) return { ok: false, error: 'Это не совместимое сохранение UPDS или его schema слишком новая.' };
    try {
      const current = this.storage.getItem(this.key);
      if (current) this.backupRecovery(current, 'before-import');
      if (!this.save(candidate.state)) return { ok: false, error: 'Хранилище браузера недоступно для записи.' };
      this.lastLoadReport = { status: 'loaded', detail: `imported-schema-${candidate.schemaVersion}` };
      return { ok: true, state: candidate.state };
    } catch { return { ok: false, error: 'Не удалось импортировать сохранение.' }; }
  }

  private backupRecovery(raw: string, reason: string): void {
    try {
      this.storage.setItem(SAVE_RECOVERY_KEY, JSON.stringify({ capturedAt: new Date().toISOString(), reason, saveKey: this.key, raw }));
    } catch { /* recovery is best-effort */ }
  }
}

