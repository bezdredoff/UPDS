# ANM-016B R5 — Validation report

Версия: `0.16.6-anm016b-r5`

## Причина R5

GitHub Quality Gate падал в `tests/VnPresentationAudit.test.ts`: audit всё ещё ожидал pre-R4 flex-контракт `.dialogue-text`, хотя R4 намеренно перевёл dialogue body на стабильный grid viewport для render-measured pagination.

## Исправление

Production runtime R4 не изменён. Обновлён presentation audit, который теперь проверяет актуальные инварианты:

- four-row VN shell;
- `dialogue` grid `minmax(0, 1fr) auto`;
- `.dialogue-text` как `display:block; width:100%; height:100%` viewport;
- `min-width:0; min-height:0`;
- `overflow:hidden`;
- wiring `createDialogueRenderedFit(textElement)`;
- прежние background/portrait staging assertions.

## Проверки

- strict TypeScript (`tsc --noEmit`): PASS
- semantic equivalent of failing presentation audit: PASS
- stale pre-R4 flex assertion absent: PASS
- package-lock dependency graph unchanged: PASS
- workflows / validator: BYTE-EXACT vs R4
- narrative / screenplay / levels / rigs: BYTE-EXACT vs R4
- Match3 / CampaignStore: BYTE-EXACT vs R4
- ANM-016C seam/nameplate runtime: BYTE-EXACT vs R4
- R4 dialogue measurement runtime: BYTE-EXACT vs R4
- `public/assets/**`: BYTE-EXACT vs R4

Full Vitest remains authoritative in GitHub importer; R5 specifically repairs the stale assertion that caused the reported failure.
