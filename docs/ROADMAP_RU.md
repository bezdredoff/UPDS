# UPDS — Production Roadmap

Technical product version: `0.25.4-dev`.
Active production foundation: **ANM-025/026 Match-3 production + tooling, completed ANM-027A–G canonical story pipeline, accepted ANM-028B1 R4.1 Scene Studio geometry, ANM-028B2 R1.1 authored VN shot adoption, ANM-028B3 R1.1 guest/witness presentation and ANM-028D3A Emi approved-frame runtime transition**. Current candidate focus: **ANM-029B3L R1 Belarusian VN Slot 11**. Remaining character-art generation is paused for an external Stable Diffusion workflow; the complete `0–21` screenplay is now a frozen input for localization production.

`package.json.version` — единственный источник продуктовой semver dev-линии; `src/appVersion.ts` импортирует её как `APP_VERSION`. `BUILD_LABEL` остаётся отдельным feature/baseline identity и не выводится из semver. Текущий функциональный baseline отслеживается через `BUILD_LABEL`, feature docs и этот roadmap; уникальная конкретная сборка идентифицируется через `BUILD_ID`.

## Current state

### Completed / stable foundations

- mobile ZIP → GitHub candidate → CI → preview → merge pipeline;
- ChatGPT direct GitHub branch/PR path для небольших docs/tests/non-visual technical changes; runtime/visual/art changes still use mobile candidate preview;
- H1 Delta ZIP Import Foundation с exact `baseSha`, stale-patch rejection и protected pipeline paths;
- failed/rejected ZIP cleanup без noisy zero-ZIP importer rerun;
- save/progression foundation;
- VN shell, dialogue paging, staging and localization foundation;
- PWA/offline/update foundation;
- telemetry foundation;
- Match-3 shared move legality, feedback semantics and narrative special taxonomy;
- ANM-022E Narrative Special Combination Matrix;
- ANM-022F Interaction Guidance: inactivity hint, drag/tap source telemetry и direct special double-tap activation;
- Emi runtime integration through ANM-021B R6.1; current visual approval is `rebuild-required`, so these assets remain a temporary fallback rather than a production style reference;
- character runtime uses precomposed 1024×1536 expression frames; retired transparent face-overlay composition must not return;
- ANM-023 Architecture & Test Health Pass: repository hygiene, test-health cleanup, architecture boundary audit and pipeline failure hygiene.
- **ANM-023E Test, Tooling & Identity Hardening — R1 IN QA**: lifecycle-status assertions are replaced by durable contracts, Biome is added to `npm run check`, and package/app product version metadata has one source of truth.
- ANM-024 Display / Viewport / Safe-Area Foundation: shared viewport shell, centralized safe-area ownership, portrait regression matrix and orientation-neutral low-height landscape contract.
- ANM-025E quantitative balance baseline through E3; E4 remains optional only if later human playtest data shows a concrete need.
- ANM-025F Match-3 Narrative Reactions complete through F1 resolver contract, F2 content and F3 presentation/anti-spam.
- ANM-027A–D story production pipeline: graph contract, graph-driven runtime routing, import/completeness audit and canonical runtime import/transition QA for the currently authored ANM-003 screenplay.
- ANM-027E Lean Content Production Contract: all 22 planned content slots and three endings remain in scope; production cost is constrained through character tiers, staging/background reuse, native evidence UI, Match-3 archetypes and asset-trigger budgets. Canonical contract: [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md).
- documentation/traceability authority aligned with ANM-027E and protected by a focused docs drift gate.
- ANM-028B1 R4.1 multi-actor focal-eye-line and selected-frame guide parity accepted on iPhone and
  merged through PR #96 (`c224df25c35c610eb6f83e675f8d95f48b92a3c8`).
- ANM-028D0 R1 Emi neutral master accepted in lineup/solo/duo/trio and merged through PR #97
  (`977ab2d98f33ae3cdf922d0b92685e6ce2e0f25b`); it is the approved expression anchor.
- ANM-028D1 R1 Emi smile accepted in lineup/solo/duo/trio and merged through PR #98
  (`1f41ec3bcc7892bd75d09b704e38afe323a3a32e`); it remains outside runtime as an approved expression.
