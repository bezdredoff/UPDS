# ANM-027A — Story Graph Contract & Validator

## Цель

Заменить implicit vertical-slice структуру вида:

`numeric scene index + sceneStarts/sceneEnds + арифметика переходов`

на явный production contract, который можно безопасно расширять до полного сценария.

027A **не мигрирует runtime**. Он сначала создаёт тестируемый канонический graph поверх уже работающего vertical slice.

## Contract

`src/data/storyGraph.ts` вводит:

- `StoryEpisodeId`;
- `StoryChapterId`;
- `StorySceneId`;
- `StoryEndingId`;
- `StorySourceRange`;
- `StoryTransition`;
- `StorySceneDefinition`;
- `StoryChapterDefinition`;
- `StoryEpisodeDefinition`;
- `StoryGraph`.

Формат текущей версии:

`upds-story-graph-v1`.

## Текущий vertical slice

Один episode:

`EP001_CASE_001`.

Пять chapters:

1. `CH001_PROLOGUE`;
2. `CH002_LOCKER_SEARCH`;
3. `CH003_PHOTO_ALIBI`;
4. `CH004_POOL_LAUNDRY`;
5. `CH005_ORDERED_INSPECTION`.

Все девять существующих `VN_SCENE_*` получают явное место в episode/chapter graph.

## Явные transitions

Graph больше не требует выводить сюжетную связь из нечётности numeric scene index.

Каждая сцена явно заканчивается одним из:

- `scene → targetSceneId`;
- `match3 → levelId + onWinSceneId`;
- `ending → endingId`.

Все четыре production Match-3 уровня должны встречаться в graph ровно как story routes:

- `M3_00_LOCKER_TUTORIAL`;
- `M3_01_PHOTO_PROPS`;
- `M3_02_POOL_LAUNDRY`;
- `M3_03_ORDERED_APARTMENT`.

## Save compatibility

027A сохраняет текущий `CampaignSave.scene: number` и `SAVE_SCHEMA_VERSION = 2`.

Для будущей runtime migration добавлены адаптеры:

- `storySceneIdFromLegacyIndex`;
- `legacySceneIndexFromStoryId`;
- `storyTransitionForLegacyScene`.

Таким образом 027B сможет перевести routing на stable IDs без принудительной миграции существующих save.

## Validator

`validateStoryGraph()` проверяет:

- duplicate IDs;
- episode/chapter/scene references;
- contiguous legacy indices;
- 1:1 соответствие текущему `sceneMeta`;
- корректные и непрерывные screenplay ranges;
- ссылки transitions на существующие scenes;
- ссылки Match-3 transitions на production level IDs;
- reachability всех scenes от entry;
- полное Match-3 route coverage;
- ровно один terminal ending.

## Что намеренно не входит

- изменение `VnController`;
- изменение `CampaignStore`;
- save schema migration;
- новый content import format;
- импорт полного сценария;
- новые сцены/линии;
- изменение VN/Match-3 поведения.

## Дальнейший split ANM-027

- **027A** Story Graph Contract & Validator;
- **027B** Runtime Routing Migration — VN/Match-3/ending переходы читаются из graph;
- **027C** Story Import Format & Completeness Tooling;
- **027D** Full Story Import & transition QA.

Принцип: сначала стабильный contract, затем runtime migration, затем массовый content import.
