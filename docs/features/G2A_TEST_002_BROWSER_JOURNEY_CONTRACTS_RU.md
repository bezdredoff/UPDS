# G2a-TEST-002 — browser journey contracts without production source-shape coupling

## Цель

Снизить хрупкость fast/unit gate вокруг Playwright journeys: browser contract test должен защищать способ доказательства пользовательского поведения и запрет test-only shortcuts, но не требовать точного текста production-реализации.

## Проблема

`tests/BrowserPersistenceLocalizationFlowContract.test.ts` исторически читал сразу несколько production-файлов (`RuntimeServices`, `AppSession`, `MainMenuController`, `Match3Controller`, `VnController`, `storyGraph`, stores и UI helpers) и проверял конкретные строки реализации.

Из-за этого безопасный refactor мог ломать fast CI даже при неизменном публичном поведении. Практический пример — locale subscription: browser E2E уже проверяет немедленную смену языка и восстановление после reload, а `LocalizationFoundation.test.ts` отдельно проверяет `LocaleSettingsStore`; тем не менее контракт требовал буквально строку `localization.subscribe((locale) => localeSettings.save(locale))`.

## Новая граница

`BrowserPersistenceLocalizationFlowContract.test.ts` теперь читает только browser-level артефакты:

- `e2e/tests/persistence-localization-flow.pw.ts`;
- `e2e/helpers/flow.ts`;
- `e2e/selectors.ts`.

Он сохраняет проверки, которые действительно относятся к integrity browser journey:

- save/resume доказывается через `page.reload()` и видимый Continue;
- locale меняется через Settings selector и проверяется после настоящего reload;
- Story → Match-3 boundary проходит через публичный UI flow;
- helper/spec не имеют `localStorage.setItem`, `sessionStorage.setItem` или `__UPDS_TEST__` shortcut;
- browser helper не импортирует/не вызывает `Match3Controller.completeLevel()` для принудительного прохождения.

## Что больше не фиксируется здесь

Этот contract больше не проверяет точный текст production wiring:

- как `RuntimeServices` подписывает locale persistence;
- как `AppSession` загружает save;
- где именно `MainMenuController` вызывает reload/openScene;
- какие локальные переменные использует `Match3Controller` для post-win route;
- буквальное представление route records в `storyGraph.ts`.

Эти вещи должны защищаться на своём уровне: публичными unit/domain tests, architecture contracts или реальным browser behavior. Stable Story save key уже отдельно защищён `RepositoryHygiene.test.ts`; locale store/key — `LocalizationFoundation.test.ts`; post-win Story boundary имеет отдельный G8B browser journey/contract.

## Правило для следующих G2a slices

Source-reading contract допустим, когда он проверяет реально архитектурную границу, которую трудно выразить через публичный API: например запрет sibling-controller imports, единственный composition root или отсутствие hidden test mutation API.

Не стоит добавлять source-text assertion только ради того, чтобы зафиксировать имя локальной переменной, порядок внутренних вызовов или точное написание реализации, уже доказанной unit/E2E поведением.

## Scope

Нет изменений runtime, Playwright specs, workflows, Golden Samples, PWA, gameplay, localization catalogs, Story/Match-3 data или background assets.
