# ANM-016C Validation Report

Версия: `0.16.3-anm016c`

## Scope

Узкая подфича VN presentation: speaker nameplate должен полностью отображаться поверх нижней части сцены, а не обрезаться границей dialogue card.

## Реализация

- `.dialogue-shell`: `z-index: 8`, `isolation: isolate`, `overflow: visible`.
- `.stage` остаётся на `z-index: 2`, поэтому dialogue hierarchy гарантированно выше scene layer.
- `.dialogue`: `overflow: visible` вместо `hidden`.
- `.dialogue .name`: явный `z-index: 5`, отрицательный `top` сохранён.
- `.dialogue-text`: остаётся `z-index: 1`, paging/overflow текста не изменены.

## Проверки

- strict TypeScript: PASS.
- regression test `VnNameplateLayering.test.ts`: компилируется strict TypeScript и фиксирует layering contract.
- diff против ANM-016B R2: только style/version/test/docs.
- `public/assets/**`: byte-exact.
- `.github/workflows/**`: byte-exact.
- `scripts/validate-upload-zip.py`: byte-exact.
- narrative / screenplay / levels / character rigs / Match3 / CampaignStore: byte-exact.

## Не входит

- ANM-016A staging;
- ANM-016B adaptive paging;
- ANM-016D header contrast;
- новые изображения или gameplay changes.
