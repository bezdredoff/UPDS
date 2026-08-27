import { levels } from '../../data/levels';
import type { PlaytestLevelSummary, PlaytestSummary } from '../../platform/PlaytestTelemetry';
import { escapeHtml } from '../../ui/viewMarkup';

const percentage = (value: number | null): string => (value === null ? '—' : `${value}%`);
const metric = (value: number | null): string => (value === null ? '—' : String(value));
const seconds = (value: number | null): string => (value === null ? '—' : `${Math.round(value / 100) / 10}s`);

const invalidMoveRate = (summary: PlaytestLevelSummary): number | null => {
  const attempts = summary.validMoves + summary.invalidMoves;
  return attempts > 0 ? Math.round((summary.invalidMoves / attempts) * 1000) / 10 : null;
};

const levelOrder = new Map(levels.map((level, index) => [level.id, index] as const));
const levelMeta = new Map(levels.map((level) => [level.id, level] as const));

export function match3PlaytestLevelSummaryMarkup(levelId: string, summary: PlaytestLevelSummary): string {
  const level = levelMeta.get(levelId);
  const title = level?.title ?? levelId;
  const shortId = level?.shortId ?? levelId;

  return `<article class="match3-playtest-level" data-playtest-level="${escapeHtml(levelId)}">
    <header><span>${escapeHtml(shortId)}</span><b>${escapeHtml(title)}</b><em>${summary.starts} att.</em></header>
    <div class="match3-playtest-metrics">
      <span><small>WIN</small><b>${percentage(summary.winRate)}</b><i>${summary.wins}W · ${summary.losses}L · ${summary.abandons}A</i></span>
      <span><small>MOVES</small><b>${metric(summary.medianMovesUsed)}</b><i>median used</i></span>
      <span><small>TIME</small><b>${seconds(summary.medianDurationMs)}</b><i>median run</i></span>
      <span><small>INVALID</small><b>${percentage(invalidMoveRate(summary))}</b><i>${summary.invalidMoves}/${summary.validMoves + summary.invalidMoves} attempts</i></span>
      <span><small>HINTS</small><b>${summary.hints}</b><i>${summary.manualHints} manual · ${summary.autoHints} auto</i></span>
      <span><small>CASCADE 2+</small><b>${percentage(summary.cascade2PlusRate)}</b><i>max ×${summary.maxCascade}</i></span>
      <span><small>SPECIAL</small><b>${summary.directSpecialActivations}</b><i>${summary.directComboSignals} combo signals</i></span>
      <span><small>CONTINUE</small><b>${percentage(summary.sameSessionNextAfterWinRate)}</b><i>retry ${percentage(summary.sameSessionRetryAfterLossRate)}</i></span>
    </div>
  </article>`;
}

export function match3PlaytestSummaryMarkup(summary: PlaytestSummary): string {
  const entries = Object.entries(summary.levels)
    .filter(([, level]) => level.starts > 0)
    .sort(([left], [right]) => {
      const leftOrder = levelOrder.get(left) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = levelOrder.get(right) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || left.localeCompare(right);
    });

  const attempts = entries.reduce((sum, [, level]) => sum + level.starts, 0);
  const completed = entries.reduce((sum, [, level]) => sum + level.wins + level.losses, 0);

  return `<section class="match3-playtest-summary" aria-label="Match-3 playtest summary">
    <div class="match3-playtest-heading">
      <span><small>MATCH-3 PLAYTEST</small><b>Сводка по уровням</b></span>
      <em>${entries.length} levels · ${attempts} attempts · ${completed} completed</em>
    </div>
    <p>Локальная telemetry этой установки; Story, Campaign и Level Lab агрегируются вместе. JSON export ниже остаётся полным source-of-truth.</p>
    ${entries.length > 0
      ? `<div class="match3-playtest-levels">${entries.map(([levelId, level]) => match3PlaytestLevelSummaryMarkup(levelId, level)).join('')}</div>`
      : '<div class="match3-playtest-empty">Пока нет Match-3 попыток. Запусти уровень и вернись сюда — сводка появится автоматически.</div>'}
  </section>`;
}
