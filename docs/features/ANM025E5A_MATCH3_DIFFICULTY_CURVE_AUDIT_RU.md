# ANM-025E5A — All-22 Match-3 Difficulty / Activity Audit

Build label: `ANM-025E5A R2 · Difficulty Curve Audit Foundation`.

## Что измерено

Одноразовый capture на GitHub runner прогнал **200 seeds × 22 production levels = 4400 полных попыток** одной и той же objective-aware policy `getHintMove() → attemptSwap()`. Capture успел полностью вывести отчёт; importer затем завершился failure только из-за Vitest worker RPC timeout после одного 96.9-секундного теста. Поэтому R2 не повторяет измерение в обычном CI: snapshot сохранён в `docs/reports/ANM025E5A_MATCH3_AUTO_AUDIT.json`, а повторный deep audit вынесен в ручную команду `npm run match3:audit` и разбит на короткие per-level cases.

Это **не human win-rate** и не доказательство fun. Это воспроизводимый comparative instrument для обнаружения резких spikes, RNG sensitivity и низкой board activity.

## Текущая кривая агента

| Level | Win | Median moves | Specials / move | Cascade 2+ | Signal |
|---|---:|---:|---:|---:|---|
| M3_00 | 76.0% | 6 / 24 | 0.193 | 0.324 | moderate |
| M3_01 | 76.0% | 12 / 26 | 0.164 | 0.328 | moderate |
| M3_02 | 56.0% | 20.5 / 25 | 0.169 | 0.299 | hard |
| M3_03 | 55.0% | 23 / 27 | 0.171 | 0.310 | hard |
| M3_04 | 67.0% | 18 / 28 | 0.108 | 0.246 | moderate |
| M3_05 | 65.5% | 18 / 27 | 0.166 | 0.318 | moderate |
| M3_06 | 9.5% | 29 / 29 | 0.076 | 0.213 | **SEVERE SPIKE** |
| M3_07 | 71.5% | 16 / 28 | 0.171 | 0.330 | moderate |
| M3_08 | 64.5% | 21.5 / 30 | 0.172 | 0.335 | moderate |
| M3_09 | 33.0% | 29 / 29 | 0.150 | 0.294 | **VERY HARD** |
| M3_10 | 54.0% | 27 / 28 | 0.185 | 0.312 | hard |
| M3_11 | 2.0% | 29 / 29 | 0.114 | 0.235 | **SEVERE SPIKE** |
| M3_12 | 70.5% | 18 / 28 | 0.135 | 0.278 | moderate |
| M3_13 | 73.0% | 16 / 30 | 0.170 | 0.324 | moderate |
| M3_14 | 38.5% | 29 / 29 | 0.155 | 0.299 | **VERY HARD** |
| M3_15 | 21.5% | 30 / 30 | 0.169 | 0.313 | **VERY HARD** |
| M3_16 | 68.5% | 16 / 29 | 0.158 | 0.317 | moderate |
| M3_17 | 63.5% | 23 / 30 | 0.126 | 0.260 | moderate |
| M3_18 | 53.5% | 29 / 31 | 0.158 | 0.317 | hard |
| M3_19 | 70.0% | 18 / 30 | 0.173 | 0.334 | moderate |
| M3_20 | 66.5% | 21 / 31 | 0.162 | 0.317 | moderate |
| M3_21 | 67.5% | 21 / 29 | 0.119 | 0.265 | moderate |

## Главные выводы

1. Кривая сейчас не выглядит намеренной волной. После умеренных M3_00–05 идёт обрыв M3_06 (9.5%), затем relief M3_07–08, новый провал M3_09, почти нормальный M3_10, экстремальный M3_11 (2%), затем снова relief M3_12–13. Поздняя пара M3_14–15 снова резко тяжелее, после чего M3_16–21 возвращаются в в основном 53–70%.
2. **M3_06 и M3_11 — первоочередные auto-balance outliers.** Их значения настолько далеки от соседей, что их стоит исправить до массового human playtest.
3. **M3_09, M3_14, M3_15 — второй tuning cohort.** У них высокая completion fraction на проигрыше (~0.78), то есть агент часто почти завершает цели, но упирается в move budget/route efficiency. Это хороший кандидат для bounded moves/objective/placement tuning, а не новых mechanics.
4. M3_06 одновременно имеет самую низкую special activity (`0.0757 specials / valid move`) и низкий cascade2+ rate (`0.2129`), поэтому проблема может быть не только difficulty, но и ощущением менее «сочного» поля.
5. M3_11 имеет высокий reshuffle rate (`3.07%` valid moves) относительно большинства уровней и severe win-rate; shaped topology/ingredient routing нужно проверить отдельно.

## Proposed agent target wave (не human target)

Следующий tuning pass должен стремиться не к монотонному росту, а к волне: onboarding → challenge → relief → challenge → relief → climax. Для objective-aware агента предлагается **диагностический**, а не release, envelope:

- onboarding M3_00–01: ~70–85%;
- normal/early M3_02–05: ~55–75%;
- challenge beats: ~40–60%;
- relief/novelty beats: ~60–75%;
- ни один production level без явной design-причины не должен сидеть <30% у этого же comparator;
- значения <20% считаются красным auto-audit flag и требуют human verification/tuning.

## Следующий implementation slice

**E5B1:** исправить только M3_06 и M3_11, повторить 200-seed audit и не ухудшить соседние уровни. Затем **E5B2:** M3_09/M3_14/M3_15. После удаления gross spikes запускать human playtest telemetry; нет смысла отправлять людям заведомо 2–10% comparator outliers и смешивать balance defects с субъективным fun feedback.

Human telemetry уже существует локально и экспортирует per-level win/loss/abandon, hints, invalid moves, reshuffles, specials, direct activations, cascades, retries, continuation, duration и move gaps. Следующий human slice должен добавить только короткую субъективную оценку `Fun 1–5` + `too easy / right / too hard`, а не новый analytics backend.
