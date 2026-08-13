# ANM-027B — Runtime Routing Migration

## Цель

Перевести работающий Story runtime с implicit numeric routing на канонический `storyGraph`, созданный в ANM-027A, не меняя существующий save format и не меняя видимое поведение vertical slice.

До 027B runtime полагался на три разных источника маршрутизации:

- `VnController`: `scene === 1/3/5/7`, `scene + 1`, `sceneMeta.length - 1`;
- `CampaignStore`: `levelForPreMatchScene()` и `postSceneForLevel()` с арифметикой индексов;
- `Match3Controller`: возврат в VN через `postSceneForLevel(levelIndex)`.

После 027B источник истины один:

`src/data/storyGraph.ts`.

## Runtime cutover

### VN → VN

`VnController.advanceScene()` читает `storyTransitionForLegacyScene()`.

Для `scene` transition target определяется стабильным `StorySceneId`, а текущий numeric save index получается только через compatibility adapter `legacySceneIndexFromStoryId()`.

### VN → Match-3

Для `match3` transition используется `storyMatch3RouteForLegacyScene()`.

Graph явно хранит:

- source scene;
- stable `levelId`;
- production `levelIndex`;
- `onWinSceneId`;
- legacy post-scene index.

`VnController` больше не определяет Match-3 сцены по нечётности numeric index.

### Match-3 → VN

`Match3Controller` использует `storyWinSceneIndexForLevelId(level.id)`.

Возврат после победы теперь определяется stable Match-3 level ID, а не выражением `level * 2 + 2`.

### Ending

Финал определяется `transition.kind === 'ending'`, а не сравнением с `sceneMeta.length - 1`.

## CampaignStore boundary

Story routing удалён из `CampaignStore`.

`CampaignStore` снова отвечает только за:

- normalize/save/load;
- compatibility/recovery;
- manual save;
- import/export.

Это важно для дальнейшего 027C/027D: расширение story graph не должно требовать изменений persistence layer.

## Save compatibility

027B намеренно сохраняет:

- `CampaignSave.scene: number`;
- `CampaignSave.line: number`;
- `SAVE_SCHEMA_VERSION = 2`;
- текущий save key.

То есть существующие сохранения не требуют migration.

Numeric `scene` после 027B — compatibility representation в persistence, а не источник логики маршрутизации.

## Fail-fast contract

Если runtime встретит transition, который validator должен был запретить (unknown target, missing Match-3 route), controller бросает явную ошибку вместо silent arithmetic fallback.

В production candidate это должно быть невозможно при зелёном `validateStoryGraph()`/CI.

## Automated coverage

`StoryRuntimeRouting.test.ts` проверяет:

- VN → VN graph routes;
- VN → Match-3 route resolution;
- Match-3 → VN by stable level ID;
- terminal ending;
- отсутствие старых routing helpers в `CampaignStore`;
- отсутствие numeric routing arithmetic в `VnController`;
- сохранение save schema v2.

Существующие `NarrativeContract` и `CampaignStore` tests также обновлены под новые ownership boundaries.

## Что не входит

- save schema migration на `sceneId`;
- новый story import format;
- новые chapters/scenes;
- массовый импорт полного сценария;
- изменение VN presentation;
- изменение Match-3 mechanics/balance.

## Следующий slice

**ANM-027C — Story Import Format & Completeness Tooling**

После runtime cutover можно безопасно определить production import schema и completeness validator, не привязывая импорт к one-off controller routing.
