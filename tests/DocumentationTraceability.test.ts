import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('active documentation traceability', () => {
  it('keeps status and build identity in their authoritative sources instead of a stale root copy', () => {
    const readme = read('README.md');
    const index = read('docs/README.md');
    const roadmap = read('docs/ROADMAP_RU.md');
    const buildFeature = BUILD_LABEL.split(' · ')[0];
    const tick = String.fromCharCode(96);

    expect(readme).toContain('docs/ROADMAP_RU.md');
    expect(readme).toContain('src/appVersion.ts');
    expect(readme).not.toContain('Current build:');
    expect(index).toContain('## Authority order');
    expect(roadmap).toContain('Technical product version: ' + tick + APP_VERSION + tick);
    expect(buildFeature).toMatch(/^ANM-/);
    expect(roadmap).toContain(buildFeature);
    expect(roadmap).toContain('Current engineering focus: **ANM-023G8');
  });

  it('aligns protected character prose with the canonical precomposed v2 manifest', () => {
    const protectedContracts = read('docs/architecture/PROJECT_CONTRACTS_RU.md');
    const productionContract = read('docs/art/CHARACTER_PRODUCTION_CONTRACT_RU.md');
    const activeEntryPoints = [
      read('README.md'),
      read('docs/README.md'),
      protectedContracts,
      read('docs/architecture/ARCHITECTURE_RU.md'),
      read('docs/process/AI_DEVELOPMENT_RU.md'),
    ];

    expect(protectedContracts).toContain('src/data/characterProduction.ts');
    expect(protectedContracts).toContain('precomposed 1024×1536 expression frames');
    expect(protectedContracts).toContain('Miku, Onoe, Ayuki, Emi');
    expect(protectedContracts).toContain('Kentaro, Norihiro, Mayu, Rina, Kurose');
    expect(productionContract).toContain('upds-character-production-v2');
    expect(productionContract).toContain('ровно семь обязательных runtime assets');
    for (const source of activeEntryPoints) {
      expect(source).not.toContain('base-neutral + face overlay');
    }
  });

  it('documents the complete canonical story import and final ending boundary', () => {
    const protectedContracts = read('docs/architecture/PROJECT_CONTRACTS_RU.md');
    const architecture = read('docs/architecture/ARCHITECTURE_RU.md');
    const index = read('docs/README.md');

    for (const source of [protectedContracts, architecture]) {
      expect(source).toContain('src/content/story/ANM003.vertical-slice.story.json');
      expect(source).toContain('src/data/storyGraph.ts');
    }
    expect(architecture).toContain('src/content/storyRuntime.ts');
    expect(protectedContracts).toContain('976 authored lines');
    expect(protectedContracts).toContain('VN0250` является canonical bridge');
    expect(index).toContain('all 22 slots `0–21`');
    expect(index).toContain('three mutually exclusive authored ending routes');
  });

  it('locks the lean full-content scope and keeps guest/offline production boundaries explicit', () => {
    const strategy = read('docs/content/CONTENT_PRODUCTION_STRATEGY_RU.md');
    const roadmap = read('docs/ROADMAP_RU.md');
    const index = read('docs/README.md');
    const aiWorkflow = read('docs/process/AI_DEVELOPMENT_RU.md');
    const characterContract = read('docs/art/CHARACTER_PRODUCTION_CONTRACT_RU.md');
    const protectedContracts = read('docs/architecture/PROJECT_CONTRACTS_RU.md');

    for (const source of [roadmap, index, aiWorkflow, protectedContracts]) {
      expect(source).toContain('CONTENT_PRODUCTION_STRATEGY_RU.md');
    }
    expect(strategy).toContain('22 planned content slots: `0–21`');
    expect(strategy).toContain('Сюжетный объём не сокращается');
    expect(strategy).toContain('[`ANM-001_Story_Bible.md`](ANM-001_Story_Bible.md), v0.2');
    expect(strategy).toContain('[`ANM-002_22_Episode_Plot.md`](ANM-002_22_Episode_Plot.md), v0.1');
    expect(strategy).toContain('исторический beat source на 115 слайдов');
    expect(strategy).toContain('ANM-027E supersedes **только production-volume estimates**');
    expect(strategy).toContain('8–10 эмоций и 2 позы');
    expect(strategy).toContain('8–10 master-локаций');
    expect(strategy).toContain('5–7 hero clue close-ups');
    expect(strategy).toContain('пакетами по три последовательных эпизода');
    expect(strategy).toContain('runtime face overlay');
    expect(strategy).toContain('нельзя добавлять в `upds-character-production-v2`');
    expect(characterContract).toContain('только к полноценным stage-персонажам');
    expect(characterContract).toContain('Runtime получает только готовые');
    expect(protectedContracts).toContain('22 planned content slots `0–21`');
    expect(protectedContracts).toContain('upds-guest-witness-production-v1');
    expect(protectedContracts).toContain('ANM-002 §8');
    expect(aiWorkflow).toContain('`4–6`, `7–9`, `10–12`, `13–15`, `16–18` and `19–21` are implemented packages');
    expect(aiWorkflow).toContain('canonical `0–21` screenplay is complete');

    const storyBible = read('docs/content/ANM-001_Story_Bible.md');
    const episodePlot = read('docs/content/ANM-002_22_Episode_Plot.md');
    expect(index).toContain('content/ANM-001_Story_Bible.md');
    expect(index).toContain('content/ANM-002_22_Episode_Plot.md');
    expect(storyBible).toContain('active narrative canon');
    expect(storyBible).toContain('ANM-027F Full Story Macro Lock');
    expect(episodePlot).toContain('Superseded production estimate');
    expect(episodePlot).toContain('completed authored baseline');
    expect(episodePlot).not.toContain('следующий документ — **ANM-003');
  });

  it('describes every supported delivery lane without granting direct PRs a mobile preview', () => {
    const pipeline = read('docs/process/GITHUB_PHONE_PIPELINE_RU.md');
    const preflight = read('docs/process/CHATGPT_PREFLIGHT_RU.md');

    expect(pipeline).toContain('PATCH.zip');
    expect(pipeline).toContain('upds-delta-v1');
    expect(pipeline).toContain('FULL_PROJECT.zip');
    expect(pipeline).toContain('Direct connector branch/PR');
    expect(pipeline).toContain('Current workflows do not publish');
    expect(pipeline).toContain('/preview/');
    expect(pipeline).toContain('Quality gate');
    expect(pipeline).toContain('Merge manually');
    expect(preflight).toContain('Reset/sync');
    expect(preflight).toContain('Never merge');
  });

  it('keeps current phase/index/brief traceability free from known stale markers', () => {
    const roadmap = read('docs/ROADMAP_RU.md');
    const index = read('docs/README.md');
    const briefs = read('docs/art/CHARACTER_BRIEFS_RU.md');
    const architecture = read('docs/architecture/ARCHITECTURE_RU.md');

    expect(roadmap).toContain('028A Character Production Manifest & Validator Foundation — COMPLETE');
    expect(roadmap).not.toContain('COMPLETE WHEN MERGED');
    expect(roadmap).toContain('029B Belarusian Production — COMPLETE (B4 R1.1, PR #135)');
    expect(roadmap).toContain('exact **3870/3870** base-key parity');
    expect(roadmap).toContain("supportedLocales = ['ru', 'be', 'en']");
    expect(index).toContain('ANM028A_CHARACTER_PRODUCTION_MANIFEST_RU.md');
    expect(index).toContain('ANM027D_FULL_STORY_IMPORT_RU.md');
    expect(index).toContain('ANM026C_MATCH3_CAMPAIGN_MODE_RU.md');
    expect(briefs).toContain('pose_b_arms_crossed.png');
    expect(briefs).not.toContain('pose_b_guarded_athlete.png');
    expect(architecture).toContain('src/features/levelLab/LevelLabController.ts');
    expect(architecture).toContain('src/features/match3Campaign/Match3CampaignController.ts');
    expect(architecture).not.toContain('Status: ANM-023D audited baseline');
  });

  it('keeps durable production foundations and localization feature documents traceable', () => {
    const roadmap = read('docs/ROADMAP_RU.md');
    const index = read('docs/README.md');
    const architecture = read('docs/architecture/ARCHITECTURE_RU.md');
    const protectedContracts = read('docs/architecture/PROJECT_CONTRACTS_RU.md');
    const feature = read('docs/features/ANM028B1_REUSABLE_STAGING_PRESETS_RU.md');
    const candidateFeature = read('docs/features/ANM028D0_EMI_NEUTRAL_CANDIDATE_RU.md');
    const candidatePrompt = read('docs/art/prompts/ANM028D0_EMI_NEUTRAL_R1_PROMPT.md');
    const smileFeature = read('docs/features/ANM028D1_EMI_SMILE_CANDIDATE_RU.md');
    const smilePrompt = read('docs/art/prompts/ANM028D1_EMI_SMILE_R1_PROMPT.md');
    const seriousFeature = read('docs/features/ANM028D2_EMI_SERIOUS_CANDIDATE_RU.md');
    const seriousPrompt = read('docs/art/prompts/ANM028D2_EMI_SERIOUS_R1_PROMPT.md');
    const surprisedFeature = read('docs/features/ANM028D3_EMI_SURPRISED_CANDIDATE_RU.md');
    const surprisedPrompt = read('docs/art/prompts/ANM028D3_EMI_SURPRISED_R1_PROMPT.md');
    const planningReset = read('docs/features/ANM029H_PRODUCTION_PLANNING_RESET_RU.md');
    const biomeHygiene = read('docs/features/ANM023F1_BIOME_REPOSITORY_HYGIENE_RU.md');
    const testSimplification = read('docs/features/ANM023F2_TEST_SUITE_SIMPLIFICATION_RU.md');
    const match3PresentationExtraction = read('docs/features/ANM023F3A_MATCH3_PRESENTATION_EXTRACTION_RU.md');
    const vnPresentationExtraction = read('docs/features/ANM023F3B_VN_PRESENTATION_EXTRACTION_RU.md');
    const match3RuleKernelExtraction = read('docs/features/ANM023F3C_MATCH3_RULE_KERNEL_EXTRACTION_RU.md');
    const lazyLocalePayload = read('docs/features/ANM023F4A_LAZY_LOCALE_PAYLOAD_RU.md');
    const runtimeAssetPreloadMemory = read('docs/features/ANM023F4B_RUNTIME_ASSET_PRELOAD_MEMORY_RU.md');
    const assetGapAudit = read('docs/features/ANM030A_FULL_GAME_ASSET_GAP_AUDIT_RU.md');

    expect(roadmap).toContain('028B1 R4.1 Multi-Actor Eye-Line & Frame-Accurate Guides — COMPLETE');
    expect(roadmap).toContain('ANM-028D0 R1 Emi neutral master accepted');
    expect(roadmap).toContain('ANM-028D1 R1 Emi smile accepted');
    expect(roadmap).toContain('ANM-028D2 R1 Emi serious accepted');
    expect(roadmap).toContain('ANM-028B2 R1.1 Authored VN Shot Adoption — COMPLETE');
    expect(roadmap).toContain('028B3 Guest/Witness Presentation Contract — R1.1 COMPLETE');
    expect(roadmap).toContain('027G Episode Batch Production & Canonical Import — COMPLETE');
    expect(roadmap).toContain('029A Localization Production Foundation — R1.1 COMPLETE');
    expect(roadmap).toContain('029B Belarusian Production — COMPLETE (B4 R1.1, PR #135)');
    expect(index).toContain('ANM029B1_BELARUSIAN_PLAYER_SHELL_RU.md');
    expect(index).toContain('ANM029B2B1_BELARUSIAN_MATCH3_LEVELS_00_06_RU.md');
    expect(index).toContain('ANM029B2B2_BELARUSIAN_MATCH3_LEVELS_07_13_RU.md');
    expect(index).toContain('ANM029B2B3_BELARUSIAN_MATCH3_LEVELS_14_21_RU.md');
    expect(index).toContain('ANM029B2C_BELARUSIAN_MATCH3_REACTIONS_AUDIT_RU.md');
    expect(index).toContain('ANM029B3A_BELARUSIAN_VN_SLOT_0_RU.md');
    expect(index).toContain('ANM029B3B_BELARUSIAN_VN_SLOT_1_RU.md');
    expect(index).toContain('ANM029B3C_BELARUSIAN_VN_SLOT_2_RU.md');
    expect(index).toContain('ANM029B3D_BELARUSIAN_VN_SLOT_3_RU.md');
    expect(index).toContain('ANM029B3E_BELARUSIAN_VN_SLOT_4_RU.md');
    expect(index).toContain('ANM029B3F_BELARUSIAN_VN_SLOT_5_RU.md');
    expect(index).toContain('ANM029B3G_BELARUSIAN_VN_SLOT_6_RU.md');
    expect(index).toContain('ANM029B3H_BELARUSIAN_VN_SLOT_7_RU.md');
    expect(index).toContain('ANM029B3I_BELARUSIAN_VN_SLOT_8_RU.md');
    expect(index).toContain('ANM029B3J_BELARUSIAN_VN_SLOT_9_RU.md');
    expect(index).toContain('ANM029B3K_BELARUSIAN_VN_SLOT_10_RU.md');
    expect(index).toContain('ANM029B3L_BELARUSIAN_VN_SLOT_11_RU.md');
    expect(index).toContain('ANM029B3M_BELARUSIAN_VN_SLOT_12_RU.md');
    expect(index).toContain('ANM029B3N_BELARUSIAN_VN_SLOT_13_RU.md');
    expect(index).toContain('ANM029B3O_BELARUSIAN_VN_SLOT_14_RU.md');
    expect(index).toContain('ANM029B3P_BELARUSIAN_VN_SLOT_15_RU.md');
    expect(index).toContain('ANM029B4_BELARUSIAN_COMPLETION_RU.md');
    expect(index).toContain('ANM029H_PRODUCTION_PLANNING_RESET_RU.md');
    expect(index).toContain('ANM023F1_BIOME_REPOSITORY_HYGIENE_RU.md');
    expect(index).toContain('ANM023F2_TEST_SUITE_SIMPLIFICATION_RU.md');
    expect(index).toContain('ANM023F3A_MATCH3_PRESENTATION_EXTRACTION_RU.md');
    expect(index).toContain('ANM023F3B_VN_PRESENTATION_EXTRACTION_RU.md');
    expect(index).toContain('ANM023F3C_MATCH3_RULE_KERNEL_EXTRACTION_RU.md');
    expect(index).toContain('ANM023F4A_LAZY_LOCALE_PAYLOAD_RU.md');
    expect(index).toContain('ANM023F4B_RUNTIME_ASSET_PRELOAD_MEMORY_RU.md');
    expect(roadmap).toContain('ANM-023F — Codebase, Test & Tooling Simplification');
    expect(roadmap).toContain('023F1 Biome Expansion & Repository Hygiene');
    expect(roadmap).toContain('ANM-030A Full Game Asset Gap Audit');
    expect(planningReset).toContain('`110` Vitest files');
    expect(planningReset).toContain('do **not** blindly enable every Biome rule');
    expect(planningReset).toContain('less test code and lower maintenance cost without weaker behavioral protection');
    expect(planningReset).toContain('merged via PR #136');
    expect(biomeHygiene).toContain('biome lint src tests vite.config.ts');
    expect(biomeHygiene).toContain('noAccumulatingSpread');
    expect(biomeHygiene).toContain('ANM-023F2 — Test Suite Simplification');
    expect(biomeHygiene).toContain('merged via PR #137');
    expect(testSimplification).toContain('BelarusianCompletionLocalization.test.ts');
    expect(testSimplification).toContain('BelarusianMatch3Localization.test.ts');
    expect(testSimplification).toContain('BelarusianVnLocalization.test.ts');
    expect(testSimplification).toContain('110 → 90 `*.test.ts` files');
    expect(testSimplification).toContain('149 representative copy/payload assertions');
    expect(testSimplification).toContain('noAccumulatingSpread');
    expect(testSimplification).toContain('PR #138');
    expect(match3PresentationExtraction).toContain('Match3Presentation.ts');
    expect(match3PresentationExtraction).toContain('15.7% less controller surface');
    expect(match3PresentationExtraction).toContain('PR #139');
    expect(vnPresentationExtraction).toContain('VnPresentation.ts');
    expect(vnPresentationExtraction).toContain('24.7% less controller surface');
    expect(vnPresentationExtraction).toContain('PR #140');
    expect(match3RuleKernelExtraction).toContain('Match3Rules.ts');
    expect(match3RuleKernelExtraction).toContain('22.9% less engine-class surface');
    expect(match3RuleKernelExtraction).toContain('500 randomized boards');
    expect(match3RuleKernelExtraction).toContain('PR #141');
    expect(lazyLocalePayload).toContain('1,206.14 kB / 389.05 kB gzip');
    expect(lazyLocalePayload).toContain('741.15 kB / 247.14 kB gzip');
    expect(lazyLocalePayload).toContain('PR #142');
    expect(lazyLocalePayload).toContain('initialAppCatalogs');
    expect(lazyLocalePayload).toContain('activateLocale()');
    expect(lazyLocalePayload).toContain('ANM-023F4B');
    expect(runtimeAssetPreloadMemory).toContain('IMAGE_PRELOAD_CONCURRENCY = 4');
    expect(runtimeAssetPreloadMemory).toContain('CACHE_WARM_CONCURRENCY = 4');
    expect(runtimeAssetPreloadMemory).toContain('services.pwa.start(runtimeAssetCatalog)');
    expect(runtimeAssetPreloadMemory).toContain('PR #144');
    expect(runtimeAssetPreloadMemory).toContain('UPDS CI #289');
    expect(runtimeAssetPreloadMemory).toContain('ANM-030A');
    expect(architecture).toContain('Runtime asset warming / offline cache ownership');
    expect(architecture).toContain('Production asset audit ownership');
    expect(roadmap).toContain('ANM-023F4A R1 [P1] — COMPLETE / PR #142');
    expect(roadmap).toContain('ANM-023F4B R1 [P1] — COMPLETE / PR #144');
    expect(roadmap).toContain('ANM-030A R1.1 [P0] — COMPLETE / PR #145');
    expect(roadmap).toContain('ANM-030A2 [P0] — COMPLETE / PR #147');
    expect(roadmap).toContain('ANM-030B0A1 R1.1 [P1] — COMPLETE / PR #148');
    expect(roadmap).toContain('ANM-030B0A2 [P1] — ART-BLOCKED');
    expect(roadmap).toContain('one shared five-asset pack');
    expect(index).toContain('ANM030A_FULL_GAME_ASSET_GAP_AUDIT_RU.md');
    expect(assetGapAudit).toContain('upds-asset-gap-audit-v1');
    expect(assetGapAudit).toContain('5 dedicated production / 24 runtime-used');
    expect(assetGapAudit).toContain('38 production outputs');
    expect(assetGapAudit).toContain('1 shared production-art gap: 5 special/bonus visuals');
    expect(match3PresentationExtraction).toContain('mobile candidate preview');
    expect(index).toContain('ANM023E_TEST_TOOLING_IDENTITY_HARDENING_RU.md');
    expect(roadmap).toContain('remaining **999** base-catalog keys');
    expect(roadmap).toContain('exact **3870/3870** base-key parity');
    expect(roadmap).toContain("supportedLocales = ['ru', 'be', 'en']");
    expect(roadmap).toContain('029C Simplified Chinese Production — PAUSED');
    expect(roadmap).toContain('029F Brazilian Portuguese Production — PAUSED');
    expect(roadmap).toContain('028D Character Production / Normalization — ART GENERATION PAUSED');
    expect(index).toContain('ANM028B1_REUSABLE_STAGING_PRESETS_RU.md');
    expect(index).toContain('ANM028D0_EMI_NEUTRAL_CANDIDATE_RU.md');
    expect(index).toContain('ANM028D0_EMI_NEUTRAL_R1_PROMPT.md');
    expect(index).toContain('ANM028D1_EMI_SMILE_CANDIDATE_RU.md');
    expect(index).toContain('ANM028D1_EMI_SMILE_R1_PROMPT.md');
    expect(index).toContain('ANM028D2_EMI_SERIOUS_CANDIDATE_RU.md');
    expect(index).toContain('ANM028D2_EMI_SERIOUS_R1_PROMPT.md');
    expect(index).toContain('ANM028D3_EMI_SURPRISED_CANDIDATE_RU.md');
    expect(index).toContain('ANM028D3_EMI_SURPRISED_R1_PROMPT.md');
    expect(architecture).toContain('src/data/sceneStaging.ts');
    expect(architecture).toContain('src/data/sceneStudioCalibration.ts');
    expect(architecture).toContain('src/ui/vnFrameMarkup.ts');
    expect(architecture).toContain('src/ui/vnPortraitGeometry.ts');
    expect(architecture).toContain('src/features/sceneStudio/SceneStudioController.ts');
    expect(protectedContracts).toContain('upds-scene-staging-v1');
    expect(protectedContracts).toContain('upds-scene-studio-calibration-v1');
    expect(protectedContracts).toContain('face-critical-lane');
    expect(protectedContracts).toContain('background-focal-eye-line');
    expect(protectedContracts).toContain('strict seven-asset Emi rig is `rebuild-required`');
    expect(protectedContracts).toContain('manual Golden Sample gates');
    expect(protectedContracts).toContain('upds-character-candidate-v1');
    expect(protectedContracts).toContain('runtimeEligible: false');
    expect(protectedContracts).toContain('ANM-028B2');
    expect(protectedContracts).toContain('ANM-028B3');
    expect(protectedContracts).toContain('src/data/guestWitnesses.ts');
    expect(protectedContracts).toContain('src/ui/guestWitnessMarkup.ts');
    expect(feature).toContain('## Восемь пресетов');
    expect(feature).toContain('## Shared runtime frame');
    expect(feature).toContain('runtime camera `178 / -78`');
    expect(feature).toContain('frameGeometry[expression]');
    expect(feature).toContain('SELECTED FRAME ALPHA');
    expect(feature).toContain('каждый duo/trio actor');
    expect(feature).toContain('visualApproval: rebuild-required');
    expect(feature).toContain('upds-scene-studio-qa-v1');
    expect(feature).toContain('guest-testimony-card');
    expect(feature).toContain('не входят');
    expect(candidateFeature).toContain('330,80,737,1508');
    expect(candidateFeature).toContain('runtimeEligible: false');
    expect(candidateFeature).toContain('lineup/solo/duo/trio');
    expect(candidateFeature).toContain('c224df25c35c610eb6f83e675f8d95f48b92a3c8');
    expect(candidateFeature).toContain('approved-master');
    expect(candidatePrompt).toContain('built-in ChatGPT Work `imagegen`');
    expect(candidatePrompt).toContain('chroma-key green RGB #00FF00');
    expect(smileFeature).toContain('977ab2d98f33ae3cdf922d0b92685e6ce2e0f25b');
    expect(smileFeature).toContain('88×42 px');
    expect(smileFeature).toContain('runtimeEligible: false');
    expect(smileFeature).toContain('approved-expression');
    expect(smilePrompt).toContain('built-in ChatGPT Work `imagegen`');
    expect(smilePrompt).toContain('gpt-work-face-roi');
    expect(seriousFeature).toContain('1f41ec3bcc7892bd75d09b704e38afe323a3a32e');
    expect(seriousFeature).toContain('три feathered области');
    expect(seriousFeature).toContain('runtimeEligible: false');
    expect(seriousFeature).toContain('approved-expression');
    expect(seriousPrompt).toContain('built-in ChatGPT Work `imagegen`');
    expect(seriousPrompt).toContain('единая маска всего лица отклонена');
    expect(surprisedFeature).toContain('85ebb2148ba786dfcc5a0fee936617a7a80e67dd');
    expect(surprisedFeature).toContain('три feathered области');
    expect(surprisedFeature).toContain('runtimeEligible: false');
    expect(surprisedPrompt).toContain('built-in ChatGPT Work `imagegen`');
    expect(surprisedPrompt).toContain('более узкая маска из ANM-028D2 отклонена');
  });

  it('keeps Playwright as the sole browser automation stack and G8 audit split traceable', () => {
    const roadmap = read('docs/ROADMAP_RU.md');
    const testing = read('docs/process/TESTING_RU.md');
    const ai = read('docs/process/AI_DEVELOPMENT_RU.md');
    const e2eReadme = read('e2e/README.md');
    const rootPackage = read('package.json').toLowerCase();
    const e2ePackage = read('e2e/package.json').toLowerCase();

    expect(roadmap).toContain('023G7C Version / Diagnostics Closeout [P1] — COMPLETE / PR #159');
    expect(roadmap).toContain('023G7D Browser Gate Playwright Container Hardening [P1] — COMPLETE / PR #160');
    expect(roadmap).toContain('023G8A Coverage Audit & QA/Production Parity Matrix [P1] — R1 CURRENT CANDIDATE / PR #162');
    expect(roadmap).toContain('023G8C1 Match-3 Browser Interaction Parity [P1] — PLANNED');
    expect(roadmap).toContain('023G8C2 Match-3 Completion & Progression Flow [P1] — PLANNED');
    expect(roadmap).toContain('ANM-030B0A2 [P1] — ART-BLOCKED');
    expect(testing).toContain('Playwright is the only browser/E2E automation framework for UPDS');
    expect(testing).toContain('Selenium/WebDriver is not part of the UPDS test stack');
    expect(ai).toContain('Playwright is the sole browser/E2E framework');
    expect(e2eReadme).toContain('Playwright is the only browser/E2E automation framework for UPDS');
    expect(rootPackage).not.toContain('selenium');
    expect(e2ePackage).not.toContain('selenium');
  });

  it('keeps mobile archive names short while preserving manifest authority', () => {
    const pipeline = read('docs/process/GITHUB_PHONE_PIPELINE_RU.md');
    const ai = read('docs/process/AI_DEVELOPMENT_RU.md');
    expect(pipeline).toContain('ANM-<feature>_R<revision>.zip');
    expect(pipeline).toContain('ANM-028B1_R4.1.zip');
    expect(pipeline).toContain('complete title remains in `patch-manifest.json`');
    expect(ai).toContain('ANM-<feature>_R<revision>_FULL.zip');
  });
});
