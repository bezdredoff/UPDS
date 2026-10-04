# ANM-025D2 — Objective Mechanics Tutorials

## Цель

Расширить tutorial framework D1 на две базовые objective-механики Match-3 без дублирования системы подсказок и без tutorial-логики внутри `Match3Game`.

## Concepts

M3_00 объявляет последовательность:

1. `basic-swap` — базовый swap/match из D1;
2. `clear-blocker` — снятие препятствий матчами на соседних клетках;
3. `drop-ingredient` — опускание сюжетного предмета к нижнему краю.

Каждый concept сохраняется в `CampaignSave.tutorialsCompleted` и больше не показывается после подтверждённого освоения.

### G5b follow-up — повторный prompt спецфишки

`activate-special` — исключение из completion-by-action: если игрок явно подтверждает окно кнопкой «Понятно / Got it», concept сохраняется завершённым и не повторяет тот же modal на каждом следующем уровне. Реальная активация по-прежнему может быть изучена через постоянный Help; acknowledgement здесь устраняет повтор окна, а не утверждает, что игрок совершил ход.

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

## G5b amendment — first objectives and blocker introductions

M3_00 is now a low-friction first match level: one collect objective, no blockers or story ingredients, and only the `basic-swap` coachmark. The first zip-bag is introduced on M3_01 with a dedicated `clear-package` concept. M3_02 introduces permeable foam through a distinct `clear-foam` concept; covered tiles can move and match, while the foam layer is cleared by matches on it or on an orthogonal neighbor. M3_05 introduces locked cells through the unique `clear-lock` concept: first hit removes the padlock, second removes chains. These concepts have RU/BE/EN copy and separate save IDs so a legacy `clear-blocker` completion cannot suppress them.
