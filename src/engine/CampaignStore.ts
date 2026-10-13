import type { KeyValueStorage } from '../contracts/KeyValueStorage';
import { createSaveExportBundle, decodeCampaignSave, decodeSaveImportText, freshSave, persistedSave } from './CampaignSaveFormat';
import type { CampaignSave, SaveExportBundle, SaveImportResult } from './CampaignSaveFormat';
import { ANM009_SAVE_KEY, MANUAL_SAVE_KEY, SAVE_RECOVERY_KEY } from './CampaignSaveFormat';
export { ANM009_SAVE_KEY, freshSave, MANUAL_SAVE_KEY, normalizeSave, SAVE_RECOVERY_KEY, SAVE_SCHEMA_VERSION } from './CampaignSaveFormat';
export type { CampaignSave, PersistedSaveMetadata, SaveExportBundle, SaveImportResult } from './CampaignSaveFormat';
export type SaveLoadReport = Readonly<{ status: 'fresh' | 'loaded' | 'recovered-corrupt'; detail: string }>;

export class CampaignStore {
  private lastLoadReport: SaveLoadReport = { status: 'fresh', detail: 'not-loaded' };
  constructor(private readonly storage: KeyValueStorage, private readonly key = ANM009_SAVE_KEY) {}

  load(): CampaignSave {
    let raw: string | null;
    try { raw = this.storage.getItem(this.key); }
    catch { this.lastLoadReport = { status: 'fresh', detail: 'storage-read-failed' }; return freshSave(); }
    if (!raw) { this.lastLoadReport = { status: 'fresh', detail: 'no-save' }; return freshSave(); }
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        this.backupRecovery(raw, 'save-root-not-object');
        this.lastLoadReport = { status: 'recovered-corrupt', detail: 'save-root-not-object' };
        const recovered = freshSave();
        this.save(recovered);
        return recovered;
      }
      const decoded = decodeCampaignSave(parsed);
      if (!decoded) {
        this.backupRecovery(raw, 'unsupported-schema');
        this.lastLoadReport = { status: 'recovered-corrupt', detail: 'unsupported-schema' };
        return freshSave();
      }
      this.lastLoadReport = { status: 'loaded', detail: decoded.schemaVersion === 0 ? 'legacy-save' : `schema-${decoded.schemaVersion}` };
      return decoded.state;
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
      const decoded = decodeCampaignSave(parsed);
      return decoded?.state ?? null;
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
    return createSaveExportBundle(state);
  }

  importFromText(text: string): SaveImportResult {
    const candidate = decodeSaveImportText(text);
    if (!candidate.ok) return candidate;
    try {
      const current = this.storage.getItem(this.key);
      if (current) this.backupRecovery(current, 'before-import');
      if (!this.save(candidate.state)) return { ok: false, error: 'Хранилище браузера недоступно для записи.' };
      this.lastLoadReport = { status: 'loaded', detail: `imported-schema-${candidate.schemaVersion}` };
      return { ok: true, state: candidate.state, schemaVersion: candidate.schemaVersion };
    } catch { return { ok: false, error: 'Не удалось импортировать сохранение.' }; }
  }

  private backupRecovery(raw: string, reason: string): void {
    try {
      this.storage.setItem(SAVE_RECOVERY_KEY, JSON.stringify({ capturedAt: new Date().toISOString(), reason, saveKey: this.key, raw }));
    } catch { /* recovery is best-effort */ }
  }
}

