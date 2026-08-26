# ANM-025G3B — Spatially Neutral Hint Ranking

Candidate label: `ANM-025G3B R1 · Spatially Neutral Hint Ranking`.

## Причина

Human playtest M3_09 показал, что подсказки непропорционально часто фокусируются в верхней части поля. Причина находилась не в objective-aware score: если несколько ходов получали одинаковый лучший score, прежний tie-break всегда выбирал минимальный индекс клетки. Поскольку board scan идёт сверху вниз и слева направо, равные варианты систематически разрешались в пользу верхней части поля.

На нейтральном deterministic cohort из 128 досок прежний earliest-index tie-break выбирал верхнюю половину 84 раза (`65.6%`). Новый контракт даёт 69 выборов (`53.9%`) без изменения силы предложенного хода.

Полная uniform-ротация всех equal-score случаев была отклонена локальным gate: она снижала established M3_21 hint-following baseline с `7/8` до `5/8`. Поэтому G3B использует консервативный 50%-контракт: ротация включается для четырёх из восьми стабильных board-signature buckets. Это убирает aggregate top bias, но не превращает UX-исправление в скрытый rebalance поздних уровней.

## Ranking contract

1. Все legal moves по-прежнему оцениваются существующим objective-aware score.
2. Ход с более высоким score всегда побеждает: direct objective progress, completion bonus и tactical strength не меняются.
3. Если лучший score разделяют несколько ходов, engine сохраняет все равные варианты.
4. Стабильный hash текущего board signature и level ID назначает поле одному из восьми buckets.
5. В четырёх buckets равный вариант ротируется через hash; в остальных сохраняется established первый вариант как balance-safe fallback.
6. Hash не использует gameplay RNG и не меняет последующие refill/cascade результаты.
7. Повторный вызов `getHintMove()` на неизменившемся поле возвращает тот же ход.

Это не случайная подсказка и не принудительное смещение вниз. Разные доски детерминированно распределяют равные лучшие варианты по полю, а одна и та же доска остаётся воспроизводимой. Доля ротации намеренно ограничена, пока G3A telemetry не даст новый human cohort.

## Что намеренно не меняется

- 30-секундный inactivity contract и manual Hint;
- legality, objective scoring и tactical score;
- direct-special подсказки и special combinations;
- move budgets, objectives, blockers, topology, seeds и spawn weights;
- подсветка `.hinted`, тексты и звуки;
- telemetry schema v2 и summary/reporting;
- invalid-move feedback и reshuffle UX.

G3B исправляет только скрытый positional tie-break. Invalid feedback и reshuffle остаются следующими отдельными Slice B PR.

## Regression contract

- фиксированная доска с тремя равными лучшими вариантами больше не выбирает раннюю верхнюю пару;
- три последовательных hint-запроса на неизменившейся доске возвращают один результат и не мутируют board;
- neutral 128-board cohort держит upper-half share в узком симметричном диапазоне;
- существующие legality, objective-aware guidance и all-level balance cohorts остаются зелёными;
- G3A coordinates позволяют проверить реальное распределение на следующем human playtest export.

## Preview QA

1. На нескольких уровнях запросить manual Hint после разных ходов и убедиться, что подсказки встречаются в разных частях поля.
2. Дважды нажать Hint без изменения доски: подсвечивается одна и та же пара.
3. Выполнить предложенный ход: он остаётся legal и продвигает objective так же, как до G3B.
4. Убедиться, что auto-hint по-прежнему появляется только после 30 секунд.

Merge допускается после зелёного Quality gate и короткого production preview smoke. Отдельный визуальный screenshot gate не нужен: G3B не меняет layout или assets.
