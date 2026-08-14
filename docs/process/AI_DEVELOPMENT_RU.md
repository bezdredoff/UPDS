# UPDS — инструкция для AI/разработчика

Status: active workflow aligned with ANM-027E, accepted ANM-028B1 R4.1/ANM-028D0/D1/D2 and ANM-028D3 R1 candidate QA.

## Before editing

1. Resolve the exact current GitHub `main` SHA; do not trust an old ZIP/handoff.
2. Read:
   - `docs/architecture/PROJECT_CONTRACTS_RU.md`;
   - `docs/ROADMAP_RU.md`;
   - `docs/content/CONTENT_PRODUCTION_STRATEGY_RU.md` for story/art/content work;
   - `docs/architecture/ARCHITECTURE_RU.md`;
   - the narrow current contract/feature document for the task.
3. Identify the machine-readable source of truth before editing prose.
4. Treat `docs/archive/` and older feature notes as history, not current requirements.
5. Check for an open PR or concurrent candidate before publishing a branch.

If personal/chat context conflicts with GitHub `main`, GitHub wins until an explicit new product
decision is authored and merged.

## Authority map

### Status and build identity

- feature state and next sequence: `docs/ROADMAP_RU.md`;
- product/build identity: `src/appVersion.ts`;
- package metadata: `package.json.version` (not a feature-status source).

Do not copy a “current build” string into multiple READMEs.

### Narrative

1. Explicitly supplied/approved Story Bible and episode plan;
2. repository-authored screenplay sources;
3. `upds-story-content-v1` manifests and `upds-story-graph-v1`;
4. canonical runtime import/tests.

The only authored repository source at the current baseline is
`src/content/ANM-003_Vertical_Slice_Screenplay.md`. Do not invent the missing post-slice screenplay
inside a technical feature or claim it exists because an old handoff mentions a plan.

Full-game scope, asset-trigger budgets and authoring sequence:
`docs/content/CONTENT_PRODUCTION_STRATEGY_RU.md`. It preserves content slots `0–21`; a technical
optimization must not silently remove an episode, ending or canonical story beat.

External planning inputs currently identified for 027F are `ANM-001_Story_Bible.md` v0.2,
`ANM-002_22_Episode_Plot.md` v0.1 and the historical 115-slide `UPDS.pptx`. Use the deck only through
the source-reconciliation table in the strategy: preserve its level/beat DNA, never revive its
school-age setting, old culprits, non-consensual searches, stereotype-based jokes or sexualized
camera. ANM-027E replaces ANM-002 §8 art-volume estimates; it does not replace the modern plot.
The repository copies are `docs/content/ANM-001_Story_Bible.md` and
`docs/content/ANM-002_22_Episode_Plot.md`; read those copies for content work instead of relying on
chat memory or an unavailable external attachment.

### Character art

Technical/runtime authority:

1. `src/data/characterProduction.ts`;
2. `docs/art/CHARACTER_PRODUCTION_CONTRACT_RU.md`;
3. CI-checked documentation mirror and runtime catalog.

Visual identity authority:

1. approved model sheets/lineup;
2. approved Golden Samples and Art Bible;
3. existing masters whose explicit `visualApproval` is `approved`.

Runtime `production` status proves asset completeness/routing, not visual quality. Emi is currently
`rebuild-required`; do not use that runtime set as a style, scale, anatomy or full-body reference.
Use `anm028d0-r1` as Emi's approved authoring master until the complete replacement set is integrated.

Technical status/path metadata never overrides visual approval, and a visual reference never creates
a production asset path by itself.

## Work in the smallest feature boundary

`AnimeDetectiveApp.ts` is the composition root, not the default editing surface.

Typical ownership:

- VN progression/paging/staging → `src/features/vn/` plus VN helpers;
- story import/routing → `src/content/`, `src/data/storyGraph.ts`, `src/data/narrative.ts`;
- Match-3 presentation/session → `src/features/match3/` plus UI helpers;
- Match-3 rules → `src/engine/Match3Game.ts`;
- production levels → `src/data/levels.ts`;
- Level Lab → `src/features/levelLab/`;
- direct Match-3 campaign → `src/features/match3Campaign/`, session/store;
- character production metadata → `src/data/characterProduction.ts`;
- reusable scene composition → `src/data/sceneStaging.ts`, `src/ui/sceneStaging.ts` and
  `src/features/sceneStudio/`;
- Scene Studio calibration/reporting → `src/data/sceneStudioCalibration.ts`; shared playable/QA VN
  DOM frame → `src/ui/vnFrameMarkup.ts`;
- settings/diagnostics/dossier/ending → their dedicated feature controller;
- cross-feature composition/navigation only → `src/ui/AnimeDetectiveApp.ts`, `src/app/`.

Feature controllers must not import or construct sibling controllers. Add a narrow
navigation/callback seam through the composition root.

## Story/content production rules

