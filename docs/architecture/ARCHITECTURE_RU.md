# UPDS — текущая архитектура

Status: active architecture through completed ANM-027G `0–21` canonical story, merged ANM-029A/B1/B2A/B2B1/B2B2/B2B3/B2C/B3A–B3P and ANM-029B4 R1.1 Belarusian production, plus merged ANM-023E tooling hardening. ANM-029H R1 is a planning-only reset: current runtime architecture is unchanged, additional locales are paused, and ANM-023F becomes the next technical simplification track before high-volume ANM-030 integration.

## Runtime flow

`authored content + manifests + localization → domain/data contracts → engine/application state → feature controllers → composition root → platform services`

Presentation may animate an engine result, but must not redefine Match-3 rules, story IDs,
character production metadata or persistence semantics.

## Planned simplification track — ANM-023F

ANM-029H does not change ownership boundaries. It records the next bounded maintenance sequence:

- F1 expands Biome/static-analysis and repository hygiene without blanket rule enablement;
- F2 reduces duplicated/brittle test code while preserving behavioral contracts;
- F3 decomposes measured controller/engine hotspots only where a cut reduces coupling and reading scope;
- F4 measures bundle/startup/preload/memory/locale payload before any optimization such as lazy locale loading.

The desired direction remains `controller orchestrates → pure/domain modules calculate → renderer renders → store persists`. Existing public/runtime contracts remain stable unless a later atomic feature explicitly changes them.

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

Owns one active Match-3 presentation/session:

- intro/start and mode-specific completion callbacks;
- tap/drag/swipe/direct-special input;
- frames/motion playback, hints, tutorials and reactions;
- win/loss/evidence presentation;
- attempt telemetry.

Rules remain in `src/engine/Match3Game.ts`. Story, Match-3 Campaign and Level Lab enter the same
controller through explicit mode seams; the controller must not invent per-mode rules or import VN.

### `src/features/levelLab/LevelLabController.ts`

Owns the QA authoring surface for deterministic seeds, validated editable level config, board
shape/start layout preview, exact-seed play/retry and JSON export. Lab runs must produce no Story
save, campaign progression, clue or persistent tutorial side effects.

### `src/features/sceneStudio/SceneStudioController.ts`

Owns the read-only ANM-028B1 R4.1 composition/calibration and ANM-028D0/D1/D2/D3 candidate QA surface: art-source/preset/background/authored-line,
text-scale and ANM-024 viewport switching; the same shared VN frame as playable runtime; safe-area,
playable portrait crop/occlusion; measured duo/trio eye-line alignment to the rendered background
focal eye-line; distinct background-calibration, preset face-lane and selected-expression
alpha/eye guides;
canonical/approved-master/current-expression lineup; separated
automatic/warning/manual diagnostics; native evidence/guest shells; scene budget and structured QA
report. It consumes shared resolvers/contracts and does not write screenplay, save, calibration
approval, character manifests or production assets.

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

- `src/data/characterProduction.ts` — canonical `upds-character-production-v2` manifest, runtime production/planned status, separate visual-approval status, assets, expression set, proportions and per-expression alpha/eye guide geometry with validator;
- `src/data/characterCandidates.ts` — `upds-character-candidate-v1` provenance/manual-QA metadata; candidate metadata remains `runtimeEligible: false` even when an approved file is deliberately referenced by a separate transition override;
- `src/data/characterRuntimeOverrides.ts` — explicit `upds-character-runtime-override-v1` transition layer currently exposing approved Emi D0–D3 expression files without pretending the incomplete replacement family is a new seven-asset rig;
- `src/data/characterRigs.ts` — canonical runtime rigs/staging/placeholders plus expression lookup through the transition override;
- `src/data/sceneStaging.ts` — canonical `upds-scene-staging-v1` registry/validator for eight reusable scene compositions;
- `src/data/authoredVnShots.ts` — bounded `upds-authored-vn-shots-v1` stable-line background/preset/actor/expression/Pose B declarations;
- `src/data/guestWitnesses.ts` — separate `upds-guest-witness-production-v1` contract/validator for the six macro-locked episode guests; planned packages are asset-free and production packages contain neutral bust + two expression variants + neutral medallion;
- `src/ui/guestWitnessMarkup.ts` — shared `guest-testimony-card` renderer used by playable VN and Scene Studio without promoting guests to `CharacterKey`;
- `src/data/sceneStudioCalibration.ts` — read-only `upds-scene-studio-calibration-v1` viewport,
  background and measurable lineup QA contract plus `upds-scene-studio-qa-v1` report identity;
