import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { ANM009_SAVE_KEY } from '../src/engine/CampaignStore';
import {
  MATCH3_CAMPAIGN_SAVE_KEY,
  Match3CampaignStore,
  freshMatch3CampaignSave,
  normalizeMatch3CampaignSave,
} from '../src/engine/Match3CampaignStore';
import { levels } from '../src/data/levels';
import { AnimeDetectiveApp } from '../src/ui/AnimeDetectiveApp';

class MemoryStorage implements Storage {
  private values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, value); }
}

class FakeRoot {
  innerHTML = '';
  querySelector(): null { return null; }
  querySelectorAll(): [] { return []; }
}

const originalWindow = globalThis.window;

describe('ANM-026C standalone Match-3 campaign', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        localStorage: new MemoryStorage(),
        setTimeout: globalThis.setTimeout.bind(globalThis),
        clearTimeout: globalThis.clearTimeout.bind(globalThis),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'window', { configurable: true, value: originalWindow });
  });

  it('uses a dedicated save key and normalizes only known campaign content', () => {
    expect(MATCH3_CAMPAIGN_SAVE_KEY).not.toBe(ANM009_SAVE_KEY);
    expect(freshMatch3CampaignSave()).toEqual({ completed: [], attempts: {}, bestMovesLeft: {}, tutorialsCompleted: [] });
    expect(normalizeMatch3CampaignSave({
      completed: [levels[0].id, 'bad-level', levels[0].id],
      attempts: { [levels[0].id]: 2.9, bad: 99 },
      bestMovesLeft: { [levels[0].id]: 7.8, bad: 88 },
      tutorialsCompleted: ['basic-swap', 'bad', 'basic-swap'],
    })).toEqual({
      completed: [levels[0].id],
      attempts: { [levels[0].id]: 2 },
      bestMovesLeft: { [levels[0].id]: 7 },
      tutorialsCompleted: ['basic-swap'],
    });
  });

  it('persists campaign progress without touching the story save key', () => {
    const storage = new MemoryStorage();
    const store = new Match3CampaignStore(storage);
    const state = freshMatch3CampaignSave();
    state.completed.push(levels[0].id);
    state.attempts[levels[0].id] = 3;
    state.bestMovesLeft[levels[0].id] = 9;
    state.tutorialsCompleted.push('basic-swap');
    expect(store.save(state)).toBe(true);
    expect(storage.getItem(MATCH3_CAMPAIGN_SAVE_KEY)).toContain(levels[0].id);
    expect(storage.getItem(ANM009_SAVE_KEY)).toBeNull();
    expect(store.load()).toEqual(state);
  });

  it('renders a player-facing hub with sequential unlocks', () => {
    const storage = (globalThis.window as unknown as { localStorage: Storage }).localStorage;
    const root = new FakeRoot();
    const app = new AnimeDetectiveApp(root as unknown as HTMLElement) as AnimeDetectiveApp & { renderMatch3Campaign(): void };
    app.renderMatch3Campaign();
    expect(root.innerHTML).toContain('Доска дел');
    expect(root.innerHTML).toContain('M3_00');
    expect(root.innerHTML).toContain('data-campaign-level="0"');
    expect(root.innerHTML).toContain('data-campaign-level="1"');
    expect(root.innerHTML).toMatch(/data-campaign-level="1"[^>]*disabled/);

    const store = new Match3CampaignStore(storage);
    const state = store.load();
    state.completed.push(levels[0].id);
    store.save(state);
    app.renderMatch3Campaign();
    expect(root.innerHTML).not.toMatch(/data-campaign-level="1"[^>]*disabled/);
    expect(root.innerHTML).toContain('ПРОЙДЕНО');
  });

  it('starting campaign Match-3 records only the campaign attempt', () => {
    const storage = (globalThis.window as unknown as { localStorage: Storage }).localStorage;
    const root = new FakeRoot();
    const app = new AnimeDetectiveApp(root as unknown as HTMLElement) as AnimeDetectiveApp & { startCampaignMatch(level: number): void };
    app.startCampaignMatch(0);
    const campaign = new Match3CampaignStore(storage).load();
    expect(campaign.attempts[levels[0].id]).toBe(1);
    expect(storage.getItem(ANM009_SAVE_KEY)).toBeNull();
    expect(root.innerHTML).toContain('match-screen');
    expect(root.innerHTML).toContain('КАМПАНИЯ 1/4');
    expect(root.innerHTML).not.toContain('aria-label="Досье"');
  });
});
