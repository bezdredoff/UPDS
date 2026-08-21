# UPDS — Production Roadmap

Technical product version: `0.26.0-dev`.
Active production foundation: **ANM-025/026 Match-3 production + tooling, completed ANM-027A–G canonical story pipeline, accepted ANM-028B1 R4.1 Scene Studio geometry, ANM-028B2 R1.1 authored VN shot adoption, ANM-028B3 R1.1 guest/witness presentation, completed ANM-029B4 Belarusian production and merged ANM-029H planning reset**. The complete **ANM-023F** simplification/performance track is merged through **F4B / PR #144**. ANM-030A R1.1 is merged through **PR #145**, audit-tooling follow-up ANM-030A2 through **PR #147**, and the planning-only Match-3 special visual contract ANM-030B0A1 R1.1 through **PR #148**. ANM-030B0B integrates the approved nine-character full-stage production cast and retires the temporary Emi transition override. **ANM-023G Playwright Browser Automation is COMPLETE through G8 closeout**: G1–G7D establish the shared Chromium/mobile-WebKit Browser Gate; G8A audits real coverage; G8B closes the first Story completion handoff; G8C1 adds real pointer interaction parity; G8D closes dependency security; and G8E1–E3 harden PWA updates, localized iOS VN viewport stability and Match-3 render stability. The next art-independent quality backlog is intentionally post-G8: mobile locale × viewport coverage first, then PWA offline/recovery, VN/content asset crawl and quantitative Match-3 regression improvements. ANM-023G8C2 Campaign completion E2E is deferred until balance stabilizes or a concrete regression justifies its maintenance cost. Remaining ANM-030B guest/background/clue/Match-3 art stays blocked until explicitly approved; full-stage cast art is no longer blocked.

`APP_VERSION` in `src/appVersion.ts` is the canonical player-facing product semver dev-line. npm `package.json.version` remains internal package metadata with an independent lifecycle. `BUILD_LABEL` remains a separate feature/baseline identity and is not derived from either semver; `BUILD_ID` uniquely identifies a concrete CI build. Product version changes do not imply a save-schema migration.

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
- ANM-030B0B/ANM-030B0C full-stage cast integration: all nine recurring/core characters use the exact approved source-archive seven-asset rigs; the R1 follow-up replaces the previously retained Miku/Onoe/Ayuki/Emi binaries, locks all 63 assets by SHA-256, and keeps the temporary Emi override plus five planned placeholders closed;
- character runtime uses precomposed 1024×1536 expression frames; retired transparent face-overlay composition must not return;
- ANM-023 Architecture & Test Health Pass: repository hygiene, test-health cleanup, architecture boundary audit and pipeline failure hygiene.
- **ANM-023E Test, Tooling & Identity Hardening — R1 COMPLETE**: lifecycle-status assertions are reduced in favor of durable contracts, Biome is added to `npm run check`, and package/app product version metadata is structurally separated from feature/build identity.
- **ANM-023G1–G8 Playwright Browser Automation — COMPLETE**: one Playwright stack owns Chromium/WebKit E2E, production QA/player surfaces, traces/diagnostics and reviewed mobile visual baselines. Selenium/WebDriver is not part of the UPDS test stack and is not planned as a parallel CI framework.
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

### Historical ANM-028 visual acceptance notes

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

Эти проверки не блокируют дальнейшую разработку: ANM-023G8 закрыт, Match-3 и story foundations имеют automated coverage, а character pipeline строится поверх стабильного VN runtime.

### Deferred, not cancelled

- **ANM-030B0A2 / B0B / B1–B4 graphics and art integration — ART-BLOCKED** until the external/local art workflow produces assets that pass explicit product approval; there are currently no approved new production Match-3 special PNGs to integrate;
- Kentaro → Norihiro → Mayu → Rina → Kurose character production, triggered only when external art is ready and the product sequence explicitly resumes that wave;
- large-scale character animation production;
- additional locale production (`zh-CN`, `ja`, `ko`, `pt-BR`) until explicitly resumed after the planning reset;
- **ANM-023G8C2 Campaign completion/progression browser E2E** until Match-3 balance is stable enough for a durable real-level journey or a concrete production regression proves the browser-level signal is worth the maintenance cost. Do not replace it with a tiny automation-only win fixture merely to mark the gap closed.

Local generator/ComfyUI/VNCCS experimentation is R&D outside the repository production inventory. It does not change asset status until an approved output is deliberately imported through the production contract.

## Production backlog