- Stable content IDs are independent from localized display text.
- New authored content enters through screenplay → content manifest/audit → story graph → runtime.
- Do not add scene-range tables or a second screenplay parser to `narrative.ts`.
- Explicitly declare deferred source lines; unassigned content must fail closed.
- Match-3 story handoffs use stable level IDs and explicit graph transitions.
- Episode-specific behavior belongs in data/contracts, not controller `switch` statements.
- Dialogue internal pages are runtime presentation state and never authored/save IDs.
- Before detailed post-slice screenplay, lock a `0–21` macro table with case/emotional beat,
  location family, cast tier, evidence treatment, Match-3 archetype, transition and asset triggers.
- Add detailed content in reviewable packages of three sequential episodes before mass
  localization/art production; the first post-slice package is `4–6`.
- Apply the strategy asset-trigger budget while writing. Prefer recurring cast, guest testimony,
  native dossier/phone/document UI and existing location families over one-off production assets.
- A budget exception must state the dramatic purpose, why reuse is insufficient and every added
  art/localization/runtime obligation.

## Character production rules

- Generate/export one standalone character asset at a time; do not bake multiple actors into one
  runtime PNG.
- First approve a neutral 1024×1536 master in a shared-baseline lineup.
- Review that neutral master inside Scene Studio lineup and at least solo/two-shot presets with the
  real VN header/dialogue/controls on the ANM-024 viewport matrix. Do not proceed while automatic
  errors or unexplained measurable pivot/alpha warnings remain.
- Encode relative height in the master canvas; do not repair it with runtime CSS scale.
- Record neutral alpha bounds and `neutralEyeLineYPx`, then record exact alpha bounds/eye line in
  `frameGeometry[expression]` for every exported Pose A frame. Verify the selected-frame guide
  against the displayed PNG before using it in duo/trio focal alignment.
- A complete runtime set may remain available with `visualApproval: rebuild-required`, but it must
  not seed expressions, poses or new-character prompts until a replacement neutral is approved.
- Store a pre-approval neutral or expression under `characters/<key>/candidates/<slice>/` with
  explicit `runtimeEligible: false`; an approved authoring master also remains outside the rig until
  its complete required family passes QA. Never overwrite the rig or preload catalog just to obtain a preview.
- If Work produces a visually accepted RGB image but fails true alpha, regenerate one solid
  chroma-key source and perform only deterministic matte/de-spill/canvas normalization. Validate
  `1024×1536` RGBA, alpha bounds and edges on both light and dark backgrounds; record the final Work
  prompt and extraction provenance beside the candidate feature doc.
- Produce the four additional expression frames from the approved master while preserving body,
  camera, silhouette and alpha bounds.
- Use a small face ROI and edit one expression at a time. Offline masks/layers/compositing are
  allowed; verify unchanged pixels outside the permitted ROI and stable alpha height, then export a
  finished precomposed frame.
- Runtime receives finished precomposed frames only. Never restore runtime face overlays.
- The full-stage required set remains exactly five Pose A expressions + Pose B + medallion; do not
  expand the standard expression taxonomy.
- Only full-stage characters use `upds-character-production-v2`. The ANM-028B3 guest/witness package
  is a separate presentation/asset class; never satisfy the full-stage validator with fake guest
  paths or incomplete sets.
- Assign full-stage production only when the character appears in at least three episodes,
  participates in the resolution or carries a substantial emotional scene. Pose B is full-stage
  only; a special climax frame requires explicit budget approval.
- `blink`/`speaking` remain deferred until the ANM-028 safe-motion proof.
- Keep a character `planned` until the complete set and manual visual approval exist.
- All depicted/student characters in the production manifest are explicitly adult.

## Scene, background and evidence production rules

- After 028B1 R4.1 visual acceptance, build scenes only from the frozen `upds-scene-staging-v1` IDs in `src/data/sceneStaging.ts`:
  `solo-close`, `solo-medium`, `two-shot-conflict`, `two-shot-alliance`,
  `trio-central-speaker`, `trio-reaction`, `evidence-cutaway`, `guest-testimony-card`.
- Presets own shot, actor slots, active/listening/background roles, speaker focus, entry/exit and
  safe-area/non-overlap constraints. Runtime still composes standalone character assets; never bake
  a group into one PNG.
- Do not add episode-specific coordinates or silently treat the current single-active-speaker VN
  renderer as multi-character. Authored preset assignment/migration belongs to 028B2 and must use
  the shared resolver. Guest/witness content uses `upds-guest-witness-production-v1` plus the shared
  B3 `guest-testimony-card` renderer; planned guests remain asset-free until a complete external art
  package is explicitly promoted.
- Preview composition through the shared `vnFrameMarkup` contract. A separate fake Studio header,
  dialogue card or bottom-control layout is prohibited because it hides real occlusion/crop defects.
