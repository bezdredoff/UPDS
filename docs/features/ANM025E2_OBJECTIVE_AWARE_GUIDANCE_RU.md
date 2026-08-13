# ANM-025E2 — Objective-Aware Guidance

## Цель

После упрощения objective structure в E1 сделать 5-second hint действительно полезным для текущего условия победы. Подсказка не должна предпочитать большой, но нерелевантный match, если на той же доске есть видимый ход, который непосредственно продвигает незавершённую цель.

## Production contract

- direct progress незавершённой win objective имеет приоритет над generic tactical value;
- tactical strength (размер match, создание/активация special) остаётся tie-breaker между одинаково полезными goal moves;
- `collect` оценивает только реально очищаемые клетки нужного tile identity;
- `clearBlockers` учитывает damage по blocker, включая первый удар по 2-layer blocker, а не только финальное уничтожение;
- `drop` / `dropGroup` оценивают очищаемые клетки ниже ingredient только внутри его текущего gravity segment; locked blocker является вертикальным барьером, board hole — нет;
- projected clear учитывает уже существующие special effects, которые активируются выбранным swap;
- scoring выполняется в том временно swapped состоянии, в котором был найден match, после чего board обязательно возвращается назад;
- `getHintMove()` остаётся read-only и не расходует moves/RNG/progress;
- E2 не меняет level moves, objective targets, spawn weights, blockers/ingredients positions или win-rate tuning.

## Что исправлено относительно старого scoring

Старый hint score складывал небольшие бонусы (`collect`, blockers, ingredient) с generic match/special score. Поэтому большой нерелевантный match мог обгонять непосредственный progress цели. Кроме того, `evaluateSwap()` уже возвращал доску в исходное состояние до objective scoring, поэтому tile/special identity на найденных match indices могла читаться не из того состояния.

E2 делает приоритет лексикографическим: наличие direct objective progress сначала определяет класс полезности хода, а tactical score выбирает лучший ход внутри этого класса.

## Regression scenarios

- `M3_00`, seed `63`: hint должен предпочесть ход, который повреждает/очищает blocker, вместо более крупного нерелевантного match;
- `M3_03`, seed `89`: hint должен непосредственно продвигать cabinet objective;
- collect-only archetype, seed `477`: hint должен собирать target tile;
- drop-only archetype, seed `13`: hint должен сдвигать receipt вниз по текущему gravity segment;
- вызов `getHintMove()` не меняет board и movesLeft.

## Не входит в E2

- изменение move budgets;
- изменение blocker layers/positions;
- изменение ingredient start positions;
- spawn weights;
- статистическая настройка target win rate;
- предсказание случайных будущих cascades.

Эти параметры настраиваются в ANM-025E3 уже поверх корректной objective structure и guidance semantics.