### ANM-023F — Codebase, Test & Tooling Simplification [P0/P1] — COMPLETE

The post-Belarusian reset intentionally reopens the ANM-023 maintenance line before high-volume art/content integration. This is a bounded simplification track, not an architecture rewrite.

- **023F1 Biome Expansion & Repository Hygiene [P0] — R1 COMPLETE / PR #137** — unified Biome lint across `src`, `tests` and Vite config; focused/duplicate test hooks are blocking; repository debris is removed and guarded; safe-fix commands are available. F1's merged CI baseline exposed only two test-only unused-code warnings and zero findings from the staged high-signal advisory cohort.
- **023F2 Test Suite Simplification [P0] — R1 COMPLETE / PR #138** — completed Belarusian lifecycle-batch tests are consolidated into three domain suites; repository test-file count is reduced from 110 to 90; F1 warning sources are removed and the proven high-signal Biome cohort is blocking.
- **023F3 Runtime / Controller Simplification [P0/P1] — COMPLETE THROUGH F3C / PR #141** — three bounded behavior-preserving cuts reduce measured runtime reading hotspots without broad architectural churn: F3A `/ PR #139` extracts Match-3 presentation, F3B `/ PR #140` extracts VN presentation, and F3C `/ PR #141` extracts the stateless Match-3 rule kernel while mutable lifecycle remains in `Match3Game`.
- **023F4 Performance & Payload Pass [P1] — COMPLETE / PR #144** — F4A **R1 COMPLETE / PR #142** reduced the initial entry from **1,206.14 / 389.05 kB gzip** to **741.15 / 247.14 kB gzip** with BE/EN emitted as separate chunks. F4B **R1 COMPLETE / PR #144** keeps the complete PWA offline catalog but removes full-catalog bootstrap `Image()` warming and bounds browser/service-worker warm concurrency at four; post-merge CI #289 kept the entry at **741.59 / 247.24 kB gzip**.
- **ANM-023F4A R1 [P1] — COMPLETE / PR #142** — lazy non-default locale payload and measured initial-entry reduction remain the durable F4A baseline.
- **ANM-023F4B R1 [P1] — COMPLETE / PR #144** — bounded runtime/PWA asset warming remains the durable F4B baseline.

Success criterion: the next feature requires less code/test surface to understand and modify, while GitHub CI catches more real defects and behavioral coverage does not regress. Runtime-impacting F3/F4 cuts still require mobile preview QA.

### ANM-023G — Playwright Browser Automation [P0/P1] — COMPLETE THROUGH G8

Playwright is the browser/E2E framework. The track reuses production QA/product surfaces rather than creating a second game implementation, and keeps browser CI parallel to the existing `npm run check` quality gate. **Selenium/WebDriver is explicitly not planned as a second automation stack.**

Completed implementation split:
- **023G1 Playwright Foundation [P0] — COMPLETE / PR #150** — isolated `e2e` package, deterministic production-build browser commands, artifacts and boot smoke;
- **023G2 QA Harness & Testability Contract [P0] — COMPLETE / PR #151** — production QA Scene Navigation, Match-3 Campaign and Level Lab formalized as shared automation entry points without browser-only game logic;
- **023G3 Boot / Build / Pages Preview Smoke [P0] — COMPLETE / PR #152** — stable-root and `/preview/` production topology smoke plus browser/runtime health checks;
- **023G4 VN QA Navigation E2E [P0/P1] — COMPLETE / PR #153** — real VN renderer coverage for measured paging, authored staging/assets and `CHOICE_00`; **G4A / PR #154** separately hardens Pages rerun artifact identity;
- **023G5 Match-3 Campaign + Level Lab E2E [P0/P1] — COMPLETE / PR #155** — production campaign entry and deterministic Level Lab mechanics through the real Match-3 runtime;
- **023G6 Persistence / Localization / Main-Flow Journeys [P1] — COMPLETE / PR #156** — campaign save/reload, locale persistence and short real-player VN → choice → Match-3 integration flow;
- **023G7A Browser Gate CI [P1] — COMPLETE / PR #157** — full Chromium suite plus mobile-critical WebKit subset in parallel GitHub Actions, with Playwright reports/traces/failure artifacts;
- **023G7B Mobile Visual Golden Samples [P1] — COMPLETE / PR #158** — four reviewed iPhone 13 WebKit baselines: Main Menu, VN0008 trio, CHOICE_00 and deterministic Match-3 seed 7;
- **023G7C Version / Diagnostics Closeout [P1] — COMPLETE / PR #159** — player-facing product version, build and save-schema identity remain separate and diagnosable;
- **023G7D Browser Gate Playwright Container Hardening [P1] — COMPLETE / PR #160** — pinned Playwright container plus deterministic hosted-runner font bridge;
- **023G8A Coverage Audit & QA/Production Parity Matrix [P1] — COMPLETE / PR #162** — inventories the Browser Gate, proves QA surfaces converge on production controllers and prioritizes real browser-only gaps;
- **023G8B Story/VN Production-Flow Expansion [P1] — COMPLETE / PR #165** — bounded Story Match-3 completion → evidence → post-win VN → persisted Continue journey;
- **023G8C1 Match-3 Browser Interaction Parity [P1] — COMPLETE / PR #166** — real `pointerdown → pointermove → pointerup`, drag commit and short-drag no-op through production input wiring;
- **023G8D Dependency Security Closure [P1] — COMPLETE / PR #168** — Vite/Vitest security refresh plus blocking high-severity npm audit with zero known vulnerabilities at merge;
- **023G8E1 PWA Update Reliability [P1] — COMPLETE / PR #171** — published-build identity and reliable update/reload behavior instead of a no-op waiting-worker assumption;
- **023G8E2 iOS VN Viewport Stability [P1] — COMPLETE / PR #174** — iOS text-inflation guard, in-place dialogue paging and RU/BE/EN localized multi-page regression coverage;
- **023G8E3 Match-3 Render Stability [P1] — COMPLETE / PR #175** — transient hint/reaction/cascade presentation updates no longer rebuild the whole Match-3 screen; stable board-level delegated input remains functional across cell replacement.

