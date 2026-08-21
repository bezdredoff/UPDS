# UPDS — Production Roadmap

Technical product version: `0.26.0-dev`.
Active production foundation: **ANM-025/026 Match-3 production + tooling, completed ANM-027A–G canonical story pipeline, accepted ANM-028B1 R4.1 Scene Studio geometry, ANM-028B2 R1.1 authored VN shot adoption, ANM-028B3 R1.1 guest/witness presentation, completed ANM-029B4 Belarusian production and merged ANM-029H planning reset**. The complete **ANM-023F** simplification/performance track is merged through **F4B / PR #144**. ANM-030A R1.1 is merged through **PR #145**, audit-tooling follow-up ANM-030A2 through **PR #147**, and the planning-only Match-3 special visual contract ANM-030B0A1 R1.1 through **PR #148**. **ANM-030B0B–B0F close the full-stage character production migration**: all nine recurring/core characters use approved seven-asset rigs, all 63 runtime assets are archive/digest locked, historical candidate/placeholder/static-override seams are removed, and Mobile WebKit owns the nine-character lineup gate. **ANM-023G Playwright Browser Automation is COMPLETE through G8 closeout**: G1–G7D establish the shared Chromium/mobile-WebKit Browser Gate; G8A audits real coverage; G8B closes the first Story completion handoff; G8C1 adds real pointer interaction parity; G8D closes dependency security; and G8E1–E3 harden PWA updates, localized iOS VN viewport stability and Match-3 render stability. The next art-independent quality backlog is intentionally post-G8: mobile locale × viewport coverage first, then PWA offline/recovery, VN/content asset crawl and quantitative Match-3 regression improvements. ANM-023G8C2 Campaign completion E2E is deferred until balance stabilizes or a concrete regression justifies its maintenance cost. Remaining ANM-030B guest/background/clue/Match-3 art stays gated until explicitly approved; full-stage cast art is complete.

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
- **ANM-030B0B–B0F full-stage character closure**: all nine recurring/core characters use exact approved seven-asset rigs; B0C replaces the previously retained Miku/Onoe/Ayuki/Emi binaries and locks all 63 assets by SHA-256; B0D removes live Emi candidate data/assets; B0E adds the Mobile WebKit full-cast lineup gate; B0F removes retired full-stage planned/placeholder and built-in static override seams;
- character runtime uses precomposed 1024×1536 expression frames plus optional browser-local Scene Studio experiments only; retired transparent face-overlay/candidate/static-override composition must not return;
- ANM-023 Architecture & Test Health Pass: repository hygiene, test-health cleanup, architecture boundary audit and pipeline failure hygiene;
- **ANM-023E Test, Tooling & Identity Hardening — R1 COMPLETE**: lifecycle-status assertions are reduced in favor of durable contracts, Biome is added to `npm run check`, and package/app product version metadata is structurally separated from feature/build identity;
- **ANM-023G1–G8 Playwright Browser Automation — COMPLETE**: one Playwright stack owns Chromium/WebKit E2E, production QA/player surfaces, traces/diagnostics and reviewed mobile visual baselines. Selenium/WebDriver is not part of the UPDS test stack and is not planned as a parallel CI framework;
- ANM-024 Display / Viewport / Safe-Area Foundation: shared viewport shell, centralized safe-area ownership, portrait regression matrix and orientation-neutral low-height landscape contract;
- ANM-025E quantitative balance baseline through E3; E4 remains optional only if later human playtest data shows a concrete need;
- ANM-025F Match-3 Narrative Reactions complete through F1 resolver contract, F2 content and F3 presentation/anti-spam;
- ANM-027A–D story production pipeline: graph contract, graph-driven runtime routing, import/completeness audit and canonical runtime import/transition QA;
- ANM-027E Lean Content Production Contract: all 22 planned content slots and three endings remain in scope; production cost is constrained through character tiers, staging/background reuse, native evidence UI, Match-3 archetypes and asset-trigger budgets. Canonical contract: [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md);
- documentation/traceability authority aligned with ANM-027E and protected by a focused docs drift gate;
- ANM-028B1 R4.1 multi-actor focal-eye-line and selected-frame guide parity accepted on iPhone and merged through PR #96 (`c224df25c35c610eb6f83e675f8d95f48b92a3c8`).

