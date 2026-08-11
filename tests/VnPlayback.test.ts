import { describe, expect, it } from 'vitest';
import { getReadHistory, getScene } from '../src/data/narrative';
import { autoDelayForLine, nextUnreadIndex } from '../src/ui/vnPlayback';

describe('VN playback semantics', () => {
  it('skips only consecutive read lines and stops at unread content or the choice checkpoint', () => {
    const scene = getScene(1, 'A');
    const start = scene.findIndex((line) => line.id === 'VN0037');
    const checkpoint = scene.findIndex((line) => line.id === 'VN0040');
    const read = scene.slice(start, checkpoint + 1).map((line) => line.id);
    expect(nextUnreadIndex(scene, start, read)).toBe(checkpoint);

    const prologue = getScene(0, 'A');
    expect(nextUnreadIndex(prologue, 0, [prologue[0].id, prologue[1].id])).toBe(2);
    expect(nextUnreadIndex(prologue, 2, [prologue[0].id, prologue[1].id])).toBe(2);
  });

  it('keeps backlog in authored order and resolves only the active branch', () => {
    const history = getReadHistory(['VN0001', 'VN0003', 'VN0041B', 'VN0041A'], 'B');
    expect(history.map((line) => line.id)).toEqual(['VN0001', 'VN0003', 'VN0041B']);
    expect(history.every((line) => !line.speaker.startsWith('{IF'))).toBe(true);
  });

  it('uses deterministic AUTO timing with longer text receiving extra reading time', () => {
    expect(autoDelayForLine('Коротко.', 'fast')).toBeLessThan(autoDelayForLine('Коротко.', 'normal'));
    expect(autoDelayForLine('Коротко.', 'normal')).toBeLessThan(autoDelayForLine('Коротко.', 'slow'));
    expect(autoDelayForLine('Очень длинная реплика '.repeat(12), 'normal')).toBeGreaterThan(autoDelayForLine('Коротко.', 'normal'));
  });
});
