import { describe, expect, it } from 'vitest';
import { getBackgroundForLine, getScene, parsedLineCount, sceneMeta, type ChoiceId } from '../src/data/narrative';
import { storyMatch3RouteForLegacyScene } from '../src/data/storyGraph';

const starts = ['VN0001', 'VN0023', 'VN0058', 'VN0085', 'VN0114', 'VN0143', 'VN0167', 'VN0192', 'VN0217'];
const ends = ['VN0022', 'VN0057', 'VN0084', 'VN0113', 'VN0142', 'VN0166', 'VN0191', 'VN0216', 'VN0249'];
const numeric = (id: string): number => Number(id.slice(2, 6));

describe('narrative integration contract', () => {
  it('parses 262 authored rows into nine non-empty ordered scenes', () => {
    expect(parsedLineCount).toBe(262);
    expect(sceneMeta).toHaveLength(9);
    for (const choice of ['A', 'B', 'C'] as ChoiceId[]) {
      for (let sceneIndex = 0; sceneIndex < sceneMeta.length; sceneIndex += 1) {
        const scene = getScene(sceneIndex, choice);
        expect(scene.length).toBeGreaterThan(0);
        expect(scene[0].id).toBe(starts[sceneIndex]);
        expect(scene.at(-1)?.id).toBe(ends[sceneIndex]);
        for (let index = 1; index < scene.length; index += 1) {
          expect(numeric(scene[index].id)).toBeGreaterThanOrEqual(numeric(scene[index - 1].id));
        }
      }
    }
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('keeps only choice branch %s and preserves the CHOICE_00 checkpoint', (choice) => {
    const scene = getScene(1, choice);
    const checkpoint = scene.findIndex((line) => line.id === 'VN0040');
    expect(checkpoint).toBeGreaterThanOrEqual(0);
    expect(scene[checkpoint + 1]?.id).toBe(`VN0041${choice}`);
    expect(scene.some((line) => /VN0041[ABC]/.test(line.id) && line.id !== `VN0041${choice}`)).toBe(false);
    expect(scene.every((line) => !line.speaker.startsWith('{IF'))).toBe(true);
  });

  it('keeps the four VN → match → VN transitions mapped through the canonical story graph', () => {
    const routes = [1, 3, 5, 7].map((preScene) => storyMatch3RouteForLegacyScene(preScene));
    expect(routes.map((route) => route?.levelId)).toEqual([
      'M3_00_LOCKER_TUTORIAL',
      'M3_01_PHOTO_PROPS',
      'M3_02_POOL_LAUNDRY',
      'M3_03_ORDERED_APARTMENT',
    ]);
    expect(routes.map((route) => route?.onWinLegacyIndex)).toEqual([2, 4, 6, 8]);
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('switches the mixed-location scene background exactly at VN0048 for branch %s', (choice) => {
    const scene = getScene(1, choice);
    const transition = scene.findIndex((line) => line.id === 'VN0048');
    expect(transition).toBeGreaterThan(0);
    expect(getBackgroundForLine(1, transition - 1, scene)).toBe('clubroom');
    expect(getBackgroundForLine(1, transition, scene)).toBe('lockerAthletics');
  });

  it('ends the playable finale at VN0249 and does not runtime-include optional teaser VN0250', () => {
    const finale = getScene(8, 'A');
    expect(finale.at(-1)?.id).toBe('VN0249');
    expect(finale.some((line) => line.id === 'VN0250')).toBe(false);
  });
});
