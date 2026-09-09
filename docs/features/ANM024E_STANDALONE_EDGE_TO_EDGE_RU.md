# ANM-024E — Universal standalone edge-to-edge

Статус: candidate fix after real-device viewport diagnostics.

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

1. Physical shell и game viewport используют полную physical-height модель из `viewport.css`.
2. Внутренние размеры VN/Match-3, которые должны зависеть от высоты игрового canvas, не используют shortened `dvh` на standalone iOS; standalone overrides используют `vh`.
3. Все реальные OS inset-значения берутся только через общие `--safe-area-*` tokens из `env(safe-area-inset-*)`.
4. Background/game canvas рисуется до физического края.
5. Интерактивные controls остаются выше `safe-area-bottom`, но сам safe-area не должен выглядеть как отдельная нефункциональная полоса.
6. Transient `window.resize` в установленной PWA не должен запускать feature-level full re-render. Реальная смена ориентации продолжает обрабатываться через `orientationchange`.
7. Standalone app монтируется после `document.fonts.ready`, чтобы загрузка web fonts не создавала поздний первый VN re-layout.
8. Online/offline/service-worker/cache state не участвуют в geometry contract.

## Browser contract

Обычная browser/Safari вкладка сохраняет dynamic viewport поведение:

- `visualViewport.height` / `innerHeight` могут обновлять browser shell;
- keyboard/browser chrome resize остаётся поддержан;
- standalone overrides не применяются.

## Regression matrix

Проверки должны быть независимы от конкретной модели iPhone и покрывать разные safe-area комбинации, включая:

- `top/bottom = 0/0`;
- `47/34`;
- `59/34`;
- `62/34`;
- landscape left/right insets.

Ни один тест или production CSS не должен предполагать конкретные `62px` или `34px`.

## Manual iPhone gate

После merge candidate build:

1. cold start online → VN, подождать минимум 30 секунд: нет позднего rescale;
2. Match-3: фон/canvas до физического низа, hint/tooltray остаются выше home indicator;
3. VN: фон виден под нижней safe-area, кнопки не попадают под home indicator;
4. полностью закрыть PWA, включить airplane mode, повторить пункты 1–3;
5. portrait → landscape → portrait: geometry не сохраняет stale размер;
6. Diagnostics: `.viewport-shell` и `.game-viewport` продолжают совпадать с `100vh`/physical height.
