# UPDS — Test Strategy

Статус: active production contract, ANM-023.

GitHub CI и `npm run check` остаются authoritative automated gate. Локальный запуск полезен для быстрой обратной связи, но не заменяет GitHub CI.

## Категории тестов

### 1. Behavior

Проверяют наблюдаемое поведение через публичный API/контроллер/DOM, не устройство реализации.

Использовать по умолчанию для gameplay, progression, input, localization behavior и пользовательских сценариев.

### 2. Contract

Проверяют стабильные данные и границы между подсистемами: schema, IDs, save compatibility, asset metadata, level invariants, shared engine contracts.

Один production contract должен иметь один основной authoritative contract test. Не создавать несколько тестов, которые защищают одно и то же правило разными строковыми проверками.

### 3. Smoke

Проверяют, что критический путь может загрузиться/отрендериться без падения и очевидной интеграционной регрессии. Smoke не должен дублировать детальную behavior-спецификацию.

### 4. Source-audit

Читают исходники/workflow/docs как текст и проверяют структурные safety-инварианты, которые неудобно наблюдать через runtime: GitHub permissions, запрещённые legacy-файлы, protected pipeline paths, отсутствие retired implementation contracts.

Source-audit — исключение, а не основной стиль тестирования. Его нельзя использовать для проверки UI copy, layout или gameplay behavior, если это можно проверить через behavior/contract test.

## Правила ANM-023

- При изменении behavior сначала искать/создавать behavior test, а не `toContain()` по исходному коду.
- Source-string assertion должен защищать именно структурный контракт и быть явно понятен из имени теста.
- Retired implementation details удаляются из active tests/docs, а не сохраняются «на всякий случай».
- `.bak`, временные копии и альтернативные active workflow/test files не хранятся в production tree.
- При разделении большого файла тесты должны продолжать защищать внешнее поведение, а не прежнее расположение методов.
- Visual/mobile QA остаётся обязательным для визуальных/runtime изменений, но pipeline/docs-only PR не требует нерелевантного visual QA.

## Приоритет при рефакторинге

1. Сохранить behavior и production contracts.
2. Удалить дублирующие или retired assertions.
3. Заменить brittle source-audit тесты behavior/contract тестами там, где это практично.
4. Только после этого менять ownership boundaries и структуру файлов.
