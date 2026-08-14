# UPDS — текущая архитектура

Status: audited active architecture at accepted ANM-028B1 R4.1/ANM-028D0/D1 plus the ANM-028D2 R1 Studio-only candidate.

## Runtime flow

`authored content + manifests + localization → domain/data contracts → engine/application state → feature controllers → composition root → platform services`

Presentation may animate an engine result, but must not redefine Match-3 rules, story IDs,
character production metadata or persistence semantics.

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

Owns the read-only ANM-028B1 R4.1 composition/calibration and ANM-028D0/D1/D2 candidate QA surface: art-source/preset/background/authored-line,
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

`ANM-003 Markdown + ANM003.vertical-slice.story.json + storyGraph → auditStoryContent → canonicalStoryLines → narrative facade → VN`

- `src/content/ANM-003_Vertical_Slice_Screenplay.md` — current authored source;
- `src/content/story/ANM003.vertical-slice.story.json` — `upds-story-content-v1` completeness manifest;
- `src/content/storyContentFormat.ts` — pure parser/auditor;
- `src/content/storyRuntime.ts` — fail-closed canonical import;
- `src/data/storyGraph.ts` — stable episode/chapter/scene IDs and explicit scene/Match-3/ending transitions;
- `src/data/narrative.ts` — presentation facade: scene lines, choices, metadata/background/history.

`narrative.ts` no longer owns a second screenplay parser or parallel scene-range tables. Story graph
routing no longer derives transitions from numeric-scene arithmetic. The legacy numeric save field
is isolated behind graph adapters until an explicit save migration is approved.

The current graph covers only the authored vertical slice. Adding full story content primarily
extends authored sources, manifests and graph data; it must not add episode-specific controller
switch statements.

## Character production architecture

- `src/data/characterProduction.ts` — canonical `upds-character-production-v2` manifest, runtime production/planned status, separate visual-approval status, assets, expression set, proportions and per-expression alpha/eye guide geometry with validator;
- `src/data/characterCandidates.ts` — isolated `upds-character-candidate-v1` metadata for approved
  authoring masters and manual-QA expressions; candidates are explicitly non-runtime and may
  override only Studio asset/guide geometry;
- `src/data/characterRigs.ts` — runtime rigs, staging and placeholders derived from that manifest;
- `src/data/sceneStaging.ts` — canonical `upds-scene-staging-v1` registry/validator for eight reusable scene compositions;
- `src/data/sceneStudioCalibration.ts` — read-only `upds-scene-studio-calibration-v1` viewport,
  background and measurable lineup QA contract plus `upds-scene-studio-qa-v1` report identity;
- `src/ui/sceneStaging.ts` — pure actor-assignment resolver that keeps canonical character scale separate from preset shot scale;
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
Runtime integration does not imply visual approval: Emi remains playable as a temporary fallback
while `visualApproval: rebuild-required` prevents it from being treated as an approved style master.
ANM-028D0 neutral, ANM-028D1 smile and ANM-028D2 serious are selected through explicit Scene Studio
`artSource` values; their measured alpha/eye geometry replaces guides only in that read-only preview
and all are absent from runtime preload/rig data. D1/D2 inherit D0 canvas/alpha outside bounded ROIs.
Authored VN adoption and its multi-character rendering remain a bounded ANM-028B2 migration, not
hidden episode-specific conditions in `VnController`.

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

RU and EN cover the current authored vertical slice and active Match-3 systems. VN IDs, level IDs,
reaction IDs and telemetry remain locale-independent. Internal dialogue paging runs after localized
text resolution and never creates authored IDs.

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

`docs/ROADMAP_RU.md` owns feature status; `src/appVersion.ts` owns product/build identity; machine
manifests own production data; architecture/process documents explain current behavior. Feature
notes and archived reports never override those sources.
