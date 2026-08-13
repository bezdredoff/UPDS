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
    const buildFeature = BUILD_LABEL.match(/^ANM-\d+[A-Z]?/)?.[0];
    const tick = String.fromCharCode(96);

    expect(readme).toContain('docs/ROADMAP_RU.md');
    expect(readme).toContain('src/appVersion.ts');
    expect(readme).not.toContain('Current build:');
    expect(index).toContain('## Authority order');
    expect(roadmap).toContain('Technical product version: ' + tick + APP_VERSION + tick);
    expect(buildFeature).toBeDefined();
    expect(roadmap).toContain(buildFeature!);
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
    expect(protectedContracts).toContain('Kentaro, Norihiro, Mayu');
    expect(productionContract).toContain('upds-character-production-v2');
    expect(productionContract).toContain('ровно семь обязательных runtime assets');
    for (const source of activeEntryPoints) {
      expect(source).not.toContain('base-neutral + face overlay');
    }
  });

  it('documents the canonical story import and current missing-content boundary', () => {
    const protectedContracts = read('docs/architecture/PROJECT_CONTRACTS_RU.md');
    const architecture = read('docs/architecture/ARCHITECTURE_RU.md');
    const index = read('docs/README.md');

    for (const source of [protectedContracts, architecture]) {
      expect(source).toContain('src/content/story/ANM003.vertical-slice.story.json');
      expect(source).toContain('src/data/storyGraph.ts');
    }
    expect(architecture).toContain('src/content/storyRuntime.ts');
    expect(protectedContracts).toContain('262 authored lines');
    expect(protectedContracts).toContain('VN0250');
    expect(index).toContain('screenplay beyond that slice is not yet');
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
    expect(strategy).toContain('8–10 master-локаций');
    expect(strategy).toContain('5–7 hero clue close-ups');
    expect(strategy).toContain('пакетами по три последовательных эпизода');
    expect(strategy).toContain('runtime face overlay');
    expect(strategy).toContain('нельзя добавлять в `upds-character-production-v2`');
    expect(characterContract).toContain('только к полноценным stage-персонажам');
    expect(characterContract).toContain('Runtime получает только готовые');
    expect(protectedContracts).toContain('22 planned content slots `0–21`');
    expect(protectedContracts).toContain('future guest/witness bust package');
    expect(aiWorkflow).toContain('first post-slice package is `4–6`');
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
    expect(index).toContain('ANM028A_CHARACTER_PRODUCTION_MANIFEST_RU.md');
    expect(index).toContain('ANM027D_FULL_STORY_IMPORT_RU.md');
    expect(index).toContain('ANM026C_MATCH3_CAMPAIGN_MODE_RU.md');
    expect(briefs).toContain('pose_b_arms_crossed.png');
    expect(briefs).not.toContain('pose_b_guarded_athlete.png');
    expect(architecture).toContain('src/features/levelLab/LevelLabController.ts');
    expect(architecture).toContain('src/features/match3Campaign/Match3CampaignController.ts');
    expect(architecture).not.toContain('Status: ANM-023D audited baseline');
  });
});
