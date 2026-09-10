# G2-TOUCH-001 — compact production touch targets

## Цель

Не допускать уменьшения интерактивных player-facing controls ниже 44 px по высоте в компактном portrait-профиле, включая минимальный regression viewport 320×568.

## Повторный аудит current main

Перед изменением подтверждены три реально достигаемых нарушения baseline:

- Match-3 Campaign: базовое правило 44 px, но compact media-query уменьшал кнопки карточек до 42 px;
- Settings: language select имел `min-height: 42px`;
- VN Config: audio preview actions имели более специфичный `min-height: 40px`.

В старом compact CSS также остаётся `hint-button { min-height: 38px; }`, но более поздний `match3Production.css` уже возвращает Hint к 44 px при том же compact-профиле. G2-TOUCH-001 дополнительно фиксирует 44 px более специфичным production accessibility rule, чтобы значение не зависело от порядка legacy-правил.

QA-only Scene Studio / Level Lab и PWA update UI не входят в этот slice.

## Реализация

`src/ui/accessibilityTouchTargets.css` задаёт `min-height: 44px` для:

- Settings language select;
- VN Config audio preview buttons;
- Match-3 Campaign level-card buttons;
- Match-3 Hint.

Файл подключён через существующий shared `systemControls.ts`, чтобы не переписывать большие CRLF entry/style файлы и не создавать шумный diff.

## Проверка

`tests/TouchTargetAccessibility.test.ts` защищает CSS selectors и wiring.

Существующий mobile-critical `e2e/tests/boot.pw.ts` дополнен browser regression на 320×568. Он измеряет фактическую высоту DOM controls через `getBoundingClientRect()` для Settings, Campaign и VN Config и требует не менее 44 px. Новый Playwright spec-файл не создаётся.

## Вне scope

- Campaign locked-card readability — G2-READ-001;
- PWA safe-area/offline/update;
- Match-3 balance/design;
- QA tool ergonomics.
