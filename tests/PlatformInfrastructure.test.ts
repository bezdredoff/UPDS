import { describe, expect, it } from 'vitest';
import { APP_VERSION } from '../src/appVersion';
import { ANM009_SAVE_KEY, MANUAL_SAVE_KEY, CampaignStore, SAVE_RECOVERY_KEY, SAVE_SCHEMA_VERSION, freshSave, normalizeSave } from '../src/engine/CampaignStore';
import { uniqueAssetList } from '../src/platform/AssetPreloader';
import { ERROR_LOG_MAX_ENTRIES, ErrorLog } from '../src/platform/ErrorLog';
import { runtimeAssetCatalog } from '../src/platform/RuntimeAssets';
import { getSafeStorage, type StorageLike } from '../src/platform/SafeStorage';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('platform infrastructure', () => {
  it('falls back to in-memory storage when the browser storage probe fails', () => {
    const handle = getSafeStorage(() => ({ getItem: () => null, setItem: () => { throw new Error('blocked'); }, removeItem: () => undefined }));
    expect(handle.mode).toBe('memory');
    handle.storage.setItem('x', '1');
    expect(handle.storage.getItem('x')).toBe('1');
  });

  it('persists schema metadata without breaking the ANM-010 flat save shape', () => {
    const storage = new MemoryStorage();
    const store = new CampaignStore(storage);
    const state = { ...freshSave(), scene: 4, line: 7, completed: [0, 1], clues: ['CUE_001', 'CUE_002'] as const };
    expect(store.save({ ...state, clues: [...state.clues] })).toBe(true);
    const persisted = JSON.parse(storage.getItem(ANM009_SAVE_KEY)!);
    expect(persisted.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(persisted.appVersion).toBe(APP_VERSION);
    expect(persisted.state).toBeUndefined();
    expect(normalizeSave(persisted)).toMatchObject({ scene: 4, line: 7, completed: [0, 1] });
  });

  it('keeps an ANM-013 manual VN save slot separate from the stable campaign save key', () => {
    const storage = new MemoryStorage();
    const store = new CampaignStore(storage);
    const manual = { ...freshSave(), scene: 5, line: 9, choice: 'B' as const };
    expect(store.saveManual(manual)).toBe(true);
    expect(storage.getItem(ANM009_SAVE_KEY)).toBeNull();
    expect(storage.getItem(MANUAL_SAVE_KEY)).not.toBeNull();
    expect(store.loadManual()).toMatchObject({ scene: 5, line: 9, choice: 'B' });
  });

  it('backs up invalid JSON and recovers to a fresh playable save', () => {
    const storage = new MemoryStorage();
    storage.setItem(ANM009_SAVE_KEY, '{ definitely broken');
    const store = new CampaignStore(storage);
    expect(store.load()).toEqual(freshSave());
    expect(store.getLastLoadReport()).toEqual({ status: 'recovered-corrupt', detail: 'invalid-json' });
    const recovery = JSON.parse(storage.getItem(SAVE_RECOVERY_KEY)!);
    expect(recovery.reason).toBe('invalid-json');
    expect(recovery.raw).toBe('{ definitely broken');
  });

  it('exports and imports normalized saves while rejecting foreign or future schemas', () => {
    const storage = new MemoryStorage();
    const store = new CampaignStore(storage);
    const state = { ...freshSave(), scene: 6, line: 12, choice: 'C' as const, completed: [0, 1, 2] };
    const bundle = store.createExportBundle(state);
    const result = store.importFromText(JSON.stringify(bundle));
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.state).toMatchObject({ scene: 6, line: 12, choice: 'C', completed: [0, 1, 2] });
    expect(store.importFromText(JSON.stringify({ ...bundle, saveKey: 'raven-manor-save' })).ok).toBe(false);
    expect(store.importFromText(JSON.stringify({ ...bundle, schemaVersion: SAVE_SCHEMA_VERSION + 1 })).ok).toBe(false);
  });

  it('caps persistent runtime errors and tolerates malformed log storage', () => {
    const storage = new MemoryStorage();
    storage.setItem('seiran-detectives-error-log-v1', '{bad');
    const log = new ErrorLog(storage);
    expect(log.getEntries()).toEqual([]);
    for (let index = 0; index < ERROR_LOG_MAX_ENTRIES + 7; index += 1) log.record('application', `e${index}`);
    expect(log.getEntries()).toHaveLength(ERROR_LOG_MAX_ENTRIES);
    expect(log.getEntries()[0].message).toBe('e7');
  });

  it('builds a deduplicated runtime preload catalog from UPDS assets', () => {
    expect(uniqueAssetList(['a', 'a', '', 'b'])).toEqual(['a', 'b']);
    expect(runtimeAssetCatalog.length).toBeGreaterThan(40);
    expect(new Set(runtimeAssetCatalog).size).toBe(runtimeAssetCatalog.length);
    expect(runtimeAssetCatalog).toContain('./assets/backgrounds/BG_CLUBROOM_DAY.webp');
    expect(runtimeAssetCatalog).toContain('./assets/ui/icon_log.svg');
    expect(runtimeAssetCatalog.some((asset) => asset.includes('characters/miku/rig/pose_a/base-neutral.png'))).toBe(true);
  });
});
