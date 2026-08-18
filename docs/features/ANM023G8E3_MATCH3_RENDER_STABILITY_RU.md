# ANM-023G8E3 — Match-3 Render Stability

## Проблема

Ручной iPhone QA выявил частое визуальное мигание Match-3: перед inactivity hint, после ходов и cascade-серий, а также при появлении character reaction/bark. Причина находилась не в preview badge и не в Match3Game: transient изменения presentation-state завершались полным `renderMatch()`, который заново создавал весь `.match-screen`, HUD, board и tooltray.

При этом анимационный path уже имел `renderMatchFrame()`, который сохранял сам `.board`, но обновлял его cell markup для clear/settle/refill кадров. Финальный full render после каждого хода сводил это преимущество на нет и был особенно заметен на мобильном браузере.

## Исправление

G8E3 разделяет structural render и transient presentation sync.

Полный `renderMatch()` остаётся для настоящих screen boundaries: старт матча, возврат из Settings/Dossier и fallback при повреждённом DOM. Внутри активного матча selection, hint, objective/moves HUD, bark/reaction, tutorial overlay и завершение обычного хода обновляются через `syncMatchPresentation()` без замены `.match-screen` или `.board`.

`syncMatchPresentation()`:

- обновляет moves и objective progress существующих HUD nodes;
- меняет только `selected` / `hinted` classes на существующих board cells;
- сбрасывает завершившийся frame phase/feedback без пересоздания board;
- меняет bark markup только когда содержимое bark действительно изменилось;
- добавляет/удаляет только tutorial overlay, если tutorial-state изменился;
- сохраняет существующий reaction dismissal timer и DOM transition.

## Стабильный input после frame updates

`renderMatchFrame()` по-прежнему меняет cell markup внутри стабильного `.board`, поэтому старые per-cell listeners не могли сохраниться без последующего полного `renderMatch()`.

G8E3 переводит tap и `pointerdown` на event delegation с `.board`. Pointer move/up/cancel уже были board-level. Поэтому после clear/settle/refill новые cell nodes сразу остаются интерактивными, а board shell не нужно пересоздавать только ради повторной установки listeners.

## Browser regression

`e2e/tests/match3.pw.ts`, который входит и в Chromium full E2E, и в Mobile WebKit critical E2E, теперь фиксирует DOM identity `.match-screen` и `.board` и проверяет три пользовательских случая:

1. inactivity hint через реальный 5-секундный production timer добавляет две hinted cells без расхода хода и без замены screen/board;
2. deterministic special-created reaction появляется и автоматически исчезает, сохраняя screen/board;
3. deterministic cascade проходит production clear/settle/refill и после завершения сохраняет те же screen/board DOM nodes.

Существующий multi-action test дополнительно продолжает проверять второй ход и direct special activation после frame replacement, поэтому event delegation защищено реальным повторным interaction path.

## Scope

Нет изменений Match3Game rules, seed fixtures, balance, level content, save schema, localization strings, assets или GitHub workflows. Slice касается только render/input presentation boundary и regression coverage.

## Следующий шаг

После ручной проверки отсутствия мигания продолжаем ANM-023G8C2 — Match-3 Campaign Completion & Progression Flow.

## R1.1 — contract alignment

Первый R1 корректно остановился на read-only import gate: два существующих browser contract-теста всё ещё фиксировали старый per-cell `pointerdown` listener. R1.1 обновляет эти исторические контракты под новый board-level event delegation (`board.addEventListener('pointerdown', ...)` + `closest('[data-cell]')`). Production runtime и browser regression относительно R1 не меняются.
