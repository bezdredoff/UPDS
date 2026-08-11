export type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export type StorageMode = 'persistent' | 'memory';

export type SafeStorageHandle = Readonly<{
  storage: StorageLike;
  mode: StorageMode;
}>;

class MemoryStorage implements StorageLike {
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

export const getSafeStorage = (provider: () => StorageLike = () => globalThis.localStorage): SafeStorageHandle => {
  try {
    const storage = provider();
    storage.setItem(PROBE_KEY, '1');
    storage.removeItem(PROBE_KEY);
    return { storage, mode: 'persistent' };
  } catch {
    return { storage: memoryFallback, mode: 'memory' };
  }
};
