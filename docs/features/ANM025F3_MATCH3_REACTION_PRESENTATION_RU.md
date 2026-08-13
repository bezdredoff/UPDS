# ANM-025F3 — Match-3 Narrative Reaction Presentation / Timing / Anti-Spam

## Цель

Закрыть production presentation слой для mid-match narrative reactions после F1/F2: дать репликам предсказуемое время жизни, не позволять повторяемым каскадам спамить UI, не дёргать геометрию доски и сделать поведение наблюдаемым через telemetry.

F3 **не меняет Match-3 механику, баланс, objective rules, resolver priorities, save schema или narrative content F2**.

## Presentation policy

`src/ui/match3ReactionPresentation.ts` — pure presentation policy поверх результата F1/F2 resolver.

Для каждого semantic reaction ID задаются:

- `durationMs` — сколько реплика живёт на экране;
- `cooldownMs` — presentation cooldown;
- `emphasis` — `urgent | strong | standard | light`.

Одноразовые `once-per-attempt` reactions никогда не подавляются presentation-слоем. Это сохраняет важные F2 beats (`objective-complete`, `danger`, `special-combo`, `near-win`, character beats и т.д.).

Только repeatable `cascade` получает anti-spam cooldown: 3600 ms. Его визуальный hold короче — 1700 ms.

## Timing tiers

- `objective-complete`, `danger`: 3200 ms, urgent;
- `near-win`: 3000 ms, strong;
- `special-combo`: 2600 ms, strong;
- `special-activated`: 2300 ms, strong;
- `low-moves`, `character-beat`: 2800 ms;
- contextual progress reactions: 2300–2600 ms;
- repeatable cascade: 1700 ms + 3600 ms cooldown.

Значения являются presentation constants, не gameplay tuning.

## Runtime integration

`Match3Controller` по-прежнему:

1. получает semantic reaction от `resolveMatch3Reaction`;
2. передаёт её pure presentation policy;
3. если reaction разрешена — локализует и показывает;
4. если repeatable cascade попал в cooldown — не меняет текущий bark;
5. сбрасывает presentation state между попытками.

Показанная narrative reaction автоматически очищается после своего hold. Hold-таймер стартует только при фактическом `renderMatch`, а не в момент resolver decision до move animation; повторный render не перезапускает timer или entrance. Timer не перерендеривает всю Match-3 сцену: DOM bark удаляется отдельно, поэтому input/board state не пересоздаются.

## Stable mobile layout

`field-bark-slot` резервирует прежние 42 px bark-высоты плюс существующий 5 px нижний зазор. Поэтому исчезновение timed reaction не должно сдвигать board/HUD на iPhone.

`src/match3ReactionPresentation.css` добавляет:

- короткий entrance;
- hold/fade lifecycle;
- emphasis variants;
- reduced-motion fallback без slide movement.

## Telemetry review

Событие `match_reaction` сохраняет прежний semantic payload и теперь дополнительно содержит presentation outcome:

Для показанной реакции:

- `action: shown`;
- `durationMs`;
- `cooldownMs`.

Для подавленного repeatable cascade:

- `action: suppressed`;
- `suppressionReason: cooldown`;
- `cooldownMs`.

Telemetry остаётся наблюдателем и не влияет на resolver/presentation decisions.

## Automated contract

`Match3NarrativeReactionPresentation.test.ts` фиксирует:

- once-per-attempt reactions не подавляются;
- cascade подавляется внутри cooldown и снова разрешается после него;
- timing/emphasis policy детерминирована;
- presentation policy не зависит от DOM/runtime/Match3Game;
- controller имеет stable bark slot и shown/suppressed telemetry;
- CSS содержит lifecycle animation и reduced-motion path.

## Mobile QA после CI

На iPhone проверить:

1. доска не прыгает вверх/вниз при появлении и исчезновении reaction bark;
2. bark мягко появляется и самостоятельно исчезает;
3. urgent reactions читаются достаточно долго;
4. быстрые повторные cascade 2+ не создают серию одинаковых реплик;
5. once-per-attempt F2 reactions по-прежнему появляются;
6. invalid swap / hint / tutorial / start / win / lose flows не сломаны;
7. Story, Match-3 Campaign и Level Lab работают одинаково стабильно;
8. при `prefers-reduced-motion` нет slide-анимации;
9. telemetry export содержит `match_reaction` с `shown`/`suppressed` outcome.

После успешного CI и mobile QA ANM-025F можно считать production-complete по narrative reaction framework; дальнейшие новые реплики добавляются как content, а не через новую controller-логику.
