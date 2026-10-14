import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { godotLockerScene, godotPostMatchScene, godotPrologue, godotVnAudio } from './fixtures/godotPrologue';

describe('Godot prologue source parity', () => {
  const source = godotPrologue();
  it('keeps canonical lines, locales and authored staging aligned with the web runtime', () => {
    expect(JSON.parse(readFileSync('godot/data/prologue.json', 'utf8'))).toEqual(source);
  });
  it('ships byte-identical approved art and the original VN music/cue definitions', () => {
    const assets = new Set([source.background, ...source.lines.flatMap((line) => line.actors.map((actor) => actor.asset))]);
    for (const asset of assets) expect(readFileSync(`godot/${asset}`).equals(readFileSync(`public/${asset}`))).toBe(true);
    const audio = JSON.parse(readFileSync('godot/data/menu_audio.json', 'utf8'));
    expect({ vn: audio.vn, vnAdvance: audio.vnAdvance, choice: audio.choice }).toEqual(godotVnAudio());
  });
  it('keeps scene 1, all CHOICE_00 variants, localized choice copy and first Match-3 gate source aligned', () => {
    const source = godotLockerScene();
    expect(JSON.parse(readFileSync('godot/data/locker_scene.json', 'utf8'))).toEqual(source);
    expect(source.nextLevelId).toBe('M3_00_LOCKER_TUTORIAL');
    expect(Object.keys(source.variants)).toEqual(['A', 'B', 'C']);
    for (const option of ['A', 'B', 'C']) {
      expect(source.variants[option].some((line) => line.id === `VN0041${option}`)).toBe(true);
      expect(source.variants[option].at(-1)?.id).toBe('VN0057');
      for (const line of source.variants[option]) {
        expect(readFileSync(`godot/${line.background}`).equals(readFileSync(`public/${line.background}`))).toBe(true);
        for (const actor of line.actors) expect(readFileSync(`godot/${actor.asset}`).equals(readFileSync(`public/${actor.asset}`))).toBe(true);
      }
    }
  });
  it('keeps the first post-match scene VN0058–VN0084 and its original art aligned', () => {
    const source = godotPostMatchScene();
    expect(JSON.parse(readFileSync('godot/data/post_match_scene.json', 'utf8'))).toEqual(source);
    expect(source.sceneId).toBe('VN_SCENE_02_E0_POST');
    expect(source.lines[0]?.id).toBe('VN0058');
    expect(source.lines.some((line) => line.id === 'VN0059')).toBe(true);
    expect(source.lines.at(-1)?.id).toBe('VN0084');
    for (const line of source.lines) {
      expect(readFileSync(`godot/${line.background}`).equals(readFileSync(`public/${line.background}`))).toBe(true);
      for (const actor of line.actors) expect(readFileSync(`godot/${actor.asset}`).equals(readFileSync(`public/${actor.asset}`))).toBe(true);
    }
  });
});
