# ANM-023G8B — Story Match-3 Completion → Evidence → VN

Status: R1 candidate.
Base: main after ANM-023G8A / PR #162.

## Цель

Добавить один короткий Playwright journey, который доказывает production boundary после настоящей победы Story Match-3:

`M3_00 real win → clue/save → evidence → VN0058 → reload → Continue → VN0058`.

Тест не должен превращаться в Match-3 bot и не должен иметь `forceWin`/`window.__UPDS_TEST__`.

## Deterministic setup

`src/data/storyFlowQa.ts` создаёт QA-override для M3_00:

- canonical `id`, `shortId`, context и `CUE_001` сохраняются;
- tutorial отключён только в QA fixture;
- moves = 1;
- objective = один `lockedCell`;
- initial tiles гарантируют, что swap `2 ↔ 10` создаёт match рядом с blocker.

`withStoryWinQaLevel()` временно подставляет fixture только на время синхронного вызова production `Match3Controller.startMatch(0)`, после чего canonical `levels[0]` восстанавливается в `finally`.

Это не force-win: после старта Playwright делает обычные два DOM click, `Match3Game.attemptSwap()` сам возвращает `won: true`.

## Production path under test

После победы fixture больше не участвует. Существующий `Match3Controller.completeLevel()`:

1. завершает attempt telemetry;
2. читает canonical M3_00 из `levels[0]`;
3. добавляет completed index и `CUE_001`;
4. вызывает clue callback;
5. вычисляет `VN_SCENE_02_E0_POST` через `storyWinSceneIndexForLevelId()`;
6. сохраняет `scene=2`, `line=0`;
7. показывает настоящий evidence transition;
8. `continue-story` открывает canonical post-win VN, первая строка `VN0058`.

После reload Main Menu → Continue обязан вернуть `VN0058`.

## QA UX

В Diagnostics добавляется видимая кнопка `Story win boundary`.

Она предупреждает, что QA setup сбрасывает текущий Story save. Это защищает ручного тестера от случайного уничтожения прогресса и одновременно делает сценарий детерминированным.

Main Menu не меняется, поэтому четыре утверждённых Golden Samples не требуют обновления.

## Browser Gate

Новый `story-completion.pw.ts` входит в full Chromium suite автоматически.

Он намеренно не добавляется в `mobileCriticalTestMatch`, поэтому Mobile WebKit остаётся на 15 critical cases. Сначала стабилизируем cross-system journey в Chromium; mobile-specific signal здесь ниже, чем у будущего G8C1 drag/swipe.

## Automated contracts

- `StoryWinQaFixture.test.ts` доказывает one-swap real win и восстановление canonical registry, включая throw path.
- `BrowserStoryCompletionE2EContract.test.ts` запрещает hidden force-win/browser-storage shortcuts и фиксирует evidence/VN/reload assertions.
- G8A inventory обновляется до 8 specs / 21 Chromium / 15 Mobile WebKit critical.

## Не входит

- полный playthrough production M3_00;
- изменение production M3_00 balance/objectives;
- изменение `Match3Controller.completeLevel()`;
- новые graphics/assets;
- WebKit inclusion;
- later-story journey;
- Campaign progression (G8C2);
- real pointer drag/swipe (G8C1).
