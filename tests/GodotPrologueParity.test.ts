import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { godotLockerScene, godotPostMatchScene, godotPrologue, godotStoryScene, godotVnAudio } from './fixtures/godotPrologue';

describe('Godot story source parity', () => {
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

  it('keeps the photo chapter, M3_01 gate, post-match chapter and next port boundary aligned', () => {
    for (const [sceneIndex, path, first, last, nextLevelId, onWinSceneIndex] of [
      [3, 'godot/data/photo_scene.json', 'VN0085', 'VN0113', 'M3_01_PHOTO_PROPS', 4],
      [4, 'godot/data/post_photo_scene.json', 'VN0114', 'VN0142', '', -1],
    ] as const) {
      const source = godotStoryScene(sceneIndex);
      expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual(source);
      expect(source.lines[0]?.id).toBe(first);
      expect(source.lines.at(-1)?.id).toBe(last);
      expect(source.nextLevelId).toBe(nextLevelId);
      expect(source.onWinSceneIndex).toBe(onWinSceneIndex);
      for (const line of source.lines) {
        expect(readFileSync(`godot/${line.background}`).equals(readFileSync(`public/${line.background}`))).toBe(true);
        for (const actor of line.actors) expect(readFileSync(`godot/${actor.asset}`).equals(readFileSync(`public/${actor.asset}`))).toBe(true);
      }
    }
    const bundle = JSON.parse(readFileSync('godot/data/campaign_match3_levels.json', 'utf8'));
    const photoLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_01_PHOTO_PROPS');
    expect(photoLevel.evidence.id).toBe('CUE_002');
    expect(photoLevel.evidence.localized.ru.title).toBeTruthy();
    expect(photoLevel.evidence.localized.be.label).toBeTruthy();
    expect(photoLevel.evidence.localized.en.continueStory).toBeTruthy();
    for (const [sceneIndex, path, first, last, nextLevelId, onWinSceneIndex] of [
      [5, 'godot/data/pool_scene.json', 'VN0143', 'VN0166', 'M3_02_POOL_LAUNDRY', 6],
      [6, 'godot/data/post_pool_scene.json', 'VN0167', 'VN0191', '', -1],
      [7, 'godot/data/ordered_inspection_scene.json', 'VN0192', 'VN0216', 'M3_03_ORDERED_APARTMENT', 8],
      [8, 'godot/data/post_ordered_inspection_scene.json', 'VN0217', 'VN0250', '', -1],
      [9, 'godot/data/emergency_meeting_scene.json', 'VN0251', 'VN0270', 'M3_04_EMERGENCY_MEETING', 10],
      [10, 'godot/data/post_emergency_meeting_scene.json', 'VN0271', 'VN0288', '', -1],
    ] as const) {
      const source = godotStoryScene(sceneIndex);
      expect(JSON.parse(readFileSync(path, 'utf8'))).toEqual(source);
      expect(source.lines[0]?.id).toBe(first);
      expect(source.lines.at(-1)?.id).toBe(last);
      expect(source.nextLevelId).toBe(nextLevelId);
      expect(source.onWinSceneIndex).toBe(onWinSceneIndex);
      for (const line of source.lines) {
        expect(readFileSync(`godot/${line.background}`).equals(readFileSync(`public/${line.background}`))).toBe(true);
        for (const actor of line.actors) expect(readFileSync(`godot/${actor.asset}`).equals(readFileSync(`public/${actor.asset}`))).toBe(true);
      }
    }
    const poolLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_02_POOL_LAUNDRY');
    expect(poolLevel.evidence.id).toBe('CUE_003');
    expect(poolLevel.evidence.localized.ru.title).toBeTruthy();
    expect(poolLevel.evidence.localized.be.label).toBeTruthy();
    expect(poolLevel.evidence.localized.en.continueStory).toBeTruthy();
    const apartmentLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_03_ORDERED_APARTMENT');
    expect(apartmentLevel.evidence.id).toBe('CUE_004');
    expect(apartmentLevel.evidence.localized.ru.title).toBeTruthy();
    expect(apartmentLevel.evidence.localized.be.label).toBeTruthy();
    expect(apartmentLevel.evidence.localized.en.continueStory).toBeTruthy();
    const meetingLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_04_EMERGENCY_MEETING');
    expect(meetingLevel.evidence.id).toBe('CUE_005');
    expect(meetingLevel.evidence.localized.ru.title).toBeTruthy();
    expect(meetingLevel.evidence.localized.be.label).toBeTruthy();
    expect(meetingLevel.evidence.localized.en.continueStory).toBeTruthy();
  });
});
