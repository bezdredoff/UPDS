# ANM-023G8B — Story Match-3 Completion → Evidence → VN

Status: R1.3 candidate.
Base: `main` at `2d18a81c054000675d8a9875f0f440afdfe7224f` after ANM-023G8A / PR #162.
Browser inventory with this candidate: **8 specs / 21 Chromium cases / 15 Mobile WebKit critical cases**.

## Цель

Добавить один короткий Playwright journey, который доказывает production boundary после настоящей победы Story Match-3:

`M3_00 real win → clue/save → evidence → VN0058 → reload → Continue → VN0058`.

Тест не должен превращаться в Match-3 bot и не должен иметь `forceWin`/`window.__UPDS_TEST__`.

## Deterministic setup

`src/data/storyFlowQa.ts` создаёт QA level override для M3_00:

- canonical `id`, `shortId`, context и `CUE_001` сохраняются;
- tutorial отключён только в QA fixture;
- moves = 1;
- objective = один `lockedCell`;
- initial tiles гарантируют, что swap `2 ↔ 10` создаёт match рядом с blocker.

Production `Match3Controller.startMatch()` получает необязательный `levelOverride?: LevelDefinition`. Обычный Story flow по-прежнему вызывает `startMatch(levelIndex)` и использует canonical `levels[levelIndex]`. QA-кнопка передаёт `storyWinQaLevel` явно.

Это лучше, чем временная подмена registry: production `levels` никогда не мутируется. После старта Playwright делает обычные два DOM click, а `Match3Game.attemptSwap()` сам возвращает `won: true`.

## Production path under test

После победы QA override не управляет completion routing. Существующий `Match3Controller.completeLevel()`:

1. завершает attempt telemetry;
2. читает canonical M3_00 из `levels[0]`;
3. добавляет completed index и `CUE_001`;
4. вызывает clue callback;
5. вычисляет `VN_SCENE_02_E0_POST` через `storyWinSceneIndexForLevelId()`;
6. сохраняет `scene=2`, `line=0`;
7. показывает настоящий evidence transition;
8. Evidence остаётся на экране без автоперехода и ждёт явного `continue-story`;
9. `continue-story` открывает canonical post-win VN, первая строка `VN0058`.

R1.3 удаляет прежний production auto-advance `shell.schedule(..., 1800)`: игрок должен успеть прочитать найденную улику и сам решить, когда продолжить.

После reload Main Menu → Continue обязан вернуть `VN0058`.

## QA UX

В Diagnostics добавляется видимая кнопка `Story win boundary`.

Она предупреждает, что QA setup сбрасывает текущий Story save. Подсказка рекомендует нажать обычный **Hint** и сделать подсвеченный ход, поэтому сценарий можно вручную проверить на телефоне без знания индексов клеток.

Main Menu не меняется, поэтому четыре утверждённых Golden Samples не требуют обновления.

## Browser Gate

Новый `story-completion.pw.ts` входит в full Chromium suite автоматически.

Он намеренно не добавляется в `mobileCriticalTestMatch`, поэтому Mobile WebKit остаётся на 15 critical cases. Сначала стабилизируем cross-system journey в Chromium; mobile-specific signal здесь ниже, чем у будущего G8C1 drag/swipe.

Завершённый G8A audit-документ не переписывается этим feature. `BrowserCoverageAuditContract.test.ts` проверяет его как immutable исторический baseline `7 specs / 20 Chromium cases`, но не перечисляет текущий live inventory и не требует вручную allowlist-ить более поздние Playwright specs. Текущие `*.pw.ts` обнаруживаются самим Playwright через `testMatch`, а feature-specific additions защищаются собственными contracts/docs.

## Automated contracts

- `StoryWinQaFixture.test.ts` доказывает one-swap real win через настоящий `Match3Game` и неизменность canonical `levels[0]`.
- `BrowserStoryCompletionE2EContract.test.ts` после G2a-TEST-003 защищает player-visible Evidence → VN → reload/Continue boundary и запрещает browser-storage/hidden force-win/controller shortcuts, не фиксируя точный QA copy или внутреннюю форму production controllers.
- `BrowserCoverageAuditContract.test.ts` сохраняет только historical G8A baseline; `story-completion.pw.ts` не входит в центральный post-audit registry.

## Не входит

- полный playthrough production M3_00;
- изменение production M3_00 balance/objectives;
- изменение `Match3Controller.completeLevel()`;
- глобальная/временная мутация `levels`;
- новые graphics/assets;
- WebKit inclusion;
- later-story journey;
- Campaign progression (G8C2);
- real pointer drag/swipe (G8C1).
