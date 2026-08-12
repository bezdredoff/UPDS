# ANM-025B — Narrative Level Context

Статус: candidate.

## Цель

Match-3 должен быть продолжением непосредственно предшествующей VN-сцены, а не универсальной головоломкой поверх случайного оформления.

025B разделяет контекст уровня на независимые слои:

- `sourceSceneId` — VN-сцена, которая передаёт управление Match-3;
- `pageBackground` — **общий фон всей страницы Match-3** за HUD, board и tooltray;
- `boardSurface` — локальная подложка непосредственно под grid;
- `boardFrame` — материал/рамка игрового поля;
- `narrativeProfile` — стабильный ключ для contextual hints/barks в 025F;
- `participants` — персонажи, релевантные расследованию;
- `narrativeTags` — семантические теги для Level Lab/контента.

Это намеренно не одно поле `background`: общий фон страницы и поверхность Match-3 имеют разные обязанности и должны независимо настраиваться.

## Runtime

`Match3Controller` использует `pageBackground` одинаково для:

1. level intro;
2. gameplay screen;
3. evidence transition после победы.

`boardSurface`, `boardFrame` и `narrativeProfile` публикуются как `data-m3-*` атрибуты. Production CSS уже даёт четырём текущим уровням разные локальные материалы board без новых art assets; будущие production assets смогут заменить эти surfaces, не меняя gameplay controller.

## Narrative continuity gate

Automated test находит `sourceSceneId`, вычисляет фактический фон **последнего кадра** предшествующей VN-сцены через `getBackgroundForLine()` и требует совпадения с `pageBackground` Match-3.

Это важно для M3_00: default background pre-scene начинается в клубной комнате, но к handoff сцена уже переходит в раздевалку. Контракт проверяет именно фактический handoff, а не default scene metadata.

## Что намеренно не входит

025B не меняет:

- `Match3Game`;
- seed/determinism;
- starting tile distribution;
- spawn probabilities;
- move budgets/objectives;
- contextual bark text.

Текущий engine всё ещё использует равномерный `randomTile()`/`shuffledTileKeys()`. Настройка стартовой пропорции и spawn weights должна получить отдельный data contract, а конкретные значения удобно редактировать/валидировать через ANM-026 Level Lab перед финальным ANM-025E balance pass.

Полноценные narrative reactions используют `narrativeProfile` в ANM-025F.

## Текущие профили

- M3_00: athletics locker → locker bench / evidence file → `locker-search`;
- M3_01: Kentaro apartment → photo contact sheet / photo file → `photo-alibi`;
- M3_02: pool locker → wet service tile / wet service frame → `pool-laundry`;
- M3_03: Norihiro apartment → ordered cabinet / precision file → `ordered-inspection`.
