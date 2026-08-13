# UPDS — Production Roadmap

Technical product version: `0.25.0-dev`.
Active production foundation: **ANM-025 Match-3 production framework + ANM-026 tooling + ANM-027 story architecture/import pipeline complete for currently authored canon**. Current production focus: **ANM-028 Character Production Pipeline 2.0**. Full screenplay production beyond the ANM-003 vertical slice remains pending before ANM-029/release.

`APP_VERSION` — продуктовая dev-линия и не используется как источник feature status; npm `package.json.version` остаётся внутренним package metadata. Текущий функциональный baseline отслеживается через `BUILD_LABEL`, feature docs и этот roadmap; уникальная конкретная сборка идентифицируется через `BUILD_ID`.

## Current state

### Completed / stable foundations

- mobile ZIP → GitHub candidate → CI → preview → merge pipeline;
- ChatGPT direct GitHub branch/PR path для небольших technical changes;
- H1 Delta ZIP Import Foundation с exact `baseSha`, stale-patch rejection и protected pipeline paths;
- failed/rejected ZIP cleanup без noisy zero-ZIP importer rerun;
- save/progression foundation;
- VN shell, dialogue paging, staging and localization foundation;
- PWA/offline/update foundation;
- telemetry foundation;
- Match-3 shared move legality, feedback semantics and narrative special taxonomy;
- ANM-022E Narrative Special Combination Matrix;
- ANM-022F Interaction Guidance: inactivity hint, drag/tap source telemetry и direct special double-tap activation;
- Emi production integration through ANM-021B R6.1;
- character runtime uses precomposed 1024×1536 expression frames; retired transparent face-overlay composition must not return;
- ANM-023 Architecture & Test Health Pass: repository hygiene, test-health cleanup, architecture boundary audit and pipeline failure hygiene.
- ANM-024 Display / Viewport / Safe-Area Foundation: shared viewport shell, centralized safe-area ownership, portrait regression matrix and orientation-neutral low-height landscape contract.
- ANM-025E quantitative balance baseline through E3; E4 remains optional only if later human playtest data shows a concrete need.
- ANM-025F Match-3 Narrative Reactions complete through F1 resolver contract, F2 content and F3 presentation/anti-spam.
- ANM-027A–D story production pipeline: graph contract, graph-driven runtime routing, import/completeness audit and canonical runtime import/transition QA for the currently authored ANM-003 screenplay.

### Useful manual regression still pending

- полный ручной QA всех direct special combinations на телефоне;
- при следующем намеренно rejected/stale ZIP полезно подтвердить live failure-cleanup path: run остаётся красным, а `incoming` очищается без второго zero-ZIP run.

Эти проверки не блокируют ANM-028: Match-3 и story foundations уже имеют automated coverage, а character pipeline строится поверх стабильного VN runtime.

### Deferred, not cancelled

- Kentaro → Norihiro → Mayu character production;
- large-scale character animation production;
- full multilingual content production.

## Production backlog

### ANM-024 — Display, Viewport & Safe-Area Foundation [P0] — COMPLETE

Unify:
`physical screen → safe viewport → game viewport → scene coordinates`

Includes:
- stable scaling across menu/VN/Match-3/tools;
- iOS safe-area insets, notch/Dynamic Island/home indicator;
- standalone PWA and browser mode;
- Android cutouts/insets;
- portrait viewport matrix regression tests;
- architecture must not hardcode portrait-only assumptions that block later landscape support.

Completed split:
- 024A viewport/safe-area contract + audit;
- 024B shared game viewport shell;
- 024C shared safe-area ownership migration;
- 024D legacy safe-area cleanup + portrait/low-height-landscape regression closure + iPhone QA.

### ANM-025 — Match-3 Production Framework [P0] — FRAMEWORK COMPLETE

025A–D complete: Golden Sample presentation, narrative level context, production tile identities/rollout и persistent context-aware tutorial framework от basic swap до special combinations. Финальные 025E balance и 025F narrative reactions выполняются после раннего ANM-026 Level Lab.

After ANM-024:
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
- **025E Balance pass — BASELINE COMPLETE THROUGH E3** — E1 objective simplification/HUD contract COMPLETE; E2 objective-aware guidance COMPLETE; E3 deterministic quantitative balance COMPLETE; E4 is optional and should only run when later manual playtest evidence identifies a concrete calibration issue;
- **025F Narrative reactions during Match-3 — COMPLETE** — F1 resolver contract, F2 reaction content, F3 timing/presentation/anti-spam.

### ANM-026 — Level Lab & Match-3 Campaign [P1] — COMPLETE

