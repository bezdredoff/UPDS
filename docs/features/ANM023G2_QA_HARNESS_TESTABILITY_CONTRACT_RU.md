# ANM-023G2 — QA Harness & Testability Contract

Статус поставки: **R1 candidate**.

## Цель

Формализовать уже существующие продуктовые QA-поверхности как официальные точки входа для Playwright, не создавая отдельную QA-реализацию VN или Match-3.

## Главный контракт

Browser automation использует тот же runtime, что и игрок:

- `QA Scene Navigation` вызывает обычный `AppNavigation.openScene(...)` и приходит в production VN runtime;
- `Match-3 Campaign` запускает production level через общий Match-3 runtime;
- `Level Lab` передаёт выбранный level/draft и exact uint32 seed в тот же production Match-3 runtime;
- Story, Campaign и Lab различаются режимом/источником progression, но не renderer/game engine;
- shared `vnFrameMarkup` остаётся общей production DOM-структурой VN;
- `Match3Presentation` остаётся общей production DOM-структурой Match-3.

Запрещено добавлять ради browser tests:

- `QAVnController` / QA-only VN renderer;
- `QAMatch3Controller` / отдельную Match-3 implementation;
- browser-only gameplay rules;
- специальные production code paths, которые существуют только для Playwright.

## Stable automation selectors

G2 не добавляет лишние `data-testid`: текущий production DOM уже имеет достаточно устойчивых семантических точек. Они становятся automation API и защищаются Vitest contract-тестом на уровне `e2e/selectors.ts`, а не повторным чтением production markup/controllers.

Основные entry selectors:

- Main Menu: `#episodes`, `#match3-campaign`, `#level-lab`;
- Scene Navigation: `.scene-select`, `[data-scene]`;
- playable VN: `[data-vn-frame="shared"][data-frame-context="runtime"]`, `.dialogue-text`;
- Match-3 Campaign: `.match3-campaign-screen`, `[data-campaign-level]`;
- Level Lab: `.level-lab-screen`, `#lab-level`, `#lab-seed`, `#lab-preview`, `#lab-play`;
- playable Match-3: `.match-screen`, `.board[role="grid"]`, `[data-cell]`.

Если в будущем DOM меняется намеренно, selector contract и Playwright helpers обновляются в том же PR.

## Browser-side reset

`e2e/helpers/runtime.ts` очищает `localStorage` и `sessionStorage` через браузер перед тестом и перезагружает настоящее приложение.

Это намеренно находится только в Playwright package:

- production runtime не получает `window.__TEST__`/`window.__UPDS_TEST__`;
- save/progression classes не получают test-only методы;
- нет hidden URL/query-param для подмены игрового состояния.

Более специализированные deterministic fixtures добавляются только когда конкретная production boundary действительно требует воспроизводимого setup.

## G2 harness smoke

Текущий `harness.pw.ts` содержит четыре коротких browser journeys:

1. Main Menu → QA Scene Navigation → первая сцена → shared production VN frame.
2. Main Menu → Scene Studio → direct mouse drag → shared production stage/calibration state.
3. Main Menu → Match-3 Campaign → первый доступный level → shared production Match-3 board.
4. Main Menu → Level Lab → exact seed → Play Draft → shared production Match-3 board.

Это не полноценное VN/Match-3 покрытие. Harness только доказывает правильность QA entry boundaries. Детальные проверки остаются в специализированных VN, Match-3, persistence/localization и visual-regression specs.

## Validation ownership после G2a

Root `npm run check` по-прежнему не запускает Playwright. G2a разделяет ответственность, чтобы fast tests не зеркалили локальную форму production-кода:

- `RepositoryHygiene.test.ts` защищает архитектуру composition root: feature-controller construction остаётся централизованным, sibling feature imports запрещены, persistence не пересоздаётся внутри feature modules;
- `BrowserAutomationHarnessContract.test.ts` защищает стабильный selector API, наличие ключевых QA journeys в `harness.pw.ts` и отсутствие прямых runtime/game shortcuts в browser harness/reset helper;
- `BrowserCoverageAuditContract.test.ts` хранит исторический G8A audit как audit-документ, а не как повторный source-code verifier;
- фактическая QA → production parity проверяется исполнением `harness.pw.ts` в Browser Gate.

То есть рефакторинг controller internals не требует переписывать browser contract только ради совпадения строк, если архитектурные boundaries и исполняемое browser-поведение остаются неизменными.
