# UPDS — Production Roadmap Rebaseline

Build baseline: `0.22.0-anm022g`.

This roadmap replaces the previous vertical-slice-oriented ordering with a production-oriented sequence.

## Current state

### Completed / stable foundations

- mobile ZIP → GitHub candidate → CI → preview → merge pipeline;
- save/progression foundation;
- VN shell, dialogue paging, staging and localization foundation;
- PWA/offline/update foundation;
- telemetry foundation;
- Match-3 legality, feedback semantics and narrative special taxonomy;
- Emi production integration through ANM-021B R6.1;
- 2×2 Lead creation/resolution fixed in ANM-022D R1.3.

### In progress / pending validation

- ANM-022E — Narrative Special Combination Matrix;
- full manual QA of direct special combinations;
- ANM-022F — Interaction Guidance.

### Deferred, not cancelled

- Kentaro → Norihiro → Mayu character production;
- large-scale character animation production;
- full multilingual content production.

## Rebaselined production backlog

### ANM-022H — Mobile/GitHub Development Flow v2 [P0 infrastructure]

Goal: reduce phone transfer cost while preserving the GitHub CI/preview/manual-QA gates.

- 022H1 Delta ZIP Import Foundation:
  `PATCH.zip → main + delta → candidate → full CI → preview → PR`;
- keep FULL_PROJECT ZIP as recovery/binary/art path;
- exact `baseSha` stale-patch protection in delta v1;
- protected workflow/validator paths cannot be modified by delta;
- GitHub plugin direct-write remains an optional future fast path until connector write routing is stable;
- later improvements: per-PR preview, candidate update/re-upload and better reporting.

022H should land before the next long sequence of code/content iterations because it reduces the cost of every later atomic feature.

### ANM-023 — Architecture & Test Health Pass [P0]

Do this before major new layout/content/tooling expansion.

Goals:
- audit feature boundaries and remove stale architectural leftovers;
- reduce coupling between scene orchestration, VN, Match-3, content and presentation;
- identify large/high-churn source files and split only where ownership boundaries are clear;
- remove dead code, legacy contracts and unused assets;
- consolidate duplicate utility logic;
- classify tests into behavior / contract / source-audit / smoke;
- replace brittle source-string tests with behavior tests where feasible;
- archive or delete stale tests that guard retired implementation details;
- ensure every current production contract has one authoritative test, not several overlapping copies;
- update architecture docs to match runtime reality;
- keep GitHub CI as the authoritative gate.

Exit criteria:
- no known retired face-overlay/runtime contracts remain in active code/tests/docs;
- no duplicated Match-3 legality/special semantics;
- no stale localization/asset paths;
- test suite categories documented;
- all tests green before and after refactor;
- no intentional gameplay/visual changes.

### ANM-024 — Display, Viewport & Safe-Area Foundation [P0]

Unify:
`physical screen → safe viewport → game viewport → scene coordinates`

Includes:
- stable scaling across menu/VN/Match-3/tools;
- iOS safe-area insets, notch/Dynamic Island/home indicator;
- standalone PWA and browser mode;
- Android cutouts/insets;
- portrait viewport matrix regression tests;
- architecture must not hardcode portrait-only assumptions that block later landscape support.

### ANM-025 — Match-3 Production Framework [P0]

After ANM-022F:
- Golden Sample presentation parity;
- narrative-driven level context;
- background / board skin / board shape;
- tile distribution and spawn weights;
- expanded underwear-oriented tile presentation without exploding gameplay color count;
- narrative character hints/comments during play;
- tutorial framework for base Match-3 and every newly introduced mechanic;
- balance and readability validation.

Suggested split:
- 025A Golden Sample parity;
- 025B Narrative Level Context contract;
- 025C Tile presentation/variation expansion;
- 025D Tutorial framework;
- 025E Balance pass;
- 025F Narrative reactions during Match-3.

### ANM-026 — Level Lab & Match-3 Campaign [P1]

Build tooling before mass level production.

Includes:
- direct Match-3 mode from main menu;
- sequential Match-3 progression/save separate from Story campaign progression;
- level selector;
- Level Lab for board shape, blockers, start layout, objectives, moves, spawn weights;
- instant play/restart/preview;
- export validated level config.

Level Lab should land before the final balance pass if practical.

### ANM-027 — Full Story Content Architecture & Import [P0]

- canonical data-driven episode/chapter/scene structure;
- import all planned story content;
- validate VN → Match-3 → VN transitions;
- content completeness validator;
- no hardcoded one-off scene routing;
- preserve campaign save compatibility.

### ANM-028 — Character Production Pipeline 2.0 [P0/P1]

Do not resume mass character production before this contract is stable.

Needs:
- unified adult young-adult visual age and proportions;
- multi-character staging;
- character/background scale calibration;
- pose/expression/body contract;
- lightweight breathing/blink/speaking animation without flicker/halo;
- runtime asset-size/load budget;
- support for several characters in one frame;
- more varied poses, comedy/falls and tasteful ecchi framing;
- clear adult-character art-direction guardrail;
- upgraded Character/Scene Studio for background, shot size, positions, expressions and animation preview.

### ANM-029 — Full Localization Production [P1]

Target:
- Russian;
- Belarusian;
- English;
- Simplified Chinese;
- Japanese;
- Korean;
- Brazilian Portuguese.

Before mass translation:
- full canonical story must exist;
- no new hardcoded UI/story strings;
- locale completeness validator;
- overflow/CJK typography QA;
- glossary/character-name consistency.

### ANM-030 — Full Content / Art Production [P1]

Mass production only after frameworks above stabilize:
- remaining characters;
- backgrounds;
- poses/expressions;
- Match-3 visual variants;
- story-specific props/assets;
- optimization and preload strategy.

### ANM-031 — Landscape Support [P2]

- VN landscape staging;
- Match-3 landscape layout;
- safe-area handling;
- multi-character composition;
- portrait/landscape parity.

Architectural assumptions required for landscape must be handled earlier in ANM-024.

### ANM-032 — Music & Level Song Pipeline [P2]

- short comedic songs for key episodes/levels/characters;
- reusable musical stems for ordinary levels;
- soundtrack metadata;
- export/promo-friendly album structure;
- avoid requiring a unique full song for every future Match-3 level.

### ANM-033 — Release Candidate Hardening [P0 before release]

- full mobile regression;
- offline/update/save;
- accessibility;
- performance;
- asset size/loading;
- localization proofreading;
- full story + Match-3 QA;
- final telemetry review.

## Post-launch / DLC

### DLC-001 — Beach Episode

Reserve as a self-contained expansion:
- limited cast;
- summer visual pack;
- ecchi-comedy-friendly setting;
- dedicated Match-3 skins/mechanics where justified;
- optional songs;
- independent promotional beat.

Do not consume core production capacity before base release.

## Recommended immediate sequence

1. finish/validate ANM-022E;
2. ANM-022H1 Delta ZIP Import Foundation;
3. ANM-022F Interaction Guidance;
4. ANM-023 Architecture & Test Health Pass;
5. ANM-024 Display / Safe Area / Viewport Foundation;
6. ANM-025A–D Match-3 production framework;
7. ANM-026 Level Lab early;
8. ANM-025E–F balance + narrative reactions;
9. ANM-027 full story;
10. ANM-028 character pipeline 2.0;
11. ANM-029 localization;
12. ANM-030 mass art/content;
13. ANM-031 landscape;
14. ANM-032 music;
15. ANM-033 release hardening.

## Backlog principle

Do not solve production problems by adding more one-off code.
Before a high-volume content task, build the reusable contract/tooling that makes the content cheap to create, validate and maintain.
