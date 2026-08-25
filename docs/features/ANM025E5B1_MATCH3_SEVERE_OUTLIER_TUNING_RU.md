# ANM-025E5B1 — Severe Match-3 Outlier Tuning

Build label: `ANM-025E5B1 R1 · Severe Outlier Tuning`.

## Зачем нужен этот slice

E5A зафиксировал all-22 objective-aware baseline на 200 seeds и показал два явных красных выброса:

- `M3_06` — 9.5% win rate, 0.0757 specials / valid move, 0.2129 cascade2+;
- `M3_11` — 2.0% win rate, 3.07% reshuffle / valid move.

Это не human win-rate targets, но значения слишком далеко от соседних уровней и от proposed challenge envelope (~40–60%), поэтому до human playtest эти два уровня нужно вывести из severe-зоны.

## Диагностика M3_06

`M3_06` не проигрывался из-за collect-цели: `sportsBra ×12` выполнялась в 100% E5A runs. Все 8 garment bags очищались в 81% runs. Главный bottleneck — две drop-улики: warranty card и silver spool стояли в колонках 2 и 5 над нижними garment-bag gates и вместе доходили до выхода только в 9.5% runs.

E5B1 сохраняет две отдельные evidence lanes и верхний split workshop silhouette, но убирает нижний зеркальный разрез. Поле превращается из двух замкнутых верхних/нижних кластеров в split-entry → общий нижний workbench. Это одновременно:

- сохраняет topology identity;
- даёт уликaм реальный путь к выходу;
- увеличивает пространство для specials/cascades;
- снижает reshuffle pressure.

Изменения `M3_06`:

- `boardHoles`: 12 → 6, остаются `[3, 4, 11, 12, 19, 20]`;
- active cells: 52 → 58;
- moves: 29 → 32;
- objectives, blocker count/layers, ingredient identities/positions, active tiles и narrative context не меняются.

## Диагностика M3_11

В E5A transfer seal и manifest доходили до выхода примерно в половине runs, а `routeCard` — только примерно в 6.5%. Он стартовал в верхней крайней колонке, где objective-aware agent почти не создавал достаточное количество вертикальных clears. Дополнительные ходы почти не лечили проблему.

E5B1 делает service-yard topology более читаемой: остаются верхний и нижний notched entry/exit, а четыре внутренних боковых holes открываются. Три документа размещаются глубже в центральной service zone:

- transfer seal → index 28;
- route card → index 45;
- manifest → index 36.

Seal и manifest образуют последовательную документную дорожку, route card идёт в соседней lane. Blockers и все три narrative evidence requirements сохраняются.

Изменения `M3_11`:

- `boardHoles`: 12 → 8, остаются `[1, 2, 5, 6, 57, 58, 61, 62]`;
- active cells: 52 → 56;
- moves: 29 → 33;
- blockers/objectives/active tiles не меняются;
- ingredient placements: `[4, 7, 12]` → `[28, 45, 36]`.

## 200-seed baseline + holdout

Одна и та же policy `getHintMove() → attemptSwap()` прогнана на трёх независимых cohort по 200 seeds.

| Level | Cohort | Before | E5B1 | Specials/move before → after | Cascade2+ before → after | Reshuffle before → after |
|---|---:|---:|---:|---:|---:|---:|
| M3_06 | 150000 | 9.5% | 45.5% | 0.0757 → 0.1089 | 21.3% → 25.7% | 5.38% → 1.23% |
| M3_06 | 160000 | 7.0% | 33.5% | 0.0872 → 0.1087 | 20.8% → 25.6% | 4.84% → 1.04% |
| M3_06 | 170000 | 5.5% | 42.0% | 0.0738 → 0.1136 | 20.1% → 25.9% | 5.59% → 1.34% |
| M3_11 | 150000 | 2.0% | 44.0% | 0.1137 → 0.1339 | 23.5% → 24.7% | 3.07% → 0.74% |
| M3_11 | 160000 | 4.5% | 37.5% | 0.1134 → 0.1317 | 22.5% → 24.8% | 2.89% → 1.11% |
| M3_11 | 170000 | 2.5% | 38.0% | 0.1099 → 0.1451 | 23.4% → 26.9% | 2.99% → 0.84% |

E5B1 не пытается сделать эти уровни easy/relief. Они остаются challenge beats, но severe 2–10% comparator traps исчезают на всех трёх cohorts.

## CI regression guard

`tests/Match3DifficultyCurveTuning.test.ts` использует отдельный 24-seed holdout (`180000..180023`) и сравнивает production E5B1 configuration с реконструированной pre-E5B1 configuration. Gate проверяет:

- существенный рост hint-agent wins у обоих severe outliers;
- рост activity signal;
- снижение reshuffle pressure;
- `M3_11` не превращается в слишком лёгкий relief level.

Старые E4B/E4C topology tests обновлены: E4 silhouette был экспериментальной отправной точкой, а E5B1 является evidence-driven tuning поверх неё.

## Что дальше

После merge и короткого human QA `M3_06`/`M3_11` следующий auto-balance cohort — **E5B2: M3_09, M3_14, M3_15**. После удаления gross outliers можно начинать human telemetry playtest с `Fun 1–5` и субъективной difficulty оценкой.
