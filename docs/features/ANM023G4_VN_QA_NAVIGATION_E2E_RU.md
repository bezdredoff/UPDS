# ANM-023G4 — VN QA Navigation E2E

Статус поставки: **R1 candidate**.

## Цель

Добавить representative browser coverage VN через существующую QA Scene Navigation, подтверждая, что QA-инструмент действительно тестирует production VN runtime, browser layout и реальные assets.

## Архитектурная граница

G4 не добавляет direct browser API для `openScene(scene, line)`, test-only save mutation, отдельный QA renderer или отдельную VN реализацию.

Playwright проходит тот же путь, что ручной QA:

`Main Menu → QA Scene Navigation → scene button → VnController.openScene() → renderVN()`.

Для перехода между строками browser helper нажимает production `#next`, поэтому measured dialogue pages также проходят естественно.

## Representative cases

### 1. Scene 0 / VN0001 — measured paging

Проверяется production shared VN frame, режиссёрская карточка, загруженный production background, `data-dialogue-pages > 1` после реального browser measurement, многоточие на непоследней странице и то, что первый `#next` меняет dialogue page, но остаётся на `VN0001`.

Это покрывает то, чего unit tests не могут полностью доказать: фактическую вместимость текста при реальном DOM/CSS layout.

### 2. Scene 0 / VN0002 → VN0008 — staging/assets

На `VN0002` проверяется обычный production fallback character rendering Мику.

Затем browser реально проходит реплики до `VN0008`, где уже существующий approved authored contract задаёт `trio-central-speaker`.

Проверяется `data-authored-shot="VN0008"`, preset `trio-central-speaker`, три actor slots, ровно один speaking actor, три `background-focal-eye-line` anchors и фактическая загрузка всех character/background images.

Pixel-perfect screenshots здесь не фиксируются — это остаётся G7.

### 3. Scene 1 / VN0040 — CHOICE_00

Browser открывает Scene 1 с `VN0023` и проходит production `#next` до `VN0040`.

После последней dialogue page проверяется настоящий `.choice-screen` с тремя `[data-choice]`. Выбирается B, после чего production runtime должен вернуться к shared VN frame на `VN0041B`.

Так тестируется реальный transition `renderChoice → save.choice → getScene → branchIndex → renderVN`.

## Selectors

G4 расширяет единый `e2e/selectors.ts` уже существующими production DOM hooks: `.vn-background-fit`, `.stage`, `.direction-card`, `.line-id`, `#next`, `[data-character]`, `[data-authored-shot]`, `.vn-authored-actor-slot`, `.choice-screen`, `[data-choice]`.

Новых production `data-testid` не требуется.

## CI boundary

Исполняемый `vn-navigation.pw.ts` остаётся отдельным browser suite до G7.

Текущий root `npm run check` проверяет `VnBrowserE2EContract.test.ts`, который защищает отсутствие browser-only runtime seam, selector contract, representative line IDs, связь `VN0008` с уже утверждённым authored-shot production contract и использование реального choice DOM/handler.

## Следующий шаг

ANM-023G5 переносит тот же принцип на Match-3: production Match-3 Campaign, deterministic Level Lab seed, representative swaps/specials/objectives и тот же `Match3Controller` / `Match3Game`.
