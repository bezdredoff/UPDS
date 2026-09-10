# G2-UI-002 / G2-VN-001 — Player-facing metadata hardening

## Цель

Убрать из обычного player-facing UI внутренние build/authoring идентификаторы, сохранив необходимые QA hooks и runtime semantics.

## Изменения

- Main Menu показывает только player-facing `APP_VERSION`; внутренний `BUILD_LABEL` остаётся в Diagnostics.
- VN dialogue больше не показывает canonical line ID вида `VN####`; ID остаётся только в скрытом `.qa-line-id` для browser E2E и runtime tooling.
- History показывает порядковый номер записи вместо canonical line ID.
- Legacy `CHOICE_00`, story-choice gate IDs и option IDs `A/B/C` больше не отображаются как текст; `data-choice` / `data-story-choice` сохраняются для поведения и тестов.
- Layout choice buttons сохраняет отдельную marker-column через нейтральный декоративный символ.

## Не входит в scope

- accessible name кнопки Continue;
- `aria-pressed` для AUTO/config controls;
- modal focus management;
- touch-target sizing;
- Campaign readability;
- PWA/safe-area/offline/update.

## Regression coverage

`tests/PlayerFacingMetadata.test.ts` фиксирует границу между видимым UI и скрытыми QA metadata. Существующие browser helpers продолжают находить VN line IDs через `.qa-line-id`, без player-facing текста.
