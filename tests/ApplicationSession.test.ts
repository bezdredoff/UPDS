import { describe, expect, it } from 'vitest';
import { AppSession } from '../src/app/AppSession';
import { Match3CampaignSession } from '../src/app/Match3CampaignSession';
import { levels } from '../src/data/levels';
import { CampaignStore } from '../src/engine/CampaignStore';
import { Match3CampaignStore } from '../src/engine/Match3CampaignStore';
import type { KeyValueStorage } from '../src/contracts/KeyValueStorage';

class MemoryStorage implements KeyValueStorage {
  private readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

const failingStorage: KeyValueStorage = {
  getItem: () => null,
  setItem: () => { throw new Error('storage unavailable'); },
  removeItem: () => undefined,
};

describe('application campaign sessions', () => {
  it('persists story state through its store and reports save failures through the injected callback', () => {
    const storage = new MemoryStorage();
    const store = new CampaignStore(storage);
    const errors: string[] = [];
    const session = new AppSession(store, (message) => errors.push(message));
    session.save.scene = 3;
    session.persist();
    expect(store.load().scene).toBe(3);
    expect(errors).toEqual([]);

    const failedSession = new AppSession(new CampaignStore(failingStorage), (message) => errors.push(message));
    failedSession.persist();
    expect(errors).toEqual(['Campaign save failed; runtime progress continues in memory.']);
  });

  it('persists Match-3 campaign state through its store and reports save failures through the injected callback', () => {
    const storage = new MemoryStorage();
    const store = new Match3CampaignStore(storage);
    const errors: string[] = [];
    const session = new Match3CampaignSession(store, (message) => errors.push(message));
    session.save.completed.push(levels[0].id);
    session.persist();
    expect(store.load().completed).toEqual([levels[0].id]);
    expect(errors).toEqual([]);

    const failedSession = new Match3CampaignSession(new Match3CampaignStore(failingStorage), (message) => errors.push(message));
    failedSession.persist();
    expect(errors).toEqual(['Match-3 campaign save failed; runtime progress continues in memory.']);
  });
});
