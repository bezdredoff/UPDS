# ANM-025E4A — Match-3 Fun Metrics Foundation

Build label: `ANM-025E4A R2 · Match-3 Fun Metrics Foundation`.

## Цель

Поставить измерительную базу перед изменением topology production Match-3 уровней.

E4A намеренно не меняет правила, level data, move budgets, objectives, blockers, specials, auto-hint delay, Story/Campaign progression или player-facing UI. Следующие E4B/E4C смогут менять topology репрезентативных уровней уже на фоне одной и той же telemetry/baseline системы.

## Attempt grouping без gameplay coupling

`PlaytestTelemetry` автоматически добавляет Match-3 scoped событиям `attemptId`, создаваемый на `match_start` и закрываемый на `match_end`.

Для `match_move` также добавляются:

- `moveNumber` — число уже принятых valid moves текущего attempt;
- `moveEventGapMs` — wall-clock интервал между соседними `match_move` telemetry events.

`moveEventGapMs` — диагностическая proxy-метрика, а не точный think-time: в неё может входить часть presentation/interaction времени. Точный board-unlocked → next-input `decisionMs` требует отдельного controller-level instrumentation и не вводится в E4A только ради метрики.

Storage schema остаётся `seiran-detectives-playtest-v1` / schema version 1: старые события валидны, новые поля additive и не требуют migration.

## Fun summary

Per-level `PlaytestLevelSummary` сохраняет старые показатели и добавляет:

- `manualHints`, `autoHints`, `manualHintRate`, `autoHintRate`;
- `directSpecialActivations`;
- `directComboSignals` — показанные narrative reaction events, пришедшие из direct special-combo move;
- `cascade2PlusMoves`, `cascade2PlusRate`;
- `sameSessionRetriesAfterLoss`, `sameSessionRetryAfterLossRate`;
- `sameSessionNextAfterWin`, `sameSessionNextAfterWinRate`;
- `medianMoveEventGapMs`.

Retry/Next в E4A являются conservative same-session behavioral inference: после `match_end` берётся следующий `match_start` той же telemetry session. Это полезно для сравнительного playtest сигнала, но не заявляется как exact button-click analytics. Если E4B/C покажут, что различение result-screen действий materially важно, explicit `match_result_action` можно добавить отдельным маленьким instrumentation patch без изменения gameplay.

## All-22 deterministic baseline

`tests/Match3FunBaseline.test.ts` расширяет quantitative protection с ранних уровней на все 22 production level definitions.

Fast CI cohort:

- 8 фиксированных seeds на каждый production level;
- одинаковая objective-aware policy `getHintMove() -> attemptSwap()`;
- каждый run обязан завершиться win/loss внутри move budget;
- hint обязан оставаться legal;
- все 22 production definitions обязаны проходить `validateLevelDefinitions()`.

Каждый production level имеет отдельный Vitest case с явным 15-секундным timeout, чтобы all-22 baseline не зависел от общего default test timeout.

Baseline вычисляет для regression/debugging:

- active cells;
- blocker cells/layers;
- ingredient/objective counts;
- deterministic win rate;
- average moves used;
- average specials created;
- cascade 2+ rate;
- reshuffle rate;
- max cascade.

Эти значения не являются human win-rate targets. Как и ANM-025E3, simulation используется только как reproducible comparative baseline и аварийный regression signal.

## Почему E4A не меняет `Match3Controller`

Основная instrumentation ценность E4A достигается в telemetry boundary без изменения gameplay controller. Это уменьшает риск перед topology experiment и сохраняет чистое сравнение baseline → E4B/E4C.

E4A не пытается преждевременно получить точные данные, которых текущие runtime events не содержат. В частности exact direct combo kind, exact board-unlocked decision time, objective units per move и explicit result button action остаются кандидатами на evidence-driven instrumentation после первого topology playtest, а не обязательным условием для начала E4B.

## Automated acceptance

1. Existing playtest export/storage остаётся совместимым.
2. Match-3 events одного attempt получают одинаковый non-empty `attemptId`.
3. Valid move numbering не увеличивается на invalid move.
4. Sourced hint, direct-special, cascade и same-session continuation summary покрыты unit tests.
5. Все 22 production levels дают terminating deterministic baseline на CI cohort.
6. `npm run check` остаётся authoritative gate.

## Out of scope

- board holes / authored start layouts production levels;
- новые blocker behaviours;
- новые specials или изменение special-combo rules;
- `insight + special` jackpot redesign;
- изменение auto-hint delay;
- boosters/lives/currencies/meta;
- hard human difficulty targets;
- новые assets;
- save/progression migration.

## Следующий шаг

После green E4A и merge:

- E4B — topology prototype для `M3_00`, `M3_02`, `M3_04`, `M3_06`;
- manual iPhone QA через production-parity `?qa=1` / Level Lab / Story-Campaign paths;
- E4C — `M3_11`, `M3_12`, `M3_17`, `M3_21` только если первая topology cohort подтверждает гипотезу.


## R2 correction

R1 был отклонён read-only importer до создания candidate PR. R2 делает CI baseline менее хрупким: all-22 simulation разбита на 22 независимых test cases, fast cohort уменьшена до 8 seeds на уровень (176 deterministic runs суммарно), каждому level case дан явный 15s timeout, а `maxCascade` трактуется как измеряемая метрика, а не обязательный минимум gameplay-контракта. Gameplay/telemetry scope не меняется.
