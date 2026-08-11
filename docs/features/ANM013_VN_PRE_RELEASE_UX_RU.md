# VN pre-release UX — current state (origin: ANM-013)

ANM-013 introduced backlog, read-only SKIP semantics, AUTO, manual VN save/load, asset preloading and Golden Sample alignment. Later ANM-016 presentation work refined the UI; this document describes the **current** functional contract rather than the original ANM-013 layout.

## Current VN controls

- `CASE` / dossier access remains contextual.
- `LOG` opens read history in authored order for the active branch.
- `Settings` opens reading/audio settings; global Main Menu navigation lives inside settings rather than as a permanent header button.
- bottom reading controls keep `SKIP`, `AUTO`, `SAVE`, `LOAD`.
- text size and AUTO speed are configured through the Settings/CONFIG overlay.

## Playback semantics

- SKIP advances only through already-read authored lines and stops at unread content / choice checkpoint.
- AUTO timing scales with text length and selected speed.
- internal dialogue pages are presentation-only; a line becomes read only after its final internal page.
- Continue after the `VN0040` checkpoint returns to `CHOICE_00` when appropriate.

## Save and preload

- manual VN slot is separate from the stable campaign save.
- current/next background and character layers are preloaded best-effort.
- browser/headless environments without `Image` must degrade without throwing.

## Finale

Playable runtime includes `VN0246–VN0249`; authored `VN0250` remains an optional teaser and is not part of the current playable finale.

## Visual presentation

The current staging, two-line localisation-safe dialogue paging, nameplate seam and compact navigation are defined by `ANM016_PRESENTATION_POLISH_RU.md`.
