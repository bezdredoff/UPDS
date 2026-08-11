# ANM-016B R3 — Render-measured localisation-safe dialogue paging

ANM-016B R3 replaces word/character-count paging as the browser runtime source of truth.

## Runtime contract

- Authored VN IDs are unchanged.
- A long authored line may still render as internal pages `1/N ... N/N`.
- `save.line` and `readLines` advance only after the final internal page.
- Browser paging is determined from the real rendered `.dialogue-text` viewport using `clientHeight` / `scrollHeight` and `clientWidth` / `scrollWidth`.
- The deterministic word/character budget remains only as a headless/non-DOM fallback.
- Sentence boundaries are preferred.
- Oversized sentences use locale-aware word segmentation when `Intl.Segmenter` exists, then grapheme fallback.
- Locale is read from `document.documentElement.lang` (currently `ru`).
- Reflow is recalculated after viewport/orientation changes and after `document.fonts.ready`.
- CSS enables `hyphens: auto`, `overflow-wrap: break-word`, `line-break: auto` and reserves bottom padding so glyph descenders are not clipped.

## Scope protection

ANM-016C R2 stage/dialogue seam and nameplate layering remain intact. Character assets, narrative IDs, choice semantics, Match-3 gameplay, save key and GitHub workflows are not intentionally changed.
