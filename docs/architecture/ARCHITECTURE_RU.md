# UPDS — текущая архитектура

Build: `0.18.0-anm018`.

## Runtime flow

`data/content → engine → UI → platform services`

The UI may present engine results with animation, but presentation code must not redefine Match-3 rules or narrative IDs.

## Source map

### `src/data/`

Authoritative runtime definitions:

- `narrative.ts` — parsed vertical-slice scenes, choice filtering, backgrounds/history;
- `levels.ts` — four Match-3 level definitions and asset presentation metadata;
- `characterRigs.ts` — production rigs/placeholders and expression mapping.

### `src/content/`

- `ANM-003_Vertical_Slice_Screenplay.md` — authored screenplay bundled for runtime parsing/auditing.

### `src/engine/`

- `CampaignStore.ts` — campaign state, save compatibility, manual save, import/export/recovery;
- `Match3Game.ts` — deterministic Match-3 rules, objectives, hints and presentation frames.

Engine code must stay independent from CSS/DOM.

### `src/ui/`

- `AnimeDetectiveApp.ts` — screen orchestration and DOM event wiring;
- `viewMarkup.ts` — shared escaped icon/header markup primitives;
- `boardInteraction.ts` — pure tap/swipe/drag decisions;
- `matchMotion.ts` — presentation timing constants;
- `vnStaging.ts` — speaker/portrait lane resolution;
- `vnDialoguePaging.ts` — fallback + measured localisation-safe paging;
- `dialogueMeasurement.ts` — browser measurement boundary;
- `vnPlayback.ts` — AUTO/SKIP/read helpers.

`AnimeDetectiveApp.ts` is still the largest orchestration module. Future refactors should extract complete screen/controller responsibilities, not fragment it into arbitrary tiny helpers.

### `src/platform/`

Browser/platform concerns only:

- safe storage;
- runtime errors and diagnostics;
- asset health/preload;
- download/export;
- playtest telemetry;
- PWA/install/offline/update;
- runtime service composition.

Platform features must degrade gracefully when browser APIs are absent (tests/headless/unsupported browsers).

### `src/audio/`

Procedural audio/haptics settings, cues, music themes and manager lifecycle.

## Public files

- `public/assets/` — approved runtime art/UI assets;
- `public/icons/` — PWA icons;
- `public/manifest.webmanifest`, `public/sw.js` — install/offline distribution.

## Repository structure

Historical implementation reports do not belong in the repository root. Active docs live under `docs/`; historical notes are archived under `docs/archive/`.
