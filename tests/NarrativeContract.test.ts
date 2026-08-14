import { describe, expect, it } from 'vitest';
import { getBackgroundForLine, getScene, parsedLineCount, sceneMeta, type ChoiceId } from '../src/data/narrative';
import { storyGraph, storyMatch3RouteForLegacyScene } from '../src/data/storyGraph';

const numeric = (id: string): number => Number(id.slice(2, 6));

describe('narrative integration contract', () => {
  it('parses all canonical sources into twenty-one non-empty ordered scenes', () => {
    expect(parsedLineCount).toBe(500);
    expect(sceneMeta).toHaveLength(21);
    for (const choice of ['A', 'B', 'C'] as ChoiceId[]) {
      for (let sceneIndex = 0; sceneIndex < sceneMeta.length; sceneIndex += 1) {
        const scene = getScene(sceneIndex, choice);
        expect(scene.length).toBeGreaterThan(0);
        expect(scene[0].id).toBe(storyGraph.scenes[sceneIndex].source.startLineId);
        expect(scene.at(-1)?.id).toBe(storyGraph.scenes[sceneIndex].source.endLineId);
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

  it('keeps all VN → match → VN transitions mapped through the canonical story graph', () => {
    const routes = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19].map((preScene) => storyMatch3RouteForLegacyScene(preScene));
    expect(routes.map((route) => route?.levelId)).toEqual([
      'M3_00_LOCKER_TUTORIAL',
      'M3_01_PHOTO_PROPS',
      'M3_02_POOL_LAUNDRY',
      'M3_03_ORDERED_APARTMENT',
      'M3_04_EMERGENCY_MEETING',
      'M3_05_BASKETBALL_LOCKERS',
      'M3_06_TEXTILE_WORKSHOP',
      'M3_07_ASTERION_THREAD',
      'M3_08_LOST_FOUND_LEDGER',
      'M3_09_MAINTENANCE_KEYS',
    ]);
    expect(routes.map((route) => route?.onWinLegacyIndex)).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20]);
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('switches the mixed-location scene background exactly at VN0048 for branch %s', (choice) => {
    const scene = getScene(1, choice);
    const transition = scene.findIndex((line) => line.id === 'VN0048');
    expect(transition).toBeGreaterThan(0);
    expect(getBackgroundForLine(1, transition - 1, scene)).toBe('clubroom');
    expect(getBackgroundForLine(1, transition, scene)).toBe('lockerAthletics');
  });

  it('preserves the VN0250 bridge and reaches the current authored frontier at VN0488', () => {
    const bridge = getScene(8, 'A');
    expect(bridge.at(-1)?.id).toBe('VN0250');
    const frontier = getScene(20, 'A');
    expect(frontier.at(-1)?.id).toBe('VN0488');
  });
});
