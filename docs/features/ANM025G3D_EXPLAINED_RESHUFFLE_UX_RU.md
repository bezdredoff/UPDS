# ANM-025G3D — Explained Reshuffle UX

## Почему этот срез нужен

В человеческом плейтесте M3_06 автоматический reshuffle около 11 оставшихся ходов выглядел как краткий визуальный сбой: поле резко изменилось, но причина не успевала считываться. Телеметрия при этом корректно фиксировала `reshuffled: true`, а движок выполнял штатную защиту от dead board. Значит проблема была не в legality/балансе, а в объяснении причинности.

## Что меняется

- существующий localized feedback `match3.feedback.reshuffled` теперь объясняет и причину, и результат: `НЕТ ХОДОВ · ПОЛЕ ПЕРЕМЕШАНО` / `NO MOVES · BOARD SHUFFLED` / `НЯМА ХАДОЎ · ПОЛЕ ПЕРАМЕШАНА`;
- после reshuffle сообщение получает отдельный `feedbackHold`, поэтому не исчезает сразу после 460 ms board animation;
- если reshuffle случился после каскада, финальный redundant `CHAIN ×N` больше не перетирает более важное объяснение reshuffle; сами cascade frames и их обычный feedback остаются;
- reduced-motion путь тоже удерживает текст на короткое время вместо мгновенного render→sync;
- общий `matchDelay()` теперь уважает уже рассчитанные `matchMotionDuration(...)` значения: `0` действительно пропускается, а reduced-motion `invalidHold` / `feedbackHold` получают предусмотренные 180/160 ms.

## Что намеренно НЕ меняется

- условие dead-board detection (`!hasAvailableMove()`);
- `shuffle()` и его RNG/раскладка;
- legality swap/special activation;
- стоимость хода;
- objectives, move budgets, blockers, spawn weights, seeds, ingredient routes;
- телеметрия v2: существующего `reshuffled: true` достаточно, новая event schema не вводится;
- hint ranking и 30-секундный auto-hint contract;
- визуальные ассеты поля.

## Автоматический контракт

1. RU/EN/BE содержат причинно-понятный reshuffle feedback без добавления новых localization keys.
2. Normal-motion path после reshuffle удерживает reshuffle feedback и не заменяет его финальным chain summary.
3. Reduced-motion path также удерживает feedback через reduced `feedbackHold`.
4. Engine по-прежнему reshuffle-ит только живую незавершённую доску без доступного хода.

## Preview / iPhone QA

Лучше всего воспроизвести на M3_06 или любом уровне, где естественно возникает dead board.

- при reshuffle должно быть понятно **почему** поле меняется: `НЕТ ХОДОВ · ПОЛЕ ПЕРЕМЕШАНО`;
- сообщение должно читаться как осознанное системное действие, а не как один кадр/flash;
- после завершения перестановки управление возвращается как обычно;
- reshuffle не списывает дополнительный ход;
- если перед reshuffle был каскад, его анимации остаются, но итоговый `CHAIN` не должен скрыть объяснение reshuffle;
- при системном Reduce Motion текст всё равно должен быть кратко читаемым, без лишней board animation.

После merge G3D Slice B — Hint & Feedback считается закрытым: G2 pacing + G3B ranking + G3C invalid reasons + G3D reshuffle UX.
