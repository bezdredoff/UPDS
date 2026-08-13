# UPDS — Production Roadmap

Technical product version: `0.25.0-dev`.
Active production foundation: **ANM-025C Tile Presentation / Variation Expansion complete**; current production focus is **ANM-025D1 Tutorial State + Base Interaction**.

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

### Useful manual regression still pending

- полный ручной QA всех direct special combinations на телефоне;
- при следующем намеренно rejected/stale ZIP полезно подтвердить live failure-cleanup path: run остаётся красным, а `incoming` очищается без второго zero-ZIP run.

Эти проверки не блокируют ANM-025D: gameplay mechanics и tile-set contracts уже имеют automated coverage, а следующий slice строит tutorial framework поверх стабильной механики.

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

### ANM-025 — Match-3 Production Framework [P0]

Current slice: **025D1 Tutorial State + Base Interaction**. 025A–C complete. D1 вводит data-driven tutorial concepts, persistent completion state и первый базовый урок swap/match в M3_00; следующие D-срезы расширят тот же framework на blockers, ingredients и specials.

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

1. **ANM-025A–D Match-3 production framework**;
2. ANM-026 Level Lab early;
3. ANM-025E–F balance + narrative reactions;
4. ANM-027 full story;
5. ANM-028 character pipeline 2.0;
6. ANM-029 localization;
7. ANM-030 mass art/content;
8. ANM-031 landscape;
9. ANM-032 music;
10. ANM-033 release hardening.

## Backlog principle

Do not solve production problems by adding more one-off code.
Before a high-volume content task, build the reusable contract/tooling that makes the content cheap to create, validate and maintain.
