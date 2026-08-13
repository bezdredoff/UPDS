# ANM-027C — Story Import Format & Completeness Tooling

## Цель

Подготовить сценарный pipeline к массовому импорту контента так, чтобы потерянные строки, неполные ветки и контент вне runtime graph обнаруживались автоматически до merge.

027C не меняет runtime, save schema, VN presentation или Match-3.

## Формат

Вводится `upds-story-content-v1`.

Manifest хранится рядом с source screenplay и содержит:

- `sourceId`;
- `episodeId`;
- `sourcePath`;
- ожидаемый непрерывный диапазон base line IDs;
- формальные branch ranges и обязательные variants;
- `deferredLineIds` — строки, осознанно присутствующие в source, но ещё не включённые в runtime graph.

Текущий vertical slice описан в:

`src/content/story/ANM003.vertical-slice.story.json`.

## Pure tooling

`src/content/storyContentFormat.ts` предоставляет:

- `parseStoryContentLines(source)`;
- `auditStoryContent(source, manifest, graph)`;
- типизированные issue codes.

Validator проверяет:

1. формат manifest;
2. episode присутствует в graph;
3. корректные и уникальные line IDs;
4. отсутствие дыр в base numeric sequence;
5. полноту branch variants;
6. наличие контента во всех runtime scene ranges;
7. отсутствие незаявленного контента вне graph;
8. существование и корректность deferred lines.

## Реальный найденный edge case

Source screenplay содержит `VN0250` — optional teaser после `VN0249`, тогда как текущий runtime graph осознанно заканчивается на `VN0249`.

Раньше это было неявным знанием. 027C фиксирует:

`deferredLineIds: ["VN0250"]`.

Если строку позже добавят в runtime scene, validator потребует убрать её из deferred списка. Если появится новая строка вне graph без явного решения, CI упадёт.

## Branch completeness

Текущий `CHOICE_00` формализован как диапазон `VN0041..VN0046` с вариантами `A/B/C`.

Удаление, например, `VN0043C` теперь является автоматической ошибкой content audit.

## Команда

Для быстрого точечного gate:

`npm run story:audit`

Полный `npm run check` всё равно запускает этот test через общий Vitest suite.

## Следующий шаг

ANM-027D может использовать этот contract для controlled full-story import:

`source content -> v1 manifest/audit -> graph mapping -> generated/runtime content`.

До 027D текущий `narrative.ts` и Markdown parser остаются runtime source of truth.
