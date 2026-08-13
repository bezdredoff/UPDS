# ANM-027D — Canonical Story Runtime Import & Transition QA

## Решение по scope

Историческое название ANM-027 обещает `Full Story Content Architecture & Import`, однако в текущем репозитории авторским каноническим screenplay является только:

`src/content/ANM-003_Vertical_Slice_Screenplay.md`

Он покрывает существующий playable vertical slice: девять VN-сцен, четыре Match-3 handoff и optional teaser `VN0250`.

В репозитории нет отдельного полного screenplay эпизодов 4–21. Поэтому 027D **не сочиняет отсутствующий канон внутри технической фичи**. Он импортирует в production runtime весь реально существующий authored source и закрывает автоматический transition QA. Полный 22-episode screenplay остаётся отдельной content-production зависимостью до ANM-029/релиза.

## Новый canonical data flow

До 027D существовали две параллельные цепочки:

1. completeness tooling: Markdown → `storyContentFormat` → audit;
2. VN runtime: тот же Markdown → второй regex → `sceneStarts/sceneEnds` → runtime lines.

После 027D:

`ANM-003 Markdown → story manifest → audit/parser → canonicalStoryLines → storyGraph ranges → VN runtime`

Runtime больше не имеет собственного line parser или таблиц scene ranges.

## `storyRuntime.ts`

`src/content/storyRuntime.ts`:

- импортирует authored Markdown;
- импортирует `ANM003.vertical-slice.story.json`;
- прогоняет `auditStoryContent(..., storyGraph)`;
- fail-closed при любой audit issue;
- экспортирует только уже проверенные canonical lines и summary metadata.

Таким образом контент, который не проходит ANM-027C completeness contract, не может молча стать runtime content.

## `narrative.ts`

VN data facade сохраняет публичный API (`getScene`, `getReadHistory`, `sceneMeta`, backgrounds, choices), но:

- получает строки из `canonicalStoryLines`;
- получает границы сцены из `storyGraph`;
- больше не содержит `sceneStarts`;
- больше не содержит `sceneEnds`;
- больше не содержит второго `linePattern`/`screenplay.matchAll`.

Choice semantics A/B/C и conditional speaker resolution не меняются.

## Graph dependency direction

`storyGraph.ts` больше не импортирует `narrative.ts`.

Graph — pure domain/data contract. Проверка соответствия presentation metadata (`sceneMeta`) graph IDs выполняется в integration/regression tests, а не через обратную runtime dependency.

Это устраняет потенциальный цикл:

`narrative → story runtime → storyGraph → narrative`.

## Transition QA

Новый `StoryCanonicalRuntimeImport.test.ts` автоматически проверяет:

- canonical source = `ANM003_VERTICAL_SLICE`;
- 262 authored lines parsed;
- 261 lines назначены playable graph;
- `VN0250` остаётся единственной explicit deferred line;
- все девять graph scenes имеют runtime content для A/B/C;
- first/last line каждой runtime scene совпадают с graph range;
- весь playable graph проходится от entry до `ENDING_CASE_001` без циклов;
- все четыре Match-3 transitions встречаются в правильном порядке;
- у каждой Match-3 pre/post scene реально существует canonical content;
- `sceneMeta` остаётся 1:1 aligned с graph IDs;
- duplicate parser/range tables не возвращаются.

## Save/runtime compatibility

Не меняются:

- `CampaignSave.scene: number`;
- `SAVE_SCHEMA_VERSION = 2`;
- stable VN line IDs;
- `CHOICE_00` semantics;
- Match-3 level IDs;
- видимый сюжет vertical slice;
- ending behavior;
- localization contracts.

## Что означает завершение 027D

После 027D технический production pipeline story-content готов:

- 027A — graph contract;
- 027B — graph-driven runtime routing;
- 027C — import/completeness tooling;
- 027D — audited canonical runtime import + end-to-end transition QA.

Но это **не означает**, что отсутствующий screenplay эпизодов 4–21 уже написан. Перед ANM-029 Full Localization Production и release он должен быть создан как отдельный canonical content source и импортирован через уже готовый ANM-027 pipeline.
