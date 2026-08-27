# ANM-025D2 — Blocker Readability

## Цель

Закрыть оставшийся после G1 визуальный blocker-readability gap без изменения механики, баланса или level data.

G1 уже сократил blocker vocabulary до трёх reusable archetypes (`locked`, `solid`, `overlay`) и оставил один исторический permeability exception: M3_02. D2 делает эти различия читаемыми прямо на production board.

## Изменения

- `locked` получает более жёсткий красно-золотой rim и контрастный lock art;
- `solid` получает плотный gold/navy frame и более тяжёлое чтение поверхности;
- `overlay` становится прозрачнее, чтобы retained base tile не исчезал под foam art;
- M3_02 (`pool-laundry`) — единственный permeable overlay — визуально ещё легче остальных overlay blockers;
- layer badge усилен по контрасту и размеру, чтобы `1/2` читались на маленьком mobile board scale;
- blocker presentation остаётся pointer-inert и не меняет hit targets/board geometry.

## Что намеренно не меняется

- `clearBlockers`, blocker placements и layer counts;
- `blockerIsPermeable` и единственный exception M3_02;
- swap legality, gravity, clears, cascades и move budgets;
- level objectives, seeds, board holes, ingredients и specials;
- engine/controller/frame schema;
- telemetry, save, tutorials, Hint и Help;
- сами PNG blocker assets.

## Почему CSS-only

Три archetype уже используют стабильные runtime assets. Для D2 достаточно presentation overrides поверх существующей DOM-разметки; новый controller state или новые data fields только увеличили бы regression surface.

Селекторы различают archetype по уже отрисованному blocker asset, а M3_02 — по существующему `data-m3-profile="pool-laundry"`. Это не вводит новую gameplay семантику.

## Automated contract

`Match3BlockerReadability.test.ts` фиксирует:

- отдельное presentation treatment для всех трёх archetype assets;
- единственный permeability exception M3_02;
- более лёгкое визуальное treatment для `pool-laundry` overlay;
- усиленный layer badge;
- production stylesheet loading после базового Match-3 CSS.

Новый standalone Playwright spec не добавляется.

## iPhone preview QA

1. M3_00 / другой `locked`: blocker сразу выглядит как закрытая клетка, layer badge читается.
2. M3_06 / другой `solid`: box blocker визуально не путается с lock и foam.
3. M3_12 / M3_16: blocking foam остаётся заметным, но base tile под ним читается.
4. M3_02: foam выглядит заметно легче, чем на blocking-overlay уровнях, и игрок видит base tile как доступный для interaction/gravity.
5. Проверить 1-layer и 2-layer cells на узком portrait viewport.
6. Board/HUD geometry, input hit targets и animation pacing не изменились.

## Следующий шаг D

После D2 остаётся отдельный asset-readability вопрос. Исходный remediation note упоминает четыре проблемных ассета, но их имена не были сохранены в repository source-of-truth. Их нельзя безопасно заменять по догадке; следующий pass должен сначала восстановить конкретный shortlist из visual QA/playtest evidence либо сформировать новый measured shortlist на текущем runtime.
