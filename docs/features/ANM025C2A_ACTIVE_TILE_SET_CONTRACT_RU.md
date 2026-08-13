# ANM-025C2A — Active Tile Set Contract

## Причина изменения

ANM-025C1 отделил presentation от Match-3 правил, но исходный контракт всё ещё предполагал шесть глобальных `TileKey` и потенциальный art override через presentation profile.

Для UPDS этого недостаточно: на отдельных уровнях до четырёх из шести активных match-types должны быть **разными видами трусиков**. Они обязаны заметно различаться визуально и матчиться только с идентичными экземплярами своего вида.

## Главный инвариант

`Match3TileId` — это одновременно:

- конкретная match identity;
- конкретная визуальная identity;
- единица collect-objective и progress.

Категория (`panties`, `bra`, `towel` и т.д.) является metadata и **не участвует в match equality**.

Разные `Match3TileId` не должны становиться визуально одинаковыми внутри одного active set.

## Active tile set

Каждый `LevelDefinition` явно хранит `activeTiles`.

Production contract:

- ровно 6 активных match-types на уровне;
- все ID уникальны;
- initial fill, refill после cascade и reshuffle используют только `level.activeTiles`;
- collect-objective может ссылаться только на активный tile ID;
- до 4 активных типов могут иметь `category: 'panties'`;
- разные активные IDs не могут использовать один и тот же core asset.

На C2A четыре существующих уровня намеренно сохраняют старые шесть IDs в прежнем порядке. Это архитектурная миграция без нового арта и без намеренного изменения текущих seeded boards/balance.

## Presentation profile после C2A

`tilePresentationProfile` остаётся narrative/art-direction metadata (`locker-laundry`, `photo-props`, `pool-service`, `ordered-return`).

Он больше **не имеет права заменять core asset** конкретного match ID. Core asset и category принадлежат самому `Match3TileId` через tile catalog/presentation entry.

Это исключает ситуацию, когда две визуально разные вещи неожиданно считаются одним match-type.

## Что будет в C2B

Production Tile Art Pack добавит новые concrete IDs и реальные различимые изображения, после чего один из уровней впервые перейдёт, например, на:

- panties A;
- panties B;
- panties C;
- panties D;
- support item A;
- support item B.

Только после появления реальных разных assets такой состав допустим в runtime.

## Что остаётся позже для Level Lab

Level Lab должен редактировать независимо:

- `activeTiles`;
- future `spawnWeights`;
- opening layout;
- objectives;
- page background;
- board surface/frame;
- narrative/presentation profile.

C2A **не добавляет spawn weights** и не меняет механику special combinations.
