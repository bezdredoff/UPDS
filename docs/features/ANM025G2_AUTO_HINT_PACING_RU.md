# ANM-025G2 — Auto-Hint Pacing

Candidate label: `ANM-025G2 R1 · Auto-Hint Pacing`.

## Причина

Human playtest M3_06–M3_16 показал, что прежняя пятисекундная inactivity-подсказка вмешивается раньше, чем игрок успевает прочитать стартовую реплику или самостоятельно оценить поле. В экспортированной telemetry зафиксировано 95 показов подсказок на 149 валидных ходов: 94 автоматических и только один ручной. На всех восьми проверенных уровнях auto-hint составлял основную или единственную долю подсказок.

Пятисекундный порог также находился внутри обычного темпа игрока: median move gap по сессиям лежал между `5.0` и `18.5` секунды. Поэтому текущая система трактовала нормальное чтение и обдумывание хода как запрос помощи.

## Pacing contract

- inactivity auto-hint срабатывает после **30 секунд** бездействия;
- любое взаимодействие с полем по-прежнему очищает подсветку и запускает полный 30-секундный интервал заново;
- timer не запускается, пока открыт tutorial coachmark;
- manual Hint остаётся доступным сразу и использует тот же objective-aware `getHintMove()`;
- после win, loss, выхода, открытия Settings/Dossier и во время locked input stale timer не может показать подсказку;
- источник telemetry остаётся `manual | inactivity` без schema migration.

Используется одна переиспользуемая задержка, а не отдельные per-level или first/subsequent настройки. Это сохраняет lean-контракт и не создаёт новый tuning surface до следующего плейтеста.

## Что намеренно не меняется

- hint scoring и выбор предлагаемых клеток;
- положение подсказки на поле и визуальная анимация `.hinted`;
- manual Hint и direct-special interaction;
- move budgets, objectives, topology, blockers, specials, seeds и spawn weights;
- tutorial progression, save schema и telemetry schema;
- тексты invalid move, FAQ и blocker/overlay art.

Качество hint ranking, пояснение special combinations и UX invalid move остаются отдельными атомарными PR. Balance уровней не корректируется в G2.

## Regression contract

- unit contract фиксирует production delay `30000` и сохранение существующих interaction/telemetry seams;
- browser test использует virtual clock и проверяет точную границу: на `29 999 ms` подсветки нет, на `30 000 ms` появляются две клетки;
- тот же browser test подтверждает отсутствие расхода хода и сохранение DOM/геометрии board;
- Chromium и Mobile WebKit выполняют один production-parity contract без реального 30-секундного замедления CI.

## Preview / iPhone QA перед merge

1. Открыть M3_06 или M3_11 и не взаимодействовать с экраном: стартовая реплика должна оставаться видимой, а клетки не должны подсвечиваться в первые 30 секунд.
2. Нажать ручную кнопку Hint до истечения 30 секунд: две клетки должны подсветиться сразу, ход не расходуется.
3. Сделать обычный ход и убедиться, что auto-hint не появляется через прежние 5 секунд.
4. Подождать полный новый интервал: objective-aware подсветка появляется без мигания экрана и без расхода хода.
5. На уровне с tutorial coachmark убедиться, что timer начинается только после `Попробовать`.
6. Открыть Settings или Dossier, вернуться в матч и убедиться, что stale подсказка не появляется немедленно.

Merge допускается после зелёного CI и manual preview gate на iPhone.
