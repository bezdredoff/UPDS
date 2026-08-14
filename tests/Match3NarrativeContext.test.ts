import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { levels, validateLevelDefinitions } from '../src/data/levels';
import { backgroundAssets, getBackgroundForLine, getScene, sceneMeta, type ChoiceId } from '../src/data/narrative';

const controllerSource = readFileSync(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');
const productionCss = readFileSync(new URL('../src/match3Production.css', import.meta.url), 'utf8');
const engineSource = readFileSync(new URL('../src/engine/Match3Game.ts', import.meta.url), 'utf8');

describe('ANM-025B narrative Match-3 level context', () => {
  it('links every level to the actual environment at the end of its preceding VN scene', () => {
    for (const level of levels) {
      const sourceSceneIndex = sceneMeta.findIndex((scene) => scene.id === level.context.sourceSceneId);
      expect(sourceSceneIndex, `${level.id}: source scene exists`).toBeGreaterThanOrEqual(0);
      for (const choice of ['A', 'B', 'C'] as const satisfies readonly ChoiceId[]) {
        const story = getScene(sourceSceneIndex, choice);
        expect(story.length, `${level.id}/${choice}: source scene is not empty`).toBeGreaterThan(0);
        const finalBackground = getBackgroundForLine(sourceSceneIndex, story.length - 1, story);
        expect(level.context.pageBackground, `${level.id}/${choice}: Match-3 page continues VN environment`).toBe(finalBackground);
      }
      expect(backgroundAssets[level.context.pageBackground], `${level.id}: page background asset exists`).toBeTruthy();
    }
  });

  it('gives page background, local board material and future reaction profile separate data contracts', () => {
    expect(validateLevelDefinitions(levels)).toEqual([]);
    expect(new Set(levels.map((level) => level.context.boardSurface)).size).toBeLessThanOrEqual(levels.length);
    expect(levels[8].context.boardSurface).toBe('service-lanes');
    expect(levels[9].context.boardSurface).toBe('service-lanes');
    expect(new Set(levels.map((level) => level.context.boardFrame)).size).toBeLessThanOrEqual(levels.length);
    expect(levels[10].context.boardFrame).toBe('service-file');
    expect(levels[11].context.boardFrame).toBe('lab-file');
    expect(levels[12].context.boardFrame).toBe('evidence-file');
    expect(new Set(levels.map((level) => level.context.narrativeProfile)).size).toBe(levels.length);
    for (const level of levels) {
      expect(level.context.participants.length).toBeGreaterThan(0);
      expect(level.context.narrativeTags.length).toBeGreaterThan(0);
    }
  });

  it('uses pageBackground for intro, gameplay and evidence while exposing board/profile selectors', () => {
    expect(controllerSource).not.toContain('level.background');
    expect(controllerSource.match(/backgroundAssets\[level\.context\.pageBackground\]/g)?.length).toBe(4);
    expect(controllerSource).toContain('data-m3-board-surface');
    expect(controllerSource).toContain('data-m3-board-frame');
    expect(controllerSource).toContain('data-m3-profile');
    expect(controllerSource).toContain('narrativeProfile: level.context.narrativeProfile');
  });

  it('keeps narrative context out of engine while rendering distinct local board surfaces', () => {
    expect(engineSource).not.toContain('Match3LevelContext');
    expect(engineSource).toContain('this.level.spawnWeights');
    for (const surface of ['locker-bench', 'photo-contact-sheet', 'pool-service-tile', 'ordered-cabinet', 'meeting-grid', 'locker-columns', 'workbench-clusters', 'signal-cross', 'service-lanes']) {
      expect(productionCss).toContain(`data-m3-board-surface='${surface}'`);
    }
    for (const frame of ['evidence-file', 'photo-file', 'wet-service', 'precision-file', 'audit-file', 'service-file', 'workshop-file', 'lab-file', 'warehouse-file', 'maintenance-file']) {
      expect(productionCss).toContain(`data-m3-board-frame='${frame}'`);
    }
  });
});
