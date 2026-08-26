# ANM-025G3C — Reason-Specific Invalid-Move Feedback

Candidate label: `ANM-025G3C R1 · Reason-Specific Invalid-Move Feedback`.

## Причина

Human playtest на M3_07 дал 15 невалидных действий: игрок пытался двигать заблокированные клетки и сюжетный объект, а общий баннер `ОБМЕН НЕДОСТУПЕН` не объяснял, какое именно правило нарушено. Engine уже возвращал точную причину (`no-match`, `blocked`, `ingredient`, `not-adjacent`) и telemetry v2 её сохраняет, поэтому проблема была только в player-facing feedback.

## Контракт

Каждая обычная невалидная попытка обмена теперь получает короткое объяснение причины:

- `no-match` → `НЕТ СОВПАДЕНИЯ`;
- `blocked` → `ПЕРЕМЕЩЕНИЕ ЗАБЛОКИРОВАНО`;
- `ingredient` → `СЮЖЕТНЫЙ ОБЪЕКТ НЕЛЬЗЯ ПЕРЕМЕЩАТЬ`;
- `not-adjacent` → `ВЫБЕРИТЕ СОСЕДНЮЮ ФИШКУ`.

RU / EN / BE используют один и тот же typed resolver. Для редких не-player swap причин (`same-cell`, `no-special`, `finished`) сохраняется безопасный generic fallback.

Character bark остаётся вторым уровнем объяснения: blocked, story object и no-match сохраняют существующие подсказки, а non-adjacent получает отдельную реплику о соседних фишках.

## Что намеренно не меняется

- move legality и shared legality contract;
- move budgets, objectives, blockers, ingredient routes, seeds, spawn weights и balance;
- расход хода: невалидная попытка по-прежнему не тратит ход;
- no-match swap-return animation и invalid shake/lock;
- 30-секундный auto-hint и G3B hint ranking;
- telemetry v2 schema / IDs / board revisions;
- reshuffle behavior и его UX — это следующий отдельный Slice B PR.

## Regression contract

- typed resolver фиксирует четыре player-action причины и generic fallback;
- RU / EN / BE содержат все новые короткие сообщения;
- runtime banner больше не сводит blocked / ingredient / not-adjacent к `swapUnavailable`;
- explanatory character barks остаются привязаны к той же причине;
- browser contract продолжает проходить через production `Match3Controller`;
- engine legality tests остаются источником истины для того, является ход валидным или нет.

## Preview QA

На M3_07 проверить четыре ситуации:

1. обмен, который не создаёт совпадение → `НЕТ СОВПАДЕНИЯ`;
2. попытка сдвинуть заблокированную клетку → `ПЕРЕМЕЩЕНИЕ ЗАБЛОКИРОВАНО`;
3. попытка двигать сюжетный объект → `СЮЖЕТНЫЙ ОБЪЕКТ НЕЛЬЗЯ ПЕРЕМЕЩАТЬ`;
4. drag/tap на несоседнюю фишку → `ВЫБЕРИТЕ СОСЕДНЮЮ ФИШКУ`.

Во всех четырёх случаях moves left не должен уменьшаться. После ошибочной попытки следующий валидный ход должен выполняться нормально.

Merge допускается после зелёных UPDS CI + Browser Gate и короткого iPhone preview smoke. Новые assets или golden screenshots для G3C не нужны.
