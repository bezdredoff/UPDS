# ANM-025C1 — Tile Presentation Profile Contract

## Цель

Создать narrative presentation profile для Match-3. **Уточнение ANM-025C2A:** после продуктового решения о нескольких разных видах трусиков на одном поле concrete visual identity является частью `Match3TileId`; presentation profile больше не заменяет core asset.

После этой фичи движок по-прежнему знает только шесть `TileKey`:
`camisole`, `laundryTag`, `panties`, `towel`, `socks`, `sportsBra`.

## Контракт

Каждый `Match3LevelContext` получает отдельный `tilePresentationProfile`:

- `locker-laundry`;
- `photo-props`;
- `pool-service`;
- `ordered-return`.

`Match3Controller` больше не выбирает PNG напрямую из `tilePresentation`. Board cells, collect-objectives и preload проходят через `resolveMatch3TilePresentation(profile, tile)`.

Профиль отвечает за **art direction / narrative metadata**, но после ANM-025C2A не может подменять core asset конкретного match ID. Он не имеет права менять:

- match legality;
- число gameplay типов;
- objective semantics;
- spawn probability;
- initial distribution;
- special-combination rules.

Эти правила остаются в `Match3Game` / level balance data.

## Уточнение контракта в ANM-025C2A

Разные визуально предметы, которые одновременно присутствуют на поле, являются **разными `Match3TileId`** и матчятся только с идентичным ID. Общая категория (`panties` и т.п.) не объединяет их для match rules.

## Текущий визуальный результат

025C1 намеренно не добавляет фальшивые hue-rotate/recolor варианты. В репозитории пока существует только по одному production PNG на каждый из шести TileKey, поэтому все четыре профиля используют безопасный base fallback.

Заметная визуальная разница появится в **ANM-025C2B Production Tile Art Pack**, где новые concrete tile IDs получат реальные отдельные изображения.

## Связь с Level Lab

Level Lab должен редактировать/выбирать `tilePresentationProfile` отдельно от будущих `spawnWeights` и `openingLayout`. Это позволяет менять внешний вид уровня независимо от его математического баланса.
