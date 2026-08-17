# ANM-023G2 — QA Harness & Testability Contract

Статус поставки: **R1 candidate**.

## Цель

Формализовать уже существующие продуктовые QA-поверхности как официальные точки входа для Playwright, не создавая отдельную QA-реализацию VN или Match-3.

## Главный контракт

Browser automation использует тот же runtime, что и игрок:

- `QA Scene Navigation` вызывает обычный `AppNavigation.openScene(...)` и приходит в единственный `VnController`;
- `Match-3 Campaign` запускает production level через единственный `Match3Controller`;
- `Level Lab` передаёт выбранный level/draft и exact uint32 seed в тот же `Match3Controller.startLabMatch(...)`;
- Story, Campaign и Lab различаются режимом/источником progression, но не renderer/game engine;
- shared `vnFrameMarkup` остаётся общей production DOM-структурой VN;
- `Match3Presentation` остаётся общей production DOM-структурой Match-3.

Запрещено добавлять ради browser tests:

- `QAVnController` / QA-only VN renderer;
- `QAMatch3Controller` / отдельную Match-3 implementation;
- browser-only gameplay rules;
- специальные production code paths, которые существуют только для Playwright.

## Stable automation selectors

G2 не добавляет лишние `data-testid`: текущий production DOM уже имеет достаточно устойчивых семантических точек. Они становятся automation API и защищаются Vitest contract-тестом.

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

Более специализированные deterministic fixtures добавляются только когда G4/G5 докажут конкретную необходимость.

## G2 harness smoke

Добавлены три коротких browser journeys:

1. Main Menu → QA Scene Navigation → первая сцена → shared production VN frame.
2. Main Menu → Match-3 Campaign → первый доступный level → shared production Match-3 board.
3. Main Menu → Level Lab → seed `424242` → Play Draft → shared production Match-3 board с `SEED 424242`.

Это не полноценное VN/Match-3 покрытие. G2 только доказывает правильность harness boundaries. Детальные проверки остаются:

- G3 — boot/build/Pages `/preview/`;
- G4 — VN content/paging/presentation;
- G5 — Match-3 mechanics/campaign/Level Lab;
- G6 — persistence/localization/main-flow;
- G7 — visual regression + blocking Browser Gate.

## Validation

Root `npm run check` по-прежнему не запускает Playwright. Он проверяет `BrowserAutomationHarnessContract.test.ts`, который защищает:

- единственный production controller для VN;
- единственный production controller для Match-3;
- routing QA surfaces в эти controllers;
- стабильный selector contract;
- отсутствие test-only runtime reset/game logic.

Исполняемые `*.pw.ts` tests остаются отдельным Playwright suite и войдут в GitHub Browser Gate в G7.
