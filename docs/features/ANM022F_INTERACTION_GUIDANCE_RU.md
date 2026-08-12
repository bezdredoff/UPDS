# ANM-022F — Interaction Guidance

Status: R1 candidate.

## Цель

Сделать уже существующий Match-3 input более читаемым и удобным без изменения balance, level data или special taxonomy.

## Контракт

- после 5 секунд бездействия на активном поле автоматически показывается текущий objective-aware best move;
- любое новое взаимодействие с полем сбрасывает inactivity timer;
- ручная кнопка Hint остаётся и использует тот же `getHintMove()` contract;
- special можно активировать напрямую двойным тапом по той же клетке;
- прямое special activation тратит ровно один move и использует существующий deterministic special effect/resolution pipeline;
- drag/swipe special в соседнюю клетку продолжает активировать special через shared swap legality;
- обычный double-tap по normal tile не активирует ничего и сохраняет tap-selection fallback;
- telemetry различает `match_hint.source = manual | inactivity`;
- telemetry `match_move` различает `source = tap | drag | double-tap` и `activation = swap | direct`;
- reduced-motion path остаётся функциональным.

## Non-goals

- никаких изменений move budgets/objectives/spawn rates;
- никаких новых special types или special-special combinations;
- никаких новых art assets;
- никаких изменений save schema;
- никаких новых tutorial screens.

## Manual QA

На iPhone preview проверить:

1. ничего не трогать 5 секунд — подсветка двух клеток появляется автоматически;
2. коснуться/потянуть поле до 5 секунд — timer начинается заново;
3. кнопка Hint по-прежнему работает;
4. создать special и дважды быстро тапнуть по нему — special активируется на месте и списывает один ход;
5. special можно перетащить в соседнюю обычную клетку — он активируется через swap;
6. двойной тап по обычной фишке не запускает special effect;
7. invalid drag/tap не ломает selection/input;
8. после win/loss/выхода auto-hint больше не срабатывает.
