import { APP_VERSION, BUILD_ID } from '../appVersion';
import type { StorageLike } from './SafeStorage';

export const PLAYTEST_STORAGE_KEY = 'seiran-detectives-playtest-v2';
export const PLAYTEST_LEGACY_STORAGE_KEY = 'seiran-detectives-playtest-v1';
export const PLAYTEST_SCHEMA_VERSION = 2;
export const PLAYTEST_EVENT_LIMIT = 2500;

export type PlaytestEventName =
  | 'session_start' | 'session_end' | 'screen_view'
  | 'vn_line' | 'vn_paging' | 'vn_skip' | 'vn_auto' | 'vn_log_open'
  | 'choice_selected'
  | 'match_start' | 'match_move' | 'match_hint' | 'match_tutorial' | 'match_reaction' | 'match_end'
  | 'vertical_slice_complete'
  | 'pwa_registered' | 'pwa_offline_ready' | 'pwa_update_available' | 'pwa_update_applied' | 'pwa_installed' | 'connectivity_changed';

export type PlaytestEvent = Readonly<{
  seq: number;
  at: string;
  sessionId: string;
  name: PlaytestEventName;
  appVersion: string;
  buildId: string;
  data: Readonly<Record<string, unknown>>;
}>;

type PersistedPlaytest = Readonly<{
  schemaVersion: number;
  createdAt: string;
  updatedAt: string;
  nextSeq: number;
  events: PlaytestEvent[];
}>;

export type PlaytestLevelSummary = Readonly<{
  starts: number;
  wins: number;
  losses: number;
  abandons: number;
  winRate: number | null;
  hints: number;
  manualHints: number;
  autoHints: number;
  manualHintRate: number | null;
  autoHintRate: number | null;
  validMoves: number;
  invalidMoves: number;
  reshuffles: number;
  specials: number;
  directSpecialActivations: number;
  directComboSignals: number;
  cascade2PlusMoves: number;
  cascade2PlusRate: number | null;
  sameSessionRetriesAfterLoss: number;
  sameSessionRetryAfterLossRate: number | null;
  sameSessionNextAfterWin: number;
  sameSessionNextAfterWinRate: number | null;
  maxCascade: number;
  medianMoveEventGapMs: number | null;
  medianDurationMs: number | null;
  medianMovesUsed: number | null;
  medianMovesLeftOnWin: number | null;
}>;

export type PlaytestSummary = Readonly<{
  sessions: number;
  events: number;
  verticalSliceCompletions: number;
  choices: Readonly<Record<string, number>>;
  vn: Readonly<{ uniqueLinesViewed: number; skipActions: number; autoToggles: number; logOpens: number }>;
  levels: Readonly<Record<string, PlaytestLevelSummary>>;
  pwa: Readonly<{ installedLaunches: number; offlineLaunches: number; installs: number; updatesApplied: number }>;
}>;

export type PlaytestExportBundle = Readonly<{
  format: 'upds-playtest-report';
  exportVersion: 1;
  schemaVersion: number;
  exportedAt: string;
  appVersion: string;
  buildId: string;
  summary: PlaytestSummary;
  events: readonly PlaytestEvent[];
}>;

const blankPersisted = (): PersistedPlaytest => {
  const now = new Date().toISOString();
  return { schemaVersion: PLAYTEST_SCHEMA_VERSION, createdAt: now, updatedAt: now, nextSeq: 1, events: [] };
};

