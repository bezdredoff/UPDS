# ANM-019D · Localized Screenplay Runtime

Build: `0.19.3-anm019d`.

## Цель

Сделать VN screenplay locale-aware без изменения authored VN IDs, branching, save semantics и paging algorithm.

## Scope

- `VN0001`–`VN0022` имеют полноценные ru/en speaker/emotion/text keys;
- runtime разрешает localized display fields по стабильному `VN...` ID;
- untranslated VN lines продолжают использовать authored Russian fallback;
- render-measured paging получает уже локализованный text;
- history и reading-config chrome локализованы;
- character/expression routing и background directives продолжают использовать authored metadata.

## QA

Выбрать English и начать New Game. Пролог должен быть полностью английским; длинные реплики должны сохранять двухстрочный paging и continuation semantics. После перехода к следующей сцене русский текст пока является ожидаемым fallback.
