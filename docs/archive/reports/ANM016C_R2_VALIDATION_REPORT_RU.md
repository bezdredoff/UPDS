# ANM-016C R2 — Validation Report

Версия: `0.16.3-anm016c-r2`

## Исправленная первопричина

R1 менял `overflow` у dialogue card, но portrait всё ещё обрезался на `.stage { overflow: hidden }`, а nameplate оставался дочерним элементом `<button class="dialogue">`. На iOS/Safari это оставляло два визуальных дефекта: жёсткий срез персонажа на границе stage и возможный clipping nameplate внутри rounded button.

R2:
- `.stage` → `overflow: visible`;
- существующий half-body portrait продолжает уходить ниже stage и скрывается диалоговой карточкой по z-order;
- gradient background dialogue-shell удалён;
- nameplate вынесен в sibling `.dialogue-nameplate` с `z-index: 12` и `pointer-events: none`;
- dialogue card сохраняет кликабельность и пространство для nameplate.

## Автоматические проверки

- TypeScript strict: PASS.
- VN layering static regression test компилируется с проектом: PASS.
- package/appVersion contract: PASS (`0.16.3-anm016c-r2`).
- Scope diff против ANM-016C R1: только style/markup/test/version/docs.
- `public/assets/**`: byte-exact с ANM-016C R1.
- `.github/workflows/**` и ZIP validator: byte-exact с ANM-016C R1.
- narrative, screenplay, levels, rigs, Match3 engine, CampaignStore: byte-exact с ANM-016C R1.
- Финальный ZIP validator: PASS (см. итог упаковки).

## Ограничение локальной проверки

Полный clean `npm ci && npm run check` не объявляется локально: authoritative clean dependency install/Vitest/Vite build выполняет GitHub importer. Финальный ZIP дополнительно проверяется после повторной распаковки.
