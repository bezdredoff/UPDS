import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getBackgroundForLine, getScene, sceneMeta, type ChoiceId } from '../src/data/narrative';
import { isPreMatchScene, levelForPreMatchScene, postSceneForLevel } from '../src/engine/CampaignStore';

const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');
const starts = ['VN0001', 'VN0023', 'VN0058', 'VN0085', 'VN0114', 'VN0143', 'VN0167', 'VN0192', 'VN0217'];
const ends = ['VN0022', 'VN0057', 'VN0084', 'VN0113', 'VN0142', 'VN0166', 'VN0191', 'VN0216', 'VN0249'];

const numeric = (id: string): number => Number(id.slice(2, 6));

describe('ANM-016 VN presentation and sequence audit', () => {
  it.each(['A', 'B', 'C'] as ChoiceId[])('keeps all nine scenes ordered and inside authored boundaries for branch %s', (choice) => {
    expect(sceneMeta).toHaveLength(9);
    for (let sceneIndex = 0; sceneIndex < sceneMeta.length; sceneIndex += 1) {
      const scene = getScene(sceneIndex, choice);
      expect(scene.length).toBeGreaterThan(0);
      expect(numeric(scene[0].id)).toBe(numeric(starts[sceneIndex]));
      expect(numeric(scene[scene.length - 1].id)).toBe(numeric(ends[sceneIndex]));
      for (let line = 1; line < scene.length; line += 1) {
        expect(numeric(scene[line].id)).toBeGreaterThanOrEqual(numeric(scene[line - 1].id));
      }
    }
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('preserves CHOICE_00 checkpoint and branch entry for branch %s', (choice) => {
    const scene = getScene(1, choice);
    const checkpoint = scene.findIndex((line) => line.id === 'VN0040');
    expect(checkpoint).toBeGreaterThanOrEqual(0);
    expect(scene[checkpoint + 1]?.id).toBe(`VN0041${choice}`);
  });

  it('keeps the four VN → match → VN transitions mapped to the intended scene pairs', () => {
    for (const preScene of [1, 3, 5, 7]) {
      expect(isPreMatchScene(preScene)).toBe(true);
      const level = levelForPreMatchScene(preScene);
      expect(level).toBe(Math.floor(preScene / 2));
      expect(postSceneForLevel(level)).toBe(preScene + 1);
    }
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('changes the mixed-location scene background exactly at VN0048 for branch %s', (choice) => {
    const scene = getScene(1, choice);
    const transition = scene.findIndex((line) => line.id === 'VN0048');
    const before = transition - 1;
    expect(transition).toBeGreaterThan(0);
    expect(getBackgroundForLine(1, before, scene)).toBe('clubroom');
    expect(getBackgroundForLine(1, transition, scene)).toBe('lockerAthletics');
  });

  it('uses a stable four-row VN shell, close-up bottom-anchored portraits and contain-over-fill backgrounds', () => {
    expect(style).toContain('grid-template-rows: auto minmax(0, 1fr) clamp(154px, 22dvh, 198px) auto');
    expect(style).toContain('.vn-background-fit { object-fit: contain');
    expect(style).toContain('.vn-background-fill { object-fit: cover');
    expect(style).toContain('bottom: -78%;\n  height: 178%;');
    expect(style).toContain('.portrait-left { left: 29%; }');
    expect(style).toContain('.portrait-right { left: 71%; }');
    expect(style).toContain('.portrait-center { left: 50%; }');
    expect(style).toContain('.dialogue-text { position: relative; z-index: 1; flex: 1 1 auto; min-height: 0;');
    expect(appSource).toContain('vn-background-stack');
  });
});
