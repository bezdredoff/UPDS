# G2-TOUCH-001 — compact production touch targets

## Цель

Не допускать уменьшения интерактивных player-facing controls ниже 44 px по высоте в компактном portrait-профиле, включая минимальный regression viewport 320×568.

## Повторный аудит current main

Перед изменением подтверждены три реально достигаемых нарушения baseline:

- Match-3 Campaign: базовое правило 44 px, но compact media-query уменьшал кнопки карточек до 42 px;
- Settings: language select имел `min-height: 42px`;
- VN Config: audio preview actions имели более специфичный `min-height: 40px`.

Для Match-3 Hint отдельная правка не нужна: production-слой уже задаёт 48 px в обычном профиле и 44 px в compact-профиле. Старое legacy-правило 38 px перекрывается более поздним `match3Production.css`. G2-TOUCH-001 специально не переопределяет Hint, чтобы не менять утверждённую Golden Sample геометрию обычного Match-3 viewport.

QA-only Scene Studio / Level Lab и PWA update UI не входят в этот slice.

## Реализация

`src/ui/accessibilityTouchTargets.css` задаёт `min-height: 44px` только для реально нарушавших baseline controls:

- Settings language select;
- VN Config audio preview buttons;
- Match-3 Campaign level-card buttons.

Файл подключён через существующий shared `systemControls.ts`, чтобы не переписывать большие CRLF entry/style файлы и не создавать шумный diff.

## Проверка

`tests/TouchTargetAccessibility.test.ts` защищает CSS selectors и wiring, а также проверяет, что Match-3 Hint сохраняет 48 px в обычном production-профиле и 44 px только в compact-профиле.

Существующий mobile-critical `e2e/tests/boot.pw.ts` дополнен browser regression на 320×568. Он измеряет фактическую высоту DOM controls через `getBoundingClientRect()` для Settings, Campaign и VN Config и требует не менее 44 px. Новый Playwright spec-файл не создаётся.

## Вне scope

- Campaign locked-card readability — G2-READ-001;
- PWA safe-area/offline/update;
- Match-3 balance/design;
- QA tool ergonomics.
