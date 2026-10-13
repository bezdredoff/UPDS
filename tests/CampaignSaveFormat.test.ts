import { describe, expect, it } from 'vitest';
import {
  ANM009_SAVE_KEY,
  createSaveExportBundle,
  decodeCampaignSave,
  decodeSaveImportText,
  freshSave,
  SAVE_SCHEMA_VERSION,
} from '../src/engine/CampaignSaveFormat';

describe('campaign save format', () => {
  it('decodes current and legacy saves without a storage adapter', () => {
    expect(decodeCampaignSave({ scene: 0 })).toEqual({ state: { ...freshSave() }, schemaVersion: 0 });
    expect(decodeCampaignSave({ ...freshSave(), schemaVersion: SAVE_SCHEMA_VERSION })).toEqual({
      state: freshSave(), schemaVersion: SAVE_SCHEMA_VERSION,
    });
  });

  it('round trips an export bundle and rejects incompatible or future formats', () => {
    const bundle = createSaveExportBundle({ ...freshSave(), completed: [1] }, '2026-10-13T10:00:00.000Z');
    expect(bundle.saveKey).toBe(ANM009_SAVE_KEY);
    expect(decodeSaveImportText(JSON.stringify(bundle))).toEqual({
      ok: true, state: { ...freshSave(), completed: [1] }, schemaVersion: SAVE_SCHEMA_VERSION,
    });
    expect(decodeCampaignSave({ ...bundle, saveKey: 'other-game' })).toBeNull();
    expect(decodeCampaignSave({ ...bundle, schemaVersion: SAVE_SCHEMA_VERSION + 1 })).toBeNull();
    expect(decodeSaveImportText('{')).toMatchObject({ ok: false });
  });
});
