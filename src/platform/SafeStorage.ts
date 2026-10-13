import type { KeyValueStorage } from '../contracts/KeyValueStorage';

export type StorageMode = 'persistent' | 'memory';

export type SafeStorageHandle = Readonly<{
  storage: KeyValueStorage;
  mode: StorageMode;
}>;

class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

const memoryFallback = new MemoryStorage();
const PROBE_KEY = '__upds_storage_probe__';

export const getSafeStorage = (provider: () => KeyValueStorage = () => globalThis.localStorage): SafeStorageHandle => {
  try {
    const storage = provider();
    storage.setItem(PROBE_KEY, '1');
    storage.removeItem(PROBE_KEY);
    return { storage, mode: 'persistent' };
  } catch {
    return { storage: memoryFallback, mode: 'memory' };
  }
};
