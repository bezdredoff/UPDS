# ANM-016 — current presentation & interaction polish contract

This document replaces the incremental ANM-016/A/B/C/D/E and R3/R4/R5 implementation notes as the **current** contract. Historical notes remain in `docs/archive/feature-notes/`.

## VN staging

- production portraits are half-body/close-up rather than centered full-body;
- portrait lower body continues below the stage and is occluded naturally by the dialogue card;
- stable lanes: left/right, with centered Miku internal thoughts where appropriate;
- background uses contain-over-fill layering so important 9:16 content remains visible.

## Dialogue seam and nameplate

- stage permits portrait overflow;
- dialogue card sits above the lower portrait;
- nameplate is a sibling layer above both stage and dialogue card and must never be clipped by the clickable dialogue element.

## Dialogue paging

- visible dialogue viewport is designed for two fully visible text lines plus safety padding;
- browser runtime uses detached render measurement as the source of truth;
- deterministic word/character budgeting exists only as headless fallback;
- split preference: sentence → word → locale-aware grapheme;
- non-final internal pages show presentation-only `…`;
- whitespace-language continuation avoids 1–2-word orphan tails when redistribution is possible (target 4 words, floor 3);
- CJK text uses locale-aware grapheme segmentation without injecting Latin spaces;
- paging recalculates after relevant viewport/font changes;
- internal pages never create/change authored `VN` IDs or save semantics.

## Header/navigation

- high-contrast shared 44×44 icon-action language;
- VN persistent actions: CASE, LOG, Settings;
- Match-3: contextual Back/Dossier/Settings;
- global Main Menu is inside Settings/CONFIG rather than a permanent gameplay header action;
- Settings returns to the caller screen;
- leaving an active Match-3 attempt requires confirmation.

## Match-3 motion

- drag follows pointer and previews neighbour reaction;
- tap→tap and swipe remain supported;
- invalid swap animates out/back without spending a move;
- clear affects matched tile stacks, not whole cells;
- settle/spawn use per-tile motion metadata;
- input is locked only during the move presentation transaction;
- reduced-motion mode has an accelerated path.

## Out of scope

This presentation layer does not change narrative, level balance, save key/schema, or production rig structure.