- ANM-028D2 R1 Emi serious accepted in lineup/solo/duo/trio and merged through PR #99
  (`85ebb2148ba786dfcc5a0fee936617a7a80e67dd`); it remains outside runtime as an approved expression.

### Current candidate / manual acceptance required

- **ANM-028B2 R1.1 Authored VN Shot Adoption — COMPLETE** — five stable ANM-003 line IDs use the accepted
  `upds-scene-staging-v1` resolver directly in playable VN, covering trio, duo and one real Pose B
  shot while every unlisted line retains the stable legacy staging fallback. Scene Studio can preview
  the same authored declarations. No new art is introduced.
- R1/PR #92 passed automated gates but did not pass final visual acceptance because it lacked real
  VN chrome/occlusion and exposed unresolved character/background inconsistencies. It is evidence,
  not a completed roadmap item.
- R2/PR #93 passed CI but failed iPhone visual acceptance: scene actors were full-body, too small
  relative to backgrounds and appeared to float. It must not be merged.
- R3/PR #94 passed CI and was merged as a diagnostic baseline, but failed final visual acceptance:
  trio actors still exposed almost full masters, touched the top edge and did not align their eyes
  to the focal point. The same lineup proved the existing Emi master stylistically inconsistent,
  oversized and not full-body. R3 geometry must not be frozen for authored content.
- R4/PR #95 passed import validation and corrected trio framing, but its preview QA found that duo remained
  top-locked and preset guides still used stale estimated coordinates rather than the displayed
  expression images. R4.1 supersedes it and must be tested as a replacement candidate.

### Useful manual regression still pending

- полный ручной QA всех direct special combinations на телефоне;
- при следующем намеренно rejected/stale ZIP полезно подтвердить live failure-cleanup path: run остаётся красным, а `incoming` очищается без второго zero-ZIP run.

Эти проверки не блокируют ANM-028: Match-3 и story foundations уже имеют automated coverage, а character pipeline строится поверх стабильного VN runtime.

### Deferred, not cancelled

- Kentaro → Norihiro → Mayu → Rina → Kurose character production, triggered only when external art is ready;
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

025A–D complete: Golden Sample presentation, narrative level context, production tile identities/rollout и persistent context-aware tutorial framework от basic swap до special combinations. 025E balance baseline и 025F narrative reactions также завершены после раннего ANM-026 Level Lab.

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

Level Lab был введён до финального 025E quantitative balance pass и остаётся production authoring/QA surface.

### ANM-027 — Story Content Architecture & Import [P0] — PIPELINE + LEAN CONTRACT COMPLETE / FULL CANON CONTENT PENDING

Completed technical split:
- **027A Story Graph Contract & Validator — COMPLETE** — stable episode/chapter/scene IDs, explicit transitions and legacy save-index adapters;
- **027B Runtime Routing Migration — COMPLETE** — VN/Match-3/ending routing reads the graph instead of numeric scene arithmetic;
- **027C Story Import Format & Completeness Tooling — COMPLETE** — `upds-story-content-v1`, authored-line/branch/deferred-content audit and focused CI command;
- **027D Canonical Story Runtime Import & Transition QA — COMPLETE** — runtime consumes the same audited content pipeline and graph ranges; full playable VN → Match-3 → VN → ending path is automatically validated.

Current authored canon is complete: `ANM-003_Vertical_Slice_Screenplay.md` covers slots `0–3`, sequential ANM-027G sources cover `4–18`, and `ANM-027G_Episodes_19_21_Screenplay.md` authors the three mutually exclusive ending slots. `VN0250` remains the canonical bridge into the sequential ANM-027G source chain.

All 22 planned story slots are now authored; ANM-029 may consume the complete canonical screenplay, while art production remains independently gated by the external asset workflow.

Content-production split:
- **027E Lean Content Production Contract — COMPLETE** — [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md) preserves slots `0–21` while capping one-off production through full-stage/guest/extras tiers, eight staging presets, 8–10 location masters, 5–7 hero clue close-ups and 5–6 Match-3 layout archetypes;
- **027F Full Story Macro Lock — COMPLETE** — slots `0–21`, endings `19–21`, eight location families, six reusable Match-3 archetypes, six hero clue close-ups, full-stage/guest tiers and asset triggers are locked in `src/content/story/ANM027F.full-story-macro.json`; all slots `0–21` are now authored/production-configured;
- **027G Episode Batch Production & Canonical Import — COMPLETE** — all six post-slice packages are merged. Canonical runtime contains 976 authored lines / 45 VN scenes / 22 Match-3 routes, three data-driven ending branches and the gated full-truth outcome. The story is now a frozen input for ANM-029 localization production.

