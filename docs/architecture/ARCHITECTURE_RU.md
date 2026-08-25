# UPDS — текущая архитектура

Status: active architecture through completed ANM-027G `0–21` canonical story, ANM-029B4 R1.1 Belarusian production, completed ANM-023F simplification/performance, completed ANM-023G browser automation and merged ANM-030B0F character runtime compatibility cleanup. ANM-030A remains the derived asset-gap audit; full-stage cast is closed at 9/9 production-ready.

## Runtime flow

`authored content + manifests + localization → domain/data contracts → engine/application state → feature controllers → composition root → platform services`

Presentation may animate an engine result, but must not redefine Match-3 rules, story IDs,
character production metadata or persistence semantics.

## Planned simplification track — ANM-023F

ANM-029H does not change ownership boundaries. It records the bounded maintenance sequence now completed:

- F1 merged via PR #137: Biome lint unified across source/tests/config and generated repository debris removed/guarded;
- F2 merged via PR #138: completed localization lifecycle-batch tests consolidated into domain suites and the clean Biome cohort made blocking;
- F3 complete through PR #141: deterministic Match-3 presentation, deterministic VN presentation and stateless Match-3 rules extracted from mutable lifecycle;
- F4 complete through PR #144: RU remains eager fallback while BE/EN base catalogs load on demand, and complete PWA offline caching is separated from contextual bounded browser-image warming.

The desired direction remains `controller orchestrates → pure/domain modules calculate → renderer renders → store persists`. Existing public/runtime contracts remain stable unless a later atomic feature explicitly changes them.

## Localization startup / payload ownership

`src/localization/catalogs/index.ts` owns the runtime loading seam. Russian is the synchronously available source/fallback catalog; production-complete Belarusian and English base catalogs are dynamic imports. `LocalizationService` caches loaded catalogs and deduplicates concurrent locale loads. `RuntimeServices.ready` resolves the persisted locale before `src/main.ts` mounts the UI, preventing a wrong-language startup flash while keeping non-active locale payload out of the initial dependency graph. Match-3 reaction catalogs remain eager after F4A; the measured locale split already reduced the initial entry to the accepted F4 baseline, so further code splitting is not assumed necessary without another measured bottleneck.

## Runtime asset warming / offline cache ownership

`src/platform/RuntimeAssets.ts` owns the complete runtime distribution catalog used by the PWA offline cache. `src/main.ts` passes that catalog to `PwaController.start()` but does not create browser `Image()` warmers for the whole set. Browser-image warming belongs to feature transitions: VN warms the current/next line presentation assets and Match-3 warms the active level presentation family. `AssetPreloader` deduplicates already-requested URLs and caps active image warmers at `IMAGE_PRELOAD_CONCURRENCY = 4`; `AssetHealth` exposes current/peak activity for diagnostics. The service worker preserves the complete `CACHE_URLS` contract while limiting background fetch/cache work with `CACHE_WARM_CONCURRENCY = 4`.

## Application composition

### `src/ui/AnimeDetectiveApp.ts`

The small composition root owns only:

- runtime-service, session and shell construction;
- feature-controller construction;
- `AppNavigation` and narrow callback wiring;
- global PWA update presentation;
- global return-to-menu lifecycle.

It constructs VN, Match-3, Level Lab, Scene Studio, player-facing Match-3 Campaign, menu, settings,
diagnostics, dossier and ending controllers. It must not accumulate feature rendering, game rules, story content,
level definitions or feature-owned state. Repository tests keep it at no more than 200 lines and
prevent controller construction elsewhere.

### `src/app/`

- `AppSession.ts` — Story campaign state and the persistence seam used by Story features;
- `Match3CampaignSession.ts` — separate player-facing Match-3 progression/attempt session;
- `AppShell.ts` — one-screen DOM shell and disposable UI timers;
- `AppNavigation.ts` — navigation surface shared by controllers.

Controllers do not import or instantiate sibling feature controllers. Cross-feature transitions go
through `AppNavigation` or a narrow callback supplied by the composition root. The awarded-clue
handoff remains one intentional callback; a second independent transient payload would trigger a
dedicated application flow contract rather than callback accumulation.

