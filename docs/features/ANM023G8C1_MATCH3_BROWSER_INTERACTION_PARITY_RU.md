# ANM-023G8C1 — Match-3 Browser Interaction Parity

Status: R1 candidate.
Base: `main` at `adde3599dba476499aec21d3b16a7bc09ccb214b` after merged ANM-023G8B R1.3 / PR #165.
Browser inventory with this candidate: **8 specs / 22 Chromium cases / 16 Mobile WebKit critical cases**.

## Цель

Закрыть browser-only gap из G8A: доказать, что реальный rendered Match-3 board принимает pointer drag через production wiring, а не только два DOM click из `tapSwap()`.

Один новый case в существующем `e2e/tests/match3.pw.ts` проверяет цепочку:

`Playwright mouse geometry → pointerdown → pointermove → drag preview/target reaction → pointerup → production drag commit → Match3Game`.

Production runtime не меняется: C1 только наблюдает уже существующий `Match3Controller` и `boardInteraction` contract.

## Почему Level Lab

Тест использует существующий `openDeterministicLab()` и тот же seed/fixture, который G5 уже применяет для tap-based mechanics coverage. Level Lab здесь является deterministic setup surface, но после `Play` тест взаимодействует с настоящей `.board[role="grid"]`, production cells и production `Match3Controller`.

Никакой второй Match-3 implementation, `window.__UPDS_TEST__`, browser storage mutation или synthetic `dispatchEvent()` не добавляется.

## Pointer geometry

Helper внутри spec получает `boundingBox()` source и target cells, вычисляет их центры и двигает настоящий Playwright `page.mouse` от source в направлении соседней target cell.

Используются две безопасно разнесённые дистанции:

- `0.10` расстояния между центрами — выше production target-reaction threshold `0.035`, но ниже commit threshold `0.24`;
- `0.42` — уверенно выше commit threshold и всё ещё не требует вручную кликать target cell.

Это проверяет не математическую формулу заново, а DOM/event wiring вокруг уже unit-tested `getDragPreview()` / `getSwipeDecision()`.

## Один bounded browser case

### 1. Short drag

На deterministic pair `10 → 2` тест удерживает pointer после короткого движения и проверяет:

- source получает `drag-source`;
- target получает `drag-target`;
- target ещё не получает `drag-target--commit`;
- source `.tile-stack` получает реальный `--drag-y` preview offset.

После `page.mouse.up()` drag classes очищаются, а moves, objective progress и tile variants остаются без изменений.

### 2. Committed drag

Затем тот же pair `10 → 2` двигается выше порога:

- target получает `drag-target--commit` до release;
- `pointerup` исполняет production swap source=`drag`;
- moves становятся `11` из `12`;
- objective progress становится `3/10`;
- в cell `2` появляется production `flash-row` special;
- board остаётся заполнен 64 tiles.

Итоговое состояние намеренно совпадает с уже существующим tap fixture. Поэтому новый тест доказывает parity способа ввода, а не повторяет engine coverage.

## Browser Gate

C1 добавляет case внутрь `match3.pw.ts`, поэтому:

- full Chromium suite получает его автоматически;
- existing `mobileCriticalTestMatch` уже включает `match3.pw.ts`, поэтому mobile WebKit получает тот же case без изменения workflow/config;
- Golden Samples не меняются;
- browser spec count остаётся 8, Chromium cases растут 21 → 22, Mobile WebKit critical cases 15 → 16.

WebKit здесь намеренно важен: G8A отдельно отметил real pointer input как product-critical mobile boundary.

## Automated contract

`Match3BrowserInteractionParityContract.test.ts` фиксирует:

- использование rendered `boundingBox()` + `page.mouse.down/move/up`;
- отсутствие synthetic `dispatchEvent()` и hidden browser mutation API;
- production `pointerdown/pointermove/pointerup` wiring и source=`drag`;
- reaction/commit thresholds;
- short-drag no-op assertions;
- committed deterministic state parity;
- присутствие `match3.pw.ts` в mobile-critical WebKit lane.

## Не входит

- изменение drag/swipe UX или production thresholds;
- новый touch-only implementation;
- новые Match-3 engine rules;
- Campaign result/progression;
- Story completion logic;
- новые QA controls;
- runtime assets или screenshots;
- изменение Browser Gate workflows.

Следующий отдельный audited slice — **G8C2**, Campaign completion & progression flow.
