# UPDS — инструкция для AI/разработчика

Status: active workflow aligned with ANM-027E and ANM-028A R2.

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

### Character art

Technical/runtime authority:

1. `src/data/characterProduction.ts`;
2. `docs/art/CHARACTER_PRODUCTION_CONTRACT_RU.md`;
3. CI-checked documentation mirror and runtime catalog.

Visual identity authority:

1. approved model sheets/lineup;
2. approved Golden Samples and Art Bible;
3. existing approved production masters.

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
- Encode relative height in the master canvas; do not repair it with runtime CSS scale.
- Produce the four additional expression frames from the approved master while preserving body,
  camera, silhouette and alpha bounds.
- Use a small face ROI and edit one expression at a time. Offline masks/layers/compositing are
  allowed; verify unchanged pixels outside the permitted ROI and stable alpha height, then export a
  finished precomposed frame.
- Runtime receives finished precomposed frames only. Never restore runtime face overlays.
- The full-stage required set remains exactly five Pose A expressions + Pose B + medallion; do not
  expand the standard expression taxonomy.
- Only full-stage characters use `upds-character-production-v2`. The planned guest/witness package
  is a separate presentation/asset class; never satisfy the full-stage validator with fake guest
  paths or incomplete sets.
- Assign full-stage production only when the character appears in at least three episodes,
  participates in the resolution or carries a substantial emotional scene. Pose B is full-stage
  only; a special climax frame requires explicit budget approval.
- `blink`/`speaking` remain deferred until the ANM-028 safe-motion proof.
- Keep a character `planned` until the complete set and manual visual approval exist.
- All depicted/student characters in the production manifest are explicitly adult.

## Scene, background and evidence production rules

- Build scenes from the approved reusable staging presets: solo close/medium, conflict/alliance
  two-shots, central-speaker/reaction trios, evidence cutaway and guest testimony card.
- Presets own shot, actor slots, active/listening/background roles, speaker focus, entry/exit and
  safe-area/non-overlap constraints. Runtime still composes standalone character assets; never bake
  a group into one PNG.
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
