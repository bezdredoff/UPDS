# ANM-025F2 — Match-3 Narrative Reaction Content

## Цель

Расширить mid-match narrative reactions поверх pure resolver из ANM-025F1, не меняя Match-3 механику, баланс, save schema или presentation timing.

F2 добавляет содержательные реакции на реально полезные игровые состояния вместо новых level-index условий в `Match3Controller`.

## Новые reaction families

Для каждого из четырёх production levels добавлены:

1. `objective-complete` — первая завершённая промежуточная objective;
2. `danger` — осталось ровно 2 хода;
3. `special-combo` — игрок напрямую комбинирует два specials;
4. `near-win` — хотя бы одна objective завершена и до победы остаётся 1–2 objective units;
5. `special-activated` — успешный ход реально активировал special;
6. `character-beat` — один ранний low-priority level-specific character beat на четвёртом успешном ходе.

Все новые F2 reactions — `once-per-attempt`.

## Runtime facts

`Match3Controller` не выбирает реплику. Он только передаёт resolver дополнительные read-only facts после успешного хода:

- `specialActivated`;
- `directSpecialCombo`;
- `objectivesCompleted`;
- `objectiveUnitsRemaining`;
- `won` / `lost`.

`objectivesCompleted` и `objectiveUnitsRemaining` вычисляются из текущих `LevelObjective` + `Match3Game.objectiveValue()` и не создают нового gameplay state.

Direct special combo уже определяется runtime для tutorial contract; F2 повторно использует этот факт вместо дублирования special-combo logic.

## Priority

За один успешный ход по-прежнему выбирается максимум одна reaction.

Production priority:

1. `objective-complete` — 700;
2. `danger` — 650;
3. `special-combo` — 625;
4. `near-win` — 600;
5. `low-moves` — 500;
6. `special-activated` — 450;
7. `special-created` — 400;
8. `blocker-progress` — 300;
9. `ingredient-context` — 200;
10. `character-beat` — 150;
11. `cascade` — 100.

F1 priorities относительно друг друга сохранены.

## Finished move policy

Новые F2 reactions имеют `activeAttemptOnly` и не выбираются на уже winning/losing move. Финальный ход остаётся во владении существующего win/loss presentation flow.

Это не меняет legacy F1 rules; их timing/presentation будет рассматриваться отдельно в F3.

## Character content

Новые тексты учитывают narrative profile и участников каждого production level:

- locker-search — Мику / Оноэ / Аюки / Эми;
- photo-alibi — Мику / Оноэ / Аюки / Кэнтаро;
- pool-laundry — Мику / Оноэ / Аюки / Норихиро;
- ordered-inspection — Мику / Оноэ / Аюки / Норихиро.

Контент вынесен в `src/localization/catalogs/match3Reactions.ts` и поставляется синхронно для RU и EN. Основные большие locale catalogs не раздуваются feature-specific блоком; `catalogs/index.ts` композиционно добавляет supplemental catalog.

## Не входит

- изменение move budgets, objectives, blockers, ingredient placement или spawn weights;
- новые animations / portraits / voice;
- queue, cooldown, bark duration или anti-spam presentation;
- сохранение reaction state;
- отдельная реакция на каждую из нескольких objectives одного уровня;
- новые production locales сверх текущих RU/EN foundations.

## Automated contract

`Match3NarrativeReactions.test.ts` продолжает фиксировать F1 semantics после расширения rule set.

`Match3NarrativeReactionContent.test.ts` фиксирует:

- наличие всех F2 families на всех production levels;
- RU/EN localization coverage;
- deterministic F2 priority;
- near-win gating;
- suppression F2 reactions на finished moves;
- передачу explicit runtime facts без level-index threshold arrays в controller.

## Следующий slice

**ANM-025F3 — Match-3 Narrative Reaction Presentation & QA**:

- bark timing / cooldown / anti-spam;
- interaction with animation phases and result transitions;
- telemetry review;
- mobile visual QA на iPhone;
- финальная проверка всей ANM-025F sequence перед закрытием production framework pass.
