# ANM-025E5B2 — Route tuning для M3_09 / M3_14 / M3_15

Build label: `ANM-025E5B2 R1 · Second Outlier Cohort`.

## Цель

E5A показал второй кластер слишком тяжёлых comparator-уровней: `M3_09` 33%, `M3_14` 38.5%, `M3_15` 21.5%. В отличие от severe M3_06/M3_11, здесь collect/blocker goals почти всегда завершались; проигрыш создавал именно `dropGroup`.

B2 не меняет moves, objectives, blockers, active tile sets, mechanics или narrative context. Меняются только стартовые позиции narrative evidence.

## Диагностика и изменения

### M3_09 — Журнал универсального ключа

Baseline: blockers завершались в 98% runs, socks — в 100%, но обе drop-улики вместе — только в 33%. `serviceKey` и `handoffSlip` стояли в колонках 2/5, где те же service lanes перекрыты supply crates сверху и снизу.

- было: `[26, 29]`;
- стало: `[27, 28]`;
- moves остаются 29;
- goals остаются `8 blockers + 14 socks + 2 evidence`.

### M3_14 — Книга семейного ателье

Baseline: blocker goal 95.5%, collect 100%, обе книги/квитанции — 38.5%. Геометрия повторяла плохие колонки M3_09, дополнительно с двумя двухслойными fabric stacks.

- было: `[26, 29]`;
- стало: `[27, 28]`;
- moves остаются 29;
- goals остаются `8 blockers + 14 tags + 2 evidence`.

### M3_15 — Старый сервисный маршрут

Baseline: blockers 98.5%, collect 100%, marked package падал в 69.5%, но edge-lane `serviceKeyCard` — только в 30.5%. B2 превращает две улики в короткий диагональный service handoff внутри центральных lanes.

- было: `[28, 31]`;
- стало: `[20, 29]`;
- moves остаются 30;
- goals остаются `10 blockers + 14 tags + 2 evidence`.

## 200-seed baseline + два holdout cohort

Одна policy `getHintMove() → attemptSwap()` прогнана на трёх независимых cohort по 200 seeds.

| Level | Cohort | Before | B2 |
|---|---:|---:|---:|
| M3_09 | 150000 | 33.0% | 50.0% |
| M3_09 | 160000 | 38.5% | 48.0% |
| M3_09 | 170000 | 46.0% | 51.5% |
| M3_14 | 150000 | 38.5% | 52.5% |
| M3_14 | 160000 | 39.5% | 46.5% |
| M3_14 | 170000 | 38.0% | 42.5% |
| M3_15 | 150000 | 21.5% | 44.0% |
| M3_15 | 160000 | 32.0% | 45.0% |
| M3_15 | 170000 | 28.0% | 46.0% |

Таким образом B2 убирает второй gross-outlier cohort, не превращая его в 70–80% relief.

## Получившаяся волна comparator difficulty

После B1+B2 ключевые участки выглядят примерно так на E5A/B1/B2 baseline policy:

- `M3_08 ~64 → M3_09 ~50 → M3_10 ~54 → M3_11 ~44 → M3_12 ~70`;
- `M3_13 ~73 → M3_14 ~52 → M3_15 ~44 → M3_16 ~68`.

Это не human difficulty target. Это устранение явно патологических auto-route traps до настоящего playtest.

## Regression gate

`Match3DifficultyCurveSecondCohort.test.ts` использует 48 mixed holdout seeds из трёх диапазонов. Он фиксирует:

- новые narrative evidence placements;
- неизменные move budgets/objective targets;
- stable/playable production starts;
- comparator envelope: не severe и не relief.

## Следующий шаг

После B2 дополнительный blind auto-tuning нужно остановить. Следующий meaningful slice — human playtest telemetry: использовать уже существующие win/loss/retry/hint/cascade/duration/move metrics и добавить короткую субъективную оценку после Match-3 (`Fun 1–5`, `слишком легко / нормально / слишком сложно`). После первых реальных сессий точечно открыть E5C только для уровней, где human telemetry и субъективный feedback сходятся на проблеме.