- `src/ui/sceneStaging.ts` — pure actor-assignment resolver that keeps canonical character scale separate from preset shot scale;
- `src/ui/vnAuthoredShots.ts` — resolves bounded authored shot declarations through that same preset resolver and renders their actor assets in playable VN;
- `src/ui/vnFrameMarkup.ts` — shared production VN DOM/chrome used by both playable VN and Scene Studio;
- `src/ui/vnPortraitGeometry.ts` — preserves the accepted playable-VN `178% / -78%` runtime-top
  camera and derives an eye-line-anchored variant for duo/trio staging;
- `docs/art/CHARACTER_USAGE_MANIFEST.json` — CI-checked documentation mirror;
- `src/platform/RuntimeAssets.ts` — preload/health catalog.

Runtime renders finished precomposed frames. Five expression frames, Pose B and medallion form the
seven-asset production set. Legacy `base-neutral`, `face-*`, blink and speaking files may remain as
unreferenced baggage, but they are not runtime architecture.

Relative visual height is encoded in the shared 1024×1536 master canvas and validated from alpha
bounds. Scene-specific CSS zoom must not become a parallel proportion system. ANM-028B1 R4.1 Scene
Studio uses the same `.portrait` primitive and dialogue occlusion as playable VN. Solo presets
preserve runtime-top framing; every duo/trio actor uses the selected expression's eye landmark and
resolves vertical position against the actual focal-point element after viewport layout. Character
guides are derived from the selected Pose A PNG geometry, while actor safe boxes remain separately
labelled non-overlapping face-critical lanes. Shoulder/lower-body overlap is allowed. Neutral lineup
alone exposes the complete canvas and bottom-pivot/alpha drift.
Runtime integration does not imply whole-rig visual approval: Emi's strict seven-asset manifest remains
`visualApproval: rebuild-required`, but ANM-028D3A explicitly exposes approved D0 neutral, D1 smile,
D2 serious and D3 surprised through `upds-character-runtime-override-v1`. Their measured alpha/eye
geometry drives both playable rendering and Scene Studio runtime guides. Their candidate metadata
stays `runtimeEligible: false` and the files remain outside `RuntimeAssets` until the strict seven-asset
replacement is promoted atomically; legacy embarrassed/Pose B/medallion remain fallback. The override
is explicit and removable rather than a fake complete rig.
ANM-028B2 adds bounded authored multi-character rendering through `upds-authored-vn-shots-v1` and the
shared resolver; unlisted lines still use `resolveVnStaging()` and no line-ID condition is hidden in
`VnController`. ANM-028B3 adds a parallel episode-guest lookup before rendering: guest speaker tokens
resolve through `upds-guest-witness-production-v1`, use only `guest-testimony-card`, and preload an
image only after the corresponding package is explicitly promoted from `planned` to `production`.

## Match-3 data and engine

### `src/engine/`

- `Match3Game.ts` — deterministic rules, legality, objectives, hints, specials and frames;
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

ANM-029B was produced in bounded review scopes through merged B3O. ANM-029B4 then closes the remaining B3P/slots-16–21 chain plus deferred VN/system/tooling/dossier/ending surfaces in one final readiness batch. `beCatalog` must exactly match the stable RU source catalog (3870 base keys), the separate Belarusian F2 reaction catalog must exactly match its 132-key RU source, and runtime `appCatalogs.be` must have no missing-key fallback path before activation.

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

Keep `planned` until a standalone neutral master passes lineup/proportion QA and the complete
seven-asset set exists. Promote through `characterProduction.ts`; do not add fake paths or a second
rig registry.

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
- Biome is pinned exactly and runs before Vitest/build in `npm run check`; the initial ruleset is intentionally conservative and can be widened only after the repository is green.
