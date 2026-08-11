# ANM-016B · VN Dialogue Text Fit & Adaptive Paging

Version: `0.16.2-anm016b`

## Goal

Guarantee that authored VN text remains fully readable on supported iPhone-sized viewports without scrolling inside the dialogue card or changing stable VN line IDs.

## Changes

- One authored `VNxxxx` line may be presented as multiple internal UI pages when the viewport/text scale requires it; the current authored screenplay needs at most two.
- Internal pages do **not** create new narrative IDs and do not change the screenplay.
- A VN line becomes read only after its final internal page is advanced.
- `save.line` advances only after the final page, preserving existing save/choice semantics.
- AUTO advances page-by-page and calculates timing from the currently visible page.
- Compact screens receive a smaller word/character budget; large text reduces the budget further.
- Pagination prefers a nearby sentence boundary when possible. R2 fixes an off-by-one that could skip a valid boundary exactly at the minimum natural-cut position.
- Dialogue content no longer relies on an internal vertical scrollbar as the normal overflow path.
- Additional top spacing keeps text clear of the overlapping nameplate area.
- Multi-page lines show `VNxxxx · 1/2`, `2/2` and matching progress dots.

## Supported presentation profiles

The automated audit covers:

- 320×568 normal / large
- 375×667 normal
- 390×844 normal / large
- 430×932 normal

Every generated page is checked against its deterministic word/character budget and must reconstruct the authored text exactly when pages are joined.

## Non-goals

ANM-016B intentionally does not address:

- character staging (ANM-016A already completed);
- nameplate z-order (ANM-016C);
- header contrast (ANM-016D);
- narrative wording or VN IDs;
- Match-3 behavior.

## Manual QA

1. On 320×568 or another short viewport, open `VN0001`: it should page instead of scrolling/clipping.
2. First tap on page 1/2 keeps the same VN ID and changes only to page 2/2.
3. Second tap advances to the next authored VN line.
4. Enable large text: more long lines may page, but none should clip.
5. AUTO must advance through internal pages before changing VN line.
6. Reopen/reload a scene: it starts from page 1 of the saved VN line without corrupting campaign progress.
7. SKIP remains based on authored read-line state, not internal page numbers.
