# UPDS documentation index

This index routes readers to the current sources of truth. It is not an independent status or
version ledger.

## Authority order

1. [`ROADMAP_RU.md`](ROADMAP_RU.md) — current completed/in-progress/deferred feature state.
2. [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md) — approved full-game content scope, reuse budgets and authoring sequence.
3. [`architecture/PROJECT_CONTRACTS_RU.md`](architecture/PROJECT_CONTRACTS_RU.md) — protected product/runtime decisions.
4. [`architecture/ARCHITECTURE_RU.md`](architecture/ARCHITECTURE_RU.md) — current ownership and data flow.
5. Machine-readable runtime/data contracts in `src/`, especially story and character manifests.
6. [`process/`](process/) — delivery, AI-development and validation workflow.
7. Feature documents — implementation traceability for a particular slice; later contracts may supersede them.
8. [`archive/`](archive/) — historical evidence only.

If two active documents conflict, prefer the narrower current machine-readable contract and
`ROADMAP_RU.md`, then repair the conflicting prose in the same change.

## Read first

- [`architecture/PROJECT_CONTRACTS_RU.md`](architecture/PROJECT_CONTRACTS_RU.md)
- [`ROADMAP_RU.md`](ROADMAP_RU.md)
- [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md)
- [`architecture/ARCHITECTURE_RU.md`](architecture/ARCHITECTURE_RU.md)
- [`process/AI_DEVELOPMENT_RU.md`](process/AI_DEVELOPMENT_RU.md)
- [`process/TESTING_RU.md`](process/TESTING_RU.md)

## Current production contracts

### Story and content

- [`content/CONTENT_PRODUCTION_STRATEGY_RU.md`](content/CONTENT_PRODUCTION_STRATEGY_RU.md) — full 22-slot scope, tier/reuse budgets, macro lock and three-episode delivery batches
- [`content/ANM-001_Story_Bible.md`](content/ANM-001_Story_Bible.md) — active narrative canon v0.2
- [`content/ANM-002_22_Episode_Plot.md`](content/ANM-002_22_Episode_Plot.md) — active `0–21` plot input v0.1; its §8 asset counts are superseded by ANM-027E
- [`features/ANM027A_STORY_GRAPH_CONTRACT_RU.md`](features/ANM027A_STORY_GRAPH_CONTRACT_RU.md)
- [`features/ANM027B_RUNTIME_ROUTING_MIGRATION_RU.md`](features/ANM027B_RUNTIME_ROUTING_MIGRATION_RU.md)
- [`features/ANM027C_STORY_IMPORT_COMPLETENESS_RU.md`](features/ANM027C_STORY_IMPORT_COMPLETENESS_RU.md)
- [`features/ANM027D_FULL_STORY_IMPORT_RU.md`](features/ANM027D_FULL_STORY_IMPORT_RU.md)

The repository currently contains the authored ANM-003 vertical slice only. The ANM-027 pipeline
and ANM-027E lean production contract are ready. The screenplay beyond that slice is not yet
present, the full macro lock is also pending, and neither must be described as complete.

### Character production

- [`art/CHARACTER_PRODUCTION_CONTRACT_RU.md`](art/CHARACTER_PRODUCTION_CONTRACT_RU.md)
- [`art/CHARACTER_BRIEFS_RU.md`](art/CHARACTER_BRIEFS_RU.md)
- [`art/CHARACTER_USAGE_MANIFEST.json`](art/CHARACTER_USAGE_MANIFEST.json) — documentation mirror
- [`features/ANM028A_CHARACTER_PRODUCTION_MANIFEST_RU.md`](features/ANM028A_CHARACTER_PRODUCTION_MANIFEST_RU.md)
- [`features/ANM028B1_REUSABLE_STAGING_PRESETS_RU.md`](features/ANM028B1_REUSABLE_STAGING_PRESETS_RU.md) — accepted R4.1 foundation: eight reusable presets using the playable VN frame, focal-eye-line duo/trio staging, selected-expression alpha/eye guides, ANM-024 viewport/background calibration, visual-approval-aware lineup, diagnostics and zero-new-art budget preview
- [`features/ANM028D0_EMI_NEUTRAL_CANDIDATE_RU.md`](features/ANM028D0_EMI_NEUTRAL_CANDIDATE_RU.md) — approved Emi neutral R1 master and its completed lineup/solo/duo/trio gate
- [`features/ANM028D1_EMI_SMILE_CANDIDATE_RU.md`](features/ANM028D1_EMI_SMILE_CANDIDATE_RU.md) — first bounded face-ROI expression candidate with neutral/smile/runtime comparison
- [`art/prompts/ANM028D0_EMI_NEUTRAL_R1_PROMPT.md`](art/prompts/ANM028D0_EMI_NEUTRAL_R1_PROMPT.md) — ChatGPT Work prompt and technical export provenance
- [`art/prompts/ANM028D1_EMI_SMILE_R1_PROMPT.md`](art/prompts/ANM028D1_EMI_SMILE_R1_PROMPT.md) — exact smile prompt and deterministic ROI provenance

