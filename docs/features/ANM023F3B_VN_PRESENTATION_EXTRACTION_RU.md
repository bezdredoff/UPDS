# ANM-023F3B — VN Presentation Extraction

Status: R1 COMPLETE / PR #140 / runtime-touching behavior-preserving refactor. Story progression, screenplay content, localization catalogs, save schema, dialogue paging policy, staging presets and asset contracts are unchanged.

## Goal

Continue ANM-023F3 with a second bounded controller cut after merged F3A. `VnController.ts` should orchestrate VN session state, dialogue paging, input binding, telemetry, save/load and story routing instead of also owning deterministic stage, overlay and choice markup plus character/guest asset resolution.

## Baseline

Merged ANM-023F3A / PR #139 establishes the source baseline at main `b957a7059546629ff6b9f2841c1d8b7db978263e` with green CI #280 and stable Pages #133.

At that baseline:

- `src/features/vn/VnController.ts` is 594 lines / 30,594 bytes;
- character/placeholder/guest staging, current-line preload resolution, history/config markup and both choice-screen builders are embedded directly in the controller;
- staging/expression tests still search for portrait implementation strings specifically inside `VnController.ts`, coupling tests to the old file boundary.

## R1 cut

F3B introduces `src/features/vn/VnPresentation.ts` as a deterministic presentation boundary.

It owns:

- legacy single-character stage resolution, including Pose A/Pose B policy and canonical character staging variables;
- authored multi-character shot and guest/witness presentation composition;
- direction-card and clue-toast stage markup;
- current-line foreground preload asset resolution and next-line VN preload asset lists;
- history overlay markup;
- VN config overlay markup;
- legacy `CHOICE_00` and data-driven story-choice screen markup.

The module receives explicit presentation inputs/localized labels and returns markup or asset lists. It does **not** own DOM lookup/mutation, event listeners, timers, telemetry, save/session mutation, navigation, audio playback or story transitions.

`VnController.ts` remains responsible for:

- opening/resuming scenes and advancing storyGraph transitions;
- localized line/speaker/emotion lookup;
- two-line fallback/measured dialogue pagination and reflow;
- auto/skip/save/load state;
- current-screen telemetry and audio decisions;
- DOM event binding for VN controls, overlays and choices;
- save/session persistence and navigation to Match-3/endings/settings/dossier.

After extraction the controller is 23,034 bytes instead of 30,594 bytes: about 7.6 KB / **24.7% less controller surface** to read for VN orchestration work.

## Test boundary cleanup

F3B keeps the existing test-file count and moves ownership assertions rather than adding lifecycle tests:

- `VnPresentation.test.ts` now protects the controller/presentation split and directly exercises deterministic stage/choice/config builders;
- character staging and expression-frame source assertions follow `VnPresentation.ts`;
- the face-overlay runtime audit includes both VN controller and presentation modules;
- story routing and measured dialogue paging assertions remain on `VnController.ts` because those responsibilities did not move.

The test rule remains the same as F3A: protect player-facing contracts and architectural ownership, not historical string locations.

## Non-goals

F3B does not:

- alter any VN line, branch, ending or Match-3 route;
- change dialogue pagination, carry-word policy, font measurement or reflow timing;
- change character geometry, authored-shot presets, guest/witness contracts or expression selection rules;
- change save/load behavior, auto timing, telemetry semantics or localization copy;
- optimize bundle payload yet;
- split story routing or DOM event orchestration in the same patch.

## QA

Authoritative acceptance remains GitHub CI plus mobile preview:

1. Biome lint must stay clean;
2. full Vitest suite must pass;
3. TypeScript/Vite production build must pass;
4. existing VN presentation, story routing, staging, expression, localization and dialogue paging contracts must stay green;
5. mobile preview smoke should confirm scene render → next/page advance → history → settings → choice (where reachable) → return, with no visual or routing regression.

## Next

F3B is merged via PR #140. The measured reassessment selected one final bounded F3 cut: **ANM-023F3C Match-3 Rule Kernel Extraction**. It separates stateless match/special rules from mutable `Match3Game` lifecycle; after F3C, F4 remains measurement-first performance/payload work, followed by ANM-030A asset-gap production planning.
