# ANM-025A — Match-3 Golden Sample Parity R2

Статус: candidate.

## Почему появился R2

Первый candidate #62 был технически корректен, но iPhone QA показал, что визуальная разница с существующим pre-release Match-3 skin почти не считывается. Причина: R1 менял в основном оттенки и мелкие параметры уже существующей cream/green/navy композиции.

R2 делает presentation hierarchy заметно другой, не меняя механику.

## Production presentation contract

Golden Sample трактуется как case-file / evidence-board интерфейс:

- scene background заметно уходит назад через более тёмный grade;
- intro становится физической карточкой расследования с зелёным spine и navy moves strip;
- objective HUD остаётся светлым paper/evidence блоком;
- moves board становится тёмным navy counter-block с крупным контрастным числом;
- основная 8×8 доска получает толстую paper/gold/navy рамку и контрастные plum/navy sockets;
- tool tray становится отдельной тёмной detective console;
- hint остаётся зелёным primary action с gold border;
- compact и low-height правила сохраняют доступность игрового поля.

Визуальный слой вынесен в `src/match3Production.css`, импортируемый после общих `style.css` и `viewport.css`. Это становится узким владельцем Match-3 production presentation для последующих 025B–F.

## Non-goals

ANM-025A R2 не меняет:

- `Match3Controller.ts`;
- `Match3Game.ts` и move legality;
- special/combo taxonomy;
- level definitions, move budgets, spawn weights;
- save schema;
- telemetry semantics;
- narrative level context (025B);
- tile variation system (025C);
- tutorial framework (025D).

## iPhone QA

1. На `/preview/` должен быть виден `PREVIEW · <build-id>`.
2. M3_00 intro должен визуально отличаться от stable сразу, до внимательного сравнения деталей.
3. В матче board должен быть главным объектом: толстая светлая рамка + тёмные sockets.
4. Objectives и moves должны читаться как разные по приоритету блоки; число moves — самое заметное число HUD.
5. Detective/tool tray должен быть визуально отделён от board.
6. Все шесть базовых tile types должны оставаться читаемыми.
7. Tap, drag, invalid swap, hint, special и result flow должны работать как раньше.
8. На compact portrait и landscape не должно быть критического clipping.