Machine-readable sources of truth: `src/data/characterProduction.ts` for runtime full-stage assets/proportions,
`src/data/characterCandidates.ts` (`upds-character-candidate-v1`) for isolated manual-QA candidates,
`src/data/sceneStaging.ts` (`upds-scene-staging-v1`) for reusable composition coordinates and
`src/data/sceneStudioCalibration.ts` (`upds-scene-studio-calibration-v1`) for read-only viewport,
background and measurable lineup QA, and `src/ui/vnPortraitGeometry.ts` for runtime-top and
multi-actor eye-line-anchored shot derivation. Per-expression guide geometry lives in the character
manifest. Technical integration and visual approval are separate; Emi's existing set is
runtime-integrated but marked `rebuild-required`. ANM-028D0 neutral is now the approved authoring
master, while ANM-028D1 smile remains Studio-only until its expression QA.

### Match-3 production and tooling

- target mechanics: [`design/MATCH3_MECHANICS_TARGET_RU.md`](design/MATCH3_MECHANICS_TARGET_RU.md)
- framework closeout: [`features/ANM025F3_MATCH3_REACTION_PRESENTATION_RU.md`](features/ANM025F3_MATCH3_REACTION_PRESENTATION_RU.md)
- Level Lab: [`features/ANM026A_LEVEL_LAB_FOUNDATION_RU.md`](features/ANM026A_LEVEL_LAB_FOUNDATION_RU.md)
- editable production config: [`features/ANM026B1_EDITABLE_BALANCE_CONFIG_RU.md`](features/ANM026B1_EDITABLE_BALANCE_CONFIG_RU.md)
- board shapes/start layouts: [`features/ANM026B2_BOARD_SHAPE_START_LAYOUT_RU.md`](features/ANM026B2_BOARD_SHAPE_START_LAYOUT_RU.md)
- player-facing campaign: [`features/ANM026C_MATCH3_CAMPAIGN_MODE_RU.md`](features/ANM026C_MATCH3_CAMPAIGN_MODE_RU.md)

### Architecture and viewport foundations

- [`features/ANM023_ARCHITECTURE_TEST_HEALTH_RU.md`](features/ANM023_ARCHITECTURE_TEST_HEALTH_RU.md)
- [`features/ANM024A_VIEWPORT_SAFE_AREA_CONTRACT_RU.md`](features/ANM024A_VIEWPORT_SAFE_AREA_CONTRACT_RU.md)
- [`features/ANM024C_SHARED_SAFE_AREA_OWNERSHIP_RU.md`](features/ANM024C_SHARED_SAFE_AREA_OWNERSHIP_RU.md)
- [`features/ANM024D_VIEWPORT_REGRESSION_CLOSURE_RU.md`](features/ANM024D_VIEWPORT_REGRESSION_CLOSURE_RU.md)

## Process

- [`process/GITHUB_PHONE_PIPELINE_RU.md`](process/GITHUB_PHONE_PIPELINE_RU.md)
- [`process/CHATGPT_PREFLIGHT_RU.md`](process/CHATGPT_PREFLIGHT_RU.md)
- [`process/AI_DEVELOPMENT_RU.md`](process/AI_DEVELOPMENT_RU.md)
- [`process/TESTING_RU.md`](process/TESTING_RU.md)
- [`architecture/TEST_STRATEGY_RU.md`](architecture/TEST_STRATEGY_RU.md)

## Historical material

`archive/` contains generated release snapshots, superseded incremental notes and validation/manual
QA evidence. Those files answer “what was checked then”, not “what the current implementation must
do”. Root/current docs must never defer to archived contracts.
