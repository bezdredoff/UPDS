import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { getReadHistory, getScene } from '../src/data/narrative';
import { autoDelayForLine, nextUnreadIndex } from '../src/ui/vnPlayback';

const appSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');
const style = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8');
const screenplay = readFileSync(new URL('../src/content/ANM-003_Vertical_Slice_Screenplay.md', import.meta.url), 'utf8');

describe('ANM-013 VN pre-release contract', () => {
  it('runs the authored finale through VN0249 while keeping VN0250 as an optional teaser', () => {
    const finale = getScene(8, 'A');
    expect(finale.at(-1)?.id).toBe('VN0249');
    expect(finale.some((line) => line.id === 'VN0246')).toBe(true);
    expect(finale.some((line) => line.id === 'VN0247')).toBe(true);
    expect(finale.some((line) => line.id === 'VN0248')).toBe(true);
    expect(finale.some((line) => line.id === 'VN0249')).toBe(true);
    expect(finale.some((line) => line.id === 'VN0250')).toBe(false);
    expect(screenplay).toContain('[VN0250]');
  });

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

  it('keeps backlog in authored order and resolves only the active choice branch', () => {
    const read = ['VN0001', 'VN0003', 'VN0041B', 'VN0041A'];
    const history = getReadHistory(read, 'B');
    expect(history.map((line) => line.id)).toEqual(['VN0001', 'VN0003', 'VN0041B']);
    expect(history.every((line) => !line.speaker.startsWith('{IF'))).toBe(true);
  });

  it('uses deterministic AUTO timing with longer text receiving extra reading time', () => {
    expect(autoDelayForLine('Коротко.', 'fast')).toBeLessThan(autoDelayForLine('Коротко.', 'normal'));
    expect(autoDelayForLine('Коротко.', 'normal')).toBeLessThan(autoDelayForLine('Коротко.', 'slow'));
    expect(autoDelayForLine('Очень длинная реплика '.repeat(12), 'normal')).toBeGreaterThan(autoDelayForLine('Коротко.', 'normal'));
  });

  it('ships the golden-sample control hierarchy without embedding the golden sample itself', () => {
    expect(appSource).toContain('vn-case-pill');
    expect(appSource).toContain('>LOG<');
    expect(appSource).toContain('>MENU<');
    expect(appSource).toContain('>SKIP<');
    expect(appSource).toContain('>AUTO<');
    expect(appSource).toContain('>SAVE<');
    expect(appSource).toContain('>LOAD<');
    expect(appSource).toContain('>CONFIG<');
    expect(style).toContain('.vn-controls');
    expect(style).toContain('.vn-case-pill');
    expect(style).toContain('.dialogue-progress');
    expect(style).toContain('#f3e8d2');
    expect(appSource).not.toContain('Golden_Sample');
  });
});
