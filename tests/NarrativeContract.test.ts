import { describe, expect, it } from 'vitest';
import { getScene, parsedLineCount, sceneMeta, type ChoiceId } from '../src/data/narrative';

describe('ANM-003 narrative integration', () => {
  it('parses all authored rows into nine non-empty scenes', () => {
    expect(parsedLineCount).toBe(262);
    expect(sceneMeta).toHaveLength(9);
    for (let index = 0; index < sceneMeta.length; index += 1) expect(getScene(index)).not.toHaveLength(0);
  });

  it.each(['A', 'B', 'C'] as ChoiceId[])('keeps only choice branch %s and removes IF directives', (choice) => {
    const scene = getScene(1, choice);
    expect(scene.some((line) => line.id === `VN0041${choice}`)).toBe(true);
    expect(scene.some((line) => /VN0041[ABC]/.test(line.id) && line.id !== `VN0041${choice}`)).toBe(false);
    expect(scene.every((line) => !line.speaker.startsWith('{IF'))).toBe(true);
  });
});