## Feature ownership

### `src/features/vn/VnController.ts`

Owns VN UI/session orchestration:

- graph-addressed scene opening through compatibility adapters;
- authored-line progression and internal presentation pages;
- AUTO/SKIP/read/history/config behavior;
- measurement/reflow and character staging;
- choice and awarded-clue presentation.

It consumes narrative/character data and must not import or instantiate Match-3 feature code.
The production four-row DOM frame is composed by the pure `src/ui/vnFrameMarkup.ts`; VN controller
still owns all behavior, measurement, session and navigation bindings.

### `src/features/match3/Match3Controller.ts`

Owns one active Match-3 runtime/session orchestration:

- intro/start and mode-specific completion callbacks;
- tap/drag/swipe/direct-special input;
- frames/motion playback, hints, tutorials and reactions;
- win/loss/evidence presentation;
- attempt telemetry.

Deterministic intro/board/objective/tutorial/main-screen HTML is composed by pure `src/features/match3/Match3Presentation.ts`; it receives an explicit view model/translator and owns no DOM mutation, timers, telemetry, session or navigation. Stateless match/special calculation lives in `src/engine/Match3Rules.ts`, while mutable board/objective/cascade lifecycle remains in `src/engine/Match3Game.ts`. Story, Match-3 Campaign and Level Lab enter the same controller through explicit mode seams; the controller must not invent per-mode rules or import VN.

### `src/features/levelLab/LevelLabController.ts`

Owns the QA authoring surface for deterministic seeds, validated editable level config, board
shape/start layout preview, exact-seed play/retry and JSON export. Lab runs must produce no Story
save, campaign progression, clue or persistent tutorial side effects.

### `src/features/sceneStudio/SceneStudioController.ts`

Owns the read-only/editable QA composition surface around current production data: art-source/preset/background/authored-line,
text-scale and ANM-024 viewport switching; the same shared VN frame as playable runtime; safe-area,
playable portrait crop/occlusion; measured duo/trio eye-line alignment to the rendered background
focal eye-line; distinct background-calibration, preset face-lane and selected-expression alpha/eye guides;
canonical/current-expression full-cast lineup; browser-local character asset/calibration experiments;
separated automatic/warning/manual diagnostics; native evidence/guest shells; scene budget and structured QA report.
It consumes shared resolvers/contracts and does not write screenplay, save, calibration approval,
character manifests or production assets. Historical ANM-028D0–D3 candidate provenance is no longer
an active Scene Studio/runtime data source.

### `src/features/match3Campaign/Match3CampaignController.ts`

Owns the direct player-facing Match-3 hub: sequential unlocks, replay/best result and campaign
attempt flow. Its persistence is isolated in `Match3CampaignStore`/`Match3CampaignSession`.

### Small controllers

- `menu/MainMenuController.ts` — app entry and mode selection;
- `settings/SettingsController.ts` — system settings;
- `diagnostics/DiagnosticsController.ts` — save/telemetry/PWA diagnostics and QA navigation;
- `dossier/DossierController.ts` — clue/suspect dossier;
- `ending/EndingController.ts` — current story ending.

## Story content architecture

### Authored source and import

Current canonical repository flow:

`multiple screenplay Markdown sources + one upds-story-content-v1 manifest each + storyGraph → auditStoryContent per source → combined canonicalStoryLines → narrative facade → VN`

