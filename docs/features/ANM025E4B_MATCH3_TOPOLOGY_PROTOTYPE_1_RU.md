# ANM-025E4B — Match-3 Topology Prototype 1

Build label: `ANM-025E4B R4 · Match-3 Topology Prototype 1`.

## Цель

Проверить первую gameplay-гипотезу Match-3 Fun Pass после E4A: существующие правила UPDS могут ощущаться заметно разнообразнее, если production-уровни используют разные пространственные ситуации и authored start setup вместо повторения одного полного 8×8 поля.

E4B намеренно меняет только topology/start-layout четырёх репрезентативных уровней. Move budgets, objectives, active tile sets, spawn weights, blocker behaviours, specials, Story rewards и Campaign ordering не меняются. Это сохраняет причинность эксперимента: после merge можно сравнивать именно эффект topology.

## Production cohort

### M3_00 — Controlled Tutorial

Полное 8×8 поле остаётся контрольной формой. `initialTiles` создаёт authored возможность одним ходом `2 ↔ 10` собрать четыре `pantiesSportWhite` в верхнем ряду и создать `flash-row`.

Старт не содержит готового special или immediate match: игрок должен сам заметить и выполнить ход.

```text
########
########
########
########
########
########
########
########
```

### M3_02 — Foam Basin

`boardHoles = [0, 1, 6, 7, 8, 15, 48, 55, 56, 57, 62, 63]`.

```text
..####..
.######.
########
########
########
########
.######.
..####..
```

52 активные клетки. Пена остаётся существующим `foam` blocker без locked-cell поведения; цель — ощущение большой концентрированной зоны очистки, где line/area specials и cascades ценнее обычного одиночного прогресса.

### M3_04 — Facts vs Rumors

`boardHoles = [3, 4, 11, 12, 51, 52, 59, 60]`.

```text
###..###
###..###
########
########
########
########
###..###
###..###
```

56 активных клеток. Верх/низ визуально делятся на левую и правую группы, а центральные ряды связывают их. `laundryCalendar` остаётся на index 27 и проходит через активную центральную bridge-lane.

### M3_06 — Two Workbenches

`boardHoles = [3, 4, 11, 12, 19, 20, 43, 44, 51, 52, 59, 60]`.

```text
###..###
###..###
###..###
########
########
###..###
###..###
###..###
```

52 активные клетки. `warrantyCard` и `silverSpool` стартуют в отдельных колонках 2 и 5. Existing `garmentBag` blockers в этих же lane создают две параллельные evidence routes; игрок может выбирать, какую рабочую зону продвигать первой.

## Production parity

Topology хранится в canonical `src/data/levels.ts` через уже существующие `LevelDefinition.boardHoles` и `initialTiles`.

Story, Match-3 Campaign и Level Lab не получают отдельных prototype implementations: все три пути продолжают использовать один `LevelDefinition` и один `Match3Game`.

18 остальных production levels в E4B остаются legacy full-board без `boardHoles` и `initialTiles`. Это ограничивает эксперимент первой cohort и оставляет E4C отдельным evidence-driven шагом.

## Automated acceptance

- `validateLevelDefinitions(levels)` остаётся без ошибок;
- `Match3BoardShapeStartLayout.test.ts` защищает bounded production adoption: только M3_00/02/04/06 могут использовать authored topology на этом этапе;
- `Match3TopologyPrototype.test.ts` фиксирует четыре разные silhouettes, active blocker/ingredient placements и playable deterministic starts;
- M3_00 contract доказывает authored one-move special creation;
- merged E4A all-22 deterministic baseline продолжает проверять terminating legal hint runs;
- существующий ANM-025E3 early-level quantitative guardrail остаётся без ослабления;
- authoritative gate — `npm run check` в GitHub importer/PR CI;
- общий `Match3Game` resolution contract считает blocker-layer damage частью прогресса матча: locked blocker может оставить matched tile на месте, поэтому корректный shaped-board ход может дать `2 tile clears + 1 blocker layer`;
- synthetic objective-guidance fixtures явно отключают production `boardHoles`/`initialTiles`, чтобы проверять guidance независимо от authored tutorial topology.

## Manual iPhone QA

После green candidate открыть `/preview/?qa=1` и проверить M3_00, M3_02, M3_04, M3_06 через Level Lab на production seed. Дополнительно spot-check Story/Campaign, чтобы подтвердить production parity.

Для каждого уровня проверить:

- holes визуально читаются как форма поля, а не как сломанные/непрогруженные клетки;
- hole нельзя тапнуть/drag-нуть как tile;
- gravity и refill не заполняют holes;
- ingredients проходят корректный активный маршрут и drop-out;
- specials пересекают shaped geometry без визуального/логического рассинхрона;
- portrait layout на iPhone не получает нового overflow/scale дефекта.

Fun QA:

1. уровень можно описать по spatial idea, а не только по названию blocker;
2. есть выбор между несколькими полезными направлениями прогресса;
3. поле создаёт anticipation/payoff для special;
4. форма не делает board менее читаемым;
5. после проигрыша Retry ощущается как осмысленная новая попытка, а не повтор той же рутины.

Особые проверки:

- **M3_00:** увидеть authored setup и вручную попробовать `2 ↔ 10`; special должен ощущаться как найденная возможность, а не автоматический подарок;
- **M3_02:** rounded basin + foam должны читаться как одна зона очистки;
- **M3_04:** split reports должны ощущаться как две группы, связанные центральным мостом;
- **M3_06:** warrantyCard/silverSpool должны ощущаться как две отдельные workbench routes.

## Не входит

- новые blocker behaviours;
- изменение `insight + special` jackpot;
- новые specials/boosters;
- изменение auto-hint delay;
- rebalance moves/objectives/spawnWeights;
- массовое изменение остальных 18 уровней;
- E4C advanced cohort (`M3_11`, `M3_12`, `M3_17`, `M3_21`).

## Следующий decision gate

E4C начинается только после green CI и ручного iPhone Fun QA первой cohort. Если shaped topology улучшает различимость/решения, advanced cohort расширяет язык puzzles. Если нет — корректируется сама spatial hypothesis, а не добавляются новые mechanics поверх непроверенного дизайна.
