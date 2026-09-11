# ANM-030B1B9 — статус iOS PWA viewport и VN-низа

Дата фиксации: **2026-09-10; обновлено 2026-09-11**
Статус: **device-debug возобновлён; гипотеза physical-height опровергнута**
Связанный release gate: `G0`  
Связанные known issues: `KI-001`, `KI-003`

## Обновление 2026-09-11

Изолированная real-iPhone лаборатория доказала, что `screen.height=874` нельзя использовать как
layout height при `inner/visual/dvh=812`: вариант с `fixed; inset:0` полностью помещается, а
добавление `max(innerHeight, screen.height)` обрезает ровно `62px`. `black-translucent` отдельно
воспроизводит нижнюю полосу body и публикует safe-area `62/34`, не расширяя layout viewport.

Production candidate и новый acceptance protocol описаны в
[`G0_PWA_001_IOS_VIEWPORT_REPAIR_RU.md`](G0_PWA_001_IOS_VIEWPORT_REPAIR_RU.md). Нижележащие
наблюдения сохранены как история исходной triage; прежний physical-height контракт больше не
является активной рекомендацией.

## Решение по плану на момент исходной triage

Работу над подбором очередной формулы высоты временно приостанавливаем. Следующий приоритет —
работа по актуальному release dashboard и остальным G-задачам. `G0` остаётся `active`, а
viewport/PWA дефекты остаются release blocker до воспроизводимого решения на реальном iPhone.

## Что уже сделано

- В `index.html` сохранён `viewport-fit=cover`; `maximum-scale` и `user-scalable=no` намеренно
  не добавлялись, чтобы не отключать пользовательский zoom.
- Добавлен общий physical viewport shell и централизованные safe-area токены:
  `--safe-area-*`, `--physical-viewport-height`, `100dvh`/`100svh`/`100lvh` diagnostics.
- PWA распознаёт `navigator.standalone`, `display-mode: standalone` и публикует
  `data-upds-display-mode` до mount.
- Высота-only изменения Safari больше не пересобирают VN и не меняют frozen VN row tokens;
  реальные width/orientation изменения обрабатываются отдельно.
- В PR #262 добавлены live viewport diagnostics, recorder, экспорт JSON с ручным textarea
  fallback, Web Share/Copy/Download путями и Browser Gate evidence.
- Серия viewport/PWA исправлений была проверена локальными контрактами и Mobile WebKit E2E;
  это подтверждает кодовые инварианты, но не заменяет установленную PWA на фактическом iPhone.
- Быстрые тапы по VN-задаче защищены от iOS double-tap/smart-zoom и дублирующего advance.

## Что доказано текущими снимками

В установленной PWA на реальном телефоне зафиксированы два разных состояния:

| Состояние | inner / visual viewport | CSS `dvh` | safe top/bottom | shell/game viewport | Наблюдение |
| --- | ---: | ---: | ---: | ---: | --- |
| online | `402×812` | `812` | `62 / 34` | `402×874` | внизу появляется тёмная полоса, часть VN-низа не видна |
| airplane/offline | `402×874` | `874` | `62 / 34` | `402×936` в одном из запусков | полоса исчезает, но нижние VN-кнопки обрезаются из-за переразмера shell |

Отдельный offline-снимок также показал `screen: 402×874`, `dvh: 874`, поэтому добавление
`safe-area-top` к уже полной `dvh` даёт ошибочные `936px`. Это опровергает универсальную
формулу `100dvh + safe-area-top` для всех состояний standalone WebKit.

## Оставшиеся неизвестные и гипотезы

### KI-001: почему online standalone не даёт одинаковый physical canvas

Пока неизвестно, что именно меняется между online и airplane запуском:

1. WebKit может публиковать разные `innerHeight`/`dvh` после PWA launch и после восстановления
   из service-worker/offline cache.
2. В online режиме может быть активен другой cached document/build, чем в offline режиме.
3. `screen.height`, `innerHeight`, `visualViewport.height` и CSS `dvh` могут описывать разные
   compositor/layout области на данной версии iOS.
4. Тёмная полоса может быть не только геометрическим gap, но и отдельным compositor canvas,
   который проявляется под fixed shell.

### KI-003: почему нижний VN UI не помещается

Даже когда shell визуально достигает физического экрана, не подтверждено, что внутренняя
четырёхрядная VN grid-композиция помещается целиком. Нужно отдельно измерить на том же запуске:

- `.vn-screen`, `.vn-topbar`, `.stage`, `.dialogue-shell`, `.vn-controls` rects;
- computed `grid-template-rows`, min-height/padding кнопок и safe-area bottom;
- фактические screenshot bounds физического экрана и `game viewport`;
- одинаковость `BUILD_ID`, service-worker controller и asset cache online/offline.

Пока нельзя утверждать, что причина только в safe-area: возможна сумма фиксированных topbar,
dialogue и controls rows, превышающая доступную высоту на этом viewport.

## Что нужно собрать при возобновлении

Один и тот же build с экспортом debug JSON в четырёх состояниях: Safari tab online, installed
PWA online, installed PWA airplane/offline, installed PWA после возврата online. Для каждого
состояния нужны модель iPhone, версия iOS, `BUILD_ID`, `navigator.serviceWorker.controller`,
все viewport/CSS height значения и rects перечисленных VN-узлов. Только после этого выбирать
между CSS-only safe-area схемой, runtime physical-height fallback и исправлением внутренних VN
rows.

Требуемое evidence получено 2026-09-11; этот stop rule снят только для bounded G0-PWA-001 repair.
