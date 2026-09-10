# G2-A11Y-003 · VN modal focus management

## Цель

Закрыть accessibility-регрессию History/Config в production VN: модальные overlay уже имели `role="dialog"` и `aria-modal="true"`, но до этого не управляли keyboard focus.

## Production contract

При открытии `.vn-overlay`:

- фоновые sibling-элементы внутри `.phone` получают `inert` и перестают участвовать в keyboard/pointer interaction;
- фокус переводится внутрь overlay, по умолчанию на `#close-overlay`;
- `Tab`/`Shift+Tab` циклически остаются внутри текущего overlay;
- `Escape` активирует существующий close action;
- после закрытия фокус возвращается на исходный VN trigger (`#history` или `#header-settings`);
- если Config перерисовывается после изменения настройки, фокус восстанавливается на логически тот же control, когда у него есть стабильный selector.

Runtime behavior существующих кнопок, VN paging, save/load, Match-3, PWA и визуальная геометрия не меняются.

## Validation

Browser regression добавлен в существующий `e2e/tests/vn-navigation.pw.ts`, поэтому он выполняется и в Chromium, и в Mobile WebKit critical gate без создания нового Playwright spec-файла. Отдельный source-contract фиксирует wiring focus manager, `inert`, Escape/Tab handling и focus restore.

## Out of scope

- G2-TOUCH-001 — минимальный размер touch targets;
- G2-READ-001 — readability locked Campaign cards;
- PWA safe-area/offline/update;
- общий refactor modal/navigation architecture.
