# ANM-014 — Match-3 Pre-release UX + Feedback

## Цель

Сделать четыре существующих расследовательных match-3 уровня читаемыми и приятными для внешнего pre-release playtest на телефоне, не меняя их баланс и данные.

## Runtime contract

### Objective-aware Hint

`Match3Game.getHintMove()` перебирает только допустимые соседние обмены и не меняет состояние игры. Рейтинг повышается для ходов, которые:

- собирают ещё не закрытые collect-objectives;
- повреждают blockers рядом с совпадением;
- освобождают путь под падающими сюжетными объектами;
- активируют special;
- создают матч 4+.

Hint не гарантирует оптимальную долгосрочную стратегию и не является solver. Он нужен как понятная контекстная подсказка текущего хода.

### Move trace

Успешный `MoveResult` содержит immutable visual frames:

- `swap`;
- `clear`;
- `settle`;
- при необходимости `reshuffle`.

Engine по-прежнему завершает всю логику синхронно. Frames только описывают уже вычисленный детерминированный результат для presentation layer и не меняют gameplay contract.

### Presentation

Обычный режим показывает короткую последовательность swap/clear/settle, cascade banner и reshuffle notice. На `prefers-reduced-motion` промежуточные ожидания пропускаются, итоговое состояние остаётся тем же.

## Golden Sample alignment

Использован `ANM-005_Golden_Sample_Match3_2000s_Hybrid.png` как композиционный референс:

- cream evidence/objective cards;
- зелёные case labels;
- крупный moves counter;
- navy framed board;
- видимая детективная команда;
- отдельная tool/hint tray.

Golden Sample и model sheets не входят в runtime ZIP.

## Ручной QA на iPhone

1. Открыть `/preview/` и пройти до M3_00.
2. Проверить tap+tap и swipe.
3. Сделать невалидный swap: ход не тратится, клетки дают reject feedback.
4. Нажать `ПОДСКАЗКА`: подсвечиваются ровно две соседние клетки.
5. Выполнить подсказанный ход.
6. Убедиться, что видны swap → clear → settle и input не принимает второй ход в процессе.
7. Получить cascade 2+ и проверить banner.
8. Проверить special activation.
9. На нескольких уровнях убедиться, что objective counters обновляются только после завершения move transaction.
10. Проверить landscape recovery и 320×568 compact layout.
11. В iOS Reduce Motion убедиться, что игра не ждёт длинные animation delays.
12. Победа/поражение переходят в прежние result flows.

## Не входит

- новые типы match;
- новые boosters;
- изменение move budgets;
- перебалансировка уровней;
- новые production assets;
- звук/haptics.
