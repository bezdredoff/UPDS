# ANM-025D2 — Objective Mechanics Tutorials

## Цель

Расширить tutorial framework D1 на две базовые objective-механики Match-3 без дублирования системы подсказок и без tutorial-логики внутри `Match3Game`.

## Concepts

M3_00 объявляет последовательность:

1. `basic-swap` — базовый swap/match из D1;
2. `clear-blocker` — снятие препятствий матчами на соседних клетках;
3. `drop-ingredient` — опускание сюжетного предмета к нижнему краю.

Каждый concept сохраняется в `CampaignSave.tutorialsCompleted` и больше не показывается после подтверждённого освоения.

## Подтверждение действием

Tutorial не считается завершённым по кнопке «Попробовать».

- `basic-swap` → первый валидный swap;
- `clear-blocker` → первый реально полностью снятый blocker;
- `drop-ingredient` → первый реально выведенный через нижний край ingredient.

`MoveResult` уже содержит `blockersCleared` и `ingredientsDropped`, поэтому D2 не меняет engine и не вводит параллельный счётчик прогресса.

## Progressive disclosure

На экране показывается только первый pending concept. После подтверждения механики framework выбирает следующий.

Если игрок самостоятельно демонстрирует более позднюю механику до её coachmark, этот concept также считается освоенным и лишнее окно пропускается. Например, если ingredient уже успешно сброшен до показа соответствующего урока, повторно объяснять его не нужно.

Это уменьшает tutorial fatigue и одновременно оставляет обучение детерминированным для игроков, которым подсказки нужны.

## Boundary

D2 не меняет:

- `Match3Game.ts` и match legality;
- blocker/ingredient механику;
- objectives и move budgets;
- spawn weights;
- special taxonomy/combo matrix;
- save key или save schema (D1 schema 2 уже умеет хранить arbitrary known tutorial concept IDs).

Следующий D-срез может добавить обучение special creation/activation через тот же concept/event contract.