- `src/content/ANM-003_Vertical_Slice_Screenplay.md` + `src/content/story/ANM003.vertical-slice.story.json` — slots `0–3` and bridge `VN0250`;
- `src/content/ANM-027G_Episodes_04_06_Screenplay.md` + `src/content/story/ANM027G.episodes-04-06.story.json` — slots `4–6`, `VN0251–VN0369`;
- `src/content/ANM-027G_Episodes_07_09_Screenplay.md` + `src/content/story/ANM027G.episodes-07-09.story.json` — slots `7–9`, `VN0370–VN0488`;
- `src/content/ANM-027G_Episodes_10_12_Screenplay.md` + `src/content/story/ANM027G.episodes-10-12.story.json` — slots `10–12`, `VN0489–VN0607`;
- `src/content/ANM-027G_Episodes_13_15_Screenplay.md` + `src/content/story/ANM027G.episodes-13-15.story.json` — slots `13–15`, `VN0608–VN0726`;
- `src/content/ANM-027G_Episodes_16_18_Screenplay.md` + `src/content/story/ANM027G.episodes-16-18.story.json` — slots `16–18`, `VN0727–VN0845`;
- `src/content/ANM-027G_Episodes_19_21_Screenplay.md` + `src/content/story/ANM027G.episodes-19-21.story.json` — three ending slots `19–21`, `VN0846–VN0964`;
- `src/content/storyContentFormat.ts` — pure parser/auditor with optional manifest-owned scene scope for incremental sources;
- `src/content/storyRuntime.ts` — fail-closed multi-source canonical import;
- `src/data/storyGraph.ts` — stable episode/chapter/scene IDs and explicit scene/Match-3/ending transitions;
- `src/data/storyChoices.ts` — additive stable choice gates for post-slice batches, including `final-strategy`;
- `src/data/storyOutcome.ts` — pure Ending A eligibility metrics derived from persisted evidence/visible choices without a save-schema bump;
- `src/data/narrative.ts` — presentation facade: scene lines, legacy CHOICE_00, metadata/background/history.

`narrative.ts` owns no second screenplay parser or parallel scene-range tables. Story graph routing does not derive transitions from numeric-scene arithmetic. The legacy numeric save field remains isolated behind graph adapters; additive ANM-027G choice selections live in `CampaignSave.storyChoices` without changing save schema/key.

The current graph covers the complete authored `0–21` scope: 45 VN scenes and 22 story Match-3 routes. Scene 38 branches by persisted `final-strategy` into three mutually exclusive ending routes; Ending A additionally resolves the locked `7/2/2` evidence/team/source requirement with an explicit Ending B fallback.

## Character production architecture

- `src/data/characterProduction.ts` — canonical `upds-character-production-v2` manifest for the nine current full-stage production characters, separate visual-approval status, assets, expression set, proportions and per-expression alpha/eye guide geometry with validator;
- `src/data/characterRuntimeOverrides.ts` — browser-local Composition asset/calibration experiment layer only; no built-in/static transition override remains;
- `src/data/characterRigs.ts` — canonical runtime rigs/staging plus expression lookup through optional browser-local overrides;
- `src/data/sceneStaging.ts` — canonical `upds-scene-staging-v1` registry/validator for eight reusable scene compositions;
- `src/data/authoredVnShots.ts` — bounded `upds-authored-vn-shots-v1` stable-line background/preset/actor/expression/Pose B declarations;
- `src/data/guestWitnesses.ts` — separate `upds-guest-witness-production-v1` contract/validator for the six macro-locked episode guests; planned packages are asset-free and production packages contain neutral bust + two expression variants + neutral medallion;
- `src/ui/guestWitnessMarkup.ts` — shared `guest-testimony-card` renderer used by playable VN and Scene Studio without promoting guests to `CharacterKey`;
- `src/data/sceneStudioCalibration.ts` — read-only `upds-scene-studio-calibration-v1` viewport,
  background and measurable lineup QA contract plus `upds-scene-studio-qa-v1` report identity;
- `src/ui/sceneStaging.ts` — pure actor-assignment resolver that keeps canonical character scale separate from preset shot scale;
- `src/ui/vnAuthoredShots.ts` — resolves bounded authored shot declarations through that same preset resolver and renders their actor assets in playable VN;
- `src/ui/vnFrameMarkup.ts` — shared production VN DOM/chrome used by both playable VN and Scene Studio;
- `src/ui/vnPortraitGeometry.ts` — preserves the accepted playable-VN `178% / -78%` runtime-top camera and derives an eye-line-anchored variant for duo/trio staging;
- `docs/art/CHARACTER_USAGE_MANIFEST.json` — CI-checked documentation mirror;
- `src/platform/RuntimeAssets.ts` — preload/health catalog.

