import { describe, expect, it } from 'vitest';
import { getBackgroundForLine, getScene, parsedLineCount, sceneMeta, type ChoiceId } from '../src/data/narrative';
import { levels } from '../src/data/levels';
import { storyGraph, storyMatch3RouteForLegacyScene } from '../src/data/storyGraph';

const numeric = (id: string): number => Number(id.slice(2, 6));

describe('narrative integration contract', () => {
  it('parses all canonical sources into forty-five non-empty ordered scenes', () => {
    expect(parsedLineCount).toBe(976);
    expect(sceneMeta).toHaveLength(45);
    for (const choice of ['A', 'B', 'C'] as ChoiceId[]) {
      for (let sceneIndex = 0; sceneIndex < sceneMeta.length; sceneIndex += 1) {
        const scene = getScene(sceneIndex, choice);
        expect(scene.length).toBeGreaterThan(0);
        expect(scene[0].id).toBe(storyGraph.scenes[sceneIndex].source.startLineId);
        expect(scene.at(-1)?.id).toBe(storyGraph.scenes[sceneIndex].source.endLineId);
        for (let index = 1; index < scene.length; index += 1) expect(numeric(scene[index].id)).toBeGreaterThanOrEqual(numeric(scene[index - 1].id));
      }
    }
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('keeps only choice branch %s and preserves the CHOICE_00 checkpoint', (choice) => {
    const scene = getScene(1, choice);
    const checkpoint = scene.findIndex((line) => line.id === 'VN0040');
    expect(checkpoint).toBeGreaterThanOrEqual(0);
    expect(scene[checkpoint + 1]?.id).toBe(`VN0041${choice}`);
    expect(scene.some((line) => /VN0041[ABC]/.test(line.id) && line.id !== `VN0041${choice}`)).toBe(false);
  });

  it('keeps all 22 VN → match → VN transitions mapped through the canonical story graph', () => {
    const routes = storyGraph.scenes.filter((scene) => scene.transition.kind === 'match3').map((scene) => storyMatch3RouteForLegacyScene(scene.legacyIndex));
    expect(routes.map((route) => route?.levelId)).toEqual(levels.map((level) => level.id));
    expect(routes.slice(-3).map((route) => route?.onWinLegacyIndex)).toEqual([40, 42, 44]);
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('switches the mixed-location scene background exactly at VN0048 for branch %s', (choice) => {
    const scene = getScene(1, choice);
    const transition = scene.findIndex((line) => line.id === 'VN0048');
    expect(transition).toBeGreaterThan(0);
    expect(getBackgroundForLine(1, transition - 1, scene)).toBe('clubroom');
    expect(getBackgroundForLine(1, transition, scene)).toBe('lockerAthletics');
  });

  it('preserves the VN0250 bridge and imports all three authored ending boundaries through VN0964', () => {
    expect(getScene(8, 'A').at(-1)?.id).toBe('VN0250');
    expect(getScene(40, 'A').at(-1)?.id).toBe('VN0884');
    expect(getScene(42, 'A').at(-1)?.id).toBe('VN0924');
    expect(getScene(44, 'A').at(-1)?.id).toBe('VN0964');
  });
});
