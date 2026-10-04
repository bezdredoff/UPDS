# Политика версий UPDS

Эта политика нужна, чтобы player-visible версия, текущий feature candidate и конкретный CI build не расходились между ветками, чатами и локальными копиями.

## Что означает каждая метка

- `APP_VERSION` (`src/appVersion.ts`) — версия игры, видимая в меню и диагностике, а также записываемая в metadata сохранений и telemetry. Она должна различать изменения production runtime между merge в `main`.
- `BUILD_LABEL` (`src/appVersion.ts`) — человекочитаемый baseline текущего production milestone. Он меняется при переходе на другой milestone, но не обязан меняться при каждом PR внутри того же milestone.
- `BUILD_ID` и timestamp — идентификаторы одной конкретной сборки. Они не заменяют `APP_VERSION` или `BUILD_LABEL`.
- `package.json.version` — версия npm package. Она отдельная и не меняется при обычной разработке игры.
- Save schema version — отдельная совместимость формата сохранения. Bump `APP_VERSION` сам по себе не требует migration или смены schema.

## Когда повышать `APP_VERSION`

**Каждый PR, меняющий player-facing production build, обязан повышать `APP_VERSION`.** CI относит к таким изменениям любые файлы в `src/**`, `public/**`, корневой `index.html` и `vite.config.ts`: gameplay, интерфейс, story/localization, уровни, production art, persistence и настройки сборки.

- Обычный fix, copy/content, balance, art или presentation update: повысить patch, например `0.27.0-dev` → `0.27.1-dev`.
- Новая заметная player-facing capability: повысить minor и обнулить patch, например `0.27.1-dev` → `0.28.0-dev`.
- Major bump или переход с `-dev` на release semver делается только в согласованном release/compatibility milestone.
- PR только с документацией, тестами вне `src/**`, CI/tooling вне production paths или метаданными release dashboard не повышает `APP_VERSION`.

Не объединять несколько production PR с одной и той же версией. Если параллельная ветка основана на старом version base, после обновления `main` нужно выбрать следующий свободный bump и обновить roadmap.

## `BUILD_LABEL` и roadmap

`BUILD_LABEL` должен называть активный production milestone, а roadmap должен содержать его ANM identity и ту же `APP_VERSION`. Оставлять старый label допустимо только пока новый PR остаётся в рамках того же milestone. При переключении фокуса на другую активную production-задачу label обновляется в том же PR.

Перед PR проверьте `src/appVersion.ts`, `docs/ROADMAP_RU.md` и `docs/release-status.json`. PR template требует явно отметить решение по версии; `npm run version:check` и GitHub Quality gate проверяют связь с roadmap и обязательный bump относительно base SHA для production-facing PR.

## Что CI проверяет

- Версия в `src/appVersion.ts` совпадает со строкой `Technical product version` и текущим candidate label в roadmap.
- На PR, затрагивающем production paths, текущая semver выше версии в base SHA.
- Docs/test/tooling-only PR не требует искусственного bump.

Если проверка упала, сначала обновите `APP_VERSION` и roadmap в текущем PR либо уберите из него не относящееся production изменение. Не обходите gate комментарием или ручным исключением.
