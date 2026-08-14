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
- [`features/ANM027F_FULL_STORY_MACRO_LOCK_RU.md`](features/ANM027F_FULL_STORY_MACRO_LOCK_RU.md) — completed `0–21` beat/location/cast/clue/Match-3/asset-trigger lock
- [`features/ANM027G_EPISODES_04_06_PRODUCTION_RU.md`](features/ANM027G_EPISODES_04_06_PRODUCTION_RU.md) — first post-slice canonical production batch: slots `4–6`, six VN scenes, three Match-3 levels and two story-choice gates
- [`features/ANM027G_EPISODES_07_09_PRODUCTION_RU.md`](features/ANM027G_EPISODES_07_09_PRODUCTION_RU.md) — second canonical production batch: slots `7–9`, Asterion/laundry-service semantic variants, Rina/Kurose planned-stage triggers, Gen guest tier and three more Match-3 levels
- [`features/ANM027G_EPISODES_10_12_PRODUCTION_RU.md`](features/ANM027G_EPISODES_10_12_PRODUCTION_RU.md) — third canonical production batch: slots `10–12`, Aoi guest route, Asterion transfer chain, Second Skin reveal and three more Match-3 levels

The repository now contains detailed authored screenplay for slots `0–12`: ANM-003 covers `0–3`, `ANM-027G_Episodes_04_06_Screenplay.md` covers `4–6`, `ANM-027G_Episodes_07_09_Screenplay.md` covers `7–9`, and `ANM-027G_Episodes_10_12_Screenplay.md` covers `10–12`. Slots `13–21` remain macro-only and must enter through later three-episode ANM-027G batches.

### Character production

- [`art/CHARACTER_PRODUCTION_CONTRACT_RU.md`](art/CHARACTER_PRODUCTION_CONTRACT_RU.md)
- [`art/CHARACTER_BRIEFS_RU.md`](art/CHARACTER_BRIEFS_RU.md)
- [`art/CHARACTER_USAGE_MANIFEST.json`](art/CHARACTER_USAGE_MANIFEST.json) — documentation mirror
- [`features/ANM028A_CHARACTER_PRODUCTION_MANIFEST_RU.md`](features/ANM028A_CHARACTER_PRODUCTION_MANIFEST_RU.md)
- [`features/ANM028B1_REUSABLE_STAGING_PRESETS_RU.md`](features/ANM028B1_REUSABLE_STAGING_PRESETS_RU.md) — accepted R4.1 foundation: eight reusable presets using the playable VN frame, focal-eye-line duo/trio staging, selected-expression alpha/eye guides, ANM-024 viewport/background calibration, visual-approval-aware lineup, diagnostics and zero-new-art budget preview
- [`features/ANM028B2_AUTHORED_VN_SHOT_ADOPTION_RU.md`](features/ANM028B2_AUTHORED_VN_SHOT_ADOPTION_RU.md) — bounded playable-VN adoption of stable authored background/preset/actor/expression/Pose B declarations
- [`features/ANM028B3_GUEST_WITNESS_PRESENTATION_RU.md`](features/ANM028B3_GUEST_WITNESS_PRESENTATION_RU.md) — separate six-guest schema/validator and shared asset-free/production `guest-testimony-card` renderer
- [`features/ANM028D0_EMI_NEUTRAL_CANDIDATE_RU.md`](features/ANM028D0_EMI_NEUTRAL_CANDIDATE_RU.md) — approved Emi neutral R1 master and its completed lineup/solo/duo/trio gate
- [`features/ANM028D1_EMI_SMILE_CANDIDATE_RU.md`](features/ANM028D1_EMI_SMILE_CANDIDATE_RU.md) — first bounded face-ROI expression candidate with neutral/smile/runtime comparison
- [`features/ANM028D2_EMI_SERIOUS_CANDIDATE_RU.md`](features/ANM028D2_EMI_SERIOUS_CANDIDATE_RU.md) — serious expression from three bounded face ROIs with approved-reference/runtime comparison
- [`features/ANM028D3_EMI_SURPRISED_CANDIDATE_RU.md`](features/ANM028D3_EMI_SURPRISED_CANDIDATE_RU.md) — approved surprised expression from three bounded face ROIs
- [`features/ANM028D3A_EMI_RUNTIME_ADOPTION_RU.md`](features/ANM028D3A_EMI_RUNTIME_ADOPTION_RU.md) — explicit hybrid runtime adoption of approved Emi D0–D3 frames while embarrassed/Pose B/medallion remain legacy fallback
- [`art/prompts/ANM028D0_EMI_NEUTRAL_R1_PROMPT.md`](art/prompts/ANM028D0_EMI_NEUTRAL_R1_PROMPT.md) — ChatGPT Work prompt and technical export provenance
- [`art/prompts/ANM028D1_EMI_SMILE_R1_PROMPT.md`](art/prompts/ANM028D1_EMI_SMILE_R1_PROMPT.md) — exact smile prompt and deterministic ROI provenance
- [`art/prompts/ANM028D2_EMI_SERIOUS_R1_PROMPT.md`](art/prompts/ANM028D2_EMI_SERIOUS_R1_PROMPT.md) — exact serious prompt and deterministic multi-ROI provenance
- [`art/prompts/ANM028D3_EMI_SURPRISED_R1_PROMPT.md`](art/prompts/ANM028D3_EMI_SURPRISED_R1_PROMPT.md) — exact surprised prompt and deterministic multi-ROI provenance

Machine-readable sources of truth: `src/data/characterProduction.ts` for the strict seven-asset full-stage
fallback package, `src/data/characterRuntimeOverrides.ts` for the explicit temporary Emi D0–D3 runtime adoption,
`src/data/characterCandidates.ts` (`upds-character-candidate-v1`) for production provenance/manual-QA sources,
`src/data/sceneStaging.ts` (`upds-scene-staging-v1`) for reusable composition coordinates,
`src/data/authoredVnShots.ts` (`upds-authored-vn-shots-v1`) for bounded stable-line shot declarations,
`src/data/guestWitnesses.ts` (`upds-guest-witness-production-v1`) plus `src/ui/guestWitnessMarkup.ts` for
the separate episode-guest tier, and `src/data/sceneStudioCalibration.ts` (`upds-scene-studio-calibration-v1`) for viewport/background/lineup QA.
`src/ui/vnPortraitGeometry.ts` owns runtime-top and multi-actor eye-line camera derivation. Technical integration
and whole-rig visual approval remain separate: approved Emi neutral/smile/serious/surprised are playable through
D3A overrides, while legacy embarrassed/Pose B/medallion remain fallback until replacement art is supplied.

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
