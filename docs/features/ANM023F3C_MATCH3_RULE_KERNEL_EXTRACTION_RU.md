# ANM-023F3C — Match-3 Rule Kernel Extraction

Status: R1 candidate / final planned ANM-023F3 runtime simplification cut. Behavior-preserving engine refactor; level data, balance, RNG, objectives, save schema, Match-3 presentation and narrative content are unchanged.

## Goal

Finish the bounded ANM-023F3 runtime simplification sequence by separating stateless Match-3 rule calculation from the mutable `Match3Game` lifecycle.

F3A removed deterministic screen markup from `Match3Controller`; F3B removed deterministic VN presentation from `VnController`. The remaining core-runtime hotspot is `src/engine/Match3Game.ts`, which still combines mutable board lifecycle with pure match/special rule calculation.

## Baseline

Merged ANM-023F3B / PR #140 establishes the source baseline at main `abfae0a4dbc8d915d4d34ff5ec819c8475d59ffb` with green CI #282 and stable Pages #134.

At that baseline:

- `src/engine/Match3Game.ts` is 1128 lines / 42,197 bytes;
- match-group detection, special-creation priority, player feedback classification and special-combo expansion are embedded as private methods beside RNG, objective progress, blockers, settle/refill and mutable board state;
- several older tests protect these rules through source-string checks against `Match3Game.ts`, coupling gameplay contracts to file placement.

## R1 cut

F3C introduces `src/engine/Match3Rules.ts` as the stateless Match-3 rule kernel.

It owns:

- board row/column/index geometry helpers;
- concrete-tile row/column match-group detection;
- player-authored special creation priority: Insight → Evidence → Lead → Flash;
- MATCH / COMBO / SPECIAL classification for the first player resolution;
- direct special-combo vocabulary and symmetric pair resolution;
- deterministic direct-combo target expansion;
- chained special-effect target expansion.

The rule kernel receives a readonly board projection plus explicit callbacks where game-state knowledge is required. In particular, Lead remains objective-aware: `Match3Game` owns unfinished-objective/progress knowledge and supplies `leadTargets()` to the stateless expansion functions.

`Match3Game.ts` remains responsible for:

- seeded RNG and initial-board generation;
- mutable board cells and swap lifecycle;
- move legality orchestration and shared evaluation path;
- objective-aware hint scoring;
- objective progress, blocker damage and ingredient drop state;
- cascade loop, clear/settle/refill/reshuffle mutation;
- move/result/frame construction and win/loss state.

After extraction `Match3Game.ts` is 885 lines / 32,521 bytes instead of 1128 lines / 42,197 bytes: about 9.7 KB / **22.9% less engine-class surface** to read for mutable lifecycle work.

## Test boundary cleanup

F3C keeps the existing test-file count and strengthens gameplay contracts rather than adding lifecycle files:

- `Match3FeedbackSemantics.test.ts` directly exercises stateless MATCH/COMBO/SPECIAL classification; CHAIN remains asserted on mutable cascade resolution;
- `Match3NarrativeSpecialCombinations.test.ts` directly exercises the direct-combo matrix, Flash symmetry, Lead callback delegation and fallback targets;
- `Match3SpecialTaxonomy.test.ts` directly exercises concrete match detection, five-match Insight creation, Evidence/Lead/Insight expansion and creation-only 2×2 Lead behavior;
- source assertions remain only for lifecycle boundaries that intentionally stay in `Match3Game` (first-cascade creation/combo application, chain resolution and creation-cell preservation).

A local equivalence harness compared the extracted rules to the F3B implementation across 500 randomized boards for match detection, creation selection, direct combo resolution/targets and chained special expansion; all comparisons matched.

## Non-goals

F3C does not:

- change level definitions, active tile sets, spawn weights or RNG behavior;
- rebalance specials, hint priorities, objective scoring, blockers or ingredient gravity;
- change Match-3 presentation, animation timing, input or telemetry;
- split settle/refill/objective mutation into additional services;
- refactor Scene Studio or Level Lab merely because those controllers remain large;
- perform bundle/payload optimization.

## QA

Authoritative acceptance remains GitHub CI plus a short Match-3 preview smoke:

1. Biome lint must stay clean;
2. full Vitest suite must pass;
3. TypeScript/Vite production build must pass;
4. existing move-legality, hint, special, board-shape, objective and campaign tests must stay green;
5. mobile preview should confirm intro → start → normal match → special/combo if reachable → hint → quit/back with no behavior or visual regression.

## Next

If F3C merges green, close ANM-023F3. The two controller presentation cuts plus one engine rule-kernel cut materially reduce the main runtime reading hotspots without broad architectural churn. Continue with **ANM-023F4 — Performance & Payload Pass**, starting from measurements rather than further speculative decomposition. Scene Studio/Level Lab refactors return only if later production work exposes a concrete coupling or maintenance problem.