### ANM-028 — Character Production Pipeline 2.0 [P0/P1] — IN PROGRESS

Do not resume mass character production before the 028B shared Studio/lineup contract is stable.

Current split:
- **028A Character Production Manifest & Validator Foundation — COMPLETE** — canonical `upds-character-production-v2`, production/planned status, 7-asset precomposed runtime set, adult guardrail, proportional-height/alpha-bounds gate, PNG dimension/runtime-catalog audit and stale ANM-021 manifest cleanup;
- **028B Character/Scene Studio 2.0 — COMPLETE THROUGH B3** — 028B1 R4.1 reusable preset geometry, 028B2 R1.1 bounded authored playable adoption and 028B3 R1.1 separate guest/witness schema/renderer/validator are merged and available to content batches;
- **028C Safe Character Motion** — lightweight breathing/blink/speaking only after a replacement/delta approach proves no double-face, halo or authored-expression loss;
- **028D Character Production / Normalization — ART GENERATION PAUSED** — Emi D0 neutral, D1 smile, D2 serious and D3 surprised are approved; D3A exposes those four frames in runtime through an explicit override while legacy embarrassed/Pose B/medallion remain fallback. Remaining character art moves through the external Stable Diffusion workflow; ANM-027F has now locked Rina/Kurose as recurring-stage budget entries, not runtime assets.

Delivery order inside 028B:
- **028B1 R4.1 Multi-Actor Eye-Line & Frame-Accurate Guides — COMPLETE** — canonical `upds-scene-staging-v1` registry/resolver plus shared playable VN chrome, eye-line-anchored duo/trio camera, selected-expression alpha/eye guides, ANM-024 viewport matrix, contain-over-fill/background guides, visual-status lineup, diagnostics and read-only QA report; no new art; authored VN adoption remains 028B2;
- **028B2 Shared Lineup & Shot Authoring — R1.1 COMPLETE** — `upds-authored-vn-shots-v1` binds stable authored line IDs to background, preset, actor-role/order, expression and Pose B metadata; R1 adopts five ANM-003 Golden Sample shots while leaving every unlisted line on the legacy fallback;
- **028B3 Guest/Witness Presentation Contract — R1.1 COMPLETE** — `upds-guest-witness-production-v1` locks six macro-approved episode guests, a four-asset production package (neutral bust + two character-specific expressions + medallion), asset-free planned state, shared `guest-testimony-card` renderer and validator without weakening the strict 7-asset full-stage manifest.

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

### ANM-029 — Full Localization Production [P1] — IN PROGRESS

Target registry is fixed to `ru`, `be`, `en`, `zh-CN`, `ja`, `ko`, `pt-BR`.

