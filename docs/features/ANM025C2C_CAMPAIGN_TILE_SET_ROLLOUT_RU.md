# ANM-025C2C — Campaign Tile Set Rollout

## Цель

Завершить ANM-025C на текущем четырёхуровневом vertical slice без производства лишнего одноразового арта: использовать общий каталог уже существующих Match-3 фишек повторно, но менять состав шести активных match-types в зависимости от нарратива уровня.

## Production principle

Разнообразие кампании не требует уникального набора PNG для каждого уровня.

На каждом уровне остаётся ровно шесть активных match identities. Один и тот же конкретный `Match3TileId` можно повторно использовать в нескольких уровнях. Разные panties IDs остаются разными match identities и матчятся только с идентичными экземплярами.

До появления spawn weights доля panties регулируется грубо числом panties slots среди шести активных типов:

- `M3_00` locker-laundry — 4/6 panties types;
- `M3_01` photo-props — 3/6 panties types;
- `M3_02` pool-service — 2/6 panties types;
- `M3_03` ordered-return — 3/6 panties types.

Это не заменяет будущие spawn weights: внутри текущего engine все шесть активных IDs по-прежнему выбираются равновероятно при refill.

## Составы уровней

### M3_00 — locker-laundry

Сохраняет C2B Golden Sample:

- `pantiesSportWhite`;
- `pantiesLacePink`;
- `pantiesHighWaistBlack`;
- `pantiesBoyshortBlue`;
- `sportsBra`;
- `laundryTag`.

### M3_01 — photo-props

Более декоративный/постановочный набор:

- `pantiesLacePink`;
- `pantiesHighWaistBlack`;
- legacy coral `panties`;
- `camisole`;
- `sportsBra`;
- `laundryTag`.

### M3_02 — pool-service

Более спортивный и laundry-oriented набор:

- `pantiesSportWhite`;
- `pantiesBoyshortBlue`;
- `sportsBra`;
- `towel`;
- `laundryTag`;
- `socks`.

### M3_03 — ordered-return

Аккуратный mixed-laundry набор:

- `pantiesSportWhite`;
- `pantiesHighWaistBlack`;
- `pantiesBoyshortBlue`;
- `camisole`;
- `socks`;
- `laundryTag`.

Generic `towel` намеренно не используется в M3_03: в этом уровне `damagedTowel` является отдельным ingredient/evidence objective, поэтому обычный towel tile создавал бы лишнюю визуальную неоднозначность.

## Что не входит

C2C не меняет:

- Match-3 engine / match equality;
- число активных типов (6);
- spawn weights;
- moves;
- blockers;
- special combinations;
- save schema;
- VN/canon;
- background / board-surface contracts.

## Следующий шаг

После C2C ANM-025C Tile Presentation / Variation Expansion считается завершённым для текущего vertical slice. Следующий production slice — **ANM-025D Tutorial Framework**. Spawn weights и окончательный balance остаются для Level Lab / ANM-025E.
