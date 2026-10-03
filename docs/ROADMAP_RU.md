# UPDS — Production Roadmap

Technical product version: `0.26.0-dev`.

2026-10-02 — G5a закрыта после слияния PR #325–326 и решения пользователя. Завершены
английская и белорусская редактура: в BE вычитаны 976 сюжетных реплик, 601 строка
основного UI/Match-3 и 149 дополнительных подсказок и реакций. Оставшиеся видимые
английские подписи локализованы, факты и отображаемые производственные заметки
исправлены. В RU/BE/EN по 3 868 ключей. Localization audit — 27/27, docs audit — 11/11;
Quality, Chromium full E2E и Mobile WebKit critical E2E по PR #326 прошли. Пользователь
подтвердил проверку на телефоне. [Отчёт EN](reviews/G5A_EN_EDITORIAL_AUDIT_2026-10-02.md),
[отчёт BE](reviews/G5A_BE_EDITORIAL_AUDIT_2026-10-02.md).

2026-10-01 — редакционный пакет русского текста G5a слит в PR #322
(`92fc258`). Исправлено 45 строк VN/UI, уточнены термины и справка Match-3,
обновлены review-пакеты. Quality, Chromium full E2E и Mobile WebKit critical E2E
прошли. На 2026-10-01 оставалась проверка переноса/переполнения на мобильном экране.

2026-10-01 — все 33 позиции rework из арт-ревью (включая 13 blocker) исправлены
или согласованы пользователем и опубликованы в PR #314–320; все PR слиты,
Quality/Chromium/Mobile WebKit gates прошли. Подзадачи remediation приняты.
Подзадача `G4a-MAYU` принята по слитому PR #314. Пользователь завершил интегрированную проверку линейки, сцен и игры на телефоне 2026-10-01; G4a и KI-005 закрыты. Исторический экспорт 150 изображений не изменён.
[Отчёт G4a](reviews/G4A_ART_REVIEW_2026-09-30.md); [сводка бонусов](reviews/BONUS_READABILITY_2026-10-01.md).

G3-GUEST-UI-001 — ACCEPTED, 2026-09-30, PR #308: гостевые изображения используют общий
VN-портрет без рамки и карточки свидетеля. Пользователь подтвердил результат после merge.
Следующий этап — финальный asset/runtime audit и ручные release checks; гостевая подача закрыта.

G4a — **ACCEPTED**, 2026-10-01:
исторически просмотрены 150 изображений (117 approved, 33 rework, включая 13 blocker).
Все 33 позиции закрыты слитыми PR #314–320; пользователь подтвердил сводную проверку
линейки, сцен и игры на телефоне. G4a и `KI-005` закрыты. Экспорт и его
исходные оценки неизменны: [`отчёт G4a`](reviews/G4A_ART_REVIEW_2026-09-30.md).

Status: **G0 device accepted / G3 guest presentation accepted / release validation in progress**. G0 closed by explicit user acceptance on 2026-09-30 after merged PR #311 (G0-PWA-002 R4). KI-001/KI-003/KI-004 closed; final offline/update/save/device regression remains in G5c, with KI-002 open.

This roadmap is intentionally a strategic status map, not a transcript of every historical sub-feature. Detailed implementation history lives in feature docs and Git. The actionable remaining-work authority is [`RELEASE_BACKLOG_RU.md`](RELEASE_BACKLOG_RU.md); the approved full-game scope/reuse ceilings remain [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md); machine-readable art inventory remains `src/content/art/ANM030A.asset-gap-audit.json`. Production budgets are ceilings, not an obligation to spend every planned asset slot.

`APP_VERSION` in `src/appVersion.ts` is the canonical player-facing product semver dev-line. npm `package.json.version` remains internal package metadata. `BUILD_LABEL` is separate feature/baseline identity; the current candidate is **ANM-030B1C2 iOS PWA Interaction**. `BUILD_ID` identifies a concrete CI build.

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
- viewport/safe-area ownership, shared evidence, uncapped `440px` large-iPhone presentation and
  Playwright Browser Gate; G0-PWA-001 and G0-PWA-002 are device accepted (G0 closed);
