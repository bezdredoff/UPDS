# ANM-024F — единый viewport owner после полевого iPhone QA

> Исторический cutover. Ownership остаётся действующим, но physical-height формула опровергнута
> real-iPhone isolation 2026-09-11 и заменена G0-PWA-001 layout-viewport candidate:
> [`G0_PWA_001_IOS_VIEWPORT_REPAIR_RU.md`](G0_PWA_001_IOS_VIEWPORT_REPAIR_RU.md).

## Почему понадобился новый cutover

Полевой QA после #256, #258 и #259 показал, что три симптома сохраняются одновременно: поздний rescale, не помещающийся VN UI в standalone PWA и нижняя пустая полоса. Диагностика реального устройства показала `screen/100vh = 874`, `innerHeight/100dvh = 812`, `safe-area-top = 62`, `safe-area-bottom = 34`, при этом внешний shell уже мог достигать 874px.

Аудит истории обнаружил конфликт нескольких поколений viewport-стратегии. ANM-030B1B9 R4/R7 ранее уже прошёл реальный installed-iPhone QA с physical shell `calc(100dvh + safe-area-top)`, но #254 позже заменил его динамическим JS-height + root-background bridge. #256 добавил `100vh`, #258 добавил внутренние standalone `vh`, а #259 — browser `svh`. В результате разные уровни layout одновременно владели высотой.

## Новый контракт

Высотой владеет только shared viewport foundation.

- Browser получает один usable-height snapshot до первого mount. Height-only изменения Safari chrome не обновляют `--upds-viewport-height`.
- Реальное изменение ширины и orientation обновляют snapshot после layout settle.
- Standalone возвращается к проверенному на физическом iPhone R4/R7 контракту: `calc(100dvh + var(--safe-area-top))`.
- `.phone.game-viewport` в installed portrait phone имеет `height: 100%` от physical shell; `100vh` больше не является отдельным inner owner.
- VN dialogue/controls/status получают pixel tokens, рассчитанные из initial usable height до async services. Никакие `vh/dvh/svh/lvh` не участвуют в runtime VN geometry после mount.
- `VnController` продолжает игнорировать height-only resize и делает только in-place pagination remeasure на width/orientation changes.
- Bottom safe area остаётся неинтерактивной, но VN artwork виден под ней; safe-area не является отдельной полосой приложения.
- Старый per-screen root canvas bridge больше не считается частью geometry и поздним standalone layer нейтрализован. Любая реальная щель должна быть видна regression test, а не закрашена под экран.

## Regression gate

Mobile WebKit должен проверять не цвет root canvas, а реальные bounds:

1. synthetic `innerHeight=763`, `safe-area-top=59` -> shell/phone/active screen bottom = `822`;
2. проверка выполняется для Menu, Settings, Match-3 Campaign и runtime VN;
3. VN controls доходят до physical bottom, а кнопки остаются выше bottom safe area;
4. height-only Playwright viewport change с неизменной шириной не меняет shell/phone/stage/portrait/dialogue/controls и frozen VN tokens;
5. тест не имеет права вручную подменять `--physical-viewport-height` ожидаемым значением.

## Ручной QA

После зелёного CI проверить preview до merge:

- Safari: открыть VN, дождаться browser chrome transitions, скрыть/вернуть панели, подождать 30 секунд — размер персонажа, stage, dialogue и controls не меняется.
- Installed preview PWA: VN полностью помещается между physical top/bottom; controls остаются над home indicator; внешней нижней полосы нет.
- Повторить installed PWA online и airplane/offline.
- Portrait → landscape → portrait считается настоящим geometry transition и может один раз пересчитать layout/paging; после settle дальнейшего rescale быть не должно.
