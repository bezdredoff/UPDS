# ANM-024D — Viewport Regression Closure

Статус: complete as foundation; iOS standalone runtime exception documented after field QA.

## Цель

Закрыть Display / Viewport / Safe-Area Foundation после 024A–C: удалить временный legacy safe-area fallback, закрепить portrait + low-height landscape regression matrix и оставить один физический источник OS inset-значений.

## Финальный runtime contract

`physical viewport → safe viewport → game viewport → scene coordinates`

- `src/platform/ViewportContract.ts` остаётся orientation-neutral geometry contract;
- `src/viewport.css` — единственное место, где читаются `env(safe-area-inset-*)`;
- `src/style.css` и preview badge используют только `var(--safe-area-*)`;
- screen-specific safe-area override layer из 024C больше не нужен;
- `viewport-fit=cover` остаётся обязательным для edge-to-edge browser/PWA shell.

### iOS standalone exception

На реальном установленном iPhone PWA нельзя считать `innerHeight`, `visualViewport.height`, `100dvh`, `100svh` или `100lvh` надёжным источником физической высоты экрана при `viewport-fit=cover`.

WebKit bug 254868 (`Incorrect height values when viewport-fit=cover is set for installed web apps`) остаётся открытым и описывает именно этот класс ошибки: часть viewport API/units возвращает доступную высоту без safe-area, из-за чего полноэкранный shell становится короче экрана и появляется нижняя полоса. Связанные WebKit viewport regressions также воспроизводятся на Home Screen Web Apps.

Поэтому production contract намеренно ветвится только на уровне physical-shell height:

- browser tab: динамическая высота остаётся JS-fed через `visualViewport.height` / `innerHeight`;
- installed standalone: физический shell и мобильный `.phone.game-viewport` используют CSS `100vh`;
- standalone geometry активируется нативным `@media (display-mode: standalone)` ещё до выполнения приложения; `data-upds-display-mode='standalone'` остаётся fallback для `navigator.standalone`;
- standalone не записывает JS pixel height и не подписывается на `visualViewport.resize` / `window.resize`; сеть, service worker, cache warmup и online/offline не имеют права менять геометрию;
- safe-area tokens по-прежнему защищают интерактивные элементы сверху/снизу, но не уменьшают physical game canvas.

Ссылки на upstream bugs:
- https://bugs.webkit.org/show_bug.cgi?id=254868
- https://bugs.webkit.org/show_bug.cgi?id=244264
- https://bugs.webkit.org/show_bug.cgi?id=301108

## Automated regression matrix

Portrait:
- 320×568;
- 375×667;
- 390×844;
- 393×852;
- 430×932.

Каждый размер прогоняется с non-zero top/bottom insets и проверяется на containment внутри safe viewport.

Low-height landscape использует те же размеры, развёрнутые горизонтально, с representative left/right + bottom insets. Проверяются orientation neutrality, containment и центрирование game viewport.

Browser и standalone PWA используют один safe-area token contract, но физическая высота shell намеренно различается из-за WebKit standalone bug: browser — dynamic viewport measurement, installed PWA — CSS `100vh`.

## iPhone visual QA before merge

Проверить candidate preview в Safari browser и установленной PWA:

1. виден уникальный `PREVIEW · <build-id>` badge;
2. main menu/header не попадает под Dynamic Island/notch;
3. VN controls/status/history/config не конфликтуют с home indicator;
4. Match-3 board/tooltray/hint остаются полностью доступны;
5. Settings/Diagnostics/PWA update banner имеют корректные верхний/нижний inset;
6. standalone cold start: game canvas с первого игрового кадра доходит до физического низа без отдельной полосы;
7. подождать после запуска и после PWA cache/service-worker startup: не должно происходить позднего rescale;
8. повторить 6–7 online и в airplane/offline — геометрия должна быть одинаковой;
9. повернуть телефон в landscape и обратно: приложение может оставаться компромиссным по композиции до ANM-031, но не должно ломать safe-area, обрезать критичные controls или сохранять stale portrait height.

ANM-031 по-прежнему отвечает за полноценный landscape redesign; ANM-024 гарантирует, что фундамент ему не мешает.