- RU, BE and EN production runtime;
- nine-character full-stage production closure with exact 63 runtime assets and Mobile WebKit visual protection;
- production player surface closure: internal QA tools hidden from normal player URL and retained through explicit `?qa=1` access.

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
- **ANM-025G1 Lean Blocker Archetypes**: human-playtest follow-up reduces 18 narrative blocker IDs to three reusable presentation styles and one stable HUD term without rebalance; contract and mobile gate are in [`ANM025G1_LEAN_BLOCKER_ARCHETYPES_RU.md`](features/ANM025G1_LEAN_BLOCKER_ARCHETYPES_RU.md).
- **ANM-025G2 Auto-Hint Pacing**: playtest follow-up raises the inactivity hint delay from 5 to 30 seconds so normal reading/thinking time is not treated as a request for help; manual Hint, objective scoring, balance and telemetry schema stay unchanged. Contract and mobile gate are in [`ANM025G2_AUTO_HINT_PACING_RU.md`](features/ANM025G2_AUTO_HINT_PACING_RU.md).
- **ANM-025G3A Telemetry v2 Event Identity**: lossless v1 → v2 local migration plus attempt/hint/move IDs, stable board revisions, suggested/actual cell coordinates, exact hint-follow linkage and per-objective deltas. Gameplay, hint ranking, UI and report summary stay unchanged. Contract is in [`ANM025G3A_TELEMETRY_V2_EVENT_IDENTITY_RU.md`](features/ANM025G3A_TELEMETRY_V2_EVENT_IDENTITY_RU.md).
- **ANM-025G3B Spatially Neutral Hint Ranking**: equal-score objective-aware hints now use a stable board-derived tie-break instead of earliest cell index, removing the systematic top-board bias without changing hint strength, RNG, pacing, gameplay or telemetry schema. Contract is in [`ANM025G3B_SPATIALLY_NEUTRAL_HINT_RANKING_RU.md`](features/ANM025G3B_SPATIALLY_NEUTRAL_HINT_RANKING_RU.md).
- **ANM-025G3C Reason-Specific Invalid-Move Feedback**: blocked cells, story objects, non-adjacent selections and no-match swaps now surface their actual failure reason instead of collapsing to a generic unavailable-swap banner; legality, move cost, balance and telemetry stay unchanged. Contract is in [`ANM025G3C_INVALID_MOVE_FEEDBACK_RU.md`](features/ANM025G3C_INVALID_MOVE_FEEDBACK_RU.md).
- **ANM-025G3D Explained Reshuffle UX**: automatic dead-board reshuffles now explain both cause and outcome (`NO MOVES · BOARD SHUFFLED`), keep the explanation visible through a deliberate feedback hold, preserve it over redundant cascade summaries and retain a short readable hold under reduced motion. Engine legality, shuffle algorithm/RNG, move cost, balance and telemetry stay unchanged. Contract is in [`ANM025G3D_EXPLAINED_RESHUFFLE_UX_RU.md`](features/ANM025G3D_EXPLAINED_RESHUFFLE_UX_RU.md).
- **ANM-025C1 Responsive Objectives HUD**: все 1–3 цели production Match-3 теперь одновременно помещаются в телефонный HUD без горизонтального скролла; длинные подписи используют полную ширину карточки и переносятся, а служебный stage-блок компактнее на узких viewport без потери moves/stage ID. Objective content, balance и engine не меняются. Контракт и mobile gate — в [`ANM025C1_RESPONSIVE_OBJECTIVES_HUD_RU.md`](features/ANM025C1_RESPONSIVE_OBJECTIVES_HUD_RU.md).
- **ANM-026 Level Lab & Match-3 Campaign — COMPLETE**.
- **ANM-027 Story Content Architecture & Import — COMPLETE**.
- **027G Episode Batch Production & Canonical Import — COMPLETE**: authored/runtime-integrated `0–21` content and three endings.
- **ANM-028 Character Production Pipeline 2.0 — PRODUCTION FOUNDATION COMPLETE**.
- **028A Character Production Manifest & Validator Foundation — COMPLETE**.
- **ANM-028B2 R1.1 Authored VN Shot Adoption — COMPLETE**.
- **028D Character Production / Normalization — HISTORICAL / SUPERSEDED** by the current production rigs.
- **029A Localization Production Foundation — R1.1 COMPLETE**.
- **029B Belarusian Production — COMPLETE (B4 R1.1, PR #135)** with **exact 3855/3855 base-key parity** after ANM-025G1 removed 15 retired Level Lab blocker aliases; runtime production locales remain `supportedLocales = ['ru', 'be', 'en']`.
- **ANM-030A Full Game Asset Gap Audit**: **ANM-030A R1.1 [P0] — COMPLETE / PR #145**.
- **ANM-030A2 [P0] — COMPLETE / PR #147** — audit tooling and repository/report hygiene.
- **ANM-030B0A1 R1.1 [P1] — COMPLETE / PR #148** — planning-only shared Match-3 special visual contract.
- **ANM-030B0A2 R2 [P1] — COMPLETE** — five approved `256×256` RGBA specials replace the full base-tile artwork, retain a compact type marker, appear in localized Help, and are created by qualifying refill/cascade matches; unexplained story-object numeric tags are removed and invalid feedback remains readable for `1600 ms`.
- **ANM-030B0B–B0F full-stage character closure** is complete.
- **ANM-030B0B–B0F [P1] — COMPLETE / PRs #186–#190**: nine approved rigs, exact 63-file adoption, candidate cleanup, WebKit lineup gate and retired compatibility seam removal.
- **ANM-030B0G [P1] — DOCUMENTATION CLOSEOUT**: active architecture/testing/docs aligned with the finished 9/9 state.
- **ANM-030B0I [R0] — PRODUCTION PLAYER SURFACE COMPLETE / PR #193**: normal player menu no longer exposes Scene Navigation, Level Lab, Scene Studio or Save Diagnostics; explicit `?qa=1` retains production-parity QA access.
- **ANM-030B1B1 [R0] — STUDENT COUNCIL AUDITORIUM BACKGROUND COMPLETE**: the approved `1080×1920` production WebP replaces the visibly wrong clubroom alias in Story slot 4; background status is now `6/24` dedicated production variants and `18` runtime aliases.
- **ANM-030B1B2 [R0] — ASTERION SMART-TEXTILE LAB BACKGROUND COMPLETE**: the approved `1080×1920` golden master replaces the unrelated apartment fallback in Story slot 7; background status is now `7/24` dedicated production variants and `17` runtime aliases.
- **ANM-030B1B3 [R0] — LOST-FOUND WAREHOUSE BACKGROUND COMPLETE**: the approved `1080×1920` golden master replaces the unrelated athletics-locker fallback in Story slot 8; background status is now `8/24` dedicated production variants and `16` runtime aliases.
- **ANM-030B1B4 [R0] — CAMPUS SERVICE YARD BACKGROUND COMPLETE**: the approved `1080×1920` golden master replaces the unrelated clubroom fallback in Story slot 11; background status is now `9/24` dedicated production variants and `15` runtime aliases.
- **ANM-030B1B5 [R0] — ABANDONED LAUNDRY BACKGROUND COMPLETE**: the approved `1080×1920` golden master replaces the unrelated pool-locker fallback in Story slot 15; all eight background families now have production masters, with `10/24` dedicated variants and `14` runtime aliases.
- **ANM-030B1B6 [R0] — HIGH-USAGE BACKGROUND TRIO COMPLETE**: dedicated textile-workshop, multipurpose combat-club-hall and old-archive WebPs replace unrelated aliases across eleven common-route scene appearances; background status is now `13/24` dedicated variants and `11` runtime aliases.
- **ANM-030B1B7 [R0] — BASKETBALL LOCKER COMPLETE / PRs #201–#202**: binary-safe `1080×1920` production WebP replaces the athletics-locker alias in both E5 scenes and passes iPhone visual QA; background status is now **`14/24` dedicated variants and `10` runtime aliases**.

## What is actually left for release

The detailed classification, current background ranking and acceptance outcomes are in [`RELEASE_BACKLOG_RU.md`](RELEASE_BACKLOG_RU.md). The important rule remains that **not every remaining art budget or idea is a release requirement**.

### R0 — release blockers

1. **Production player surface — COMPLETE.** Reopen only on regression.
2. **Background semantic closure — G4 ACCEPTED.** `23/23` runtime semantic variants now have dedicated production art and `0` aliases remain. The approved ChatGPT Image batch is integrated; ComfyUI remains an optional reproducible experiment. `server-room` is removed from the current scope and represented only by the service-tunnel scene context.
3. **Guest/witness closure — ACCEPTED / PR #308.** Six guests use 24 production PNG and the shared VN portrait presentation; user acceptance recorded on 2026-09-30. Reopen only on a demonstrated regression; all-six/locale/viewport checks remain part of the final release pass.
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
- Match-3 special/bonus production art — **COMPLETE through ANM-030B0A2**; reopen only for evidence-driven activation/combo VFX polish;
- bounded audio quality replacement only if the existing procedural menu/VN/match/ending themes fail the final product listen-through.

Historical traceability: **ANM-030B0A2 [P1] — COMPLETE** closes the old five-special integration label without promoting optional activation/combo VFX to a release blocker.

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

1. **G4a — ACCEPTED:** все 33 rework-позиции, включая 13 blocker, исправлены и слиты в PR #314–320; пользователь подтвердил интегрированную проверку в игре и на телефоне. [Отчёт](reviews/G4A_ART_REVIEW_2026-09-30.md). Исходные 117 approved не менять без нового дефекта.
2. **G5a — ACCEPTED:** RU слит в PR #322, EN — #325, BE — #326; локализационные аудиты и браузерные/mobile gates пройдены, пользователь подтвердил проверку на телефоне.
3. **G5b — ACTIVE:** source/design audit всех 22 уровней, exploratory desktop pass `M3_00–M3_07`, перенос 9×7 и исправления variety/art/topology слиты в PR #337/#338; Quality, Chromium и Mobile WebKit gates прошли. Подготовлен следующий палитровый проход: минимум 3 типа белья и максимум 2 холодных match-типа на уровень; 4,400-seed auto-audit обновлён. [Отчёт G5b](reviews/G5B_MATCH3_DESIGN_BALANCE_AUDIT_2026-10-02.md). Следом — human retest палитр, полный phone pass и E6B subjective sessions.
4. **G5 — full playthrough и asset crawl:** Story `0–21`, три финала, progression и загруженная графика.
5. **G5c / ANM-033 — финальная release regression:** PWA/update/offline/save, iOS + Android, RU/BE/EN, accessibility/performance, public-release packaging/rights. KI-002 остаётся открытым здесь. Принятые G0 contracts повторно проверить на финальном payload, не открывая новый PWA refactor без дефекта.
6. **G6 — RC:** исправить только найденные release defects, затем packaging/deploy/rollback.
7. Hero inserts, landscape, extra locales, safe motion, song pipeline и DLC остаются после base release.

G0 и G3 закрыты явной пользовательской приёмкой 2026-09-30; G2a также закрыт. Они не являются следующими задачами.

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
