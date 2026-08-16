# ANM-023F3A — Match-3 Presentation Extraction

Status: R1 COMPLETE / PR #139 / runtime-touching behavior-preserving refactor. No Match-3 rules, balance, save schema, story, localization content, timing policy or asset contract changes.

## Goal

Start ANM-023F3 with one bounded cut in the largest measured feature-controller hotspot. `Match3Controller.ts` should orchestrate Match-3 state, input, animation, telemetry and navigation instead of also owning large deterministic HTML builders.

## Baseline

Merged ANM-023F2 / PR #138 establishes the source baseline at main `5ff24db25b7a9d865e508a4aa5278d5483926f4b` with green CI #278 and stable Pages #132.

At that baseline:

- `src/features/match3/Match3Controller.ts` is 1071 lines / 52,597 bytes;
- intro, board cells, objectives, tutorial overlay and the main Match-3 screen markup are embedded directly in the controller;
- several presentation tests search for markup strings specifically inside `Match3Controller.ts`, unintentionally coupling tests to the old file boundary.

## R1 cut

F3A introduces `src/features/match3/Match3Presentation.ts` as a pure presentation module.

It owns deterministic markup composition for:

- Match-3 context data attributes;
- intro screen markup;
- objective markup;
- board-cell markup, including concrete tile-presentation resolution, holes, blockers, specials, selection, hints and settle/clear classes;
- tutorial overlay markup;
- the main gameplay shell, bark slot, detective strip, stage/objective HUD and tool tray.

The module receives an explicit presentation input/view model and a translation function. It does **not** own or mutate DOM, timers, input listeners, telemetry, save/session state, navigation, audio playback or Match-3 rules.

`Match3Controller.ts` remains responsible for:

- creating and advancing `Match3Game`;
- Story / Campaign / Level Lab mode seams;
- tap/drag/direct-special input;
- animation sequencing and frame timing;
- hint/tutorial/reaction state;
- telemetry and audio decisions;
- event binding, navigation and completion flow.

After extraction the controller is about 44.3 KB instead of 52.6 KB: roughly 8.3 KB / 15.7% less controller surface to read when changing Match-3 behavior.

## Test boundary cleanup

Presentation contracts no longer require markup to live in the controller.

F3A:

- expands `Match3Presentation.test.ts` with pure presentation/view-model behavior checks instead of adding another test file;
- routes tile-profile and narrative-context presentation assertions to the presentation module;
- keeps reaction timing/telemetry assertions on the controller while moving bark-markup assertions to the renderer;
- expands localization literal audits to both Match-3 runtime modules.

This is intentional architectural protection: tests should preserve player-facing contracts and ownership boundaries, not the historical location of implementation strings.

## Non-goals

F3A does not:

- change `Match3Game` rules or move legality;
- change animation durations or feedback semantics;
- change level data, objective counts, spawn weights or tutorials;
- change localized copy;
- optimize bundle size yet;
- decompose input/animation/result-flow code in the same patch.

Further F3 cuts are selected only after this boundary is stable; F3A does not pre-approve a broad rewrite.

## QA

Authoritative acceptance remains GitHub CI and mobile candidate preview:

1. Biome lint must stay clean;
2. full Vitest suite must pass;
3. TypeScript/Vite production build must pass;
4. existing Match-3 gameplay, feedback, tutorial, narrative-reaction and localization contracts must stay green;
5. mobile preview smoke should confirm intro → start → one move/hint → quit/back, and that board/objectives/tutorial/bark presentation is visually unchanged.

## Next

F3A is merged via PR #139. The next measured cut is ANM-023F3B VN Presentation Extraction; broader controller/engine decomposition is still not pre-approved. F4 performance/payload work remains measurement-first, followed by ANM-030A asset-gap production planning.
