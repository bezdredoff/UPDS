import { describe, expect, it } from 'vitest';
import { APP_VERSION } from '../src/appVersion';
import {
  PLAYTEST_EVENT_LIMIT,
  PLAYTEST_LEGACY_STORAGE_KEY,
  PLAYTEST_SCHEMA_VERSION,
  PLAYTEST_STORAGE_KEY,
  PlaytestTelemetry,
  summarizePlaytest,
} from '../src/platform/PlaytestTelemetry';
import type { StorageLike } from '../src/platform/SafeStorage';
import { match3ObjectiveDeltas } from '../src/features/match3/Match3Telemetry';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('local playtest telemetry', () => {
  it('keeps telemetry separate from campaign save and exports summary plus raw events', () => {
    const storage = new MemoryStorage();
    const telemetry = new PlaytestTelemetry(storage);
    telemetry.startSession({ installed: true, online: false });
    telemetry.track('choice_selected', { choice: 'B' });
    telemetry.track('vn_line', { lineId: 'VN0001' });
    telemetry.track('vn_skip', { skipped: 4 });
    telemetry.track('match_start', { levelId: 'L01', attempt: 1, moveBudget: 24 });
    telemetry.track('match_hint', { levelId: 'L01', source: 'manual' });
    telemetry.track('match_move', { levelId: 'L01', valid: true, activation: 'direct', reshuffled: true, specialsCreated: 2, cascades: 3 });
    telemetry.track('match_end', { levelId: 'L01', outcome: 'win', durationMs: 12000, moveBudget: 24, movesLeft: 5 });
    telemetry.track('vertical_slice_complete');

    expect(storage.getItem(PLAYTEST_STORAGE_KEY)).not.toBeNull();
    expect(storage.getItem('seiran-detectives-anm009-v1')).toBeNull();

    const bundle = telemetry.createExportBundle();
    expect(bundle.schemaVersion).toBe(PLAYTEST_SCHEMA_VERSION);
    expect(bundle.appVersion).toBe(APP_VERSION);
    expect(bundle.summary.sessions).toBe(1);
    expect(bundle.summary.verticalSliceCompletions).toBe(1);
    expect(bundle.summary.choices.B).toBe(1);
    expect(bundle.summary.vn.uniqueLinesViewed).toBe(1);
    expect(bundle.summary.levels.L01).toMatchObject({
      starts: 1,
      wins: 1,
      hints: 1,
      manualHints: 1,
      autoHints: 0,
      manualHintRate: 100,
      validMoves: 1,
      invalidMoves: 0,
      reshuffles: 1,
      specials: 2,
      directSpecialActivations: 1,
      cascade2PlusMoves: 1,
      cascade2PlusRate: 100,
      maxCascade: 3,
      medianMovesUsed: 19,
      medianMovesLeftOnWin: 5,
    });
    expect(bundle.summary.pwa.installedLaunches).toBe(1);
    expect(bundle.summary.pwa.offlineLaunches).toBe(1);
    expect(bundle.events.length).toBeGreaterThan(0);
  });

  it('deduplicates consecutive screen views and caps the persistent event log', () => {
    const storage = new MemoryStorage();
    const telemetry = new PlaytestTelemetry(storage);
    telemetry.trackScreen('vn', 'VN0001');
    telemetry.trackScreen('vn', 'VN0001');
    telemetry.trackScreen('vn', 'VN0002');
    expect(telemetry.events().filter((event) => event.name === 'screen_view')).toHaveLength(2);

    for (let index = 0; index < PLAYTEST_EVENT_LIMIT + 50; index += 1) telemetry.track('vn_line', { lineId: `VN${index}` });
    expect(telemetry.events()).toHaveLength(PLAYTEST_EVENT_LIMIT);
  });

  it('starts a fresh session identity when playtest data is cleared between testers', () => {
    const storage = new MemoryStorage();
    const telemetry = new PlaytestTelemetry(storage);
    const first = telemetry.sessionId;
    telemetry.startSession();
    telemetry.clear();
    const second = telemetry.sessionId;
    expect(second).not.toBe(first);
    telemetry.startSession({ reset: true });
    expect(telemetry.createExportBundle().summary.sessions).toBe(1);
  });

  it('migrates the persisted v1 event log into v2 without deleting the legacy copy', () => {
    const storage = new MemoryStorage();
    const legacyEvent = {
      seq: 7,
      at: '2026-08-25T12:00:00.000Z',
      sessionId: 'legacy-session',
      name: 'match_end',
      appVersion: '0.26.0-dev',
      buildId: 'legacy-build',
      data: { levelId: 'M3_06', outcome: 'loss' },
    };
    storage.setItem(PLAYTEST_LEGACY_STORAGE_KEY, JSON.stringify({
      schemaVersion: 1,
      createdAt: '2026-08-25T11:00:00.000Z',
      updatedAt: legacyEvent.at,
      nextSeq: 8,
      events: [legacyEvent],
    }));

    const telemetry = new PlaytestTelemetry(storage);

    expect(telemetry.events()).toEqual([legacyEvent]);
    expect(JSON.parse(storage.getItem(PLAYTEST_STORAGE_KEY) ?? '{}')).toMatchObject({
      schemaVersion: 2,
      createdAt: '2026-08-25T11:00:00.000Z',
      nextSeq: 8,
      events: [legacyEvent],
    });
    expect(storage.getItem(PLAYTEST_LEGACY_STORAGE_KEY)).not.toBeNull();
  });

  it('summarizes wins, losses and abandons without treating abandons as completed attempts', () => {
    const storage = new MemoryStorage();
    const telemetry = new PlaytestTelemetry(storage);
    telemetry.track('match_start', { levelId: 'L02' });
    telemetry.track('match_end', { levelId: 'L02', outcome: 'loss', durationMs: 1000, moveBudget: 26, movesLeft: 0 });
    telemetry.track('match_start', { levelId: 'L02' });
    telemetry.track('match_end', { levelId: 'L02', outcome: 'win', durationMs: 2000, moveBudget: 26, movesLeft: 3 });
    telemetry.track('match_start', { levelId: 'L02' });
    telemetry.track('match_end', { levelId: 'L02', outcome: 'abandon', durationMs: 500, moveBudget: 26, movesLeft: 10 });
    const summary = summarizePlaytest(telemetry.events());
    expect(summary.levels.L02).toMatchObject({ starts: 3, wins: 1, losses: 1, abandons: 1, winRate: 50, medianMovesLeftOnWin: 3 });
  });

  it('adds stable event ids and board revisions while keeping valid-move sequence numbers', () => {
    const storage = new MemoryStorage();
    const telemetry = new PlaytestTelemetry(storage);
    telemetry.startSession();
    telemetry.track('match_start', { levelId: 'L03', levelIndex: 3 });
    telemetry.track('match_hint', { levelId: 'L03', source: 'inactivity', available: true, first: 4, second: 5 });
    telemetry.track('match_move', { levelId: 'L03', valid: false, cascades: 0, first: 1, second: 2 });
    telemetry.track('match_move', { levelId: 'L03', valid: true, cascades: 1, first: 6, second: 7 });
    telemetry.track('match_move', { levelId: 'L03', valid: true, cascades: 2, first: 8, second: 9 });
    telemetry.track('match_end', { levelId: 'L03', levelIndex: 3, outcome: 'loss' });

    const scoped = telemetry.events().filter((event) => event.name.startsWith('match_'));
    const attemptIds = new Set(scoped.map((event) => event.data.attemptId));
    expect(attemptIds.size).toBe(1);
    expect([...attemptIds][0]).toEqual(expect.any(String));
    const start = scoped.find((event) => event.name === 'match_start');
    const hint = scoped.find((event) => event.name === 'match_hint');
    const moves = scoped.filter((event) => event.name === 'match_move');
    const end = scoped.find((event) => event.name === 'match_end');
    expect(start?.data.boardRevision).toBe(0);
    expect(hint?.data).toMatchObject({ boardRevision: 0, hintId: `${start?.data.attemptId}:h1` });
    expect(moves.map((event) => event.data.moveId)).toEqual([
      `${start?.data.attemptId}:m1`,
      `${start?.data.attemptId}:m2`,
      `${start?.data.attemptId}:m3`,
    ]);
    expect(moves.map((event) => event.data.moveNumber)).toEqual([0, 1, 2]);
    expect(moves.map((event) => [event.data.boardRevisionBefore, event.data.boardRevisionAfter])).toEqual([
      [0, 0],
      [0, 1],
      [1, 2],
    ]);
    expect(end?.data.boardRevision).toBe(2);
  });

  it('links a move only to the latest hint pair on the same board revision', () => {
    const telemetry = new PlaytestTelemetry(new MemoryStorage());
    telemetry.track('match_start', { levelId: 'L06' });
    telemetry.track('match_hint', { levelId: 'L06', available: true, first: 10, second: 11 });
    telemetry.track('match_move', { levelId: 'L06', valid: true, first: 11, second: 10 });
    telemetry.track('match_hint', { levelId: 'L06', available: true, first: 20, second: 21 });
    telemetry.track('match_move', { levelId: 'L06', valid: true, first: 1, second: 2 });

    const hints = telemetry.events().filter((event) => event.name === 'match_hint');
    const moves = telemetry.events().filter((event) => event.name === 'match_move');
    expect(hints.map((event) => event.data.boardRevision)).toEqual([0, 1]);
    expect(moves[0].data.followedHintId).toBe(hints[0].data.hintId);
    expect(moves[1].data.followedHintId).toBeNull();
  });

  it('records an indexed before/after delta for every objective', () => {
    expect(match3ObjectiveDeltas([2, 4, 1], [5, 4, 0])).toEqual([
      { objectiveIndex: 0, before: 2, after: 5, delta: 3 },
      { objectiveIndex: 1, before: 4, after: 4, delta: 0 },
      { objectiveIndex: 2, before: 1, after: 0, delta: -1 },
    ]);
  });

  it('summarizes sourced hints, combo signals and same-session continuation behavior', () => {
    const storage = new MemoryStorage();
    const telemetry = new PlaytestTelemetry(storage);
    telemetry.startSession();

    telemetry.track('match_start', { levelId: 'L04', levelIndex: 4, mode: 'campaign' });
    telemetry.track('match_hint', { levelId: 'L04', source: 'manual' });
    telemetry.track('match_hint', { levelId: 'L04', source: 'inactivity' });
    telemetry.track('match_move', { levelId: 'L04', valid: true, activation: 'swap', cascades: 2, specialsCreated: 1 });
    telemetry.track('match_reaction', { levelId: 'L04', action: 'shown', directSpecialCombo: true });
    telemetry.track('match_end', { levelId: 'L04', levelIndex: 4, mode: 'campaign', outcome: 'loss' });

    telemetry.track('match_start', { levelId: 'L04', levelIndex: 4, mode: 'campaign' });
    telemetry.track('match_move', { levelId: 'L04', valid: true, activation: 'direct', cascades: 1, specialsCreated: 0 });
    telemetry.track('match_end', { levelId: 'L04', levelIndex: 4, mode: 'campaign', outcome: 'win' });

    telemetry.track('match_start', { levelId: 'L05', levelIndex: 5, mode: 'campaign' });

    const summary = summarizePlaytest(telemetry.events()).levels.L04;
    expect(summary).toMatchObject({
      hints: 2,
      manualHints: 1,
      autoHints: 1,
      manualHintRate: 50,
      autoHintRate: 50,
      directSpecialActivations: 1,
      directComboSignals: 1,
      cascade2PlusMoves: 1,
      cascade2PlusRate: 50,
      sameSessionRetriesAfterLoss: 1,
      sameSessionRetryAfterLossRate: 100,
      sameSessionNextAfterWin: 1,
      sameSessionNextAfterWinRate: 100,
    });
  });
});
