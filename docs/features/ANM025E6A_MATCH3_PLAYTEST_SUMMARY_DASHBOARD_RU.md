# ANM-025E6A — Match-3 Playtest Summary Dashboard

## Цель

Начать завершающий remediation slice **E — Reporting & QA** не с новой telemetry, а с превращения уже собранных данных в удобный QA-инструмент.

До E6A проект уже умел:

- собирать Match-3 telemetry v2;
- считать `PlaytestSummary` / `PlaytestLevelSummary`;
- экспортировать `UPDS_playtest_*.json` с summary + raw events;
- считать deterministic quantitative baseline для production levels;
- гонять Chromium + Mobile WebKit Browser Gate;
- сравнивать reviewed Mobile WebKit Golden Samples, включая deterministic Match-3 state.

Но в `?qa=1 → Диагностика` человек видел только количество events / sessions / vertical-slice completions. Для сравнения уровней приходилось выгружать и читать JSON вручную.

## Что делает E6A

В QA Diagnostics появляется компактная **Match-3 Playtest Summary** секция.

Для каждого реально сыгранного уровня показываются:

- attempts;
- wins / losses / abandons и win rate;
- median moves used;
- median attempt duration;
- invalid move rate;
- manual / auto hints;
- cascade 2+ rate и max cascade;
- direct special activations / direct combo signals;
- same-session next-after-win и retry-after-loss rates.

Уровни сортируются в canonical production order, а не в порядке появления telemetry events.

## Scope / ограничения

E6A **не меняет** telemetry schema и не добавляет events. Dashboard только визуализирует существующий `PlaytestSummary`.

Текущий `PlaytestSummary.levels` агрегирует Story, Match-3 Campaign и Level Lab вместе. UI говорит об этом прямо; для строгого экспериментального сравнения source-of-truth остаётся JSON export с raw events и полем `mode`.

Никаких quality thresholds вроде «win rate ниже X = плохой уровень» E6A не вводит. Маленькая human sample не должна автоматически трактоваться как balance verdict.

## Mobile presentation

Summary живёт внутри уже scrollable `.panel`, поэтому не создаёт отдельную навигацию или modal.

- обычный portrait: 4 metric cells в строке;
- `<=340px`: 2 metric cells в строке;
- horizontal scrolling не требуется;
- длинное название уровня сокращается только визуально, canonical ID остаётся рядом.

## Automated contract

`Match3PlaytestSummaryDashboard.test.ts` проверяет:

- canonical ordering сыгранных production levels;
- ключевые derived metrics и форматирование;
- empty state;
- escaping telemetry-derived fallback IDs;
- wiring в Diagnostics;
- narrow-phone layout contract.

Новый standalone Playwright spec не добавляется. Browser Gate уже проходит QA surfaces, а добавление отдельного spec только ради статической summary card не даёт достаточного сигнала относительно CI cost.

## Ручной QA после merge/candidate

В `?qa=1`:

1. открыть Diagnostics без сыгранных Match-3 — виден empty state;
2. сыграть/начать один production level и снова открыть Diagnostics — появляется только этот уровень;
3. после нескольких moves/hints summary обновляется из существующей telemetry;
4. проверить narrow portrait: metric cells не уходят горизонтально за экран;
5. `Экспорт playtest report` по-прежнему отдаёт полный JSON.

## Следующий шаг slice E

После E6A следующий gap — **repeatable human playtest protocol**: короткий сценарий тестера, правила reset/export, обязательные subjective questions и минимальный representative level cohort. Это даст одинаковую процедуру сбора данных, а не только инструменты просмотра результата.
