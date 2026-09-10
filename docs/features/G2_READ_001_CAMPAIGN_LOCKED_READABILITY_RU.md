# G2-READ-001 — читаемость locked Campaign cards

## Цель

Сохранить locked progression slot очевидно недоступным, но не ухудшать читаемость его статуса и disabled action из-за каскадного затемнения всей карточки.

## Повторный аудит current main

После G2-CAM-001 (#274) spoiler-поведение уже корректное: locked карточка не показывает будущий case ID, title или story action. Проблема G2-READ-001 находится только в presentation layer.

Legacy CSS применял к `.campaign-level-card.locked` одновременно `opacity: .58` и `filter: saturate(.55)`. Disabled button внутри карточки дополнительно имел собственное снижение opacity. В результате heading, status badges и action визуально глушились вместе с контейнером.

## Реализация

`src/features/match3Campaign/campaignReadability.css` загружается непосредственно production `Match3CampaignController` и действует только внутри `.match3-campaign-screen` на locked cards:

- whole-card `opacity` возвращается к `1`;
- `filter` сбрасывается в `none`;
- locked state остаётся отличимым через нейтральные background/border/shadow;
- heading и meta используют тёмные foreground colors на светлых surfaces;
- disabled button остаётся визуально disabled, но больше не получает дополнительное затемнение текста.

Unlocked и completed cards этим stylesheet не изменяются. Unlock logic, button behavior, level identity и localization copy не меняются.

## Проверка

- `tests/CampaignLockedReadability.test.ts` защищает stylesheet wiring, locked-only scope и spoiler-safe identity contract.
- Существующий mobile-critical `e2e/tests/boot.pw.ts` на 320×568 проверяет фактический computed style locked card: `opacity: 1`, `filter: none`, читаемые heading/meta/button colors и `button opacity: 1`.
- Существующий `campaign-spoilers.pw.ts` продолжает отвечать за отсутствие будущего `M3_*`, title/story leakage.

Golden Sample для Campaign сейчас отсутствует; существующие VN/Match-3 Golden surfaces этим locked-only selector не затрагиваются.

## Вне scope

- изменение Campaign progression/unlock logic;
- новые labels/icons или редизайн карточек;
- Match-3 balance/design;
- PWA safe-area/offline/update;
- QA-only surfaces.