const isObject = (value: unknown): value is Record<string, unknown> => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const sessionId = (): string => {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* fallback below */ }
  return `session-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const finiteNumber = (value: unknown): number | null => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const median = (values: number[]): number | null => {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
};

const percentage = (numerator: number, denominator: number): number | null => (
  denominator > 0 ? Math.round((numerator / denominator) * 1000) / 10 : null
);

const normalizePersisted = (value: unknown, acceptedSchemaVersions: readonly number[]): PersistedPlaytest | null => {
  if (!isObject(value) || !acceptedSchemaVersions.includes(Number(value.schemaVersion)) || !Array.isArray(value.events)) return null;
  const events = value.events.filter((event): event is PlaytestEvent => {
    if (!isObject(event)) return false;
    return typeof event.at === 'string' && typeof event.sessionId === 'string' && typeof event.name === 'string' && Number.isInteger(event.seq) && isObject(event.data);
  }).slice(-PLAYTEST_EVENT_LIMIT);
  const maxSeq = events.reduce((max, event) => Math.max(max, event.seq), 0);
  return {
    schemaVersion: PLAYTEST_SCHEMA_VERSION,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : new Date().toISOString(),
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
    nextSeq: Math.max(maxSeq + 1, Number(value.nextSeq) || 1),
    events,
  };
};

const nextMatchStartByEndSeq = (events: readonly PlaytestEvent[]): ReadonlyMap<number, PlaytestEvent> => {
  const bySession = new Map<string, PlaytestEvent[]>();
  for (const event of events) {
    const session = bySession.get(event.sessionId) ?? [];
    session.push(event);
    bySession.set(event.sessionId, session);
  }

  const result = new Map<number, PlaytestEvent>();
  for (const sessionEvents of bySession.values()) {
    const ordered = [...sessionEvents].sort((a, b) => a.seq - b.seq);
    let nextStart: PlaytestEvent | null = null;
    for (let index = ordered.length - 1; index >= 0; index -= 1) {
      const event = ordered[index];
      if (event.name === 'match_start') nextStart = event;
      else if (event.name === 'match_end' && nextStart) result.set(event.seq, nextStart);
    }
  }
  return result;
};

export const summarizePlaytest = (events: readonly PlaytestEvent[]): PlaytestSummary => {
  const sessions = new Set(events.filter((event) => event.name === 'session_start').map((event) => event.sessionId));
  const uniqueLines = new Set<string>();
  const choices: Record<string, number> = {};
  const levelIds = new Set<string>();
  const continuationStarts = nextMatchStartByEndSeq(events);
  for (const event of events) {
    if (event.name === 'vn_line' && typeof event.data.lineId === 'string') uniqueLines.add(event.data.lineId);
    if (event.name === 'choice_selected' && typeof event.data.choice === 'string') choices[event.data.choice] = (choices[event.data.choice] ?? 0) + 1;
    if (typeof event.data.levelId === 'string') levelIds.add(event.data.levelId);
  }

  const levels: Record<string, PlaytestLevelSummary> = {};
  for (const levelId of [...levelIds].sort()) {
    const relevant = events.filter((event) => event.data.levelId === levelId);
    const starts = relevant.filter((event) => event.name === 'match_start').length;
    const ends = relevant.filter((event) => event.name === 'match_end');
    const wins = ends.filter((event) => event.data.outcome === 'win').length;
    const losses = ends.filter((event) => event.data.outcome === 'loss').length;
    const abandons = ends.filter((event) => event.data.outcome === 'abandon').length;
    const completed = wins + losses;
    const durations = ends.map((event) => finiteNumber(event.data.durationMs)).filter((value): value is number => value !== null && value >= 0);
    const movesLeft = ends.filter((event) => event.data.outcome === 'win').map((event) => finiteNumber(event.data.movesLeft)).filter((value): value is number => value !== null);
    const movesUsed = ends.map((event) => {
      const budget = finiteNumber(event.data.moveBudget);
      const left = finiteNumber(event.data.movesLeft);
      return budget !== null && left !== null ? Math.max(0, budget - left) : null;
    }).filter((value): value is number => value !== null);
    const moves = relevant.filter((event) => event.name === 'match_move');
    const validMoves = moves.filter((event) => event.data.valid === true).length;
    const hints = relevant.filter((event) => event.name === 'match_hint');
    const manualHints = hints.filter((event) => event.data.source === 'manual').length;
    const autoHints = hints.filter((event) => event.data.source === 'inactivity').length;
    const sourcedHints = manualHints + autoHints;
    const cascade2PlusMoves = moves.filter((event) => (finiteNumber(event.data.cascades) ?? 0) >= 2).length;
    const moveEventGaps = moves
      .map((event) => finiteNumber(event.data.moveEventGapMs))
      .filter((value): value is number => value !== null && value >= 0);
    const directComboSignals = relevant.filter((event) => (
      event.name === 'match_reaction'
      && event.data.action === 'shown'
      && event.data.directSpecialCombo === true
    )).length;

    const lossEnds = ends.filter((event) => event.data.outcome === 'loss');
    const sameSessionRetriesAfterLoss = lossEnds.filter((event) => continuationStarts.get(event.seq)?.data.levelId === levelId).length;
    const campaignWinEnds = ends.filter((event) => event.data.outcome === 'win' && event.data.mode === 'campaign');
    const sameSessionNextAfterWin = campaignWinEnds.filter((event) => {
      const next = continuationStarts.get(event.seq);
      const currentIndex = finiteNumber(event.data.levelIndex);
      const nextIndex = finiteNumber(next?.data.levelIndex);
      return Boolean(next && currentIndex !== null && nextIndex === currentIndex + 1);
    }).length;

    levels[levelId] = {
      starts,
      wins,
      losses,
      abandons,
      winRate: percentage(wins, completed),
      hints: hints.length,
      manualHints,
      autoHints,
      manualHintRate: percentage(manualHints, sourcedHints),
      autoHintRate: percentage(autoHints, sourcedHints),
      validMoves,
      invalidMoves: moves.filter((event) => event.data.valid === false).length,
      reshuffles: moves.filter((event) => event.data.reshuffled === true).length,
      specials: moves.reduce((sum, event) => sum + Math.max(0, finiteNumber(event.data.specialsCreated) ?? 0), 0),
      directSpecialActivations: moves.filter((event) => event.data.valid === true && event.data.activation === 'direct').length,
      directComboSignals,
      cascade2PlusMoves,
      cascade2PlusRate: percentage(cascade2PlusMoves, validMoves),
      sameSessionRetriesAfterLoss,
      sameSessionRetryAfterLossRate: percentage(sameSessionRetriesAfterLoss, lossEnds.length),
      sameSessionNextAfterWin,
      sameSessionNextAfterWinRate: percentage(sameSessionNextAfterWin, campaignWinEnds.length),
      maxCascade: moves.reduce((max, event) => Math.max(max, finiteNumber(event.data.cascades) ?? 0), 0),
      medianMoveEventGapMs: median(moveEventGaps),
      medianDurationMs: median(durations),
      medianMovesUsed: median(movesUsed),
      medianMovesLeftOnWin: median(movesLeft),
    };
  }

  return {
    sessions: sessions.size,
    events: events.length,
    verticalSliceCompletions: events.filter((event) => event.name === 'vertical_slice_complete').length,
    choices,
    vn: {
      uniqueLinesViewed: uniqueLines.size,
      skipActions: events.filter((event) => event.name === 'vn_skip').length,
      autoToggles: events.filter((event) => event.name === 'vn_auto').length,
      logOpens: events.filter((event) => event.name === 'vn_log_open').length,
    },
    levels,
    pwa: {
      installedLaunches: events.filter((event) => event.name === 'session_start' && event.data.installed === true).length,
      offlineLaunches: events.filter((event) => event.name === 'session_start' && event.data.online === false).length,
      installs: events.filter((event) => event.name === 'pwa_installed').length,
      updatesApplied: events.filter((event) => event.name === 'pwa_update_applied').length,
    },
  };
};

export class PlaytestTelemetry {
  private currentSessionId = sessionId();
  private state: PersistedPlaytest;
  private ended = false;
  private sessionStartedAt = Date.now();
  private lastScreenKey = '';
  private activeMatchAttemptId: string | null = null;
  private activeMatchMoveNumber = 0;
  private activeMatchMoveAttemptNumber = 0;
  private activeMatchHintNumber = 0;
  private activeMatchBoardRevision = 0;
  private activeHint: Readonly<{ id: string; boardRevision: number; first: number; second: number }> | null = null;
  private lastMatchMoveTrackedAt: number | null = null;

  constructor(private readonly storage: StorageLike, private readonly key = PLAYTEST_STORAGE_KEY) {
    const current = this.read(this.key, [PLAYTEST_SCHEMA_VERSION]);
    const legacy = this.key === PLAYTEST_STORAGE_KEY && !current
      ? this.read(PLAYTEST_LEGACY_STORAGE_KEY, [1])
      : null;
    this.state = current ?? legacy ?? blankPersisted();
    if (legacy) this.write();
  }

  get sessionId(): string { return this.currentSessionId; }

  startSession(environment: Readonly<Record<string, unknown>> = {}): void {
    this.ended = false;
    this.sessionStartedAt = Date.now();
    this.activeMatchAttemptId = null;
    this.activeMatchMoveNumber = 0;
    this.activeMatchMoveAttemptNumber = 0;
    this.activeMatchHintNumber = 0;
    this.activeMatchBoardRevision = 0;
    this.activeHint = null;
    this.lastMatchMoveTrackedAt = null;
    this.track('session_start', environment);
  }

  endSession(reason = 'pagehide'): void {
    if (this.ended) return;
    this.ended = true;
    this.track('session_end', { reason, durationMs: Math.max(0, Date.now() - this.sessionStartedAt) });
  }

  track(name: PlaytestEventName, data: Readonly<Record<string, unknown>> = {}): void {
    const trackedAt = Date.now();
    if (name === 'match_start') {
      this.activeMatchAttemptId = `${this.currentSessionId}:${this.state.nextSeq}`;
      this.activeMatchMoveNumber = 0;
      this.activeMatchMoveAttemptNumber = 0;
      this.activeMatchHintNumber = 0;
      this.activeMatchBoardRevision = 0;
      this.activeHint = null;
      this.lastMatchMoveTrackedAt = null;
    }

    let eventData: Record<string, unknown> = { ...data };
    if (name.startsWith('match_') && this.activeMatchAttemptId) {
      eventData = { ...eventData, attemptId: this.activeMatchAttemptId, boardRevision: this.activeMatchBoardRevision };
    }
    if (name === 'match_hint' && this.activeMatchAttemptId) {
      this.activeMatchHintNumber += 1;
      const hintId = `${this.activeMatchAttemptId}:h${this.activeMatchHintNumber}`;
      const first = finiteNumber(eventData.first);
      const second = finiteNumber(eventData.second);
      eventData = { ...eventData, hintId };
      this.activeHint = eventData.available === true && first !== null && second !== null
        ? { id: hintId, boardRevision: this.activeMatchBoardRevision, first, second }
        : null;
    }
    if (name === 'match_move' && this.activeMatchAttemptId) {
      const boardRevisionBefore = this.activeMatchBoardRevision;
      this.activeMatchMoveAttemptNumber += 1;
      if (eventData.valid === true) this.activeMatchMoveNumber += 1;
      if (eventData.valid === true) this.activeMatchBoardRevision += 1;
      const first = finiteNumber(eventData.first);
      const second = finiteNumber(eventData.second);
      const followedHintId = this.activeHint
        && this.activeHint.boardRevision === boardRevisionBefore
        && first !== null
        && second !== null
        && ((first === this.activeHint.first && second === this.activeHint.second)
          || (first === this.activeHint.second && second === this.activeHint.first))
        ? this.activeHint.id
        : null;
      eventData = {
        ...eventData,
        moveId: `${this.activeMatchAttemptId}:m${this.activeMatchMoveAttemptNumber}`,
        moveNumber: eventData.moveNumber ?? this.activeMatchMoveNumber,
        boardRevisionBefore,
        boardRevisionAfter: this.activeMatchBoardRevision,
        followedHintId,
        ...(this.lastMatchMoveTrackedAt === null ? {} : { moveEventGapMs: Math.max(0, trackedAt - this.lastMatchMoveTrackedAt) }),
      };
      delete eventData.boardRevision;
      this.activeHint = null;
      this.lastMatchMoveTrackedAt = trackedAt;
    }

    const event: PlaytestEvent = {
      seq: this.state.nextSeq,
      at: new Date(trackedAt).toISOString(),
      sessionId: this.sessionId,
      name,
      appVersion: APP_VERSION,
      buildId: BUILD_ID,
      data: eventData,
    };
    const events = [...this.state.events, event].slice(-PLAYTEST_EVENT_LIMIT);
    this.state = { ...this.state, updatedAt: event.at, nextSeq: event.seq + 1, events };
    this.write();

    if (name === 'match_end') {
      this.activeMatchAttemptId = null;
      this.activeMatchMoveNumber = 0;
      this.activeMatchMoveAttemptNumber = 0;
      this.activeMatchHintNumber = 0;
      this.activeMatchBoardRevision = 0;
      this.activeHint = null;
      this.lastMatchMoveTrackedAt = null;
    }
  }

  trackScreen(screen: string, detail = ''): void {
    const key = `${screen}:${detail}`;
    if (key === this.lastScreenKey) return;
    this.lastScreenKey = key;
    this.track('screen_view', { screen, detail });
  }

  snapshot(): Readonly<{ schemaVersion: number; eventCount: number; sessionId: string; summary: PlaytestSummary }> {
    return { schemaVersion: PLAYTEST_SCHEMA_VERSION, eventCount: this.state.events.length, sessionId: this.sessionId, summary: summarizePlaytest(this.state.events) };
  }

  events(): readonly PlaytestEvent[] { return [...this.state.events]; }

  createExportBundle(): PlaytestExportBundle {
    return {
      format: 'upds-playtest-report', exportVersion: 1, schemaVersion: PLAYTEST_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(), appVersion: APP_VERSION, buildId: BUILD_ID,
      summary: summarizePlaytest(this.state.events), events: [...this.state.events],
    };
  }

  clear(): void {
    this.state = blankPersisted();
    this.currentSessionId = sessionId();
    this.ended = false;
    this.sessionStartedAt = Date.now();
    this.lastScreenKey = '';
    this.activeMatchAttemptId = null;
    this.activeMatchMoveNumber = 0;
    this.activeMatchMoveAttemptNumber = 0;
    this.activeMatchHintNumber = 0;
    this.activeMatchBoardRevision = 0;
    this.activeHint = null;
    this.lastMatchMoveTrackedAt = null;
    this.write();
  }

  private read(key: string, acceptedSchemaVersions: readonly number[]): PersistedPlaytest | null {
    try {
      const raw = this.storage.getItem(key);
      return raw ? normalizePersisted(JSON.parse(raw), acceptedSchemaVersions) : null;
    } catch { return null; }
  }

  private write(): void {
    try { this.storage.setItem(this.key, JSON.stringify(this.state)); } catch { /* telemetry is best-effort */ }
  }
}
