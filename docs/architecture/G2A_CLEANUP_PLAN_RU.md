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
| G2a-ARCH-005B | P1 | active | Retire root-canvas camouflage | удалить `--upds-system-canvas-color`, screen-specific standalone `:has(...)` mappings и поздний compatibility containment; geometry gap больше не маскируется цветом текущего screen |
| G2a-ARCH-006 | P1 | queued | CSS cascade/button contract | уйти от глобального `.primary !important` и feature-level counter-`!important`; ввести стабильные button modifiers / layers и убрать correctness, зависящий от import order |
| G2a-ARCH-007 | P1 | queued | Platform identity single source | один resolver для display mode и один resolver для stable/preview/local lane; PWA, bootstrap и diagnostics не вычисляют их независимо |
| G2a-ARCH-008 | P1 | queued | Shared viewport evidence collector | Diagnostics и ViewportDebug используют общий read-only raw/resolved snapshot; early pre-bundle recorder остаётся отдельным только пока нужен для KI-001/KI-003 |
| G2a-ARCH-009 | P2 | queued | Retire test-only app compatibility seams | убрать public methods в `AnimeDetectiveApp`, существующие только для старых smoke/QA tests; тестировать navigation/controller boundaries без production API ради тестов |
| G2a-ARCH-010 | P2 | queued | Repository debris guard | удалить случайный `CUsersbezdr.lmstudioscratchpadskmcheck_output.txt` и расширить hygiene guard для redirected scratch/output файлов в root |

## Рекомендуемый порядок

1. ARCH-005B — удалить dead root-canvas camouflage declarations и compatibility containment.
2. ARCH-006 — почистить cascade/`!important` после стабилизации layout ownership.
3. ARCH-007 — централизовать display mode / runtime lane identity.
4. ARCH-008 — объединить diagnostics evidence collectors.
5. ARCH-009 — удалить test-only composition-root compatibility API.
6. ARCH-010 — repository hygiene cleanup + guard.

ARCH-009/010 можно выполнить раньше, если они не пересекаются с активным runtime PR. ART/guest production может идти параллельно; этот track не должен превращаться в бесконечный refactor перед релизом.

## Явно не включаем сейчас

### Local vertical-fit rules

ARCH-004 убрал `max-height:650px` как presentation breakpoint. Отдельные локальные правила вроде `max-height:760px` для board/menu fit и landscape height rules остаются: они не выбирают общую compact presentation family и могут быть пересмотрены только при конкретной regression evidence.

### Legacy numeric Story save → stable `StorySceneId`

Это реальный compatibility layer, но он защищает существующие saves. Миграция требует отдельного save-schema decision и не является частью patch cleanup до RC.

### Локальные `clamp()` helpers

Маленькое математическое дублирование без расходящегося доменного смысла не оправдывает общий `utils.ts`.

### Scene Studio viewport/safe-area simulation

Scene Studio намеренно моделирует QA viewport profiles. Это test/authoring input, а не второй production runtime owner.

### Early viewport recorder

Inline recorder в `index.html` намеренно стартует до module graph. Удалять/сворачивать его только после закрытия реальных iPhone viewport known issues.

## Stop rule

G2a cleanup заканчивается, когда для production layout/platform state остаются понятные single-owner boundaries и дальнейший refactor не снижает конкретный regression/maintenance risk. Сходство кода само по себе не является причиной для новой задачи.
