# ANM-025D2 — Blocker Readability

## Цель

Сделать blockers понятными и менее закрывающими tile art на production board, не меняя игровые правила, баланс и level data.

## Candidate G5b-PT2-M3-002

- Player board больше не показывает числовые бейджи `1/2`. Фактическое количество слоёв хранится в существующей модели игры и остаётся только в `data-layers` для визуального состояния.
- `solid` использует существующий PNG коробки с полупрозрачной заливкой и CSS-слоем, который имитирует прозрачный пакет с застёжкой. Это визуальный прототип zip-bag, не новый арт-ассет.
- У `locked` сняты тяжёлая цветная рамка клетки, усиленная контрастность и крупная тень. Существующий PNG замка и цепи визуально легче; CSS не меняет толщину отдельных цепей внутри PNG.
- Однослойный `solid`/`locked` выглядит слегка изношенным через прозрачность/фильтр. Это не используется логикой и не влияет на правила снятия слоя.
- `overlay` и облегчённое представление permeable M3_02 сохраняются.
- Level Lab по-прежнему показывает layer counts как редакторскую информацию; они удалены только с production board.

## Что намеренно не меняется

- `clearBlockers`, blocker placements/layers и `blockerIsPermeable`;
- swap legality, gravity, clears, cascades и move budgets;
- goals, seeds, board geometry, ingredients, specials и campaign order;
- engine/controller/frame schema и input hit targets;
- PNG blocker assets.

## Проверка

Автоматический контракт проверяет отсутствие production badge, сохранение presentation metadata для слоёв, отдельные visual treatments archetypes, сохранение читаемости foam и порядок загрузки CSS. Перед визуальным принятием нужен быстрый просмотр `locked` и `solid` на representative phone board; степень прозрачности и читаемость tile art требуют human review.

## Следующий шаг

Если CSS-прототип пакета читается слабо в игровом размере, подготовить отдельный утверждаемый blocker asset. Не менять PNG без отдельного art-review.
