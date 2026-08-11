# ANM-014 — Match-3 Pre-release UX + Feedback

Версия: `0.14.0-anm014`.

ANM-014 доводит существующие четыре match-3 уровня до pre-release UX без изменения level data, move budgets или расследовательной семантики.

## Основные изменения

- staged visual feedback `swap → clear → settle → cascade`;
- invalid-swap reject feedback без траты хода;
- objective-aware hint, который ранжирует допустимые ходы по текущим целям;
- заметный reshuffle feedback;
- читаемые special/cascade banners;
- короткие win/loss transitions;
- reduced-motion путь без ожидания анимационных фаз;
- Match-3 UI приведён ближе к утверждённому `2000s Hybrid` Golden Sample: кремовые case-панели, зелёные labels, framed navy board и нижняя detective/tool tray;
- medallions Мику, Оноэ и Аюки используются в runtime, новые персонажные assets не добавлялись.

## Защищённые контракты

Не менялись: screenplay/канон, стабильные VN IDs, `CHOICE_00`, save key, `levels.ts`, move budgets, character rigs и GitHub pipeline.
