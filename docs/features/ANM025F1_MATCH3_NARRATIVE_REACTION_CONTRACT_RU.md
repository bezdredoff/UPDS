# ANM-025F1 — Match-3 Narrative Reaction Contract

## Цель

Вынести выбор mid-match narrative barks из `Match3Controller` в отдельный data-driven pure resolver без изменения Match-3 механики, баланса или save schema.

## Контракт

`src/data/match3Reactions.ts` владеет:

- stable semantic reaction IDs;
- typed triggers;
- explicit priority;
- once-per-attempt/repeatable policy;
- speaker character key;
- localization message key;
- production rules, адресованными по stable `level.id`, а не по позиции уровня в массиве.

`Match3Controller` передаёт resolver только snapshot gameplay state и уже показанные once-per-attempt reaction IDs. Resolver не зависит от DOM, runtime services, session/save или `Match3Game`.

## Мигрированное поведение

F1 сохраняет текущую семантику четырёх production levels:

1. `low-moves` — ровно 5 оставшихся ходов;
2. `special-created` — первый созданный special;
3. `blocker-progress` — level-specific milestone;
4. `ingredient-context` — первый успешный ход;
5. `cascade` — cascade 2+.

Priority соответствует этому порядку. За один move выбирается максимум одна reaction.

`low-moves`, `special-created`, `blocker-progress` и `ingredient-context` — once per attempt. `cascade` остаётся repeatable.

## Runtime

Один resolver используется в:

- Story Match-3;
- Match-3 Campaign;
- Level Lab.

Reaction state живёт только внутри текущей попытки и не сохраняется. Level Lab не получает save side effects.

После фактического выбора controller отправляет `match_reaction` telemetry с `reactionId`, `levelId`, `mode`, `speaker` и `movesLeft`.

## Не входит

- новые mechanics/objectives/blockers;
- изменение move budgets, ingredient placement или spawn weights;
- массовое написание новых bark content;
- queue/cooldown/timing polish;
- новые portraits/animations;
- переработка start/win/lose и invalid-swap/hint barks.

## Automated contract

`Match3NarrativeReactions.test.ts` фиксирует:

- stable level-id ownership;
- deterministic priority;
- once-per-attempt suppression;
- repeatable cascade;
- одинаковый resolver contract для Story/Campaign/Lab;
- отсутствие DOM/runtime dependencies;
- отсутствие старых level-index reaction tables в `Match3Controller`.

## Следующие slices

- **ANM-025F2** — расширенный narrative reaction content: objective complete, special activation/combo, near-win/danger и character-specific beats;
- **ANM-025F3** — presentation/timing/anti-spam/mobile QA и telemetry review.
