# G2a-ARCH-005A — Standalone CSS activation

Status: **in review**.

## Проблема

После ARCH-001..004 standalone geometry всё ещё активировалась двумя CSS-путями одновременно:

1. нативным `@media (display-mode: standalone)`;
2. `data-upds-display-mode='standalone'`, который публикует `ViewportRuntime`.

Оба пути задавали одну и ту же physical-height формулу и отдельно снимали desktop frame cap с `.phone.game-viewport`. Это оставляло два владельца одного platform decision и позволяло им разойтись при следующем изменении.

## Почему dataset достаточно

`installViewportRuntime()` выполняется синхронно в bootstrap до async services и до `AnimeDetectiveApp.mount()`. В `applyViewportGeometry()` он публикует resolved display mode на `<html>`:

`root.dataset.updsDisplayMode = geometry.displayMode`

До mount `.viewport-shell` и `.phone.game-viewport` ещё не существуют. Поэтому player shell не имеет промежутка, в котором ему был бы нужен отдельный native CSS display-mode resolver.

## Решение

`viewport.css` теперь использует только resolved dataset для standalone geometry:

- physical-height formula активируется через `:root[data-upds-display-mode='standalone']`;
- mobile standalone `.phone.game-viewport` активируется тем же dataset внутри обычного portrait/width media query;
- дублирующие `@media (display-mode: standalone)` ветки удалены.

`standaloneEdgeToEdge.css` остаётся feature-level consumer:

- он не определяет display mode;
- не пишет physical viewport height;
- не вычисляет VN runtime row sizes;
- только применяет standalone safe-area presentation к VN controls и Match-3 UI.

## Root canvas bridge

Исторические screen-specific `--upds-system-canvas-color` / `:root:has(...)` declarations в большом `style.css` пока намеренно не удаляются в этом slice. Поздний fixed-color containment в `standaloneEdgeToEdge.css` продолжает делать их визуально нейтральными, чтобы реальный geometry gap не маскировался цветом.

Их механическое удаление вынесено в **G2a-ARCH-005B**, чтобы не смешивать небольшой platform ownership change с rewrite большого legacy stylesheet.

## Regression contract

Vitest проверяет, что:

- `ViewportRuntime` публикует `data-upds-display-mode`;
- `viewport.css` и standalone presentation используют этот dataset;
- `viewport.css` больше не содержит `@media (display-mode: standalone)`;
- physical-height formula остаётся прежней;
- `standaloneEdgeToEdge.css` не владеет physical height или display-mode detection;
- safe-area behavior VN/Match-3 сохраняется;
- root-canvas camouflage остаётся нейтрализованным до 005B.

Существующий Browser Gate остаётся authoritative behavioral verification; Golden Samples не меняются.

## Не входит в slice

- удаление root-canvas bridge из `style.css` — ARCH-005B;
- объединение `PwaController` / `DiagnosticsController` display-mode detection — ARCH-007/008;
- изменение `ViewportRuntime` geometry/event formulas;
- gameplay, Match-3 balance, story или save schema;
- закрытие KI-001/KI-003 без реального installed-iPhone QA.
