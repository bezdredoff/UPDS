import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels } from '../src/data/levels';
import {
  match3PlaytestLevelSummaryMarkup,
  match3PlaytestSummaryMarkup,
} from '../src/features/diagnostics/Match3PlaytestSummary';
import type { PlaytestLevelSummary, PlaytestSummary } from '../src/platform/PlaytestTelemetry';

const css = readFileSync(new URL('../src/diagnosticsPlaytestSummary.css', import.meta.url), 'utf8');
const controller = readFileSync(new URL('../src/features/diagnostics/DiagnosticsController.ts', import.meta.url), 'utf8');

const levelSummary = (overrides: Partial<PlaytestLevelSummary> = {}): PlaytestLevelSummary => ({
  starts: 0,
  wins: 0,
  losses: 0,
  abandons: 0,
  winRate: null,
  hints: 0,
  manualHints: 0,
  autoHints: 0,
  manualHintRate: null,
  autoHintRate: null,
  validMoves: 0,
  invalidMoves: 0,
  reshuffles: 0,
  specials: 0,
  directSpecialActivations: 0,
  directComboSignals: 0,
  cascade2PlusMoves: 0,
  cascade2PlusRate: null,
  sameSessionRetriesAfterLoss: 0,
  sameSessionRetryAfterLossRate: null,
  sameSessionNextAfterWin: 0,
  sameSessionNextAfterWinRate: null,
  maxCascade: 0,
  medianMoveEventGapMs: null,
  medianDurationMs: null,
  medianMovesUsed: null,
  medianMovesLeftOnWin: null,
  ...overrides,
});

const summary = (levelSummaries: PlaytestSummary['levels']): PlaytestSummary => ({
  sessions: 1,
  events: 20,
  verticalSliceCompletions: 0,
  choices: {},
  vn: { uniqueLinesViewed: 0, skipActions: 0, autoToggles: 0, logOpens: 0 },
  levels: levelSummaries,
  pwa: { installedLaunches: 0, offlineLaunches: 0, installs: 0, updatesApplied: 0 },
});

describe('Match-3 playtest summary dashboard', () => {
  it('renders played production levels in canonical order with decision-useful metrics', () => {
    const first = levels[0];
    const third = levels[2];
    const markup = match3PlaytestSummaryMarkup(summary({
      [third.id]: levelSummary({ starts: 2, wins: 1, losses: 1, winRate: 50 }),
      [first.id]: levelSummary({
        starts: 3,
        wins: 2,
        losses: 1,
        winRate: 66.7,
        validMoves: 18,
        invalidMoves: 2,
        hints: 3,
        manualHints: 2,
        autoHints: 1,
        cascade2PlusRate: 22.2,
        maxCascade: 3,
        directSpecialActivations: 4,
        directComboSignals: 1,
        sameSessionRetryAfterLossRate: 100,
        sameSessionNextAfterWinRate: 50,
        medianDurationMs: 65432,
        medianMovesUsed: 17,
      }),
    }));

    expect(markup.indexOf(`data-playtest-level="${first.id}"`))
      .toBeLessThan(markup.indexOf(`data-playtest-level="${third.id}"`));
    expect(markup).toContain('66.7%');
    expect(markup).toContain('10%');
    expect(markup).toContain('65.4s');
    expect(markup).toContain('2 manual · 1 auto');
    expect(markup).toContain('max ×3');
    expect(markup).toContain('retry 100%');
    expect(markup).toContain('2 levels · 5 attempts · 5 completed');
  });

  it('has a useful empty state and omits zero-start level rows', () => {
    const markup = match3PlaytestSummaryMarkup(summary({
      [levels[0].id]: levelSummary(),
    }));

    expect(markup).toContain('Пока нет Match-3 попыток');
    expect(markup).not.toContain('match3-playtest-level"');
  });

  it('escapes telemetry-derived fallback identifiers', () => {
    const markup = match3PlaytestLevelSummaryMarkup('<script>alert(1)</script>', levelSummary({ starts: 1 }));
    expect(markup).not.toContain('<script>');
    expect(markup).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('is wired into QA Diagnostics and keeps a narrow-phone layout', () => {
    expect(controller).toContain("import '../../diagnosticsPlaytestSummary.css';");
    expect(controller).toContain('match3PlaytestSummaryMarkup(playtest.summary)');
    expect(css).toContain('.match3-playtest-metrics');
    expect(css).toContain('grid-template-columns: repeat(4, minmax(0, 1fr))');
    expect(css).toMatch(/@media \(max-width: 340px\)[\s\S]*grid-template-columns: repeat\(2, minmax\(0, 1fr\)\)/);
  });
});