Runtime renders finished precomposed frames. Five expression frames, Pose B and medallion form the seven-asset production set. Legacy `base-neutral`, `face-*`, blink and speaking files may remain as unreferenced baggage, but they are not runtime architecture.

Relative visual height is encoded in the shared 1024×1536 master canvas and validated from alpha
bounds. Scene-specific CSS zoom must not become a parallel proportion system. ANM-028B1 R4.1 Scene
Studio uses the same `.portrait` primitive and dialogue occlusion as playable VN. Solo presets
preserve runtime-top framing; every duo/trio actor uses the selected expression's eye landmark and
resolves vertical position against the actual focal-point element after viewport layout. Character
guides are derived from the selected Pose A PNG geometry, while actor safe boxes remain separately
labelled non-overlapping face-critical lanes. Shoulder/lower-body overlap is allowed. Neutral lineup
alone exposes the complete canvas and bottom-pivot/alpha drift.

All nine current full-stage rigs are `visualApproval: approved`, provide 63/63 canonical runtime assets and drive playable rendering plus Scene Studio guides directly from canonical frame geometry. Historical ANM-028D0–D3 Emi candidate metadata/files remain provenance in feature docs, prompts and Git history only; `src/data/characterCandidates.ts`, the full-stage placeholder API and built-in/static transition override are retired and must not participate in runtime resolution. Browser-local overrides remain explicit and removable experiments rather than fake rig promotion. Mobile WebKit automatically validates the nine-character production lineup.

ANM-028B2 adds bounded authored multi-character rendering through `upds-authored-vn-shots-v1` and the
shared resolver; unlisted lines still use `resolveVnStaging()` and no line-ID condition is hidden in
`VnController`. ANM-028B3 adds a parallel episode-guest lookup before rendering: guest speaker tokens
resolve through `upds-guest-witness-production-v1`, use only `guest-testimony-card`, and preload an
image only after the corresponding package is explicitly promoted from `planned` to `production`.

## Production asset audit ownership

`src/content/art/ANM030A.asset-gap-audit.json` is a **derived planning source**, not a new runtime resolver. It cross-references the canonical story macro, character/guest manifests, `backgroundAssets`, Match-3 level/presentation data and staging manifests to classify current visual coverage as production, fallback, missing/reusable or external-art-blocked.

Authority remains one-way:

`story/content + runtime manifests/resolvers → ANM-030A audit → ANM-030B production backlog`

ANM-030B integration updates the authoritative manifest/resolver first and then refreshes the audit. Runtime code must never import the audit JSON to decide which image to show. This prevents a planning snapshot from becoming a second asset-routing system. Current audit reports the full-stage cast as 9/9 production-ready with zero outstanding full-stage assets; remaining gaps belong to guests, backgrounds, hero clues and the shared Match-3 special-art pack.

## Match-3 data and engine

### `src/engine/`

- `Match3Rules.ts` — stateless board geometry, match groups, special creation/feedback and special-combo target expansion;
- `Match3Game.ts` — seeded mutable board lifecycle, legality orchestration, objectives, hints, cascades/settle/refill and frames;
- `CampaignStore.ts` — Story save compatibility/import/export/recovery;
- `Match3CampaignStore.ts` — separate direct Match-3 campaign progression.

Engine code remains DOM-independent.

### `src/data/`

- `levels.ts` — production level configs and presentation metadata;
- `match3Context.ts` — story/presentation context;
- `match3TilePresentation.ts` — gameplay identity versus visual tile variants;
- `match3Tutorials.ts` — data-driven persistent tutorial rules;
- `match3Reactions.ts` — semantic reaction resolver/content ownership.

Level Lab exports validated data matching the same level contract. New levels should enter through
data/validation, not controller arrays or hardcoded level-index branches.

## Localization

`src/localization/` owns locale resolution, stable message catalogs, formatting and persistence.
`RuntimeServices` constructs one shared `LocalizationService`; controllers consume it.

