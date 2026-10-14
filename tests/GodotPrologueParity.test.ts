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
      [11, 'godot/data/basketball_lockers_scene.json', 'VN0289', 'VN0308', 'M3_05_BASKETBALL_LOCKERS', 12],
      [12, 'godot/data/post_basketball_lockers_scene.json', 'VN0309', 'VN0326', '', -1],
      [13, 'godot/data/textile_workshop_scene.json', 'VN0327', 'VN0347', 'M3_06_TEXTILE_WORKSHOP', 14],
      [14, 'godot/data/post_textile_workshop_scene.json', 'VN0348', 'VN0369', '', -1],
      [15, 'godot/data/asterion_lab_scene.json', 'VN0370', 'VN0390', 'M3_07_ASTERION_THREAD', 16],
      [16, 'godot/data/post_asterion_lab_scene.json', 'VN0391', 'VN0409', '', -1],
      [17, 'godot/data/lost_found_scene.json', 'VN0410', 'VN0429', 'M3_08_LOST_FOUND_LEDGER', 18],
      [18, 'godot/data/post_lost_found_scene.json', 'VN0430', 'VN0448', '', -1],
      [19, 'godot/data/maintenance_keys_scene.json', 'VN0449', 'VN0469', 'M3_09_MAINTENANCE_KEYS', 20],
      [20, 'godot/data/post_maintenance_keys_scene.json', 'VN0470', 'VN0488', '', -1],
      [21, 'godot/data/control_sample_gear_scene.json', 'VN0489', 'VN0508', 'M3_10_CONTROL_SAMPLE_GEAR', 22],
      [22, 'godot/data/post_control_sample_gear_scene.json', 'VN0509', 'VN0527', '', -1],
      [23, 'godot/data/asterion_transfer_scene.json', 'VN0528', 'VN0547', 'M3_11_ASTERION_TRANSFER', 24],
      [24, 'godot/data/post_asterion_transfer_scene.json', 'VN0548', 'VN0567', '', -1],
      [25, 'godot/data/second_skin_signal_scene.json', 'VN0568', 'VN0588', 'M3_12_SECOND_SKIN_SIGNAL', 26],
      [26, 'godot/data/post_second_skin_signal_scene.json', 'VN0589', 'VN0607', '', -1],
      [27, 'godot/data/kendo_pilot_list_scene.json', 'VN0608', 'VN0627', 'M3_13_KENDO_PILOT_LIST', 28],
      [28, 'godot/data/post_kendo_pilot_list_scene.json', 'VN0628', 'VN0646', '', -1],
      [29, 'godot/data/kubo_atelier_scene.json', 'VN0647', 'VN0666', 'M3_14_KUBO_ATELIER_LEDGER', 30],
      [30, 'godot/data/post_kubo_atelier_scene.json', 'VN0667', 'VN0686', '', -1],
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
    const basketballLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_05_BASKETBALL_LOCKERS');
    expect(basketballLevel.evidence.id).toBe('CUE_006');
    expect(basketballLevel.evidence.localized.ru.title).toBeTruthy();
    expect(basketballLevel.evidence.localized.be.label).toBeTruthy();
    expect(basketballLevel.evidence.localized.en.continueStory).toBeTruthy();
    const workshopLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_06_TEXTILE_WORKSHOP');
    expect(workshopLevel.evidence.id).toBe('CUE_007');
    expect(workshopLevel.evidence.localized.ru.title).toBeTruthy();
    expect(workshopLevel.evidence.localized.be.label).toBeTruthy();
    expect(workshopLevel.evidence.localized.en.continueStory).toBeTruthy();
    const asterionLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_07_ASTERION_THREAD');
    expect(asterionLevel.evidence.id).toBe('CUE_008');
    expect(asterionLevel.evidence.localized.ru.title).toBeTruthy();
    expect(asterionLevel.evidence.localized.be.label).toBeTruthy();
    expect(asterionLevel.evidence.localized.en.continueStory).toBeTruthy();
    const lostFoundLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_08_LOST_FOUND_LEDGER');
    expect(lostFoundLevel.evidence.id).toBe('CUE_009');
    expect(lostFoundLevel.evidence.localized.ru.title).toBeTruthy();
    expect(lostFoundLevel.evidence.localized.be.label).toBeTruthy();
    expect(lostFoundLevel.evidence.localized.en.continueStory).toBeTruthy();
    const maintenanceLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_09_MAINTENANCE_KEYS');
    expect(maintenanceLevel.evidence.id).toBe('CUE_010');
    expect(maintenanceLevel.evidence.localized.ru.title).toBeTruthy();
    expect(maintenanceLevel.evidence.localized.be.label).toBeTruthy();
    expect(maintenanceLevel.evidence.localized.en.continueStory).toBeTruthy();
    const controlSampleLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_10_CONTROL_SAMPLE_GEAR');
    expect(controlSampleLevel.evidence.id).toBe('CUE_011');
    expect(controlSampleLevel.evidence.localized.ru.title).toBeTruthy();
    expect(controlSampleLevel.evidence.localized.be.label).toBeTruthy();
    expect(controlSampleLevel.evidence.localized.en.continueStory).toBeTruthy();
    const asterionTransferLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_11_ASTERION_TRANSFER');
    expect(asterionTransferLevel.evidence.id).toBe('CUE_012');
    expect(asterionTransferLevel.evidence.localized.ru.title).toBeTruthy();
    expect(asterionTransferLevel.evidence.localized.be.label).toBeTruthy();
    expect(asterionTransferLevel.evidence.localized.en.continueStory).toBeTruthy();
    const secondSkinLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_12_SECOND_SKIN_SIGNAL');
    expect(secondSkinLevel.evidence.id).toBe('CUE_013');
    expect(secondSkinLevel.evidence.localized.ru.title).toBeTruthy();
    expect(secondSkinLevel.evidence.localized.be.label).toBeTruthy();
    expect(secondSkinLevel.evidence.localized.en.continueStory).toBeTruthy();
    const kendoPilotLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_13_KENDO_PILOT_LIST');
    expect(kendoPilotLevel.evidence.id).toBe('CUE_014');
    expect(kendoPilotLevel.evidence.localized.ru.title).toBeTruthy();
    expect(kendoPilotLevel.evidence.localized.be.label).toBeTruthy();
    expect(kendoPilotLevel.evidence.localized.en.continueStory).toBeTruthy();
    const kuboAtelierLevel = bundle.levels.find((level: { id: string }) => level.id === 'M3_14_KUBO_ATELIER_LEDGER');
    expect(kuboAtelierLevel.evidence.id).toBe('CUE_015');
    expect(kuboAtelierLevel.evidence.localized.ru.title).toBeTruthy();
    expect(kuboAtelierLevel.evidence.localized.be.label).toBeTruthy();
    expect(kuboAtelierLevel.evidence.localized.en.continueStory).toBeTruthy();
    for (const [sceneIndex, gateId] of [[9, 'meeting-tone'], [14, 'apology-to-hinata'], [20, 'protect-gen-source'], [24, 'photo-permission'], [26, 'publish-tag'], [30, 'family-ledger-permission']] as const) {
      const gate = godotStoryScene(sceneIndex).choiceGate;
      expect(gate.id).toBe(gateId);
      expect(gate.choices.A.ru.title).toBeTruthy();
      expect(gate.choices.B.be.effect).toBeTruthy();
      expect(gate.choices.C.en.title).toBeTruthy();
    }
  });
});
