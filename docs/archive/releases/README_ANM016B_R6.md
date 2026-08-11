# ANM-016B R6 — Two-Line Balanced Dialogue Paging

Version: `0.16.7-anm016b-r6`

## Goal

Make VN dialogue presentation visually stable and localisation-safe: a normal dialogue page has room for two complete lines; text that does not fit is split into internal presentation pages without changing authored `VNxxxx` IDs.

## Behaviour

- visible dialogue viewport is sized for two rendered lines plus padding/safety reserve;
- browser render measurement remains the runtime source of truth;
- non-final internal pages display a presentation-only `…`;
- ellipsis width is included in the fit predicate;
- split priority: sentence → word → grapheme only as a last resort;
- continuation tails prefer at least 4 words and have a hard floor of 3 words when possible;
- CJK uses locale-aware grapheme thresholds instead of whitespace word counts;
- short orphan tails are rebalanced backwards across page boundaries where the rendered fit permits it;
- original screenplay text, `VNxxxx`, `readLines`, `save.line`, backlog and choice semantics remain unchanged.

## Preserved

ANM-016A staging, ANM-016C R2 stage/dialogue seam and nameplate layering, Match-3, assets, narrative and pipeline contracts are unchanged.
