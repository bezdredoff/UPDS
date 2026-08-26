# ANM-025G3A — Telemetry v2 Event Identity

Candidate label: `ANM-025G3A R1 · Telemetry v2 Event Identity`.

## Причина

Human playtest M3_06–M3_16 выявил вопросы, на которые schema v1 не отвечает надёжно: где на поле показывается подсказка, следует ли игрок предложенному ходу, какое устойчивое состояние доски относится к событию и какая именно цель изменилась после хода. Без этих связей нельзя доказательно исправлять top bias подсказок или объяснять причинность специальных элементов.

G3A добавляет только foundation для следующего анализа. Он не меняет правила, баланс, hint ranking, HUD, тексты или визуальные ассеты.

## Schema v2

Новый storage key — `seiran-detectives-playtest-v2`, `schemaVersion = 2`. Если v2 ещё отсутствует, runtime читает валидный `seiran-detectives-playtest-v1`, сохраняет все его события в v2 и оставляет legacy-копию нетронутой. Повреждённые или неизвестные schema не блокируют игру: telemetry по-прежнему best-effort.

Формат export envelope не меняется (`exportVersion = 1`); версия семантики событий определяется полем `schemaVersion`.

## Match-3 identity contract

| Событие | Additive payload | Семантика |
|---|---|---|
| `match_start` | `attemptId`, `boardRevision = 0` | Начало одной попытки и первого устойчивого состояния поля. |
| `match_hint` | `hintId`, `boardRevision`, `first`, `second` | Координаты реально предложенного обмена; при отсутствии хода координаты равны `null`. |
| `match_move` | `moveId`, `boardRevisionBefore`, `boardRevisionAfter`, `first`, `second`, `followedHintId`, `objectiveDeltas` | Каждая попытка взаимодействия получает ID; ссылка на hint ставится только для той же пары клеток в той же ревизии. |
| `match_end` | `attemptId`, `boardRevision` | Финальная устойчивая ревизия попытки. |

`moveId` нумерует все попытки хода, включая invalid. Существующий `moveNumber` сохраняется для обратной совместимости и увеличивается только после валидного хода.

`boardRevision` начинается с `0`, увеличивается ровно один раз после валидного хода и не увеличивается после invalid move. Каскады, animation frames и reshuffle внутри одного хода не создают отдельные ревизии: telemetry описывает устойчивые состояния до и после player action, а не рендер-кадры.

`objectiveDeltas` содержит один элемент на каждую objective:

```json
{ "objectiveIndex": 0, "before": 2, "after": 5, "delta": 3 }
```

Индекс относится к каноническому порядку `level.objectives`. Для invalid move все значения остаются неизменными и `delta = 0`.

## Hint linkage

- `hintId` имеет форму `<attemptId>:hN`;
- `moveId` имеет форму `<attemptId>:mN`;
- порядок клеток при сравнении не важен: `A → B` и `B → A` считаются одним обменом;
- `followedHintId` равен `null`, если игрок выбрал другую пару, состояние доски изменилось или hint был недоступен;
- после любой попытки хода активная связь с подсказкой очищается.

Такой контракт позволяет позже считать top/bottom distribution и hint-follow rate без хранения полного board snapshot.

## Что намеренно не входит

- новые summary-метрики и изменение diagnostics report;
- аналитический backend, отправка данных или consent flow;
- full board snapshots и cascade-frame tracing;
- изменение 30-секундного hint pacing или hint scoring;
- UX invalid move, FAQ, HUD и blocker/special art;
- balance и level data.

Эти задачи остаются в отдельных Slice B–E.

## Regression contract

- v1 migration сохраняет raw events, sequence и timestamps и пишет v2 без удаления v1;
- attempt/hint/move IDs стабильны и монотонны внутри попытки;
- invalid и valid moves дают ожидаемые board revisions;
- reversed hint pair корректно связывается с ходом, другая пара — нет;
- objective delta helper сохраняет индекс, before, after и signed delta;
- существующий summary и export envelope продолжают работать без новых метрик.

Preview gate для G3A технический: зелёные TypeScript, unit, build и repository gates плюс smoke export из Diagnostics. Визуальной разницы на iPhone быть не должно.
