# G2a-ARCH-001 — Single Viewport Runtime

Status: **accepted via PR #288**.

## Зачем

После серии real-device PWA фиксов внешний `.viewport-shell` уже мог занимать физические `874px`, но `src/main.ts` отдельно вычислял VN layout tokens из `visualViewport.height ?? innerHeight`.

На зафиксированном iPhone это давало два разных входа для одной и той же физической ориентации:

- online: `innerHeight/visualViewport.height = 812`, `screen.height = 874`;
- airplane: `innerHeight/visualViewport.height = 874`, `screen.height = 874`.

Следовательно shell мог оставаться `874px`, а dialogue/control/status geometry внутри VN строилась то из `812`, то из `874`. Online/offline состояние не должно менять композицию игры.

## Решение

Добавлен `src/platform/ViewportRuntime.ts` — единственный runtime-владелец sampling window/screen geometry и записи layout tokens.

Он:

- определяет browser/standalone mode до async startup;
- получает один initial geometry snapshot;
- для standalone доверяет `screen.height` только когда `screen.width` совпадает с layout width, сохраняя защиту от desktop/window false-positive;
- при доверенном standalone screen вычисляет `layoutHeight = max(innerHeight, screen.height)`;
- из этого же `layoutHeight` получает `--physical-viewport-height`, `--upds-vn-dialogue-row`, `--upds-vn-controls-min-height` и `--upds-vn-status-offset`;
- для browser не использует `screen.height` как game height;
- игнорирует transient height-only resize и обновляет snapshot только при реальной смене width/orientation;
- отдаёт pure `resolveViewportGeometry()` и `viewportLayoutTokens()` для deterministic unit regression.

`src/main.ts` теперь только запускает `ViewportRuntime` до async services и больше не читает `visualViewport`, `innerHeight` или `screen.height` для layout.

## Что проверяет regression

`tests/ViewportShell.test.ts` больше не закрепляет старые приватные функции bootstrap. Вместо этого он проверяет поведение public pure geometry seam:

1. standalone online `812/812 + screen 874` → `layoutHeight 874`;
2. standalone offline `874/874 + screen 874` → `layoutHeight 874`;
3. оба состояния дают одинаковые VN layout tokens;
4. browser продолжает брать snapshot height из dynamic viewport и не получает physical screen override;
5. bootstrap только делегирует viewport ownership `ViewportRuntime` до `services.ready`.

## Что намеренно не входит

Этот slice не:

- делает `.viewport-shell` persistent между `AppShell.render()`;
- удаляет legacy `:has(...)` canvas-color bridges из `style.css`;
- объединяет `viewport.css`, `vnViewportStability.css` и `standaloneEdgeToEdge.css`;
- меняет VN pagination algorithm;
- меняет Match-3 layout/balance;
- закрывает KI-001/KI-003 без real-device evidence.

Последующие результаты уже приняты: single viewport event ownership — ARCH-002 / PR #289, persistent AppShell — ARCH-003 / PR #290, unified compact layout — ARCH-004 / PR #291, standalone/root-canvas cleanup — ARCH-005A/005B / PR #292–#293. Они больше не являются будущими G2a шагами.
