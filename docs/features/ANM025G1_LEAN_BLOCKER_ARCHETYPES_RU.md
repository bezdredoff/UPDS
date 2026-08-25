# ANM-025G1 — Lean Blocker Archetypes

Candidate label: `ANM-025G1 R1 · Lean Blocker Archetypes`.

## Причина

Human playtest M3_06–M3_16 показал, что сюжетные названия blocker-целей плохо помещаются в HUD и не всегда совпадают с тем, что игрок видит на поле. В production data при этом существовало 18 `BlockerKey`, хотя все уровни используют один `clearBlockers` contract, одинаковые `blockerLayers` и только четыре повторно используемых изображения.

G1 убирает ложную продуктовую сложность до дальнейшего Playtest UX + Telemetry pass. Сюжетная семантика остаётся в `storyAction`, narrative context и репликах; технический blocker contract больше её не дублирует.

## Lean contract

| Было | Стало |
|---|---|
| 18 сюжетных `BlockerKey` | 3 reusable visual styles: `locked`, `solid`, `overlay` |
| 4 blocker assets в runtime catalog | 3 assets, по одному на style |
| отдельное название blocker-цели в каждом уровне | один HUD-термин: `Преграды / Перашкоды / Blockers` |
| `foam` неявно управлял tile interaction | presentation style и permeability разделены |

Все три style используют одну механику: `clearBlockers`, placements и `blockerLayers`. Style отвечает за presentation, а не за сюжетный тип объекта.

## Production mapping

| Style | Уровни | Runtime asset |
|---|---|---|
| `locked` | M3_00, M3_05, M3_07, M3_10, M3_17, M3_19, M3_20 | `obstacle_locked_cell.png` |
| `solid` | M3_01, M3_03, M3_04, M3_06, M3_08, M3_09, M3_11, M3_13, M3_14, M3_18, M3_21 | `obstacle_prop_box_2layer.png` |
| `overlay` | M3_02, M3_12, M3_15, M3_16 | `obstacle_soap_foam.png` |

M3_02 исторически разрешал tile interaction и gravity сквозь blocker layer. Это поведение сохранено явным `blockerIsPermeable: true`. Остальные уровни, включая визуальные overlay M3_12/M3_15/M3_16, остаются blocking. Так G1 не превращается в скрытый balance pass.

## Что намеренно не меняется

- move budgets, objective kinds/targets и порядок целей;
- blocker placements, количество слоёв и правила их снятия;
- seeds, board holes, initial tiles, active tile sets и spawn weights;
- ingredient placements, drop routes и special rules;
- tutorial progress, save schema, telemetry schema и campaign progression;
- сюжет, clue IDs, narrative context и authored barks.

G1 также не решает прозрачность blocker art, читаемость фишек под overlay, FAQ, hint timing/quality, тексты invalid move и telemetry v2. Это отдельные атомарные PR следующего pass.

## Regression contract

`Match3LeanBlockerArchetypes.test.ts` фиксирует:

- ровно три style и три runtime assets;
- полный mapping всех 22 production levels;
- единственный permeability exception M3_02;
- единый blocker objective term в RU/BE/EN;
- ровно три blocker option в Level Lab;
- validator rejection для permeable non-overlay config.

Удаление 15 retired Level Lab aliases симметрично переводит RU/BE/EN base catalogs с `3870` на `3855` keys; exact parity и zero-fallback contract сохраняются.

Существующие topology, balance, localization, Level Lab и full-suite tests остаются обязательными.

## Preview / iPhone QA перед merge

1. Открыть Level Lab и убедиться, что blocker selector содержит только `locked / solid / overlay`.
2. Проверить M3_06 и M3_11: HUD показывает короткое `Преграды`, solid art совпадает между уровнями, placements и layer counters не изменились.
3. Проверить M3_12 и M3_16: используется общий overlay art, но blocker cells по-прежнему блокируют прямое перемещение до снятия слоя.
4. Проверить M3_02: swap, clear и gravity сквозь overlay продолжают работать как в baseline.
5. Проверить RU/BE/EN на intro и in-level HUD: blocker label помещается, остальные objective labels не изменены.
6. Завершить хотя бы один уровень и сделать retry одного уровня: progression, attempts и telemetry export не регрессировали.

Merge допускается после зелёного CI и этого manual preview gate.
