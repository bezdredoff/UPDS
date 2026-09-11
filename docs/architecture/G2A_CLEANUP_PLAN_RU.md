# G2a — Architecture / Patch Cleanup Plan

Status: active bounded maintenance plan after merged G2 runtime/UI hardening and G2a test simplification.

## Цель

Убрать накопившиеся места, где один runtime-принцип имеет несколько владельцев, а исправления работают через поздние CSS overrides, повторные browser listeners, compatibility seams или implementation-shape tests.

Это не общий rewrite. Каждый пункт должен быть отдельным небольшим PR с сохранением player behavior и существующих release contracts.

## Принципы

- один runtime concept → один source of truth;
- feature code потребляет resolved state/events и не повторяет platform detection;
- physical shell и viewport geometry не должны зависеть от порядка feature render;
- CSS specificity/order не должны быть скрытым API между features;
- тесты защищают ownership/behavior, а не случайную форму реализации;
- PWA KI-001/KI-003 закрываются только после реального iPhone QA;
- Golden Samples не обновляются ради прохождения refactor CI.

## Задачи

| ID | Priority | Status | Задача | Outcome |
| --- | --- | --- | --- | --- |
| G2a-ARCH-001 | P0 | accepted | Single viewport geometry owner | `ViewportRuntime` единолично измеряет runtime geometry и пишет layout tokens; merged PR #288 |
| G2a-ARCH-002 | P0 | accepted | Single viewport event ownership | только `ViewportRuntime` слушает production `resize/orientationchange`; VN получает уже отфильтрованное geometry-change событие и отвечает только repagination; merged PR #289 |
| G2a-ARCH-003 | P0 | accepted | Persistent AppShell | `.viewport-shell` и `.phone.game-viewport` создаются один раз; screen content меняется внутри persistent `app-screen-host`; merged PR #290 |
| G2a-ARCH-004 | P1 | accepted | Unified compact layout | persistent `.game-viewport` — named inline-size container `upds-game`; compact presentation больше не выбирается старым `650px OR 340px` viewport decision; merged PR #291 |
| G2a-ARCH-005A | P1 | accepted | Single standalone CSS activation | `ViewportRuntime` dataset — единственный CSS activation signal для standalone geometry; native `@media(display-mode)` duplicate удалён; merged PR #292 |
| G2a-ARCH-005B | P1 | accepted | Retire root-canvas camouflage | `--upds-system-canvas-color`, screen-specific standalone `:has(...)` mappings и поздний compatibility containment удалены; geometry gap больше не маскируется цветом текущего screen; merged PR #293 |
| G2a-ARCH-006 | P1 | accepted | CSS cascade/button contract | shared primary modifier scoped to `.phone button.primary`; Match-3/Campaign variants win by contextual specificity instead of `!important`; merged PR #294 |
| G2a-ARCH-007 | P1 | accepted | Platform identity single source | `PlatformIdentity` единолично resolves standalone/browser и stable/preview/local; bootstrap, `ViewportRuntime`, `PwaController` и Diagnostics потребляют эти resolver'ы; merged PR #295 |
| G2a-ARCH-008 | P1 | accepted | Shared viewport evidence collector | `ViewportEvidence` даёт Diagnostics и ViewportDebug один read-only raw/resolved snapshot и один reusable probe host; layout tokens не пишет; early pre-bundle recorder остаётся отдельным; merged PR #296 |
| G2a-ARCH-009 | P2 | review | Retire test-only app compatibility seams | smoke/QA tests вызывают реальные feature-controller/session boundaries; `AnimeDetectiveApp` больше не публикует feature render/start и mutable save API только ради tests |
| G2a-ARCH-010 | P2 | queued | Repository debris guard | удалить случайный `CUsersbezdr.lmstudioscratchpadskmcheck_output.txt` и расширить hygiene guard для redirected scratch/output файлов в root |

## Рекомендуемый порядок

1. ARCH-008 — завершить shared viewport evidence collector.
2. ARCH-009 — удалить test-only composition-root compatibility API.
3. ARCH-010 — repository hygiene cleanup + guard.

ARCH-009/010 можно выполнить раньше, если они не пересекаются с активным runtime PR. ART/guest production может идти параллельно; этот track не должен превращаться в бесконечный refactor перед релизом.

## Явно не включаем сейчас

### Local vertical-fit rules

ARCH-004 убрал `max-height:650px` как presentation breakpoint. Отдельные локальные правила вроде `max-height:760px` для board/menu fit и landscape height rules остаются: они не выбирают общую compact presentation family и могут быть пересмотрены только при конкретной regression evidence.

### Accessibility / reduced-motion `!important`

ARCH-006 касается конфликтующих visual button declarations. Blanket `!important` внутри `prefers-reduced-motion` и utility `visually-hidden` остаются намеренными enforcement rules; они не являются частью button cascade contract.

### Shared diagnostics evidence

ARCH-008 объединяет текущие Diagnostics/ViewportDebug raw viewport, CSS-height, safe-area и display identity measurements в `ViewportEvidence`. Это read-only QA evidence: collector не пишет `--upds-viewport-height`, `--physical-viewport-height` или `data-upds-display-mode` и не становится вторым layout owner.

### Legacy numeric Story save → stable `StorySceneId`

Это реальный compatibility layer, но он защищает существующие saves. Миграция требует отдельного save-schema decision и не является частью patch cleanup до RC.

### Локальные `clamp()` helpers

Маленькое математическое дублирование без расходящегося доменного смысла не оправдывает общий `utils.ts`.

### Scene Studio viewport/safe-area simulation

Scene Studio намеренно моделирует QA viewport profiles. Это test/authoring input, а не второй production runtime owner.

### Early viewport recorder

Inline recorder в `index.html` намеренно стартует до module graph. ARCH-008 его не объединяет с module-level `ViewportEvidence`: ранний recorder нужен для startup evidence до загрузки bundle и остаётся отдельным до закрытия реальных iPhone viewport known issues.

## Stop rule

G2a cleanup заканчивается, когда для production layout/platform state остаются понятные single-owner boundaries и дальнейший refactor не снижает конкретный regression/maintenance risk. Сходство кода само по себе не является причиной для новой задачи.
