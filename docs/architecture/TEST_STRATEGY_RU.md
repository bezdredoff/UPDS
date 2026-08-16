# UPDS — Test Strategy

Статус: active production test-policy contract, reconciled through completed ANM-029B4 and the ANM-029H production planning reset.

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

Documentation traceability относится к source-audit только для high-risk authority links:
roadmap/status ownership, protected rig contract, story/character machine-readable sources и
delivery-lane limits. Не закреплять тестом каждую формулировку или историческую feature note.

## Правила ANM-023

- При изменении behavior сначала искать/создавать behavior test, а не `toContain()` по исходному коду.
- Source-string assertion должен защищать именно структурный контракт и быть явно понятен из имени теста.
- Retired implementation details удаляются из active tests/docs, а не сохраняются «на всякий случай».
- `.bak`, временные копии и альтернативные active workflow/test files не хранятся в production tree.
- При разделении большого файла тесты должны продолжать защищать внешнее поведение, а не прежнее расположение методов.
- Visual/mobile QA остаётся обязательным для визуальных/runtime изменений, но pipeline/docs-only PR не требует нерелевантного visual QA.
- Scene Studio may automate viewport/schema/alpha/pivot/containment coordinates, but visual style,
  anatomy, adult visual age, palette, lighting and perspective are intentionally manual Golden
  Sample gates. A green test cannot convert those judgments into an approval.
- Scene Studio regression tests must prove that scene actors use the playable `.portrait` crop,
  face-critical safe lanes and dialogue occlusion. Duo/trio tests also verify focal-eye-line camera
  math, selected-expression alpha/eye geometry and headroom. A separate full-body stage renderer,
  fixed-top multi-actor camera, stale neutral-only guide or actor shot scale below the contracted
  floor must fail before mobile QA.
- Asset completeness tests cannot assert visual approval. Runtime-integrated masters expose an
  explicit visual status; `rebuild-required` must remain visible in Studio/report/docs until a
  replacement neutral passes manual lineup QA.
- Candidate tests validate format, real RGBA, measured alpha bounds/eye line, approved-master
  geometry inheritance, Studio rendering and absence from runtime preload/rig. They cannot promote
  `manual-qa` to an approved expression; that remains the iPhone lineup/solo/duo/trio gate.
- Localization production tests distinguish structural completeness from linguistic/visual approval: key/placeholder parity can be automated, but translation quality and CJK overflow remain content/mobile QA gates. Translation-pending locales must not be exposed in runtime merely because fallback copy exists.
- Focused `story:audit`, `character:audit`, `scene:audit`, `localization:audit` и `docs:audit` ускоряют проверку, но не заменяют полный
  `npm run check` и GitHub Quality gate.

## ANM-023F — planned test/tooling simplification

ANM-029H делает следующий technical maintenance track явным:

- F1 расширяет Biome только через high-signal правила после diagnostic baseline; blanket preset/rule enablement с массовыми suppressions не является целью;
- F1 должен распространить полезный lint на `tests`, проверить ценность `format:check` как blocking gate и использовать safe fixes/import organization там, где они детерминированы;
- F2 начинает с инвентаризации уникальных contracts в текущих `110` test files, затем объединяет только реально дублирующиеся проверки и общий setup;
- exact historical roadmap wording не является production contract. Traceability тестирует durable status/authority invariants;
- уменьшение числа файлов/строк само по себе не является success metric. Поведенческая защита не должна ослабнуть.

## Приоритет при рефакторинге

1. Сохранить behavior и production contracts.
2. Удалить дублирующие или retired assertions.
3. Заменить brittle source-audit тесты behavior/contract тестами там, где это практично.
4. Только после этого менять ownership boundaries и структуру файлов.
