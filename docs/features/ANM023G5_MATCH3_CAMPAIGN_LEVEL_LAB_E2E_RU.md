# ANM-023G5 — Match-3 Campaign + deterministic Level Lab E2E

Статус поставки: **MERGED**.

## Цель

Добавить browser coverage Match-3 через существующие production QA/product surfaces, не создавая отдельный test engine и не добавляя runtime hooks.

## Архитектурная граница

G5 не меняет `src/`.

Browser проходит только существующие UI-маршруты:

`Main Menu → Match-3 Campaign → production Match3Controller → Match3Game`

и

`Main Menu → Level Lab → visible draft editor → Play Draft → production Match3Controller → Match3Game`.

В helper/spec нет импорта `Match3Game`, прямого доступа к controller и `window.__TEST__`.

## Campaign smoke

Первая campaign-карточка всегда доступна после browser reset.

Проверяется:

- открывается production `.match-screen`;
- stage id равен `M3_00`;
- стартовый budget равен 24 ходам;
- production board содержит 64 cells;
- browser health остаётся чистым.

## Deterministic Level Lab fixture

G5 использует только поля существующего Level Lab:

- seed;
- moves;
- `initialTiles`;
- blockers;
- ingredients;
- objectives;
- Apply;
- Play Draft.

Draft задаёт полностью фиксированную 8×8 доску из шести production match identities. На ней нет immediate matches, но заранее известны несколько legal moves.

Blockers и ingredients в draft очищаются, objective заменяется на:

`collect pantiesSportWhite ×10`.

Production level definitions не изменяются.

### Seed 7

Swap `10 → 2` создаёт горизонтальную четвёрку `pantiesSportWhite`.

После production resolution:

- тратится ровно один ход;
- objective = `3/10`;
- в cell 2 остаётся `flash-row`;
- refill детерминирован и проверяется по `data-tile-variant`.

Затем два обычных DOM click по свежему cell 2 проходят через production click handlers и активируют special:

- тратится ещё один ход;
- objective = `6/10`;
- special исчезает после activation.

### Seed 424242

Тот же swap является deterministic cascade fixture.

Первый refill создаёт следующую комбинацию, special вовлекается в cascade, и итоговый objective progress становится `7/10`. Проверяется финальная settled board, а не timeout/animation frame.

Эти две seed semantics были подтверждены первым реальным ANM-023G7A Chromium Browser Gate; исходный G5 документ ошибочно описывал их в обратном порядке.

## Legal и invalid swaps

Legal move не хардкодится там, где этого не требуется:

1. browser нажимает production `#hint`;
2. controller вызывает настоящий `Match3Game.getHintMove()`;
3. UI отмечает две `.hinted` клетки;
4. Playwright нажимает эти две клетки как игрок;
5. ход уменьшается ровно на один и objective получает progress.

Для invalid contract используется известная adjacent no-match пара `4 → 5` deterministic fixture. После неё moves и objective не меняются, tiles в обеих клетках остаются прежними.

## Почему reduced motion

Playwright включает `prefers-reduced-motion: reduce`.

Это не test-only branch: controller уже использует этот browser preference в production и при reduced motion показывает финальный settle/reshuffle frame без искусственных задержек. Поэтому E2E не содержит `waitForTimeout()`.

## CI boundary

`match3.pw.ts` остаётся вне root `npm run check`.

Root CI проверяет `Match3BrowserE2EContract.test.ts`, а executable browser suite запускается отдельным Browser Gate начиная с ANM-023G7A.
