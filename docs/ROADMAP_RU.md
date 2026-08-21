# UPDS — Production Roadmap

Technical product version: `0.26.0-dev`.

Status: **ANM-030B0H release-planning reset** after completed full-stage character production.

This roadmap is intentionally a strategic status map, not a transcript of every historical sub-feature. Detailed implementation history lives in feature docs and Git. The actionable remaining-work authority is [`RELEASE_BACKLOG_RU.md`](RELEASE_BACKLOG_RU.md); the approved full-game scope/reuse ceilings remain [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md); machine-readable art inventory remains `src/content/art/ANM030A.asset-gap-audit.json`. Production budgets are ceilings, not an obligation to spend every planned asset slot.

`APP_VERSION` in `src/appVersion.ts` is the canonical player-facing product semver dev-line. npm `package.json.version` remains internal package metadata. `BUILD_LABEL` is separate feature/baseline identity; current traceability still includes **ANM-023G7C Version / Diagnostics Closeout**. `BUILD_ID` identifies a concrete CI build.

## Base-release target

The current realistic first release is:

- portrait-first web/PWA;
- complete Story `0–21`, including the three ending routes `19–21`;
- player-facing Match-3 Campaign;
- production locales RU / BE / EN;
- nine production-ready full-stage characters;
- no player-visible internal QA/tool placeholders;
- no dependency on landscape, extra locales, character animation, Hero Insert/CG system or unique-song production.

Changing the release platform or market scope is a separate product decision, not an implicit expansion of the existing backlog.

## Current state

### Completed / stable foundations

- mobile ZIP → GitHub candidate → CI → preview → manual merge pipeline plus bounded direct GitHub branch/PR lane for non-visual work;
- save/progression, VN shell/paging/staging, localization foundation, PWA/offline/update foundation and telemetry foundation;
- Match-3 production framework, Level Lab and player-facing Match-3 Campaign;
- complete canonical authored story and graph/runtime pipeline for all 22 slots and three endings;
- viewport/safe-area foundation and Playwright Browser Gate;
- RU, BE and EN production runtime;
- nine-character full-stage production closure with exact 63 runtime assets and Mobile WebKit visual protection.

### Durable completion traceability

