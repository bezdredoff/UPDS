# UPDS — validation and test workflow

Status: active at accepted ANM-028B1 R4.1/ANM-028D0/D1/D2 plus ANM-028D3 R1 candidate QA.

## Authoritative gate

GitHub CI runs:

```bash
npm ci --ignore-scripts
npm run check
```

`npm run check` runs the full Vitest suite and the strict TypeScript production build. Local runs
are useful feedback but do not replace the GitHub **Quality gate**.

## Focused gates

```bash
npm run story:audit
npm run character:audit
npm run scene:audit
npm run docs:audit
```

- `story:audit` — screenplay/manifest/graph completeness.
- `character:audit` — character production manifest, isolated candidate status, PNG dimensions,
  selected-expression/candidate alpha bounds and eye-line landmarks, visual-approval status and runtime paths.
- `scene:audit` — exact eight-preset registry/resolver, face-critical lanes, runtime-top and
  focal-eye-line camera derivation, duo/trio headroom, frame-accurate actor guides, ANM-024
  viewport/background calibration, contain geometry, measurable lineup/visual-status warnings,
  shared VN frame and Scene Studio smoke.
- `docs:audit` — active documentation/source-of-truth traceability and retired-contract guards.

Focused gates accelerate iteration; `npm run check` remains required before merge.

## Test categories

### Behavioral unit/contract tests

Preferred. Exercise public pure/data/engine/controller behavior:

- story parsing, branching, graph routing and canonical import;
- Story/Match-3 campaign stores and compatibility;
- Match3Game rules, deterministic boards, objectives, hints and specials;
- Level Lab validation/export and mode side-effect isolation;
- gesture, motion, tutorial and narrative-reaction decisions;
- VN paging/staging/playback;
- localization, telemetry, audio and platform safety.

### Render smoke

`UiSmoke.test.ts` verifies that major screens render with a lightweight test root and missing
browser capabilities without crashing. Smoke does not replace detailed behavior tests or visual QA.

### Presentation contracts

A small number of tests read CSS/UI source to protect invariants not available in the headless test
environment:

- shared viewport/safe-area ownership;
- VN stage/dialogue geometry and paging;
- stable Match-3 board/bark slots;
- reduced-motion paths.

Do not add a source-string test for every visual implementation detail.

### Repository/pipeline/source-audit contracts

Used only for structural safety:

- GitHub workflows remain read/write-separated;
- delta exact-base/protected-path rules remain intact;
- repository root/archive hygiene;
- feature ownership boundaries;
- save keys and build identity shape;
- retired face-overlay runtime does not return;
- active documentation points to current machine-readable sources.

## Current automated production contracts

### Story

- `StoryGraphContract.test.ts`;
- `StoryContentAudit.test.ts`;
- `StoryCanonicalRuntimeImport.test.ts`;
- narrative/runtime transition regressions.

They preserve the current nine-scene/four-level authored path, 262 parsed source lines, 261 playable
lines and explicit deferred `VN0250`.

### Character production

- `CharacterProductionManifest.test.ts`;
- `ExpressionFrameContract.test.ts`;
- runtime asset and staging tests.

They preserve the seven-asset precomposed contract, production/planned status, PNG dimensions,
alpha-height proportions, isolated `runtimeEligible: false` candidate geometry, bounded expression
ROI inheritance and absence of runtime face-overlay/candidate preload references. Visual style,
identity and expression readability still require manual approval.

### Reusable scene staging

- `SceneStagingContract.test.ts`;
- `SceneStudioFoundation.test.ts`;
- localization parity/completion audit.

They preserve the exact eight-preset `upds-scene-staging-v1` registry, safe non-overlapping boxes,
canonical/shot scale separation, exact actor assignment, zero-new-art budgets, the
`upds-scene-studio-calibration-v1` viewport/background contract, runtime contain fit, shared
playable/QA VN frame, runtime/approved-master/current-candidate selector, exact candidate guides, lineup metrics,
read-only QA report and an asset-free guest shell.
Style, anatomy, adult visual age, lighting, perspective and final composition/readability still
require `/preview/` phone QA against the approved Golden Sample.

### Match-3

Contracts cover shared legality, narrative special taxonomy, production tile identities, tutorials,
Level Lab drafts/board shapes, campaign progression, deterministic quantitative balance and
narrative reaction resolver/presentation.

### Documentation

`DocumentationTraceability.test.ts` protects only high-risk authority relationships. It should not
pin every sentence or historical feature note.

## TypeScript hygiene

`strict`, `noUnusedLocals` and `noUnusedParameters` are enabled. Dead code/imports/parameters fail
the build.

## Manual QA by change type

### Docs/tests-only

- review rendered Markdown/links and changed-file list;
- confirm no runtime/assets/workflows changed;
- GitHub Quality gate;
- no unrelated phone visual QA required.

### Runtime visual/mobile

Use the mobile candidate `/preview/` and check affected viewports/flows. Minimum portrait matrix:

- 320×568
- 375×667
- 390×844
- 393×852
- 430×932

Also check low-height landscape does not break the shared viewport shell when relevant.

### Character assets

- standalone transparency/canvas/pivot;
- for a candidate, assert RGBA/alpha bounds/eye line and verify it is absent from runtime rig/preload;
- inspect extracted edges on both light and dark backgrounds;
- shared-baseline lineup and authored proportions;
- all five expression frames side by side and during switching;
- Pose B/medallion;
- multi-character staging in the actual runtime camera;
- real VN header/dialogue/nameplate/controls occlusion across the portrait matrix;
- background master contain box, estimated horizon/footline/actor zone and manual perspective/light
  approval;
- no overlap baked into source assets, halo, double face, crop or scale jump.

### Match-3/content

- relevant Story → Match-3 → Story transition;
- Story, Match-3 Campaign and Level Lab mode isolation;
- direct/tap/drag/swipe input as affected;
- objective/tutorial/reaction presentation;
- deterministic seed reproduction for balance defects.

## Historical evidence

Past validation/manual QA snapshots live under `docs/archive/reports/`. They document what was
checked at that commit; they do not define the current implementation.