Build tooling before mass level production.

Current split:
- **026A Level Lab Foundation — COMPLETE** — main-menu QA entry, level selector, exact uint32 seed, deterministic initial-board preview, production config summary/validation, play/retry same seed, Lab run-mode with zero Story save/tutorial/clue side effects;
- **026B1 Editable Balance Config — COMPLETE** — moves, blocker type/placements, ingredients, objectives, active tiles/spawn weights, production validation, deterministic draft preview/play and JSON export;
- **026B2 Board Shape & Start Layout — COMPLETE** — explicit board holes, deterministic prefilled start tiles, shaped-board gravity/input rules, Level Lab validation/preview/play and v2 export;
- **026C Match-3 Campaign Mode — COMPLETE** — direct player-facing Match-3 hub, sequential unlocks, replay/best result, dedicated attempts/tutorial progress and save key separate from Story campaign;
- **026D Lab/Playtest integration — NOT REQUIRED AS A SEPARATE CUT** — reproducible seeds, editable config/export and campaign replay already provide the required 025E playtest loop; extend later only if production data proves a concrete reporting need.

Includes:
- direct Match-3 mode from main menu;
- sequential Match-3 progression/save separate from Story campaign progression;
- level selector;
- Level Lab for balance config, blockers, ingredients, objectives, moves and spawn weights;
- explicit board-shape/start-layout contract in 026B2;
- instant play/restart/preview;
- export validated level config.

Level Lab lands before the final 025E balance pass.

### ANM-027 — Story Content Architecture & Import [P0] — PIPELINE COMPLETE / FULL CANON CONTENT PENDING

Completed technical split:
- **027A Story Graph Contract & Validator — COMPLETE** — stable episode/chapter/scene IDs, explicit transitions and legacy save-index adapters;
- **027B Runtime Routing Migration — COMPLETE** — VN/Match-3/ending routing reads the graph instead of numeric scene arithmetic;
- **027C Story Import Format & Completeness Tooling — COMPLETE** — `upds-story-content-v1`, authored-line/branch/deferred-content audit and focused CI command;
- **027D Canonical Story Runtime Import & Transition QA — COMPLETE** — runtime consumes the same audited content pipeline and graph ranges; full playable VN → Match-3 → VN → ending path is automatically validated.

Current authored canon in the repository is `ANM-003_Vertical_Slice_Screenplay.md` (current vertical slice, including explicit deferred `VN0250`). A separate full screenplay for the remaining planned episodes is **not present in the repository** and must be authored/imported through this pipeline before ANM-029 Full Localization Production and release-content lock.

The missing full screenplay does not block ANM-028 Character Production Pipeline 2.0 tooling, but mass localization/art production must not pretend the story is complete.

### ANM-028 — Character Production Pipeline 2.0 [P0/P1] — IN PROGRESS

Do not resume mass character production before this contract is stable.

Current split:
- **028A Character Production Manifest & Validator Foundation — COMPLETE WHEN MERGED** — canonical `upds-character-production-v2`, production/planned status, 7-asset precomposed runtime set, adult guardrail, proportional-height/alpha-bounds gate, PNG dimension/runtime-catalog audit and stale ANM-021 manifest cleanup;
- **028B Character/Scene Studio 2.0** — background/shot/actor-position/expression/Pose B/staging preview plus shared-baseline lineup/proportion ruler using the same runtime coordinates;
- **028C Safe Character Motion** — lightweight breathing/blink/speaking only after a replacement/delta approach proves no double-face, halo or authored-expression loss;
- **028D Remaining Character Production Integration** — Kentaro → Norihiro → Mayu through the 028A manifest gate and manual side-by-side visual QA.

Needs across the full feature:
- unified adult young-adult visual age and proportions;
- multi-character staging;
- character/background scale calibration;
- pose/expression/body contract;
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

1. **ANM-025A–D Match-3 production framework**;
2. ANM-026 Level Lab early;
3. **ANM-025E–F balance + narrative reactions — COMPLETE**;
4. **ANM-027A–D story architecture/import pipeline — COMPLETE for currently authored canon**; author/import the remaining canonical screenplay before production localization;
5. ANM-028 character pipeline 2.0;
6. ANM-029 localization only after the full canonical screenplay exists;
7. ANM-030 mass art/content;
8. ANM-031 landscape;
9. ANM-032 music;
10. ANM-033 release hardening.

## Backlog principle

Do not solve production problems by adding more one-off code.
Before a high-volume content task, build the reusable contract/tooling that makes the content cheap to create, validate and maintain.
