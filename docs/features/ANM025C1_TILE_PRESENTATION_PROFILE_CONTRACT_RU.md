# ANM-025C1 — Tile Presentation Profile Contract

## Цель

Развязать **gameplay identity** фишки и её конкретное изображение, чтобы Match-3 мог визуально продолжать нарратив уровня без увеличения числа игровых цветов/типов.

После этой фичи движок по-прежнему знает только шесть `TileKey`:
`camisole`, `laundryTag`, `panties`, `towel`, `socks`, `sportsBra`.

## Контракт

Каждый `Match3LevelContext` получает отдельный `tilePresentationProfile`:

- `locker-laundry`;
- `photo-props`;
- `pool-service`;
- `ordered-return`.

`Match3Controller` больше не выбирает PNG напрямую из `tilePresentation`. Board cells, collect-objectives и preload проходят через `resolveMatch3TilePresentation(profile, tile)`.

Профиль отвечает **только за art**. Он не имеет права менять:

- match legality;
- число gameplay типов;
- objective semantics;
- spawn probability;
- initial distribution;
- special-combination rules.

Эти правила остаются в `Match3Game` / level balance data.

## Почему один art override на TileKey внутри профиля

На этом этапе один `(profile, TileKey)` резолвится в одно стабильное изображение. Поэтому при swap/fall та же логическая фишка не начинает внезапно выглядеть иначе только из-за смены клетки.

Если позже понадобится несколько визуальных вариантов **одного и того же TileKey одновременно на одной доске**, сначала нужен стабильный presentation identity/token, который перемещается вместе с фишкой. Не следует выбирать вариант по текущему cell index.

## Текущий визуальный результат

025C1 намеренно не добавляет фальшивые hue-rotate/recolor варианты. В репозитории пока существует только по одному production PNG на каждый из шести TileKey, поэтому все четыре профиля используют безопасный base fallback.

Заметная визуальная разница появится в **ANM-025C2 Production Tile Art Pack**, где profile overrides получат реальные отдельные изображения.

## Связь с Level Lab

Level Lab должен редактировать/выбирать `tilePresentationProfile` отдельно от будущих `spawnWeights` и `openingLayout`. Это позволяет менять внешний вид уровня независимо от его математического баланса.