### Historical ANM-028 visual acceptance notes

- ANM-028D0/D1/D2/D3/D3A are historical Emi candidate/provenance milestones. Their generated masters and acceptance decisions are preserved in feature docs/prompts/Git history, but their candidate/runtime-override architecture is superseded by ANM-030B0B–B0F and must not be treated as current runtime design;
- **ANM-028B2 R1.1 Authored VN Shot Adoption — COMPLETE** — five stable ANM-003 line IDs use the accepted `upds-scene-staging-v1` resolver directly in playable VN, covering trio, duo and one real Pose B shot while every unlisted line retains the stable staging fallback. Scene Studio can preview the same authored declarations. No new art is introduced;
- R1/PR #92 passed automated gates but did not pass final visual acceptance because it lacked real VN chrome/occlusion and exposed unresolved character/background inconsistencies. It is evidence, not a completed roadmap item;
- R2/PR #93 passed CI but failed iPhone visual acceptance: scene actors were full-body, too small relative to backgrounds and appeared to float. It must not be merged;
- R3/PR #94 was merged as a diagnostic baseline but failed final visual acceptance; R4/PR #95 corrected part of the framing but still exposed duo/guide issues; accepted R4.1 supersedes both.

### Useful manual regression still pending

- полный ручной QA всех direct special combinations на телефоне;
- при следующем намеренно rejected/stale ZIP полезно подтвердить live failure-cleanup path: run остаётся красным, а `incoming` очищается без второго zero-ZIP run.

Эти проверки не блокируют дальнейшую разработку: ANM-023G8 закрыт, Match-3/story/character foundations имеют automated coverage.

### Deferred, not cancelled

- **ANM-030B0A2 and remaining B1–B4 guest/background/clue art integration — ART-BLOCKED / PRODUCT-GATED** until the external/local art workflow produces assets that pass explicit product approval; there are currently no approved new production Match-3 special PNGs to integrate;
- large-scale character animation production;
- additional locale production (`zh-CN`, `ja`, `ko`, `pt-BR`) until explicitly resumed after the planning reset;
- **ANM-023G8C2 Campaign completion/progression browser E2E** until Match-3 balance is stable enough for a durable real-level journey or a concrete production regression proves the browser-level signal is worth its maintenance cost. Do not replace it with a tiny automation-only win fixture merely to mark the gap closed.

Local generator/ComfyUI/VNCCS experimentation is R&D outside the repository production inventory. It does not change asset status until an approved output is deliberately imported through the production contract.

## Production backlog

### ANM-023F — Codebase, Test & Tooling Simplification [P0/P1] — COMPLETE

The post-Belarusian reset intentionally reopened the ANM-023 maintenance line before high-volume art/content integration. This bounded simplification track is complete and was not an architecture rewrite.

- **023F1 Biome Expansion & Repository Hygiene [P0] — R1 COMPLETE / PR #137** — unified Biome lint across `src`, `tests` and Vite config; focused/duplicate test hooks are blocking; repository debris is removed and guarded; safe-fix commands are available;
- **023F2 Test Suite Simplification [P0] — R1 COMPLETE / PR #138** — completed Belarusian lifecycle-batch tests are consolidated into domain suites and the high-signal Biome cohort is blocking;
- **023F3 Runtime / Controller Simplification [P0/P1] — COMPLETE THROUGH F3C / PR #141** — bounded behavior-preserving presentation/rule-kernel extractions reduce runtime reading hotspots;
- **023F4 Performance & Payload Pass [P1] — COMPLETE / PR #144** — lazy non-default locale payload plus bounded browser/service-worker warming remain the accepted performance baseline.

