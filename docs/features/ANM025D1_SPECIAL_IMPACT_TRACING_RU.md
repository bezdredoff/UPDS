# ANM-025D1 — Special Impact Tracing

## Почему

После HUD/Help pass игрок уже понимает правила special-инструментов, но во время быстрого clear/cascade visual causality всё ещё слабая: общий `special` feedback сообщает, что special сработал, однако источник эффекта и набор затронутых клеток читаются хуже, чем сам результат очистки.

D1 усиливает именно причинную связь, не меняя правила Match-3.

## Контракт D1

- активированный special-source получает короткий сильный pulse/glow;
- все клетки, которые уже входят в существующий clear-frame этого special, получают общий impact flash;
- `flash-row` и `flash-column` дополнительно получают локальный directional cue на source-клетке;
- обычные match clears не получают special-impact treatment;
- direct special combo естественно показывает несколько source-клеток, потому что каждая активированная special-фишка уже присутствует в clear-frame;
- эффект укладывается в существующие ~280 ms clear animations и не добавляет отдельной паузы;
- `prefers-reduced-motion: reduce` отключает новые animations.

## Почему без engine/controller state

Текущий rendering contract уже содержит нужную причинность:

1. clear-frame выставляет board class `phase-clear`;
2. затронутые видимые клетки получают `is-clearing`;
3. snapshot кадра создаётся до удаления содержимого, поэтому активированный source всё ещё содержит `.special`;
4. special, созданный текущим match и сохранённый на поле, не входит в clearing set, поэтому не ошибочно маркируется source.

D1 использует CSS `:has()` поверх этого существующего DOM contract. Проект уже использует `:has()` в production styles, поэтому новый browser requirement не появляется.

## Что намеренно не меняется

- special taxonomy и special rules;
- direct-combo rules;
- clear targets, cascades, blocker damage и ingredient movement;
- move budgets, balance и level definitions;
- Match3Frame schema;
- controller state, timers и render cadence;
- audio, telemetry и save schema;
- Hint, Help и tutorial contracts.

## Blocker re-audit

G1 уже закрыл semantic blocker simplification: три reusable style, единый HUD-term и явный permeability contract. D не должен возвращать сюжетные blocker-типы.

При этом G1 намеренно оставил visual blocker-art readability за рамками. Поэтому после D1 следующий визуальный срез должен отдельно проверить `locked / solid / overlay` на реальном phone canvas и только затем решать, нужны ли изменения art/CSS. Это будет D2, а не часть D1.

## Automated gate

`Match3SpecialImpactTracing.test.ts` фиксирует:

- special treatment включается только если в clearing set есть special-source;
- source и impact targets имеют разные уровни visual emphasis;
- row/column source получают directional cue;
- никаких новых engine impact fields/state не добавлено;
- reduced-motion contract сохранён;
- production entrypoint грузит новый stylesheet.

Отдельный Playwright spec не добавляется: существующий Match-3 Browser Gate уже выполняет deterministic special creation/activation на production controller, а D1 не меняет interaction contract.

## Preview / iPhone QA

1. В Level Lab создать `flash-row`, затем активировать его double-tap: source должен читаться первым, после чего легко прослеживается набор очищаемых клеток.
2. Повторить с `flash-column`: source остаётся сильнее targets, directional cue визуально отличается от row.
3. Выполнить direct combo двух specials: обе source-клетки должны быть заметны, общий impacted set — читаться как один причинный эффект.
4. Сделать обычный match без special: остаётся стандартный clear animation без золотисто-бирюзового impact tracing.
5. Проверить, что board/HUD не двигаются и clear/cascade не ощущаются медленнее.
6. При системном Reduce Motion новые pulse/flash animations должны отсутствовать, при этом обычная функциональность Match-3 сохраняется.

После D1 перейти к D2 — blocker/asset readability audit на реальном mobile viewport.
