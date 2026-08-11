# ANM-016 — ручной QA: Visual Presentation + Match-3 Motion

## VN: обязательный проход

Проверить на `/preview/` минимум в portrait iPhone viewport и, по возможности, на коротком экране:

1. QA Navigation → открыть сцены 00…08 по очереди.
2. В каждой сцене пролистать минимум до нескольких разных speakers/emotions.
3. Персонаж не должен случайно выходить за верх/низ stage; ноги/голова не должны обрезаться из-за длины реплики.
4. При переходе между короткой и длинной репликой размер stage/background/dialogue shell визуально остаётся стабильным.
5. Полный authored background виден в `contain` layer; свободное место экрана заполняет мягкий blurred/dim fill, без чёрных полос.
6. Проверить `CHOICE_00` для A/B/C и возврат в VN на `VN0041A/B/C`.
7. В scene 01 проверить cut на `VN0048`: clubroom → athletics locker без изменения геометрии UI.
8. Проверить VN → Match-3 intro → result/evidence → следующий VN для всех четырёх уровней.
9. Проверить LOG / MENU / CONFIG / SAVE / LOAD overlays: открытие/закрытие не меняет размер базового VN shell.
10. Финал: `VN0246 → VN0247 → VN0248 → VN0249 → ending`.

## Match-3: обязательный проход

1. Drag: удержать тайл и медленно вести к соседу — source следует за пальцем, target слегка реагирует.
2. Отпустить до threshold — ход не совершается.
3. Дотянуть и отпустить после threshold — совершается ровно один swap.
4. Swipe быстрым жестом и tap→tap по-прежнему работают.
5. Invalid no-match: forward swap → сообщение → возврат, moves не уменьшаются.
6. Blocked/ingredient попытка: нет fake swap через поле, показывается reject feedback/bark.
7. Valid move: swap → только совпавшие тайлы исчезают → оставшиеся падают → новые появляются сверху.
8. Cascade 2+: каждая clear/settle стадия читается отдельно; input locked до конца transaction.
9. Special/reshuffle/win/loss feedback не оставляет input stuck.
10. Hint остаётся objective-aware и не делает ход автоматически.
11. iOS Reduce Motion: gameplay не меняется, decorative motion почти мгновенный, reject остаётся читаемым.

## Regression viewport matrix

- 320×568
- 375×667
- 390×844
- 393×852
- 430×932

На каждом portrait viewport не должно быть document scroll или изменения размеров `.phone` между VN lines.
