# G2a-ARCH-008 — Shared viewport evidence collector

Status: **accepted via PR #296**.

## Проблема

После ARCH-007 platform identity уже имел один decision owner, но QA evidence всё ещё собирался двумя независимыми путями:

- `DiagnosticsController` при каждом открытии создавал временные DOM probes для `vh/dvh/svh/lvh` и safe-area;
- `ViewportDebug` держал собственный постоянный набор тех же probes и отдельно снимал raw viewport/display signals.

Это не ломало layout напрямую, но означало два measurement contracts для одних и тех же чисел. При расследовании KI-001/KI-003 Diagnostics и recorder могли расходиться не из-за устройства, а из-за различий в коде измерения.

## Реализация

Добавлен `src/platform/ViewportEvidence.ts`.

Он единолично собирает read-only evidence:

- `screen` и `avail` dimensions;
- `inner` и document `client` dimensions;
- `VisualViewport` geometry;
- measured `100vh / 100dvh / 100svh / 100lvh`;
- resolved `env(safe-area-inset-*)`;
- raw `navigator.standalone`, display-mode media query и root dataset;
- resolved mode/lane через `PlatformIdentity`;
- orientation evidence.

CSS-height и safe-area measurements используют один скрытый reusable probe host. `ViewportDebug` подготавливает его до установки Mutation/Resize observers, поэтому собственный measurement host не генерирует recorder noise.

## Ownership contract

`ViewportEvidence` — только QA evidence collector. Он не:

- пишет `--upds-viewport-height`;
- пишет `--physical-viewport-height`;
- пишет `data-upds-display-mode`;
- подписывается на resize/orientation events;
- принимает layout decisions.

Production geometry и события по-прежнему принадлежат `ViewportRuntime`, platform identity — `PlatformIdentity`.

## Consumers

- `DiagnosticsController` форматирует UI из `collectViewportEvidence()` и больше не создаёт свои temporary measurement probes;
- `ViewportDebug` включает тот же snapshot в recorder state и больше не владеет отдельными `vh/dvh/svh/lvh/safe` probes.

## Regression contract

`tests/ViewportEvidence.test.ts` фиксирует:

- единый набор `vh/dvh/svh/lvh` probes;
- один shared collector для Diagnostics и ViewportDebug;
- отсутствие второго probe map в `ViewportDebug`;
- отсутствие `measureSafeArea` / `measureCssHeight` в Diagnostics;
- read-only boundary: collector не пишет runtime geometry/dataset state.

`tests/ViewportDiagnostics.test.ts` теперь проверяет consumer ownership вместо старой implementation shape.

## Не входит в slice

- inline `window.__updsViewportEarly` recorder из `index.html`: он намеренно стартует до module graph и сохраняется для release/device regression evidence даже после закрытия KI-001/KI-003;
- изменение `ViewportRuntime` geometry/event formulas;
- новые diagnostics panels или экспортный schema bump;
- закрытие KI-001/KI-003 без real-device online/offline evidence;
- gameplay, save-schema, Match-3 balance или Golden Samples.
