# ANM-025E3 — Quantitative Match-3 Balance

## Цель

После ANM-025E1 и E2 балансировать уже сфокусированные objectives и корректную objective-aware guidance, не маскируя проблемы большим запасом ходов.

## Методика

Используется deterministic comparative simulation через публичный `Match3Game`:

- 500 seed на уровень: `100000..100499`;
- policy: повторять `getHintMove()` → `attemptSwap()` до win/loss;
- direct double-tap special activation отдельно не моделируется, поэтому метрика считается консервативным сравнительным lower bound, а не прогнозом реального human win rate;
- одна и та же policy и один и тот же seed sample применяются к baseline и candidate.

## Найденный bottleneck

После E1/E2 blocker objectives завершаются примерно в 98–100% simulation runs. Основной failure mode — ingredient route: narrative ingredient стартовал высоко и в нескольких уровнях находился над длинным blocker corridor.

Простое увеличение `moves` не устраняло эту проблему достаточно эффективно, поэтому E3 не меняет move budgets.

## Production tuning

Move budgets остаются:

- M3_00 — 24;
- M3_01 — 26;
- M3_02 — 25;
- M3_03 — 27.

Стартовые ingredient indices:

- M3_00 receipt: `51`;
- M3_01 memoryCard: `50`;
- M3_02 serviceKey: `42`;
- M3_03 receipt/damagedTowel: `50`, `53`.

Spawn weights в этом pass не задаются: simulation показала, что главным рычагом является маршрут narrative ingredient, а не частота конкретных match identities.

## Сравнительный результат

На sample `100000..100499` hint-following win rate изменился:

| Level | E2 baseline | E3 candidate |
| --- | ---: | ---: |
| M3_00 | 60.8% | 78.2% |
| M3_01 | 57.8% | 68.6% |
| M3_02 | 52.4% | 63.2% |
| M3_03 | 26.8% | 57.2% |

Получается читаемая ранняя difficulty curve без изменения механики, количества objectives или move budgets. M3_03 остаётся самым требовательным уровнем из-за двух narrative ingredients.

## Automated contract

`Match3QuantitativeBalance.test.ts` проверяет:

- неизменность move budgets;
- production ingredient placements;
- отсутствие искусственных spawn-weight overrides в этом pass;
- loose deterministic lower-bound envelope на 40 фиксированных seed через публичный gameplay API.

Envelope намеренно не фиксирует точный процент: будущий осознанный rebalance допустим, но крупная случайная деградация должна стать заметной в CI.

## Что не входит

- новые mechanics;
- изменение objective structure;
- новые blockers/board shapes;
- spawn-weight tuning;
- human-target win-rate claims;
- финальная difficulty calibration по реальной telemetry.

После merge нужен ручной iPhone QA и затем, при необходимости, короткий E4/manual calibration pass перед ANM-025F.