Success criterion remains: future features require less code/test surface to understand and modify while GitHub CI catches real defects and behavioral coverage does not regress.

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
- **023G7B Mobile Visual Golden Samples [P1] — COMPLETE / PR #158** — reviewed iPhone 13 WebKit baselines;
- **023G7C Version / Diagnostics Closeout [P1] — COMPLETE / PR #159** — player-facing product version, build and save-schema identity remain separate and diagnosable;
- **023G7D Browser Gate Playwright Container Hardening [P1] — COMPLETE / PR #160** — pinned Playwright container plus deterministic hosted-runner font bridge;
- **023G8A Coverage Audit & QA/Production Parity Matrix [P1] — COMPLETE / PR #162** — inventories the Browser Gate and prioritizes real browser-only gaps;
- **023G8B Story/VN Production-Flow Expansion [P1] — COMPLETE / PR #165** — bounded Story Match-3 completion → evidence → post-win VN → persisted Continue journey;
- **023G8C1 Match-3 Browser Interaction Parity [P1] — COMPLETE / PR #166** — real pointer drag wiring through production input;
- **023G8D Dependency Security Closure [P1] — COMPLETE / PR #168** — Vite/Vitest security refresh plus blocking high-severity npm audit;
- **023G8E1 PWA Update Reliability [P1] — COMPLETE / PR #171**;
- **023G8E2 iOS VN Viewport Stability [P1] — COMPLETE / PR #174**;
- **023G8E3 Match-3 Render Stability [P1] — COMPLETE / PR #175**.

G8 closeout decision:
- **G8C2 Campaign completion/progression browser E2E is DEFERRED, not required for G8 completion.** Revisit after balance stabilization or a concrete regression that cannot be protected more cheaply at engine/store/controller level;
- post-G8 automation should optimize for real production signal, not test count. Priority order is: **(1) RU/BE/EN mobile locale × viewport matrix; (2) PWA offline/recovery; (3) QA-driven VN/content asset crawl; (4) stronger quantitative Match-3 regression/reporting**;
- the mobile viewport matrix should use the existing portrait QA sizes `320×568`, `375×667`, `390×844`, `393×852`, `430×932` and assert geometry/overflow/visibility rather than multiplying Golden Sample screenshots.

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

All 22 planned story slots are authored; art production remains independently gated by the external asset workflow.

Content-production split:
- **027E Lean Content Production Contract — COMPLETE** — [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md) preserves slots `0–21` while capping one-off production through full-stage/guest/extras tiers, eight staging presets, 8–10 location masters, 5–7 hero clue close-ups and 5–6 Match-3 layout archetypes;
- **027F Full Story Macro Lock — COMPLETE** — slots `0–21`, endings `19–21`, eight location families, six reusable Match-3 archetypes, six hero clue close-ups, full-stage/guest tiers and asset triggers are locked in `src/content/story/ANM027F.full-story-macro.json`; all slots `0–21` are authored/production-configured;
- **027G Episode Batch Production & Canonical Import — COMPLETE** — all six post-slice packages are merged. Canonical runtime contains 976 authored lines / 45 VN scenes / 22 Match-3 routes, three data-driven ending branches and the gated full-truth outcome.

### ANM-028 — Character Production Pipeline 2.0 [P0/P1] — PRODUCTION FOUNDATION COMPLETE

The shared Studio/lineup contract is stable and the current full-stage cast production migration is closed. Future character work is limited to explicitly resumed animation/R&D or genuinely new production characters.

