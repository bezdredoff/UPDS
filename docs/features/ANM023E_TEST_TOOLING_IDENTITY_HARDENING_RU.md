# ANM-023E R1 — Test, Tooling & Identity Hardening

## Зачем

Два последовательных localization candidates показали одну и ту же системную проблему: feature-specific тесты проходили, а importer падал из-за assertions, которые фиксировали временный lifecycle status предыдущей фичи (`IN QA`). Такой тест становится ложным сразу после merge.

## Контракт тестов

- тесты проверяют долговечные инварианты: bounded content scope, document/index presence, runtime contracts и связь текущего `BUILD_LABEL` с roadmap;
- статусы `IN QA`/`COMPLETE` не фиксируются в тестах предыдущих атомов, если сам статус по определению меняется при merge;
- завершённый feature может проверяться по стабильному идентификатору/документу, но не по бывшему переходному статусу;
- текущая feature identity берётся из `BUILD_LABEL`, а не дублируется отдельной строкой в тесте.

## Package / build identity

- `package.json.name`: `class-u-detectives`;
- `package.json.version`: внутренняя npm/package metadata; она не является player-facing версией игры;
- `APP_VERSION` в `src/appVersion.ts`: canonical player-facing product semver dev-line;
- `BUILD_LABEL` остаётся независимым feature/baseline identity;
- `BUILD_ID` остаётся уникальной идентичностью конкретной CI-сборки.

Product semver намеренно не выводится ни из `BUILD_LABEL`, ни из npm package metadata: package, ANM feature и player-facing product version имеют разные жизненные циклы. Изменение `APP_VERSION` само по себе не меняет save schema и не требует migration.

## Biome

Biome добавлен как exact-pinned devDependency и включён в `npm run check` перед тестами и build. Начальный blocking ruleset намеренно узкий: production `src`/Vite config проверяются на unused imports/variables/parameters, `debugger` и duplicate object keys; тесты отдельно блокируют focused tests (`.only`). Это даёт реальный статический gate без одномоментного style migration всего production tree.

Formatter доступен отдельными командами и не переписывает файлы в CI.

## B3B recovery

Отклонённый ANM-029B3B R1 не считается content failure: его bounded Belarusian slot-1 test прошёл. После merge этого hardening-пакета B3B должен быть повторно собран на новом `main` с теми же 178 переводными ключами и новым `baseSha`.