G8 closeout decision:
- **G8C2 Campaign completion/progression browser E2E is DEFERRED, not required for G8 completion.** A real production level is intentionally balance-sensitive; a tiny deterministic win fixture would narrow the tested conditions to an automation construct and would not justify its maintenance cost. Revisit after balance stabilization or a concrete regression that cannot be protected more cheaply at engine/store/controller level.
- Post-G8 automation should optimize for real production signal, not test count. Priority order is: **(1) RU/BE/EN mobile locale × viewport matrix on real screens; (2) PWA offline/recovery journey; (3) QA-driven VN/content asset crawl through production rendering; (4) stronger quantitative Match-3 regression/reporting on real levels and seed samples outside Playwright.**
- The mobile viewport matrix should use the existing portrait QA sizes `320×568`, `375×667`, `390×844`, `393×852`, `430×932` and assert geometry/overflow/visibility rather than multiplying Golden Sample screenshots.

Core architecture result:
- browser coverage enters through the same VN/Match-3/controller/render paths used by players;
- QA surfaces provide deterministic entry and setup, not alternative implementations;
- only bounded real-player journeys cross whole-system boundaries;
- visual baselines remain limited to reviewed Golden Samples;
- Browser Gate remains separate from `npm run check`;
- one Playwright stack owns browser automation; Selenium duplication and browser-only game logic remain prohibited.

Closeout authority: [`features/ANM023G8F_CLOSEOUT_RU.md`](features/ANM023G8F_CLOSEOUT_RU.md).

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

025A–D complete: Golden Sample presentation parity, narrative level context, production tile identities/rollout и persistent context-aware tutorial framework от basic swap до special combinations. 025E balance baseline и 025F narrative reactions также завершены после раннего ANM-026 Level Lab.

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

### ANM-027 — Story Content Architecture & Import [P0] — COMPLETE

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

The shared 028B Studio/lineup contract is stable; remaining character production is now gated by approved external art availability and explicit product sequencing.