`LocalizationProduction.ts` owns the seven-locale production registry and the strict separation
between translation targets and runtime-selectable locales. `CatalogAudit.ts` owns structural
completeness/placeholder checks; `LocalizationGlossary.ts` owns stable translator terminology.
A locale remains `translation-pending` and absent from the selector until its full production catalog
passes the readiness contract.

ANM-029B was produced in bounded review scopes through merged B3P. ANM-029B4 then closes slots 16–21 plus the deferred VN/system/tooling/dossier/ending surfaces in one final readiness batch. `beCatalog` must exactly match the stable RU source catalog (3855 base keys after ANM-025G1 removed 15 retired Level Lab blocker aliases), the separate Belarusian F2 reaction catalog must exactly match its 132-key RU source, and runtime `appCatalogs.be` must have no missing-key fallback path before activation.

After B4 acceptance, RU, BE and EN cover the complete authored slots `0–21` and active Match-3 systems and are runtime-selectable. `zh-CN`, `ja`, `ko` and `pt-BR` stay translation-pending and product-paused until the post-Belarusian backlog/roadmap reset. VN IDs, level IDs, reaction IDs and telemetry remain locale-independent.
Internal dialogue paging runs after localized text resolution and never creates authored IDs; its CJK
segmentation classification consumes the shared production-locale metadata rather than a UI-local regex.

## Shared UI, viewport and platform

### `src/ui/`

Contains stateless/shared presentation helpers for view markup, system controls, VN paging,
measurement/playback/staging and Match-3 interaction/motion/reaction timing. Shared helpers must not
become a generic mutable app context.

### Viewport

- `src/platform/ViewportContract.ts` — viewport/safe-area contract;
- `src/viewport.css` — shared viewport shell and safe-area ownership;
- feature CSS consumes shared coordinates rather than re-owning device insets.

Portrait is primary; low-height landscape remains non-broken. Full landscape staging/layout is a
later feature and must extend this shared coordinate model.

### `src/platform/`

Browser/platform concerns only: safe storage, diagnostics, runtime asset health/preload, downloads,
telemetry, PWA/offline/update, build identity and viewport capabilities. APIs must degrade safely in
headless tests.

## Extension rules

### New story/content

Create stable IDs, authored source, completeness manifest and graph transitions first. Then add
levels/reactions/assets through their existing data contracts. Do not encode a scene sequence in a
controller.

### New characters

Pre-production character work remains outside the runtime manifest. A new full-stage character enters `characterProduction.ts` only when a complete seven-asset package exists, standalone transparency/canvas/pivot and lineup/proportion QA pass, and the asset set is ready to become production immediately. Do not recreate a planned/placeholder runtime lane, fake asset paths, `characterCandidates.ts` or a second rig registry merely to track work in progress.

### Save migrations

Controllers continue to use sessions/stores. Schema migration belongs in persistence, with explicit
backward-compatibility tests.

### New platforms

PWA/browser concerns stay in platform services so a future native wrapper does not require rewriting
VN, Match-3 or content contracts.

## Documentation rule

`docs/ROADMAP_RU.md` owns feature status; `package.json` owns stable product package name + semver, `src/appVersion.ts` imports that semver as `APP_VERSION` and owns `BUILD_LABEL`/build identity; machine
manifests own production data; architecture/process documents explain current behavior. Feature
notes and archived reports never override those sources.

## Test/tooling identity hardening

- lifecycle states such as `IN QA` are roadmap data, not durable assertions for already merged features; tests lock stable feature/document identities and the current `BUILD_LABEL` linkage instead;
- `package.json.name = class-u-detectives` and `package.json.version` are stable product metadata; `APP_VERSION` is imported from that version instead of duplicated;
- `BUILD_LABEL` remains feature/baseline identity and must not be derived from product semver;
- Biome is pinned exactly and runs before Vitest/build in `npm run check`; F1/F2 use staged promotion: new high-signal rules are introduced against a green baseline and become blocking only after the merged repository shows no findings.