- Scene-mode actors must use the playable `.portrait` primitive and
  `src/ui/vnPortraitGeometry.ts`. Solo preserves the accepted runtime-top crop. Every duo/trio actor
  must use `background-focal-eye-line`, align the selected expression's declared eye landmark to the
  actual rendered focal eye-line and retain visible headroom; multi-actor shots must not shrink from
  a fixed canvas top. Lower canvas
  remains behind dialogue and actor `shotScale >= 0.68`. Never fit the whole `1024×1536` canvas into
  the stage or add a Studio-only full-body renderer. Full masters are shown only in lineup QA.
- Treat actor safe boxes as non-overlapping face/identity lanes. Do not shrink shoulders and bodies
  merely to keep their transparent PNG bounds separate; intentional body overlap is part of a VN
  two-shot/trio while the dialogue row supplies lower occlusion.
- Keep guide semantics explicit: background calibration is frame-space, `FACE SAFE LANE` is a
  preset composition tolerance, and `SELECTED FRAME ALPHA`/`EYES` come from the displayed Pose A
  PNG. Never position a character guide from an unrelated slot label, stale neutral frame or
  hardcoded decorative percentage.
- Use `upds-scene-studio-calibration-v1` for viewport/background guides. Estimated focal point,
  horizon, footline and actor zone require explicit manual approval; AI must not relabel estimates as
  accepted data.
- Separate checks: dimensions/alpha/pivot/containment/coordinates may be automated; style, anatomy,
  adult visual age, palette, light direction and background perspective remain manual Golden Sample
  gates. Never claim that an automatic validator approved visual style.
- `upds-scene-studio-qa-v1` is a read-only AI/art handoff. It may seed a correction brief but never
  writes screenplay, manifests, calibration approvals or production asset paths.
- Fix character/background source masters when calibration fails. Free-form drag/scale,
  per-character runtime compensation and episode-specific CSS are prohibited repair shortcuts.
- Target 8–10 master location families for the base game. Derive crop, dressing and lighting/grade
  variants offline and route them through shared data, not episode-specific controller mappings.
- Never bake localizable text into backgrounds or ordinary evidence art. Prefer native UI for
  documents, forms, tables, messages, serials and manifests.
- Reserve separate art for 5–7 hero clue close-ups across the base game, not one bespoke clue image
  per scene.

## Match-3 content production rules

- Reuse ANM-025/026 data contracts, Level Lab and the common tile catalog.
- Vary 5–6 shared board/layout archetypes through shape, start layout, weights, objectives,
  blockers, context and reactions instead of creating unique mechanics/art per episode.
- Add a new mechanic only when at least four levels reuse it and its tutorial, validation and Level
  Lab authoring path are included.

## Delivery lanes

The exact contract is in `GITHUB_PHONE_PIPELINE_RU.md`.

### Mobile ZIP path

- `PATCH.zip` / `upds-delta-v1`: preferred for code/docs/data deltas; exact current `baseSha`;
- `FULL_PROJECT.zip`: binary/art/recovery fallback;
- both go through `incoming → read-only validation → candidate PR → /preview/ → PR CI → manual merge`.

Use short filenames: `ANM-<feature>_R<revision>.zip` for delta and
`ANM-<feature>_R<revision>_FULL.zip` for a full-project fallback. Keep the verbose feature title in
the manifest, not in the filename; archive mode is content-detected.

Delta patches never auto-rebase. A stale `baseSha` must fail.

### Direct connector PR

May be used for a narrow docs/tests/non-visual technical change when the connector can create an
explicit branch and PR safely. It still requires GitHub Quality gate, changed-file review and manual
merge. Current workflows do not create the mobile `/preview/` slot for a direct PR, so visual/runtime
changes must use the mobile ZIP path.

### Preflight branch

`preflight/chatgpt` is reusable technical staging, not a delivery source. Reset it to exact current
`main` before each use. Its green push CI does not replace candidate PR CI or preview.

## Protected pipeline files

Ordinary feature archives/PRs must not modify:

- `.github/workflows/**`;
- `scripts/validate-upload-zip.py`;
- `scripts/apply-delta-zip.py`.

Pipeline changes require a separate maintenance PR and explicit review.

## Implementation and test rules

- Prefer pure helpers for decisions/rules and thin DOM/platform boundaries.
- Browser-only code must tolerate missing APIs in headless tests.
- Do not pin tests to historical app versions or prose that is not a protected contract.
- Use source-string assertions only for structural invariants that cannot be tested behaviorally.
- Update active docs in the same PR when ownership, contracts or workflow changes.
- Add a documentation traceability assertion when a stale contradiction could silently return.

## Completion definition

A change is ready for review when:

- exact baseline/scope is recorded;
- strict TypeScript and relevant tests/build pass locally when available;
- protected contracts and machine-readable sources agree;
- story/content changes preserve the `0–21` macro scope and pass the asset-trigger budget;
- archive/branch contains only intended files;
- GitHub `Quality gate` passes;
- changed files have been reviewed;
- relevant manual QA is complete;
- merge remains manual.

For docs/tests-only changes, visual iPhone QA is not required. For any visible/runtime or asset
change, use the candidate preview and check the affected critical path on the phone.