Current split:
- **028A Character Production Manifest & Validator Foundation — COMPLETE** — canonical `upds-character-production-v2`, production/planned status, 7-asset precomposed runtime set, adult guardrail, proportional-height/alpha-bounds gate, PNG dimension/runtime-catalog audit and stale ANM-021 manifest cleanup;
- **028B Character/Scene Studio 2.0 — COMPLETE THROUGH B3** — 028B1 R4.1 reusable preset geometry, 028B2 R1.1 bounded authored playable adoption and 028B3 R1.1 separate guest/witness schema/renderer/validator are merged and available to content batches;
- **028C Safe Character Motion** — lightweight breathing/blink/speaking only after a replacement/delta approach proves no double-face, halo or authored-expression loss;
- **028D Character Production / Normalization — ART GENERATION PAUSED** — Emi D0 neutral, D1 smile, D2 serious and D3 surprised are approved; D3A exposes those four frames in runtime through an explicit override while legacy embarrassed/Pose B/medallion remain fallback. Remaining character art moves through the external Stable Diffusion workflow; ANM-027F has now locked Rina/Kurose as recurring-stage budget entries, not runtime assets.
- **028E0 Character Visual Override Lab — COMPLETE** — Scene Studio can load a browser-local ZIP with direct production character PNG replacements, auto-measure alpha bounds and temporarily override Pose A, Pose B and medallion assets across VN/QA/runtime without touching manifests, branches or CI; resets stay local to the current device/tab.
- **028E0A Character Override Calibration Export — COMPLETE** — the same browser-local lab now adds manual eye-line / bottom-pivot tuning, per-character staging scale + Y framing controls, and JSON snapshot export so accepted local overrides can be transferred into production without repeating calibration work.
- **028E0B Per-plan Visual Calibration — COMPLETE** — fixes Scene Studio preview application of scale/Y on the real portrait node, adds horizontal X framing, supports Global vs Current-plan calibration for each character, carries plan overrides into shared authored-shot staging, and exports global + per-plan geometry/staging as `upds-browser-local-character-export-v2`.
- **028E0C1 Composition / Story QA Separation — COMPLETE** — separates editable staging presets from read-only authored VN shot inspection, removes legacy Emi candidate Art Source modes from the active Scene Studio UX, keeps browser-local calibration editable only in Composition, and prevents VN line selection from overriding a Composition preset.
- **028E0C2 Slot-aware Character Composition Editor — COMPLETE** — replaces global/per-plan calibration UI with a `preset + slot + character` editor, character/expression/Pose A/B assignment per actor slot, direct pointer drag for X/Y, compact Scale/X/Y controls, inherited character defaults and `upds-browser-local-character-export-v3` composition snapshots.
- **028E0C2A Composition Pointer Interaction Fix — COMPLETE** — keeps Story QA fully inert while allowing only the Composition stage to receive pointer input, disables native PNG dragging, and adds a Browser Gate mouse-drag regression for slot X/Y calibration.

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

### ANM-029 — Full Localization Production [P1] — PAUSED AFTER BELARUSIAN

Target registry remains fixed to `ru`, `be`, `en`, `zh-CN`, `ja`, `ko`, `pt-BR`, but product sequencing no longer implies that every target must be produced consecutively.

