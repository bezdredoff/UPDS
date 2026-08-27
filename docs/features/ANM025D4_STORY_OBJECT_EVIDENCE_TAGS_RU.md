# ANM-025D4 — Story-object Evidence Tags

## Цель

Закрыть measured ambiguity, зафиксированную D3: 27 семантически разных Match-3 story objects сейчас используют только четыре физических runtime-изображения.

Вместо немедленного производства 27 отдельных PNG D4 добавляет второй независимый канал идентификации: стабильный номер улики `01–27`.

Тот же номер показывается:

- на story object внутри board cell;
- на соответствующей иконке objective HUD;
- на intro objective card до старта уровня.

Это позволяет игроку мгновенно связать объект на поле с конкретной целью даже тогда, когда базовый receipt/card/towel/key art переиспользуется для разных сюжетных сущностей.

## Presentation source of truth

`src/data/match3StoryObjectPresentation.ts`

- ровно 27 ingredient identities;
- ровно 27 уникальных двухзначных tags;
- tags стабильны и не зависят от locale;
- это presentation metadata, а не gameplay data.

Номер не заменяет локализованное имя объекта. Он работает как case/evidence label и всегда показывается рядом с уже существующим локализованным objective text / aria-label.

## Motion causality

Board badge рендерится **внутри существующего `.tile-stack`**. Поэтому он автоматически участвует в тех же:

- drag/swap transforms;
- settle/fall motion;
- spawn motion;
- clear animation;
- reshuffle animation.

Новый animation/controller state не вводится.

## HUD geometry

Objective icon получает локальный wrapper `.objective-evidence-icon`, сохраняющий существующие `30px / 23px` и multi-icon `20px / 16px` размеры.

Badge компактный и overlay-only: он не увеличивает objective width/height и не меняет board-cell geometry.

## Что намеренно не меняется

- четыре существующих physical fallback assets;
- ingredient placements и drop rules;
- objective targets;
- gravity, swaps, cascades, specials и blockers;
- level definitions / seeds / move budgets;
- controller/frame schema;
- telemetry/save/localization;
- Hint, Help и tutorials.

## Automated contract

`Match3StoryObjectEvidenceTags.test.ts` проверяет:

1. 27/27 identities имеют уникальные tags `01–27`;
2. board ingredient и objective icon получают один и тот же tag;
3. `dropGroup` сохраняет отдельный tag для каждого icon;
4. collect/blocker objectives не получают evidence tags;
5. board badge остаётся внутри motion-coupled `tile-stack`;
6. stylesheet загружается после базового Match-3 production CSS.

Новый standalone Playwright spec не добавляется.

## iPhone QA

Проверить несколько representative levels через `?qa=1` / Match-3 Campaign или Level Lab run:

- M3_00: receipt должен иметь `01` и тот же `01` в objective HUD;
- M3_03: grouped objective должен показывать отдельные `01` и `04`;
- более поздний receipt-like / memory-card-like story object должен иметь другой номер несмотря на тот же base art;
- badge не перекрывает blocker layer badge и не мешает чтению special/tile;
- во время падения story object номер визуально движется вместе с объектом;
- HUD и board geometry не изменились на узком portrait viewport.

## Результат для slice D

После D4 четыре shared assets больше не являются единственным визуальным каналом идентичности story objects. D1 закрывает special impact tracing, D2 — blocker readability, D3 — measured asset ambiguity, D4 — player-facing story-object disambiguation.

Если iPhone QA подтверждает читаемость, slice D можно считать закрытым без производства 27 новых story-object assets. Отдельные premium/hero replacements остаются art-polish задачей, а не blocker для visual causality.
