# ANM-017 · Manual QA — Playtest & Distribution Foundation

## A. Первый запуск / PWA

1. Открыть candidate `/preview/` онлайн.
2. Главное меню → `Настройки` или `Сохранения и диагностика`.
3. Убедиться, что виден блок `PWA / OFFLINE`.
4. Дождаться `OFFLINE READY`. Если отображаются cache failures — не считать offline QA пройденным.
5. На iPhone: Share → Add to Home Screen, запустить добавленную иконку и убедиться, что игра открывается standalone.
6. На браузере с install prompt: кнопка `Установить` должна появляться только когда prompt реально доступен.

## B. Offline

1. После `OFFLINE READY` полностью закрыть установленную игру/вкладку.
2. Включить Airplane Mode / отключить сеть.
3. Запустить игру снова.
4. Проверить главное меню → VN → открыть несколько фонов/портретов → один Match-3.
5. Не должно быть blank screen / missing JS/CSS / сломанных runtime assets.
6. Diagnostics должен показывать `offline`.

## C. Stable / preview isolation

1. Онлайн открыть stable `/UPDS/` и затем candidate `/UPDS/preview/`.
2. Candidate должен показывать текущий ANM-017 build, а не stable UI из кэша.
3. Переключиться stable ↔ preview несколько раз.
4. При наличии DevTools проверить, что stable SW scope — root, preview SW scope — `/preview/`.
5. Candidate online должен получать свежую сеть (network-first), даже если раньше уже открывался другой preview build.

## D. Playtest telemetry

1. Diagnostics → `Очистить playtest data`.
2. Убедиться, что campaign save/Continue не исчезли.
3. Начать/продолжить VN, открыть LOG, включить/выключить AUTO, выполнить CHOICE_00.
4. Начать Match-3, использовать Hint, сделать несколько valid/invalid swaps.
5. Завершить попытку win/loss или выйти из активной попытки в меню.
6. Diagnostics → `Экспорт playtest report`.
7. В JSON должны присутствовать `summary` и `events`.
8. В per-level summary проверить starts/wins/losses/abandons, hints, valid/invalid moves, reshuffles, specials, maxCascade, median duration/moves.
9. В events не должно быть полного текста VN-реплик.

## E. Update UX

Полноценно проверяется при следующем build в том же scope:

1. Оставить установленный/открытый предыдущий build.
2. Развернуть следующую версию и открыть приложение онлайн.
3. Должен появиться banner `Доступно обновление игры`.
4. `Позже` не перезагружает игру.
5. `Обновить` применяет waiting worker и reload только после controllerchange.
6. Если активен Match-3, перед update должно быть confirmation.

## F. Regression

- VN staging / two-line paging / nameplate seam из ANM-016A–C остаются корректными.
- Compact header/navigation ANM-016E не меняются.
- Match-3 drag/motion/feedback не меняются.
- Save key/schema не меняются.