- **ANM-023F — Codebase, Test & Tooling Simplification — COMPLETE**; **023F1 Biome Expansion & Repository Hygiene** starts the merged F1–F4B maintenance sequence through PR #144.
- **ANM-023G — Playwright Browser Automation [P0/P1] — COMPLETE THROUGH G8**. ANM-023G Playwright Browser Automation is COMPLETE through G8 closeout.
- **023G7C Version / Diagnostics Closeout [P1] — COMPLETE / PR #159**.
- **023G7D Browser Gate Playwright Container Hardening [P1] — COMPLETE / PR #160**.
- **023G8A Coverage Audit & QA/Production Parity Matrix [P1] — COMPLETE / PR #162**.
- **023G8C1 Match-3 Browser Interaction Parity [P1] — COMPLETE / PR #166**.
- **023G8E3 Match-3 Render Stability [P1] — COMPLETE / PR #175**.
- **G8C2 Campaign completion/progression browser E2E is DEFERRED, not required for G8 completion.**
- **ANM-024 Display / Viewport / Safe-Area Foundation — COMPLETE**.
- **ANM-025 Match-3 Production Framework — FRAMEWORK COMPLETE**; deterministic balance baseline is complete through E3. A separate E4 framework is evidence-driven rather than automatically required.
- **ANM-026 Level Lab & Match-3 Campaign — COMPLETE**.
- **ANM-027 Story Content Architecture & Import — COMPLETE**.
- **027G Episode Batch Production & Canonical Import — COMPLETE**: authored/runtime-integrated `0–21` content and three endings.
- **ANM-028 Character Production Pipeline 2.0 — PRODUCTION FOUNDATION COMPLETE**.
- **028A Character Production Manifest & Validator Foundation — COMPLETE**.
- **ANM-028B2 R1.1 Authored VN Shot Adoption — COMPLETE**.
- **028D Character Production / Normalization — HISTORICAL / SUPERSEDED** by the current production rigs.
- **029A Localization Production Foundation — R1.1 COMPLETE**.
- **029B Belarusian Production — COMPLETE (B4 R1.1, PR #135)** with **exact 3870/3870 base-key parity**; runtime production locales remain `supportedLocales = ['ru', 'be', 'en']`.
- **ANM-030A Full Game Asset Gap Audit**: **ANM-030A R1.1 [P0] — COMPLETE / PR #145**.
- **ANM-030A2 [P0] — COMPLETE / PR #147** — audit tooling and repository/report hygiene.
- **ANM-030B0A1 R1.1 [P1] — COMPLETE / PR #148** — planning-only shared Match-3 special visual contract.
- **ANM-030B0B–B0F full-stage character closure** is complete.
- **ANM-030B0B–B0F [P1] — COMPLETE / PRs #186–#190**: nine approved rigs, exact 63-file adoption, candidate cleanup, WebKit lineup gate and retired compatibility seam removal.
- **ANM-030B0G [P1] — DOCUMENTATION CLOSEOUT**: active architecture/testing/docs aligned with the finished 9/9 state.
- **ANM-030B1B1 [R0] — STUDENT COUNCIL AUDITORIUM BACKGROUND COMPLETE**: the approved `1080×1920` production WebP replaces the visibly wrong clubroom alias in Story slot 4; background status is now `6/24` dedicated production variants and `18` runtime aliases.
- **ANM-030B1B2 [R0] — ASTERION SMART-TEXTILE LAB BACKGROUND COMPLETE**: the approved `1080×1920` golden master replaces the unrelated apartment fallback in Story slot 7; background status is now `7/24` dedicated production variants and `17` runtime aliases.
- **ANM-030B1B3 [R0] — LOST-FOUND WAREHOUSE BACKGROUND COMPLETE**: the approved `1080×1920` golden master replaces the unrelated athletics-locker fallback in Story slot 8; background status is now `8/24` dedicated production variants and `16` runtime aliases.
- **ANM-030B1B4 [R0] — CAMPUS SERVICE YARD BACKGROUND COMPLETE**: the approved `1080×1920` golden master replaces the unrelated clubroom fallback in Story slot 11; background status is now `9/24` dedicated production variants and `15` runtime aliases.
- **ANM-030B1B5 [R0] — ABANDONED LAUNDRY BACKGROUND COMPLETE**: the approved `1080×1920` golden master replaces the unrelated pool-locker fallback in Story slot 15; all eight background families now have production masters, with `10/24` dedicated variants and `14` runtime aliases.
- **ANM-030B1B6 [R0] — HIGH-USAGE BACKGROUND TRIO COMPLETE**: dedicated textile-workshop, multipurpose combat-club-hall and old-archive WebPs replace unrelated aliases across eleven common-route scene appearances; background status is now `13/24` dedicated variants and `11` runtime aliases.

## What is actually left for release

The detailed classification and acceptance outcomes are in [`RELEASE_BACKLOG_RU.md`](RELEASE_BACKLOG_RU.md). The important change from the old roadmap is that **not every remaining art budget or idea is a release requirement**.

### R0 — release blockers

1. **Production player surface** — remove/hide QA-labelled Scene Navigation, Level Lab, Scene Studio and Save Diagnostics from the normal player menu while preserving deterministic QA/automation access. Match-3 Campaign remains player-facing.
2. **Background semantic closure** — all eight family masters now exist, and the three highest-exposure fallbacks are closed. Further ChatGPT background production is paused pending a reproducible ComfyUI style workflow; the current fallback count is `11`. Do not turn the original `19 aliases` audit count into 19 mandatory illustrations.
3. **Guest/witness closure** — six named guests must stop rendering asset-free initials placeholders in shipped scenes. Use the lean guest package or another explicitly approved final testimony presentation; do not promote them to seven-asset full-stage rigs by default.
4. **Full human content QA** — Story common route + all three endings, all 22 production Match-3 levels, direct special combinations on phone, save/continue/retry/progression boundaries.
5. **Final asset/runtime crawl** after production-art integration — zero broken shipped asset URLs/decode failures and no reliance on browser-local Scene Studio overrides.
6. **PWA/mobile release regression** — install/update/offline/recovery/save, iOS and representative Android Chromium, final payload/performance/render sanity.
7. **RU/BE/EN release-language QA** — proofreading, zero fallback, terminology and mobile overflow/paging.
8. **Minimum accessibility/interaction gate** — critical touch, focus, labels, contrast/readability and motion-safety defects fixed before RC.
9. **Public release package / rights sanity** — final PWA metadata/icons, credits and shipped-asset rights, platform-required privacy/content/age/legal notices, production URL/hosting and rollback/update ownership. Keep this bounded to the actual distribution platform.

### R1 — release-worthy / bounded polish

The old post-G8 production-signal order remains useful as a vocabulary for cheap regression work, but it is no longer an automatic implementation queue:

- **RU/BE/EN mobile locale × viewport matrix** — automate the existing portrait cohort and assert geometry/overflow/visibility rather than multiplying screenshots;
- **PWA offline/recovery** — expand Browser Gate only where it protects a real release failure mode;
- **VN/content asset crawl** — make the final shipped-content URL/decode gate repeatable after production art lands;
- **quantitative Match-3 regression/reporting** — strengthen only when human playtest evidence identifies a problem current deterministic tools do not explain cheaply;
- controlled background variants beyond the completed family anchors only when visual QA shows a narrative mismatch;
- extras mapped onto **≤4 reusable adult archetypes** only where their absence visibly hurts a shipped scene;
- Match-3 special/bonus production art only if final board QA shows the current SVGs look/read as prototype rather than production;
- bounded audio quality replacement only if the existing procedural menu/VN/match/ending themes fail the final product listen-through.

Historical traceability: **ANM-030B0A2 [P1] — ART-BLOCKED** remains the old five-special integration label, but its output is now conditional polish rather than a release blocker.

## Deferred / post-release

### Additional locales

- **029C Simplified Chinese Production — PAUSED**;
- 029D Japanese Production — PAUSED;
- 029E Korean Production — PAUSED;
- **029F Brazilian Portuguese Production — PAUSED**;
- 029G all-locale audit resumes only if additional locales are deliberately restarted.

`zh-CN`, `ja`, `ko`, `pt-BR` are market expansion, not requirements for the RU/BE/EN base release.

### Character motion

ANM-028C Safe Character Motion and large-scale character animation are post-release polish unless playtest/marketing evidence demonstrates material value. Static expressive sprites are acceptable for the base VN.

### Hero clue / Hero Insert

The audit budgets six hero close-ups, but there is currently **no separate Hero Clue runtime renderer**. Screenplay `HERO INSERT` directions and ordinary clue/ingredient images are not an implemented hero-CG system.

The old line **ANM-030B1A [P1] — NEXT PROPOSED VERTICAL-SLICE ART MILESTONE** for `conductive-seam` is now a **superseded planning label**, not the next mandatory feature. Hero inserts move to post-release/optional. If later evidence supports them, implement the smallest reusable `insert → tap → continue` presentation, not a gallery/zoom subsystem.

### ANM-031 — Landscape Support [P2]

Post-release. Portrait-first release is valid; architecture should merely avoid making future landscape impossible.

### ANM-032 — Music & Level Song Pipeline [P2]

Post-release/content-marketing idea. The game already has procedural music/SFX. Unique episode/level songs and album/export structure are not required for base release.

### ANM-023G8C2

Campaign completion/progression browser E2E stays deferred until a concrete regression or stable balance makes its maintenance value clear.

### DLC-001 — Beach Episode

Post-launch expansion only. It must not consume base-release capacity.

## Explicitly not planned without evidence

- Selenium/WebDriver as a parallel browser stack;
- 19 independent background illustrations just to eliminate an alias counter;
- contract-only unused `central-laundry` or `campus-street` art before story use;
- seven unique extras instead of ≤4 reusable archetypes;
- return of planned/placeholder/candidate full-stage runtime lanes;
- per-level Match-3 special visual packs;
- one-off Match-3 mechanics that do not meet the reuse/tutorial/tooling contract;
- complex Hero Clue gallery/zoom/collection systems;
- unique song for every level;
- more Golden Sample screenshots or E2E tests purely to increase coverage count;
- orphan clue binary cleanup without concrete runtime/repository harm.

## Manual/process checks that do not block product release by themselves

- Complete the pending manual phone QA of direct special combinations as part of the R0 full-content pass.
- At the next naturally rejected/stale ZIP, verify live importer failure cleanup. Do not create a release milestone solely to manufacture this condition.
- Local ComfyUI/VNCCS/generator work remains R&D until approved outputs are deliberately imported.

## Recommended immediate sequence

1. **ANM-030B0H — Release Backlog Reset** — current planning/doc slice.
2. **Background pipeline transfer** — merge/QA the B1B6 high-usage trio, pause further ChatGPT background generation and prepare a reproducible ComfyUI workflow from the approved UPDS style references; do not add more runtime variants in that workflow slice.
3. **Guest/witness closure** — finish production presentation for six named guests in small reviewable waves with iPhone preview.
4. **Release surface closure** — normal build hides QA tools while Browser Gate retains deterministic QA entry.
5. **Conditional visual cleanup** — only variants/extras that real visual QA flags; five Match-3 specials only if the current SVG presentation fails product quality.
6. **ANM-033 — Release Candidate Hardening [P0 before release]** — full Story/22-level human regression, three endings, RU/BE/EN, asset crawl, PWA/update/offline/save, iOS + Android, public-release packaging/rights, accessibility/performance sanity.
7. Fix only defects found by those gates; build the RC.
8. Hero inserts, landscape, extra locales, safe motion, song pipeline and DLC stay after base release until evidence changes priority.

## Backlog principle

Do not solve production problems by adding one-off code or by spending every budget slot merely because it exists. A budget is a ceiling, not a shopping list.

A new idea becomes an R0 release blocker only when at least one is true:

- progression/content comprehension breaks without it;
- the player sees an obvious placeholder or semantically wrong asset;
- there is crash/data-loss/offline/update/accessibility-critical risk;
- a device/localization regression is reproduced;
- the chosen release platform requires it;
- repeated human playtest evidence shows material product harm.

Otherwise keep it R1/R2 or remove it.