Production split:
- **029A Localization Production Foundation — R1.1 COMPLETE** — seven-locale registry, pending/ready separation, catalog key/placeholder audit, glossary contract and centralized CJK readiness metadata;
- **029B Belarusian Production — COMPLETE (B4 R1.1, PR #135)** — B1 R1 player-shell translation is COMPLETE (61 keys); B2A R1.1 Match-3 core/campaign translation is COMPLETE (83 keys); B2B1 R1 levels `M3_00–M3_06` is COMPLETE (123 keys); B2B2 R1 levels `M3_07–M3_13` is COMPLETE (128 keys); B2B3 R1 levels `M3_14–M3_21` is COMPLETE (146 keys); B2C R1 F2 reactions/full Match-3 audit is COMPLETE (132 reaction keys; 612 total Match-3 keys); B3A R1.1 canonical VN slot 0 is COMPLETE (302 keys, `VN0001–VN0084` + CHOICE_00 + scenes 00–02); B3B R1.1 canonical runtime VN slot 1 is COMPLETE (178 keys, `VN0085–VN0142` + scenes 03–04), rebased unchanged after ANM-023E; B3C R1 canonical runtime VN slot 2 is COMPLETE (151 keys, `VN0143–VN0191` + scenes 05–06); B3D R1 canonical runtime VN slot 3 is COMPLETE (181 keys, `VN0192–VN0250` + scenes 07–08), closing the original vertical-slice source at the canonical `VN0250` bridge; B3E R1 canonical runtime VN slot 4 is COMPLETE (125 keys, `VN0251–VN0288` + scenes 09–10 + `meeting-tone` choice), beginning the ANM-027G source chain; B3F R1 canonical runtime VN slot 5 is COMPLETE (118 keys, `VN0289–VN0326` + scenes 11–12), covering basketball/service-route evidence and Hinata; B3G R1 canonical runtime VN slot 6 is COMPLETE (140 keys, `VN0327–VN0369` + scenes 13–14 + `apology-to-hinata` choice), closing Hinata exoneration and bridging to Asterion; B3H R1 canonical runtime VN slot 7 is COMPLETE (124 keys, `VN0370–VN0409` + scenes 15–16), covering Asterion laboratory verification and `CUE_008`; B3I R1 canonical runtime VN slot 8 is COMPLETE (121 keys, `VN0410–VN0448` + scenes 17–18), covering the lost-and-found ledger, `CUE_009` and the bridge to the master-key route; B3J R1 canonical runtime VN slot 9 is COMPLETE (131 keys, `VN0449–VN0488` + scenes 19–20 + `protect-gen-source` choice), covering the maintenance-key handoff, `CUE_010` and the Asterion night-container route; B3K R1.1 canonical runtime VN slot 10 is COMPLETE (121 keys, `VN0489–VN0527` + scenes 21–22), covering the karate-club control sample, `CUE_011` and the old-photo Asterion container; B3L R1 canonical runtime VN slot 11 is COMPLETE (131 keys, `VN0528–VN0567` + scenes 23–24 + `photo-permission` choice), covering the Asterion transfer chain, `CUE_012` and the weak-wireless-signal bridge; B3M R1 canonical runtime VN slot 12 is COMPLETE (131 keys, `VN0568–VN0607` + scenes 25–26 + `publish-tag` choice), covering the Panty-Eater signal test, `CUE_013`, active `Second Skin` microtag and the Kurose timing link; B3N R1 canonical runtime VN slot 13 is COMPLETE (121 keys, `VN0608–VN0646` + scenes 27–28), covering the kendo pilot-list verification, `CUE_014`, Kubo testimony and the atelier-receipt bridge; B3O R1 canonical runtime VN slot 14 is COMPLETE (131 keys, `VN0647–VN0686` + scenes 29–30 + `family-ledger-permission` choice), covering the Kubo atelier ledger chronology, `CUE_015`, privacy-preserving source handling and the Ray evidence-bag bridge; B3P R1 canonical runtime VN slot 15 is COMPLETE (124 keys, `VN0687–VN0726` + scenes 31–32), covering the Ray chase, abandoned-laundry consent route, `CUE_016`, Rina yard-camera correlation and the pink-ribbon bridge; B4 R1.1 completes the remaining **999** base-catalog keys from the merged B3P baseline: slots `16–21` (`VN0727–VN0964`, scenes 33–44, `CUE_017–019`, `trust-vincent`, `final-strategy`, all three authored endings), remaining VN chrome/config/history/status, Scene Studio, Level Lab, ending UI, character names and dossier. Completion gate is exact **3870/3870** base-key parity plus **132/132** Match-3 reactions, zero missing/extra/empty/placeholder drift and no runtime fallback; accepted runtime state is `be: production-complete`, runtime-selectable with `supportedLocales = ['ru', 'be', 'en']`;
- **029C Simplified Chinese Production — PAUSED** — resume only by explicit product-priority decision after ANM-029H; CJK typography/overflow QA remains required whenever this work resumes;
- **029D Japanese Production — PAUSED** — pending backlog reprioritization;
- **029E Korean Production — PAUSED** — pending backlog reprioritization;
- **029F Brazilian Portuguese Production — PAUSED** — pending backlog reprioritization;
- **029G All-Locale Release Audit — PAUSED** — resumes only when additional production locales are deliberately restarted. Belarusian has its own full-catalog release gate in B4.

ANM-029H planning decision: **do not start another locale automatically**. `zh-CN`, `ja`, `ko` and `pt-BR` remain paused while ANM-023F1–F4 simplify tooling/tests/runtime and measure payload. Localization resumes only by an explicit product-priority decision.

Rules:
- no hardcoded UI/story strings may re-enter runtime;
- a translation-pending locale is never exposed in the player selector;
- production-ready locale catalogs must match the stable source key set and named-placeholder signatures;
- CJK typography approval is visual QA and cannot be inferred from catalog completeness;
- glossary/character-name consistency is a production content contract, not ad-hoc per-scene copy editing.

### ANM-030 — Full Content / Art Production [P1]

**ANM-030A Full Game Asset Gap Audit [P0] — R1.1 COMPLETE / PR #145**: `src/content/art/ANM030A.asset-gap-audit.json` derives the exact production/fallback/missing/reusable inventory from the completed `0–21` story macro, runtime resolver, character/guest manifests, Match-3 configs and staging. Current measured gaps: **5/24 runtime-used background variants have dedicated production masters (19 aliases), 3/9 full-stage characters are fully production-ready + Emi mixed + 5 planned, 0/6 guest packages, 0/6 dedicated hero close-ups; Match-3 gameplay/configuration is complete, but one shared production-art gap remains: five dedicated special/bonus visuals replacing the current generic SVG overlays. VN staging has zero blocking art gaps**. **ANM-030A2 Audit Tooling & Repository Hygiene — COMPLETE / PR #147** moved the one-off Copilot report into `docs/audits/`, expanded manual targeted audits and guarded root/report hygiene.

Backlog refinement from the audit:
- **ANM-030B0A1 R1.1 [P1] — COMPLETE / PR #148: Match-3 Special/Bonus Visual Contract.** Planning-only docs/data/test contract for the existing `flash-row`, `flash-column`, `evidence`, `lead`, `insight` mechanics. It freezes one shared five-asset pack, current SVG fallback mapping, 256×256 RGBA runtime targets, base-tile readability and optional-vs-blocking FX boundaries. No images and no runtime mapping changes.
- **ANM-030B0A2 [P1] — ART-BLOCKED: Match-3 Special/Bonus Asset Integration.** There are currently no approved production PNGs to import. When the external/local generation pipeline produces five explicitly approved standalone assets, import them, switch `specialAssets` from SVG fallback to production assets, preserve preload/offline safety and run playable mobile board QA. No per-level bonus packs.
- **ANM-030B0B [P1] — ART-BLOCKED: Character Closure.** Emi `embarrassed` / Pose B / medallion replacements plus seven extras semantic roles mapped onto ≤4 reusable visual archetypes. Repository integration starts only after externally produced outputs pass explicit production approval; local generator experiments alone do not satisfy this gate.
- **ANM-030B1–B4 [P1] — ART-BLOCKED / PRODUCT-GATED:** vertical story-route production waves for remaining characters, guests, background masters/variants and six hero clues.

Mass production then follows the budgets in
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

1. **ANM-029B4 R1.1 — COMPLETE / PR #135** — Belarusian production-ready and runtime-selectable;
2. **ANM-029H R1 — COMPLETE / PR #136** — production planning reset and stale-status closure;
3. **ANM-023F1–F4B — COMPLETE / PRs #137–#144** — repository/test/runtime simplification and bounded payload/preload work;
4. **ANM-030A R1.1 [P0] — COMPLETE / PR #145** — machine-readable full-game asset gap audit;
5. **ANM-030A2 [P0] — COMPLETE / PR #147** — audit dispatcher expansion + repository/report hygiene;
6. **ANM-030B0A1 R1.1 [P1] — COMPLETE / PR #148** — planning-only five-special visual production contract;
7. **ANM-023G1–G7D — COMPLETE / PRs #150–#160** — Playwright foundation, QA parity, Pages smoke, VN/Match-3/persistence flows, Browser Gate, Golden Samples and hardened container runtime;
8. **ANM-023G7C R1 [P1] — COMPLETE / PR #159** — product-version, diagnostics/save-schema display and roadmap identity closeout; retained as an explicit BUILD_LABEL traceability anchor within the completed G1–G7D line;
9. **ANM-023G8A–G8E3 — COMPLETE / PRs #162, #165, #166, #168, #171, #174, #175** — coverage audit, Story completion, pointer parity, dependency security, PWA update reliability, localized iOS VN viewport stability and Match-3 render stability;
10. **ANM-023G8F [P1] — COMPLETE** — documentation/roadmap closeout; G8C2 is explicitly deferred and the post-G8 automation backlog is prioritized by production signal;
11. **Post-G8 quality backlog [P1, demand-driven]** — first RU/BE/EN mobile locale × viewport matrix, then PWA offline/recovery, VN/content asset crawl and quantitative Match-3 regression/reporting. Implement each as a bounded slice only when it is the highest-value art-independent work;
12. **ANM-030B0A2 [P1] — ART-BLOCKED** — integrate five externally approved production special/bonus PNGs only after they exist and pass approval;
13. **ANM-030B0B / ANM-030B1–B4 [P1] — ART-BLOCKED / PRODUCT-GATED** — character and story-route art integration after approved external art exists;
14. **ANM-031 [P2]** — landscape;
15. **ANM-032 [P2]** — music;
16. **ANM-033 [P0 before release]** — release hardening, where deferred Campaign completion E2E may be reconsidered if balance has stabilized and the browser-level signal is still valuable.

## Backlog principle

Do not solve production problems by adding more one-off code.
Before a high-volume content task, build the reusable contract/tooling that makes the content cheap to create, validate and maintain.
Do not reduce the approved story scope to meet an asset budget; change staging, tier or presentation first, and record any budget exception explicitly.
