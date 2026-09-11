# G2a-ARCH-007 — Platform identity single source

Status: **accepted · PR #295**.

## Проблема

До ARCH-007 один и тот же platform state вычислялся в нескольких местах:

- `ViewportRuntime` отдельно определял `standalone/browser`;
- `PwaController` повторял ту же проверку через `navigator.standalone` + `matchMedia`;
- Diagnostics снова вычислял display mode;
- `main.ts` отдельно распознавал `/preview/`;
- `PwaController` имел собственный `laneForPath()` с другим regex boundary.

Последний пункт уже давал реальную возможность divergence: bootstrap требовал `/preview(?:/|$)`, а PWA regex мог классифицировать `/previewish` как preview.

## Реализация

Добавлен `src/platform/PlatformIdentity.ts` с двумя decision owners:

- `resolveDisplayMode()` → `standalone | browser`;
- `resolveRuntimeLane()` → `stable | preview | local`.

`resolveRuntimeLane()` использует один exact preview boundary: `/preview(?:/|$)`. HTTP(S) вне этого boundary считается stable; non-HTTP execution — local.

Эти resolver'ы теперь потребляют:

- `ViewportRuntime`;
- `PwaController` snapshot и registration telemetry;
- bootstrap preview badge decision;
- Diagnostics resolved identity.

Diagnostics при этом продолжает показывать raw navigator/media/root signals. Это evidence, а не второй decision owner. Их объединение с `ViewportDebug` в один raw/resolved snapshot выполняется следующим ARCH-008.

## Regression contract

`tests/PlatformIdentity.test.ts` проверяет:

- standalone от любого из двух поддерживаемых browser signals;
- browser при отсутствии standalone signals;
- preview `/preview`, `/preview/` и вложенные пути;
- `/previewish` не считается preview;
- stable HTTP(S) и local non-HTTP lane;
- отсутствие собственных display/lane resolver'ов в `ViewportRuntime`, `PwaController` и bootstrap.

Существующие preview build identity и viewport diagnostics source-contract tests переведены на shared resolver ownership.

## Не входит в slice

- изменение viewport geometry/event formulas;
- изменение service-worker cache topology;
- изменение player-facing preview badge presentation;
- объединение Diagnostics и ViewportDebug raw measurements — ARCH-008;
- закрытие KI-001/KI-003 без реального installed-iPhone online/offline QA.