Current split:
- **028A Character Production Manifest & Validator Foundation — COMPLETE** — canonical `upds-character-production-v2`, strict seven-asset precomposed runtime set, adult guardrail, proportional-height/alpha-bounds gate, PNG dimension/runtime-catalog audit and current nine-character production-only full-stage contract;
- **028B Character/Scene Studio 2.0 — COMPLETE THROUGH B3** — 028B1 R4.1 reusable preset geometry, 028B2 R1.1 bounded authored playable adoption and 028B3 R1.1 separate guest/witness schema/renderer/validator are merged;
- **028C Safe Character Motion — DEFERRED** — lightweight breathing/blink/speaking only after a replacement/delta approach proves no double-face, halo or authored-expression loss;
- **028D Character Production / Normalization — HISTORICAL / SUPERSEDED** — Emi D0–D3/D3A candidate lineage is preserved as generation/acceptance provenance but no longer participates in runtime; ANM-030B0B–B0F replace it with the finished nine-character production contract;
- **028E0 Character Visual Override Lab — COMPLETE** — Scene Studio can load browser-local ZIP replacements, auto-measure alpha bounds and temporarily override Pose A/Pose B/medallion assets without touching manifests/branches/CI;
- **028E0A Character Override Calibration Export — COMPLETE** — manual eye-line/bottom-pivot tuning, per-character staging and JSON snapshot export;
- **028E0B Per-plan Visual Calibration — COMPLETE** — production portrait-node Scale/X/Y calibration and exported geometry/staging;
- **028E0C1 Composition / Story QA Separation — COMPLETE** — editable staging composition separated from read-only authored VN shot inspection; legacy Emi candidate Art Source modes removed from active Scene Studio UX;
- **028E0C2 Slot-aware Character Composition Editor — COMPLETE** — `preset + slot + character` editor, expression/Pose A/B assignment, drag X/Y and `upds-browser-local-character-export-v3` snapshots;
- **028E0C2A Composition Pointer Interaction Fix — COMPLETE** — Story QA inert; Composition-only pointer input with Browser Gate drag regression.

Production closeout authority: [`features/ANM030B0G_CHARACTER_PRODUCTION_CLOSEOUT_RU.md`](features/ANM030B0G_CHARACTER_PRODUCTION_CLOSEOUT_RU.md).

### ANM-029 — Full Localization Production [P1] — PAUSED AFTER BELARUSIAN

Target registry remains fixed to `ru`, `be`, `en`, `zh-CN`, `ja`, `ko`, `pt-BR`, but product sequencing no longer implies that every target must be produced consecutively.

