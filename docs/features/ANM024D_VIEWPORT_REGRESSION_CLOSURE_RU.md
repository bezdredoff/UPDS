# ANM-024D — Viewport Regression Closure

Статус: complete on merge.

## Цель

Закрыть Display / Viewport / Safe-Area Foundation после 024A–C: удалить временный legacy safe-area fallback, закрепить portrait + low-height landscape regression matrix и оставить один физический источник OS inset-значений.

## Финальный runtime contract

`physical viewport → safe viewport → game viewport → scene coordinates`

- `src/platform/ViewportContract.ts` остаётся orientation-neutral geometry contract;
- `src/viewport.css` — единственное место, где читаются `env(safe-area-inset-*)`;
- `src/style.css` и preview badge используют только `var(--safe-area-*)`;
- screen-specific safe-area override layer из 024C больше не нужен;
- `viewport-fit=cover` остаётся обязательным для edge-to-edge browser/PWA shell.

## Automated regression matrix

Portrait:
- 320×568;
- 375×667;
- 390×844;
- 393×852;
- 430×932.

Каждый размер прогоняется с non-zero top/bottom insets и проверяется на containment внутри safe viewport.

Low-height landscape использует те же размеры, развёрнутые горизонтально, с representative left/right + bottom insets. Проверяются orientation neutrality, containment и центрирование game viewport.

Browser и standalone PWA используют один CSS safe-area contract; geometry не ветвится по `display-mode`.

## iPhone visual QA before merge

Проверить candidate preview в Safari browser и, по возможности, установленной PWA:

1. виден уникальный `PREVIEW · <build-id>` badge;
2. main menu/header не попадает под Dynamic Island/notch;
3. VN controls/status/history/config не конфликтуют с home indicator;
4. Match-3 board/tooltray/hint остаются полностью доступны;
5. Settings/Diagnostics/PWA update banner имеют корректные верхний/нижний inset;
6. повернуть телефон в landscape: приложение может оставаться компромиссным по композиции до ANM-031, но не должно ломать safe-area, обрезать критичные controls или создавать отрицательную/вылетающую геометрию.

ANM-031 по-прежнему отвечает за полноценный landscape redesign; ANM-024 гарантирует, что фундамент ему не мешает.
