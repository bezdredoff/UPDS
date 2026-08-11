# ANM-016B R5 — Presentation Audit Alignment

Version: `0.16.6-anm016b-r5`

This is a narrow corrective release on top of ANM-016B R4.

## Fix

`tests/VnPresentationAudit.test.ts` still asserted the pre-R4 flex-based `.dialogue-text` CSS shape. R4 intentionally changed the dialogue area to a stable grid viewport and isolated render-measurement probe. The production implementation was correct, but the audit was stale.

R5 updates the audit to verify the current semantic contract instead:

- four-row VN shell remains stable;
- dialogue card uses `grid-template-rows: minmax(0, 1fr) auto`;
- dialogue text is a fixed-height block viewport with `min-width/min-height: 0` and hidden overflow;
- render-measured pagination is wired through `createDialogueRenderedFit(textElement)`;
- background and portrait staging assertions are preserved.

No gameplay, narrative, art, staging, nameplate, Match-3 or pipeline behavior is changed.
