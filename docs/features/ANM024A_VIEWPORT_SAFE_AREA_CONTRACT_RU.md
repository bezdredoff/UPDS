# ANM-024A — Viewport & Safe-Area Contract / Audit

Status: complete; foundation closed by ANM-024D.

Цель: перед визуальной миграцией зафиксировать единый geometry contract:
`physical viewport → safe viewport → game viewport → scene coordinates`.

## Контракт

- physical viewport — доступный CSS viewport, orientation-neutral;
- safe viewport — physical rect после нормализованных OS safe-area insets;
- game viewport — центрированный rect внутри safe viewport, max 430×932 CSS px;
- scene coordinates — локальные CSS px относительно game viewport;
- invalid/oversized insets не могут дать отрицательную geometry;
- phone regression matrix 320×568, 375×667, 390×844, 393×852, 430×932 принадлежит platform contract, а не Match-3 input.

## Audit

Уже есть `viewport-fit=cover`, `100dvh` и component-level `env(safe-area-inset-*)`.
Проблема: safe-area policy размазана по menu/header/VN/Match-3/panels, а часть внутренних размеров использует `dvh` напрямую вместо game-container geometry.

ANM-024A намеренно не меняет CSS/layout. Следующие шаги:
- 024B shared runtime game viewport shell + CSS variables;
- 024C migration menu/VN/Match-3/tools away from component-specific viewport rules;
- 024D phone/device matrix + browser/PWA + iPhone visual QA.

Non-goals: gameplay, balance, save schema, visual redesign, final landscape layout.
