# ANM-025C3 — Contextual Story-Object Guidance

## Почему

C2 дал игроку постоянный Help / FAQ, но human playtest concern остаётся локальным: в момент, когда на конкретном поле появляется сюжетный объект, игроку важно сразу понять, почему его нельзя свапнуть как обычную фишку и что именно нужно сделать.

Повторять это ещё одним popup/coachmark не нужно: Match-3 уже имеет persistent tutorial framework и общий Help. C3 использует существующую нижнюю строку interaction guidance и временно превращает её в контекстную case-note только пока активна незавершённая `drop` / `dropGroup` цель.

## Контракт C3

- guidance появляется только для story-object objectives (`drop` / `dropGroup`);
- текст называет локализованный objective текущего уровня, а не абстрактный «предмет»;
- объясняет ровно необходимое действие: объект нельзя менять местами, нужно освобождать клетки под ним и довести до нижнего края;
- при нескольких story-object objectives показывается только первый незавершённый;
- после завершения текущего story-object objective guidance автоматически переключается на следующий такой objective;
- когда незавершённых story-object objectives больше нет, возвращается обычный `match3.inputHint`;
- никаких новых controller state, timers, telemetry events или save fields.

Переключение использует уже существующий production contract: `Match3Controller.syncMatchPresentation()` ставит objective card класс `.done`, а presentation/CSS выбирает первую незавершённую story-object card. Поэтому C3 не дублирует gameplay progress state.

## Визуальный контракт

Case-note остаётся на месте существующей нижней interaction guidance и не добавляет новый HUD row. Для узнаваемости используется тот же Match-3 visual vocabulary: paper surface, gold border, green evidence spine, navy text. На узких/низких portrait viewport padding и font-size уменьшаются.

## Локализация

Новая runtime extension содержит один параметризованный ключ `match3.storyObjectGuidance` с `{object}` для RU / BE / EN. В `{object}` передаётся уже локализованный objective label конкретного уровня, поэтому не вводится второй каталог названий сюжетных объектов.

## Что намеренно не меняется

- ingredient/drop mechanics и swap legality;
- objective definitions, targets, move budgets, spawn weights и board topology;
- tutorial completion/reveal logic;
- Hint ranking/pacing;
- Help / FAQ content;
- telemetry и persistence.

## Preview / iPhone QA

1. Открыть M3_00: нижняя строка должна назвать `Квитанция` и объяснить движение вниз.
2. Убедиться, что note выглядит частью Match-3 case-file UI и не уменьшает/не сдвигает board.
3. Проверить уровень без `drop/dropGroup`: остаётся обычная строка управления.
4. На уровне с story-object objective довести объект вниз: после закрытия цели note должен исчезнуть/переключиться, а обычный input hint вернуться, если других story-object целей нет.
5. Проверить RU / BE / EN на узком portrait viewport: текст переносится, не создаёт horizontal overflow.

После C3 slice C — HUD & Help — считается закрытым. Следующий pass: D — Visual causality.