Production split:
- **029A Localization Production Foundation — R1.1 COMPLETE** — seven-locale registry, pending/ready separation, catalog key/placeholder audit, glossary contract and centralized CJK readiness metadata;
- **029B Belarusian Production — COMPLETE (B4 R1.1, PR #135)** — exact 3870/3870 base-key parity plus 132/132 Match-3 reactions, zero missing/extra/empty/placeholder drift and no runtime fallback; accepted runtime state is `be: production-complete`, runtime-selectable with `supportedLocales = ['ru', 'be', 'en']`;
- **029C Simplified Chinese Production — PAUSED** — resume only by explicit product-priority decision after ANM-029H; CJK typography/overflow QA remains required whenever this work resumes;
- **029D Japanese Production — PAUSED**;
- **029E Korean Production — PAUSED**;
- **029F Brazilian Portuguese Production — PAUSED**;
- **029G All-Locale Release Audit — PAUSED** — resumes only when additional production locales are deliberately restarted.

ANM-029H planning decision: **do not start another locale automatically**. `zh-CN`, `ja`, `ko` and `pt-BR` remain paused while production priorities move to remaining visual content.

Rules:
- no hardcoded UI/story strings may re-enter runtime;
- a translation-pending locale is never exposed in the player selector;
- production-ready locale catalogs must match the stable source key set and named-placeholder signatures;
- CJK typography approval is visual QA and cannot be inferred from catalog completeness;
- glossary/character-name consistency is a production content contract, not ad-hoc per-scene copy editing.

### ANM-030 — Full Content / Art Production [P1]

**ANM-030A Full Game Asset Gap Audit [P0] — R1.1 COMPLETE / PR #145**: `src/content/art/ANM030A.asset-gap-audit.json` derives the production/fallback/missing/reusable inventory from the completed `0–21` story macro and runtime contracts. Current machine-readable state after character closure: **5/24 runtime-used background variants have dedicated production masters (19 aliases), 9/9 full-stage characters are production-ready with 0 outstanding full-stage assets, 0/6 guest packages, 0/6 dedicated hero close-ups; Match-3 gameplay/configuration is complete, with one shared production-art gap of five dedicated special/bonus visuals. VN staging has zero blocking art gaps**. **ANM-030A2 Audit Tooling & Repository Hygiene — COMPLETE / PR #147** moved the one-off report into `docs/audits/`, expanded targeted audits and guarded root/report hygiene.

Backlog refinement from the audit:
- **ANM-030B0A1 R1.1 [P1] — COMPLETE / PR #148: Match-3 Special/Bonus Visual Contract.** Planning-only docs/data/test contract for `flash-row`, `flash-column`, `evidence`, `lead`, `insight`; one shared five-asset production pack, no per-level bonus packs;
- **ANM-030B0A2 [P1] — ART-BLOCKED: Match-3 Special/Bonus Asset Integration.** Integrate five explicitly approved standalone PNGs when they exist, preserve preload/offline safety and run playable mobile board QA;
- **ANM-030B0B–B0F [P1] — COMPLETE / PRs #186–#190: Full-stage Character Closure.** Nine approved canonical rigs, exact 63-file adoption, SHA-256 asset lock, live candidate cleanup, Mobile WebKit lineup visual gate and retirement of planned/placeholder/static-override compatibility seams;
- **ANM-030B0G [P1] — DOCUMENTATION CLOSEOUT:** active roadmap/architecture/testing/docs authority aligned with the already-merged 9/9 character state; historical D0–D3 provenance retained without restoring runtime candidate code;
- **ANM-030B1A [P1] — NEXT PROPOSED VERTICAL-SLICE ART MILESTONE:** dedicated hero clue `conductive-seam` for slot 3. With full-stage cast closed, this is the only dedicated story-art gap remaining in original slots `0–3`;
- **ANM-030B1–B4 [P1] — ART-BLOCKED / PRODUCT-GATED:** remaining vertical story-route production waves for guest packages, background masters/controlled variants, extras archetypes and the remaining hero clues. Full-stage recurring characters are no longer part of these waves.

Mass production then follows the budgets in [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md):
- six guest packages plus reusable extras archetypes;
- 8–10 reusable master-location families and controlled variants;
- Match-3 special/bonus visuals;
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
7. **ANM-023G1–G8 — COMPLETE / PRs #150–#175** — Playwright foundation through closeout, with G8C2 explicitly deferred;
8. **ANM-030B0B–B0F [P1] — COMPLETE / PRs #186–#190** — full-stage cast integration, exact archive adoption, legacy cleanup, full-cast WebKit visual gate and compatibility-seam retirement;
9. **ANM-030B0G [P1] — CURRENT DOCS CLOSEOUT** — align active sources of truth with the already-complete 9/9 character state;
10. **ANM-030B1A [P1] — NEXT PROPOSED** — produce/integrate `conductive-seam` hero clue and close the dedicated story-art gap for slots `0–3`;
11. **Post-G8 quality backlog [P1, demand-driven]** — mobile locale × viewport matrix, PWA offline/recovery, VN/content asset crawl and quantitative Match-3 regression/reporting when each becomes the highest-value art-independent work;
12. **ANM-030B0A2 [P1] — ART-BLOCKED** — integrate five externally approved production special/bonus PNGs only after they exist and pass approval;
13. **ANM-030B1–B4 [P1] — ART-BLOCKED / PRODUCT-GATED** — guests/backgrounds/extras/hero-clue art integration after approved outputs exist;
14. **ANM-031 [P2]** — landscape;
15. **ANM-032 [P2]** — music;
16. **ANM-033 [P0 before release]** — release hardening, where deferred Campaign completion E2E may be reconsidered if balance has stabilized and the browser-level signal is still valuable.

## Backlog principle

Do not solve production problems by adding more one-off code.
Before a high-volume content task, build the reusable contract/tooling that makes the content cheap to create, validate and maintain.
Do not reduce the approved story scope to meet an asset budget; change staging, tier or presentation first, and record any budget exception explicitly.
