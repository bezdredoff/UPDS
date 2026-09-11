# ANM-024E — Universal standalone edge-to-edge

Статус: candidate fix after real-device viewport diagnostics; geometry ownership is being consolidated by G2a-ARCH-001.

> Исторический контракт. Формула с `screen.height` опровергнута изолированным real-iPhone
> evidence 2026-09-11 и заменена candidate G0-PWA-001. Текущий контракт:
> [`G0_PWA_001_IOS_VIEWPORT_REPAIR_RU.md`](G0_PWA_001_IOS_VIEWPORT_REPAIR_RU.md).

## Что показала диагностика на реальном iPhone

На установленной PWA одновременно были измерены:

- `screen.height = 874`;
- `100vh = 874`;
- `100lvh = 874`;
- `innerHeight = 812`;
- `visualViewport.height = 812`;
- `100dvh = 812`;
- `100svh = 812`;
- `safe-area-top = 62`;
- `safe-area-bottom = 34`;
- `.viewport-shell = 874`;
- `.game-viewport = 874`.

Это доказало, что после ANM-024D внешний physical/game viewport уже правильный. Оставшиеся полосы и поздний VN rescale возникают внутри feature presentation.

Числа `62` и `34` не являются частью production contract и нигде не должны хардкодиться.

## Универсальный contract

Для установленной standalone PWA:

1. Physical shell, game viewport и высотно-зависимые runtime layout tokens получают один geometry snapshot через `src/platform/ViewportRuntime.ts`.
2. Если `screen.width` совпадает с layout width, standalone использует доверенную physical height `max(innerHeight, screen.height)` и не строит VN layout tokens из shortened `visualViewport.height`.
3. Все реальные OS inset-значения берутся только через общие `--safe-area-*` tokens из `env(safe-area-inset-*)`.
4. Background/game canvas рисуется до физического края.
5. Интерактивные controls остаются выше `safe-area-bottom`, но сам safe-area не должен выглядеть как отдельная нефункциональная полоса.
6. Height-only `window.resize` после initial snapshot не меняет game/VN geometry. Реальная смена ширины и `orientationchange` переснимают geometry snapshot явно.
7. Standalone app монтируется после `document.fonts.ready`, чтобы загрузка web fonts не создавала поздний первый VN re-layout.
8. Online/offline/service-worker/cache state не участвуют в geometry contract: при одинаковом физическом экране shortened online viewport и full-height offline viewport должны дать одинаковый standalone `layoutHeight`.

## Browser contract

Обычная browser/Safari вкладка не использует `screen.height` как physical game height. При новом валидном snapshot её layout height берётся из `visualViewport.height` с fallback на `innerHeight`; текущий width/orientation-only refresh contract сохраняется до отдельного browser-layout решения.

## Regression matrix

Проверки должны быть независимы от конкретной модели iPhone и покрывать разные safe-area комбинации, включая:

- `top/bottom = 0/0`;
- `47/34`;
- `59/34`;
- `62/34`;
- landscape left/right insets.

Ни один тест или production CSS не должен предполагать конкретные `62px` или `34px`.

Отдельный pure regression в `tests/ViewportShell.test.ts` фиксирует реальную наблюдавшуюся пару: standalone online `inner/visual=812` и offline `inner/visual=874` при `screen.height=874` обязаны разрешаться в один `layoutHeight=874` и один набор VN layout tokens.

## Manual iPhone gate

После merge candidate build:

1. cold start online → VN, подождать минимум 30 секунд: нет позднего rescale;
2. Match-3: фон/canvas до физического низа, hint/tooltray остаются выше home indicator;
3. VN: фон виден под нижней safe-area, кнопки не попадают под home indicator;
4. полностью закрыть PWA, включить airplane mode, повторить пункты 1–3;
5. portrait → landscape → portrait: geometry не сохраняет stale размер;
6. Diagnostics: `.viewport-shell` и `.game-viewport` продолжают совпадать с physical height, а VN layout tokens не различаются только из-за online/offline состояния.

Этот real-device gate пройден 2026-09-11 в G0-PWA-001; KI-001 и KI-003 закрыты.