Production split:
- **029A Localization Production Foundation — R1.1 COMPLETE** — seven-locale registry, pending/ready separation, catalog key/placeholder audit, glossary contract and centralized CJK readiness metadata; RU/EN remain the only runtime-selectable locales;
- **029B Belarusian Production — IN PROGRESS** — B1 R1 player-shell translation is COMPLETE (61 keys); B2A R1.1 Match-3 core/campaign translation is COMPLETE (83 keys); B2B1 R1 levels `M3_00–M3_06` is COMPLETE (123 keys); B2B2 R1 levels `M3_07–M3_13` is COMPLETE (128 keys); B2B3 R1 levels `M3_14–M3_21` is COMPLETE (146 keys); B2C R1 F2 reactions/full Match-3 audit is COMPLETE (132 reaction keys; 612 total Match-3 keys); B3A R1.1 canonical VN slot 0 is COMPLETE (302 keys, `VN0001–VN0084` + CHOICE_00 + scenes 00–02); B3B R1.1 canonical runtime VN slot 1 is COMPLETE (178 keys, `VN0085–VN0142` + scenes 03–04), rebased unchanged after ANM-023E; B3C R1 canonical runtime VN slot 2 is COMPLETE (151 keys, `VN0143–VN0191` + scenes 05–06); B3D R1 canonical runtime VN slot 3 is COMPLETE (181 keys, `VN0192–VN0250` + scenes 07–08), closing the original vertical-slice source at the canonical `VN0250` bridge; B3E R1 canonical runtime VN slot 4 is COMPLETE (125 keys, `VN0251–VN0288` + scenes 09–10 + `meeting-tone` choice), beginning the ANM-027G source chain; B3F R1 canonical runtime VN slot 5 is COMPLETE (118 keys, `VN0289–VN0326` + scenes 11–12), covering basketball/service-route evidence and Hinata; B3G R1 canonical runtime VN slot 6 is COMPLETE (140 keys, `VN0327–VN0369` + scenes 13–14 + `apology-to-hinata` choice), closing Hinata exoneration and bridging to Asterion; B3H R1 canonical runtime VN slot 7 is COMPLETE (124 keys, `VN0370–VN0409` + scenes 15–16), covering Asterion laboratory verification and `CUE_008`; B3I R1 canonical runtime VN slot 8 is COMPLETE (121 keys, `VN0410–VN0448` + scenes 17–18), covering the lost-and-found ledger, `CUE_009` and the bridge to the master-key route; B3J R1 canonical runtime VN slot 9 is COMPLETE (131 keys, `VN0449–VN0488` + scenes 19–20 + `protect-gen-source` choice), covering the maintenance-key handoff, `CUE_010` and the Asterion night-container route; B3K R1.1 canonical runtime VN slot 10 is COMPLETE (121 keys, `VN0489–VN0527` + scenes 21–22), covering the karate-club control sample, `CUE_011` and the old-photo Asterion container; B3L R1 canonical runtime VN slot 11 is IN QA (131 keys, `VN0528–VN0567` + scenes 23–24 + `photo-permission` choice), covering the Asterion transfer chain, `CUE_012` and the weak-wireless-signal bridge; followed by later VN/ending batches and runtime enablement only after the full zero-missing-key audit;
- **029C Simplified Chinese Production** — full catalog plus first real CJK overflow/typography mobile QA;
- **029D Japanese Production**;
- **029E Korean Production**;
- **029F Brazilian Portuguese Production**;
- **029G All-Locale Release Audit** — glossary/name consistency, placeholder parity, no source fallback, representative overflow matrix and final selector lock.

Rules:
- no hardcoded UI/story strings may re-enter runtime;
- a translation-pending locale is never exposed in the player selector;
- production-ready locale catalogs must match the stable source key set and named-placeholder signatures;
- CJK typography approval is visual QA and cannot be inferred from catalog completeness;
- glossary/character-name consistency is a production content contract, not ad-hoc per-scene copy editing.

### ANM-030 — Full Content / Art Production [P1]

Mass production only after frameworks above stabilize and under the budgets in
[`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md):
- remaining characters;
- 8–10 reusable master-location families and precomposed variants;
- poses/expressions;
- Match-3 visual variants;
- native localized evidence UI plus only approved hero clue close-ups/CGs;
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

1. **ANM-025/026 and ANM-027A–F — COMPLETE foundations + full macro lock**;
2. **ANM-028B1 R4.1 — COMPLETE** and **ANM-028D3A — COMPLETE**;
3. **ANM-028B2 R1.1 — COMPLETE** — bounded authored multi-character VN adoption;
4. **ANM-028B3 R1.1 — COMPLETE** — separate guest/witness contract and asset-free Hinata presentation are available to slots 5–6;
5. **ANM-027G `4–6` — COMPLETE; `7–9` — COMPLETE; `10–12` — COMPLETE; `13–15` — COMPLETE; `16–18` — COMPLETE; `19–21` — CURRENT QA**; after acceptance canonical screenplay production is complete;
6. resume approved external character/background asset integration only when a content batch triggers it;
7. ANM-029 localization after the full canonical screenplay exists;
8. ANM-030 budgeted mass art/content;
9. ANM-031 landscape;
10. ANM-032 music;
11. ANM-033 release hardening.

## Backlog principle

Do not solve production problems by adding more one-off code.
Before a high-volume content task, build the reusable contract/tooling that makes the content cheap to create, validate and maintain.
Do not reduce the approved story scope to meet an asset budget; change staging, tier or presentation first, and record any budget exception explicitly.
