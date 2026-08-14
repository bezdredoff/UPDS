import { levels } from './levels';
import type { StoryChoiceGateId, StoryChoiceOptionId, StoryChoiceSelections } from './storyChoices';

export const storyEpisodeIds = ['EP001_CASE_001'] as const;
export type StoryEpisodeId = (typeof storyEpisodeIds)[number];

export const storyChapterIds = [
  'CH001_PROLOGUE',
  'CH002_LOCKER_SEARCH',
  'CH003_PHOTO_ALIBI',
  'CH004_POOL_LAUNDRY',
  'CH005_ORDERED_INSPECTION',
  'CH006_EMERGENCY_MEETING',
  'CH007_BASKETBALL_SCREEN',
  'CH008_TEXTILE_WORKSHOP',
  'CH009_ASTERION_EXPLANATION',
  'CH010_LOST_FOUND',
  'CH011_MAINTENANCE_KEYS',
  'CH012_CONTROL_SAMPLE_GEAR',
  'CH013_ASTERION_TRANSFER',
  'CH014_SECOND_SKIN_SIGNAL',
  'CH015_KENDO_PILOT_LIST',
  'CH016_KUBO_ATELIER',
  'CH017_ABANDONED_LAUNDRY',
  'CH018_GYMNASTICS_SCAN',
  'CH019_RINA_ARCHIVE',
  'CH020_FINAL_STRATEGY',
  'CH021_ENDING_B_CASE_CLOSED',
  'CH022_ENDING_A_FULL_TRUTH',
  'CH023_ENDING_C_PERFECT_SUSPECT',
] as const;
export type StoryChapterId = (typeof storyChapterIds)[number];

export const storySceneIds = [
  'VN_SCENE_00_PROLOGUE',
  'VN_SCENE_01_E0_PRE',
  'VN_SCENE_02_E0_POST',
  'VN_SCENE_03_E1_PRE',
  'VN_SCENE_04_E1_POST',
  'VN_SCENE_05_E2_PRE',
  'VN_SCENE_06_E2_POST',
  'VN_SCENE_07_E3_PRE',
  'VN_SCENE_08_E3_POST',
  'VN_SCENE_09_E4_PRE',
  'VN_SCENE_10_E4_POST',
  'VN_SCENE_11_E5_PRE',
  'VN_SCENE_12_E5_POST',
  'VN_SCENE_13_E6_PRE',
  'VN_SCENE_14_E6_POST',
  'VN_SCENE_15_E7_PRE',
  'VN_SCENE_16_E7_POST',
  'VN_SCENE_17_E8_PRE',
  'VN_SCENE_18_E8_POST',
  'VN_SCENE_19_E9_PRE',
  'VN_SCENE_20_E9_POST',
  'VN_SCENE_21_E10_PRE',
  'VN_SCENE_22_E10_POST',
  'VN_SCENE_23_E11_PRE',
  'VN_SCENE_24_E11_POST',
  'VN_SCENE_25_E12_PRE',
  'VN_SCENE_26_E12_POST',
  'VN_SCENE_27_E13_PRE',
  'VN_SCENE_28_E13_POST',
  'VN_SCENE_29_E14_PRE',
  'VN_SCENE_30_E14_POST',
  'VN_SCENE_31_E15_PRE',
  'VN_SCENE_32_E15_POST',
  'VN_SCENE_33_E16_PRE',
  'VN_SCENE_34_E16_POST',
  'VN_SCENE_35_E17_PRE',
  'VN_SCENE_36_E17_POST',
  'VN_SCENE_37_E18_PRE',
  'VN_SCENE_38_E18_POST',
  'VN_SCENE_39_E19_PRE',
  'VN_SCENE_40_E19_POST',
  'VN_SCENE_41_E20_PRE',
  'VN_SCENE_42_E20_POST',
  'VN_SCENE_43_E21_PRE',
  'VN_SCENE_44_E21_POST',
] as const;
export type StorySceneId = (typeof storySceneIds)[number];

export const storyEndingIds = ['ENDING_A_FULL_TRUTH', 'ENDING_B_CASE_CLOSED', 'ENDING_C_PERFECT_SUSPECT'] as const;
export type StoryEndingId = (typeof storyEndingIds)[number];

export type StoryEndingRequirement = Readonly<{ evidence: number; teamTrust: number; sourceTrust: number }>;
export type StorySourceRange = Readonly<{ format: 'screenplay-range-v1'; startLineId: string; endLineId: string }>;
export type StoryTransition =
  | Readonly<{ kind: 'scene'; targetSceneId: StorySceneId }>
  | Readonly<{ kind: 'match3'; levelId: string; onWinSceneId: StorySceneId }>
  | Readonly<{ kind: 'branch'; gateId: StoryChoiceGateId; routes: Readonly<Record<StoryChoiceOptionId, StorySceneId>> }>
  | Readonly<{ kind: 'ending'; endingId: StoryEndingId; fallbackEndingId?: StoryEndingId; successRequirement?: StoryEndingRequirement }>;
export type StorySceneDefinition = Readonly<{ id: StorySceneId; episodeId: StoryEpisodeId; chapterId: StoryChapterId; legacyIndex: number; source: StorySourceRange; transition: StoryTransition }>;
export type StoryChapterDefinition = Readonly<{ id: StoryChapterId; episodeId: StoryEpisodeId; order: number; sceneIds: readonly StorySceneId[] }>;
export type StoryEpisodeDefinition = Readonly<{ id: StoryEpisodeId; order: number; chapterIds: readonly StoryChapterId[] }>;
export type StoryGraph = Readonly<{ format: 'upds-story-graph-v1'; entrySceneId: StorySceneId; episodes: readonly StoryEpisodeDefinition[]; chapters: readonly StoryChapterDefinition[]; scenes: readonly StorySceneDefinition[] }>;

export const storyGraph: StoryGraph = {
  format: 'upds-story-graph-v1',
  entrySceneId: 'VN_SCENE_00_PROLOGUE',
  episodes: [{ id: 'EP001_CASE_001', order: 0, chapterIds: [...storyChapterIds] }],
  chapters: [
    { id: 'CH001_PROLOGUE', episodeId: 'EP001_CASE_001', order: 0, sceneIds: ['VN_SCENE_00_PROLOGUE'] },
    { id: 'CH002_LOCKER_SEARCH', episodeId: 'EP001_CASE_001', order: 1, sceneIds: ['VN_SCENE_01_E0_PRE','VN_SCENE_02_E0_POST'] },
    { id: 'CH003_PHOTO_ALIBI', episodeId: 'EP001_CASE_001', order: 2, sceneIds: ['VN_SCENE_03_E1_PRE','VN_SCENE_04_E1_POST'] },
    { id: 'CH004_POOL_LAUNDRY', episodeId: 'EP001_CASE_001', order: 3, sceneIds: ['VN_SCENE_05_E2_PRE','VN_SCENE_06_E2_POST'] },
    { id: 'CH005_ORDERED_INSPECTION', episodeId: 'EP001_CASE_001', order: 4, sceneIds: ['VN_SCENE_07_E3_PRE','VN_SCENE_08_E3_POST'] },
    { id: 'CH006_EMERGENCY_MEETING', episodeId: 'EP001_CASE_001', order: 5, sceneIds: ['VN_SCENE_09_E4_PRE','VN_SCENE_10_E4_POST'] },
    { id: 'CH007_BASKETBALL_SCREEN', episodeId: 'EP001_CASE_001', order: 6, sceneIds: ['VN_SCENE_11_E5_PRE','VN_SCENE_12_E5_POST'] },
    { id: 'CH008_TEXTILE_WORKSHOP', episodeId: 'EP001_CASE_001', order: 7, sceneIds: ['VN_SCENE_13_E6_PRE','VN_SCENE_14_E6_POST'] },
    { id: 'CH009_ASTERION_EXPLANATION', episodeId: 'EP001_CASE_001', order: 8, sceneIds: ['VN_SCENE_15_E7_PRE','VN_SCENE_16_E7_POST'] },
    { id: 'CH010_LOST_FOUND', episodeId: 'EP001_CASE_001', order: 9, sceneIds: ['VN_SCENE_17_E8_PRE','VN_SCENE_18_E8_POST'] },
    { id: 'CH011_MAINTENANCE_KEYS', episodeId: 'EP001_CASE_001', order: 10, sceneIds: ['VN_SCENE_19_E9_PRE','VN_SCENE_20_E9_POST'] },
    { id: 'CH012_CONTROL_SAMPLE_GEAR', episodeId: 'EP001_CASE_001', order: 11, sceneIds: ['VN_SCENE_21_E10_PRE','VN_SCENE_22_E10_POST'] },
    { id: 'CH013_ASTERION_TRANSFER', episodeId: 'EP001_CASE_001', order: 12, sceneIds: ['VN_SCENE_23_E11_PRE','VN_SCENE_24_E11_POST'] },
    { id: 'CH014_SECOND_SKIN_SIGNAL', episodeId: 'EP001_CASE_001', order: 13, sceneIds: ['VN_SCENE_25_E12_PRE','VN_SCENE_26_E12_POST'] },
    { id: 'CH015_KENDO_PILOT_LIST', episodeId: 'EP001_CASE_001', order: 14, sceneIds: ['VN_SCENE_27_E13_PRE','VN_SCENE_28_E13_POST'] },
    { id: 'CH016_KUBO_ATELIER', episodeId: 'EP001_CASE_001', order: 15, sceneIds: ['VN_SCENE_29_E14_PRE','VN_SCENE_30_E14_POST'] },
    { id: 'CH017_ABANDONED_LAUNDRY', episodeId: 'EP001_CASE_001', order: 16, sceneIds: ['VN_SCENE_31_E15_PRE','VN_SCENE_32_E15_POST'] },
    { id: 'CH018_GYMNASTICS_SCAN', episodeId: 'EP001_CASE_001', order: 17, sceneIds: ['VN_SCENE_33_E16_PRE','VN_SCENE_34_E16_POST'] },
    { id: 'CH019_RINA_ARCHIVE', episodeId: 'EP001_CASE_001', order: 18, sceneIds: ['VN_SCENE_35_E17_PRE','VN_SCENE_36_E17_POST'] },
    { id: 'CH020_FINAL_STRATEGY', episodeId: 'EP001_CASE_001', order: 19, sceneIds: ['VN_SCENE_37_E18_PRE','VN_SCENE_38_E18_POST'] },
    { id: 'CH021_ENDING_B_CASE_CLOSED', episodeId: 'EP001_CASE_001', order: 20, sceneIds: ['VN_SCENE_39_E19_PRE','VN_SCENE_40_E19_POST'] },
    { id: 'CH022_ENDING_A_FULL_TRUTH', episodeId: 'EP001_CASE_001', order: 21, sceneIds: ['VN_SCENE_41_E20_PRE','VN_SCENE_42_E20_POST'] },
    { id: 'CH023_ENDING_C_PERFECT_SUSPECT', episodeId: 'EP001_CASE_001', order: 22, sceneIds: ['VN_SCENE_43_E21_PRE','VN_SCENE_44_E21_POST'] },
  ],
  scenes: [
    { id:'VN_SCENE_00_PROLOGUE', episodeId:'EP001_CASE_001', chapterId:'CH001_PROLOGUE', legacyIndex:0, source:{format:'screenplay-range-v1',startLineId:'VN0001',endLineId:'VN0022'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_01_E0_PRE'} },
    { id:'VN_SCENE_01_E0_PRE', episodeId:'EP001_CASE_001', chapterId:'CH002_LOCKER_SEARCH', legacyIndex:1, source:{format:'screenplay-range-v1',startLineId:'VN0023',endLineId:'VN0057'}, transition:{kind:'match3',levelId:'M3_00_LOCKER_TUTORIAL',onWinSceneId:'VN_SCENE_02_E0_POST'} },
    { id:'VN_SCENE_02_E0_POST', episodeId:'EP001_CASE_001', chapterId:'CH002_LOCKER_SEARCH', legacyIndex:2, source:{format:'screenplay-range-v1',startLineId:'VN0058',endLineId:'VN0084'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_03_E1_PRE'} },
    { id:'VN_SCENE_03_E1_PRE', episodeId:'EP001_CASE_001', chapterId:'CH003_PHOTO_ALIBI', legacyIndex:3, source:{format:'screenplay-range-v1',startLineId:'VN0085',endLineId:'VN0113'}, transition:{kind:'match3',levelId:'M3_01_PHOTO_PROPS',onWinSceneId:'VN_SCENE_04_E1_POST'} },
    { id:'VN_SCENE_04_E1_POST', episodeId:'EP001_CASE_001', chapterId:'CH003_PHOTO_ALIBI', legacyIndex:4, source:{format:'screenplay-range-v1',startLineId:'VN0114',endLineId:'VN0142'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_05_E2_PRE'} },
    { id:'VN_SCENE_05_E2_PRE', episodeId:'EP001_CASE_001', chapterId:'CH004_POOL_LAUNDRY', legacyIndex:5, source:{format:'screenplay-range-v1',startLineId:'VN0143',endLineId:'VN0166'}, transition:{kind:'match3',levelId:'M3_02_POOL_LAUNDRY',onWinSceneId:'VN_SCENE_06_E2_POST'} },
    { id:'VN_SCENE_06_E2_POST', episodeId:'EP001_CASE_001', chapterId:'CH004_POOL_LAUNDRY', legacyIndex:6, source:{format:'screenplay-range-v1',startLineId:'VN0167',endLineId:'VN0191'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_07_E3_PRE'} },
    { id:'VN_SCENE_07_E3_PRE', episodeId:'EP001_CASE_001', chapterId:'CH005_ORDERED_INSPECTION', legacyIndex:7, source:{format:'screenplay-range-v1',startLineId:'VN0192',endLineId:'VN0216'}, transition:{kind:'match3',levelId:'M3_03_ORDERED_APARTMENT',onWinSceneId:'VN_SCENE_08_E3_POST'} },
    { id:'VN_SCENE_08_E3_POST', episodeId:'EP001_CASE_001', chapterId:'CH005_ORDERED_INSPECTION', legacyIndex:8, source:{format:'screenplay-range-v1',startLineId:'VN0217',endLineId:'VN0250'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_09_E4_PRE'} },
    { id:'VN_SCENE_09_E4_PRE', episodeId:'EP001_CASE_001', chapterId:'CH006_EMERGENCY_MEETING', legacyIndex:9, source:{format:'screenplay-range-v1',startLineId:'VN0251',endLineId:'VN0270'}, transition:{kind:'match3',levelId:'M3_04_EMERGENCY_MEETING',onWinSceneId:'VN_SCENE_10_E4_POST'} },
    { id:'VN_SCENE_10_E4_POST', episodeId:'EP001_CASE_001', chapterId:'CH006_EMERGENCY_MEETING', legacyIndex:10, source:{format:'screenplay-range-v1',startLineId:'VN0271',endLineId:'VN0288'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_11_E5_PRE'} },
    { id:'VN_SCENE_11_E5_PRE', episodeId:'EP001_CASE_001', chapterId:'CH007_BASKETBALL_SCREEN', legacyIndex:11, source:{format:'screenplay-range-v1',startLineId:'VN0289',endLineId:'VN0308'}, transition:{kind:'match3',levelId:'M3_05_BASKETBALL_LOCKERS',onWinSceneId:'VN_SCENE_12_E5_POST'} },
    { id:'VN_SCENE_12_E5_POST', episodeId:'EP001_CASE_001', chapterId:'CH007_BASKETBALL_SCREEN', legacyIndex:12, source:{format:'screenplay-range-v1',startLineId:'VN0309',endLineId:'VN0326'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_13_E6_PRE'} },
    { id:'VN_SCENE_13_E6_PRE', episodeId:'EP001_CASE_001', chapterId:'CH008_TEXTILE_WORKSHOP', legacyIndex:13, source:{format:'screenplay-range-v1',startLineId:'VN0327',endLineId:'VN0347'}, transition:{kind:'match3',levelId:'M3_06_TEXTILE_WORKSHOP',onWinSceneId:'VN_SCENE_14_E6_POST'} },
    { id:'VN_SCENE_14_E6_POST', episodeId:'EP001_CASE_001', chapterId:'CH008_TEXTILE_WORKSHOP', legacyIndex:14, source:{format:'screenplay-range-v1',startLineId:'VN0348',endLineId:'VN0369'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_15_E7_PRE'} },
    { id:'VN_SCENE_15_E7_PRE', episodeId:'EP001_CASE_001', chapterId:'CH009_ASTERION_EXPLANATION', legacyIndex:15, source:{format:'screenplay-range-v1',startLineId:'VN0370',endLineId:'VN0390'}, transition:{kind:'match3',levelId:'M3_07_ASTERION_THREAD',onWinSceneId:'VN_SCENE_16_E7_POST'} },
    { id:'VN_SCENE_16_E7_POST', episodeId:'EP001_CASE_001', chapterId:'CH009_ASTERION_EXPLANATION', legacyIndex:16, source:{format:'screenplay-range-v1',startLineId:'VN0391',endLineId:'VN0409'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_17_E8_PRE'} },
    { id:'VN_SCENE_17_E8_PRE', episodeId:'EP001_CASE_001', chapterId:'CH010_LOST_FOUND', legacyIndex:17, source:{format:'screenplay-range-v1',startLineId:'VN0410',endLineId:'VN0429'}, transition:{kind:'match3',levelId:'M3_08_LOST_FOUND_LEDGER',onWinSceneId:'VN_SCENE_18_E8_POST'} },
    { id:'VN_SCENE_18_E8_POST', episodeId:'EP001_CASE_001', chapterId:'CH010_LOST_FOUND', legacyIndex:18, source:{format:'screenplay-range-v1',startLineId:'VN0430',endLineId:'VN0448'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_19_E9_PRE'} },
    { id:'VN_SCENE_19_E9_PRE', episodeId:'EP001_CASE_001', chapterId:'CH011_MAINTENANCE_KEYS', legacyIndex:19, source:{format:'screenplay-range-v1',startLineId:'VN0449',endLineId:'VN0469'}, transition:{kind:'match3',levelId:'M3_09_MAINTENANCE_KEYS',onWinSceneId:'VN_SCENE_20_E9_POST'} },
    { id:'VN_SCENE_20_E9_POST', episodeId:'EP001_CASE_001', chapterId:'CH011_MAINTENANCE_KEYS', legacyIndex:20, source:{format:'screenplay-range-v1',startLineId:'VN0470',endLineId:'VN0488'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_21_E10_PRE'} },
    { id:'VN_SCENE_21_E10_PRE', episodeId:'EP001_CASE_001', chapterId:'CH012_CONTROL_SAMPLE_GEAR', legacyIndex:21, source:{format:'screenplay-range-v1',startLineId:'VN0489',endLineId:'VN0508'}, transition:{kind:'match3',levelId:'M3_10_CONTROL_SAMPLE_GEAR',onWinSceneId:'VN_SCENE_22_E10_POST'} },
    { id:'VN_SCENE_22_E10_POST', episodeId:'EP001_CASE_001', chapterId:'CH012_CONTROL_SAMPLE_GEAR', legacyIndex:22, source:{format:'screenplay-range-v1',startLineId:'VN0509',endLineId:'VN0527'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_23_E11_PRE'} },
    { id:'VN_SCENE_23_E11_PRE', episodeId:'EP001_CASE_001', chapterId:'CH013_ASTERION_TRANSFER', legacyIndex:23, source:{format:'screenplay-range-v1',startLineId:'VN0528',endLineId:'VN0547'}, transition:{kind:'match3',levelId:'M3_11_ASTERION_TRANSFER',onWinSceneId:'VN_SCENE_24_E11_POST'} },
    { id:'VN_SCENE_24_E11_POST', episodeId:'EP001_CASE_001', chapterId:'CH013_ASTERION_TRANSFER', legacyIndex:24, source:{format:'screenplay-range-v1',startLineId:'VN0548',endLineId:'VN0567'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_25_E12_PRE'} },
    { id:'VN_SCENE_25_E12_PRE', episodeId:'EP001_CASE_001', chapterId:'CH014_SECOND_SKIN_SIGNAL', legacyIndex:25, source:{format:'screenplay-range-v1',startLineId:'VN0568',endLineId:'VN0588'}, transition:{kind:'match3',levelId:'M3_12_SECOND_SKIN_SIGNAL',onWinSceneId:'VN_SCENE_26_E12_POST'} },
    { id:'VN_SCENE_26_E12_POST', episodeId:'EP001_CASE_001', chapterId:'CH014_SECOND_SKIN_SIGNAL', legacyIndex:26, source:{format:'screenplay-range-v1',startLineId:'VN0589',endLineId:'VN0607'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_27_E13_PRE'} },
    { id:'VN_SCENE_27_E13_PRE', episodeId:'EP001_CASE_001', chapterId:'CH015_KENDO_PILOT_LIST', legacyIndex:27, source:{format:'screenplay-range-v1',startLineId:'VN0608',endLineId:'VN0627'}, transition:{kind:'match3',levelId:'M3_13_KENDO_PILOT_LIST',onWinSceneId:'VN_SCENE_28_E13_POST'} },
    { id:'VN_SCENE_28_E13_POST', episodeId:'EP001_CASE_001', chapterId:'CH015_KENDO_PILOT_LIST', legacyIndex:28, source:{format:'screenplay-range-v1',startLineId:'VN0628',endLineId:'VN0646'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_29_E14_PRE'} },
    { id:'VN_SCENE_29_E14_PRE', episodeId:'EP001_CASE_001', chapterId:'CH016_KUBO_ATELIER', legacyIndex:29, source:{format:'screenplay-range-v1',startLineId:'VN0647',endLineId:'VN0666'}, transition:{kind:'match3',levelId:'M3_14_KUBO_ATELIER_LEDGER',onWinSceneId:'VN_SCENE_30_E14_POST'} },
    { id:'VN_SCENE_30_E14_POST', episodeId:'EP001_CASE_001', chapterId:'CH016_KUBO_ATELIER', legacyIndex:30, source:{format:'screenplay-range-v1',startLineId:'VN0667',endLineId:'VN0686'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_31_E15_PRE'} },
    { id:'VN_SCENE_31_E15_PRE', episodeId:'EP001_CASE_001', chapterId:'CH017_ABANDONED_LAUNDRY', legacyIndex:31, source:{format:'screenplay-range-v1',startLineId:'VN0687',endLineId:'VN0707'}, transition:{kind:'match3',levelId:'M3_15_ABANDONED_LAUNDRY_ROUTE',onWinSceneId:'VN_SCENE_32_E15_POST'} },
    { id:'VN_SCENE_32_E15_POST', episodeId:'EP001_CASE_001', chapterId:'CH017_ABANDONED_LAUNDRY', legacyIndex:32, source:{format:'screenplay-range-v1',startLineId:'VN0708',endLineId:'VN0726'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_33_E16_PRE'} },
    { id:'VN_SCENE_33_E16_PRE', episodeId:'EP001_CASE_001', chapterId:'CH018_GYMNASTICS_SCAN', legacyIndex:33, source:{format:'screenplay-range-v1',startLineId:'VN0727',endLineId:'VN0746'}, transition:{kind:'match3',levelId:'M3_16_PINK_RIBBON_SCANNER',onWinSceneId:'VN_SCENE_34_E16_POST'} },
    { id:'VN_SCENE_34_E16_POST', episodeId:'EP001_CASE_001', chapterId:'CH018_GYMNASTICS_SCAN', legacyIndex:34, source:{format:'screenplay-range-v1',startLineId:'VN0747',endLineId:'VN0765'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_35_E17_PRE'} },
    { id:'VN_SCENE_35_E17_PRE', episodeId:'EP001_CASE_001', chapterId:'CH019_RINA_ARCHIVE', legacyIndex:35, source:{format:'screenplay-range-v1',startLineId:'VN0766',endLineId:'VN0785'}, transition:{kind:'match3',levelId:'M3_17_RINA_ARCHIVE_CATALOG',onWinSceneId:'VN_SCENE_36_E17_POST'} },
    { id:'VN_SCENE_36_E17_POST', episodeId:'EP001_CASE_001', chapterId:'CH019_RINA_ARCHIVE', legacyIndex:36, source:{format:'screenplay-range-v1',startLineId:'VN0786',endLineId:'VN0805'}, transition:{kind:'scene',targetSceneId:'VN_SCENE_37_E18_PRE'} },
    { id:'VN_SCENE_37_E18_PRE', episodeId:'EP001_CASE_001', chapterId:'CH020_FINAL_STRATEGY', legacyIndex:37, source:{format:'screenplay-range-v1',startLineId:'VN0806',endLineId:'VN0826'}, transition:{kind:'match3',levelId:'M3_18_FULL_TIMELINE_PROOF',onWinSceneId:'VN_SCENE_38_E18_POST'} },
    { id:'VN_SCENE_38_E18_POST', episodeId:'EP001_CASE_001', chapterId:'CH020_FINAL_STRATEGY', legacyIndex:38, source:{format:'screenplay-range-v1',startLineId:'VN0827',endLineId:'VN0845'}, transition:{kind:'branch',gateId:'final-strategy',routes:{A:'VN_SCENE_39_E19_PRE',B:'VN_SCENE_41_E20_PRE',C:'VN_SCENE_43_E21_PRE'}} },
    { id:'VN_SCENE_39_E19_PRE', episodeId:'EP001_CASE_001', chapterId:'CH021_ENDING_B_CASE_CLOSED', legacyIndex:39, source:{format:'screenplay-range-v1',startLineId:'VN0846',endLineId:'VN0865'}, transition:{kind:'match3',levelId:'M3_19_PRIVATE_RETURN',onWinSceneId:'VN_SCENE_40_E19_POST'} },
    { id:'VN_SCENE_40_E19_POST', episodeId:'EP001_CASE_001', chapterId:'CH021_ENDING_B_CASE_CLOSED', legacyIndex:40, source:{format:'screenplay-range-v1',startLineId:'VN0866',endLineId:'VN0884'}, transition:{kind:'ending',endingId:'ENDING_B_CASE_CLOSED'} },
    { id:'VN_SCENE_41_E20_PRE', episodeId:'EP001_CASE_001', chapterId:'CH022_ENDING_A_FULL_TRUTH', legacyIndex:41, source:{format:'screenplay-range-v1',startLineId:'VN0885',endLineId:'VN0904'}, transition:{kind:'match3',levelId:'M3_20_SERVER_CONSENT_LOGS',onWinSceneId:'VN_SCENE_42_E20_POST'} },
    { id:'VN_SCENE_42_E20_POST', episodeId:'EP001_CASE_001', chapterId:'CH022_ENDING_A_FULL_TRUTH', legacyIndex:42, source:{format:'screenplay-range-v1',startLineId:'VN0905',endLineId:'VN0924'}, transition:{kind:'ending',endingId:'ENDING_A_FULL_TRUTH',fallbackEndingId:'ENDING_B_CASE_CLOSED',successRequirement:{evidence:7,teamTrust:2,sourceTrust:2}} },
    { id:'VN_SCENE_43_E21_PRE', episodeId:'EP001_CASE_001', chapterId:'CH023_ENDING_C_PERFECT_SUSPECT', legacyIndex:43, source:{format:'screenplay-range-v1',startLineId:'VN0925',endLineId:'VN0944'}, transition:{kind:'match3',levelId:'M3_21_CONVENIENT_CASE',onWinSceneId:'VN_SCENE_44_E21_POST'} },
    { id:'VN_SCENE_44_E21_POST', episodeId:'EP001_CASE_001', chapterId:'CH023_ENDING_C_PERFECT_SUSPECT', legacyIndex:44, source:{format:'screenplay-range-v1',startLineId:'VN0945',endLineId:'VN0964'}, transition:{kind:'ending',endingId:'ENDING_C_PERFECT_SUSPECT'} },
  ],
};

export type StoryGraphIssue = Readonly<{
  code:
    | 'duplicate-id'
    | 'unknown-reference'
    | 'legacy-index'
    | 'invalid-source-range'
    | 'unreachable-scene'
    | 'match3-coverage'
    | 'terminal-count';
  detail: string;
}>;

const numericLineId = (lineId: string): number | null => {
  const match = /^VN(\d{4})(?:[ABC])?$/.exec(lineId);
  return match ? Number(match[1]) : null;
};

export const storySceneById = (sceneId: StorySceneId): StorySceneDefinition | undefined =>
  storyGraph.scenes.find((scene) => scene.id === sceneId);

export const storySceneFromLegacyIndex = (legacyIndex: number): StorySceneDefinition | undefined =>
  storyGraph.scenes.find((scene) => scene.legacyIndex === legacyIndex);

export const storySceneIdFromLegacyIndex = (legacyIndex: number): StorySceneId | null =>
  storySceneFromLegacyIndex(legacyIndex)?.id ?? null;

export const legacySceneIndexFromStoryId = (sceneId: StorySceneId): number =>
  storySceneById(sceneId)?.legacyIndex ?? -1;

export const storyTransitionForLegacyScene = (legacyIndex: number): StoryTransition | null =>
  storySceneFromLegacyIndex(legacyIndex)?.transition ?? null;

export const storyBranchTargetForLegacyScene = (legacyIndex: number, storyChoices: StoryChoiceSelections): StorySceneId | null => {
  const transition = storyTransitionForLegacyScene(legacyIndex);
  if (!transition || transition.kind !== 'branch') return null;
  const option = storyChoices[transition.gateId];
  return option ? transition.routes[option] : null;
};

export type StoryMatch3Route = Readonly<{
  sourceSceneId: StorySceneId;
  sourceLegacyIndex: number;
  levelId: string;
  levelIndex: number;
  onWinSceneId: StorySceneId;
  onWinLegacyIndex: number;
}>;

const match3RouteFromScene = (scene: StorySceneDefinition): StoryMatch3Route | null => {
  const transition = scene.transition;
  if (transition.kind !== 'match3') return null;
  return {
    sourceSceneId: scene.id,
    sourceLegacyIndex: scene.legacyIndex,
    levelId: transition.levelId,
    levelIndex: levels.findIndex((level) => level.id === transition.levelId),
    onWinSceneId: transition.onWinSceneId,
    onWinLegacyIndex: legacySceneIndexFromStoryId(transition.onWinSceneId),
  };
};

export const storyMatch3RouteForLegacyScene = (legacyIndex: number): StoryMatch3Route | null => {
  const scene = storySceneFromLegacyIndex(legacyIndex);
  return scene ? match3RouteFromScene(scene) : null;
};

export const storyMatch3RouteForLevelId = (levelId: string): StoryMatch3Route | null => {
  const scene = storyGraph.scenes.find(
    (candidate) => candidate.transition.kind === 'match3' && candidate.transition.levelId === levelId,
  );
  return scene ? match3RouteFromScene(scene) : null;
};

export const storyWinSceneIndexForLevelId = (levelId: string): number =>
  storyMatch3RouteForLevelId(levelId)?.onWinLegacyIndex ?? -1;

export function validateStoryGraph(graph: StoryGraph = storyGraph): readonly StoryGraphIssue[] {
  const issues: StoryGraphIssue[] = [];
  const seenIds = new Set<string>();
  const register = (id: string, scope: string): void => {
    if (seenIds.has(id)) issues.push({ code: 'duplicate-id', detail: `${scope}: duplicate id ${id}` });
    seenIds.add(id);
  };

  for (const episode of graph.episodes) register(episode.id, 'episode');
  for (const chapter of graph.chapters) register(chapter.id, 'chapter');
  for (const scene of graph.scenes) register(scene.id, 'scene');

  const episodeIds = new Set(graph.episodes.map((episode) => episode.id));
  const chapterIds = new Set(graph.chapters.map((chapter) => chapter.id));
  const sceneIds = new Set(graph.scenes.map((scene) => scene.id));
  const productionLevelIds = new Set(levels.map((level) => level.id));

  for (const episode of graph.episodes) {
    for (const chapterId of episode.chapterIds) {
      if (!chapterIds.has(chapterId)) issues.push({ code: 'unknown-reference', detail: `${episode.id}: unknown chapter ${chapterId}` });
    }
  }

  for (const chapter of graph.chapters) {
    if (!episodeIds.has(chapter.episodeId)) issues.push({ code: 'unknown-reference', detail: `${chapter.id}: unknown episode ${chapter.episodeId}` });
    for (const sceneId of chapter.sceneIds) {
      if (!sceneIds.has(sceneId)) issues.push({ code: 'unknown-reference', detail: `${chapter.id}: unknown scene ${sceneId}` });
    }
  }

  const legacyIndices = graph.scenes.map((scene) => scene.legacyIndex).sort((left, right) => left - right);
  const expectedLegacyIndices = Array.from({ length: graph.scenes.length }, (_, index) => index);
  if (legacyIndices.join(',') !== expectedLegacyIndices.join(',')) {
    issues.push({ code: 'legacy-index', detail: `legacy scene indices must stay contiguous: ${legacyIndices.join(',')}` });
  }

  for (const scene of graph.scenes) {
    if (!episodeIds.has(scene.episodeId)) issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown episode ${scene.episodeId}` });
    if (!chapterIds.has(scene.chapterId)) issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown chapter ${scene.chapterId}` });

    const start = numericLineId(scene.source.startLineId);
    const end = numericLineId(scene.source.endLineId);
    if (start === null || end === null || start > end) {
      issues.push({ code: 'invalid-source-range', detail: `${scene.id}: invalid source range ${scene.source.startLineId}..${scene.source.endLineId}` });
    }

    const transition = scene.transition;
    if (transition.kind === 'scene' && !sceneIds.has(transition.targetSceneId)) {
      issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown next scene ${transition.targetSceneId}` });
    }
    if (transition.kind === 'match3') {
      if (!productionLevelIds.has(transition.levelId)) {
        issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown Match-3 level ${transition.levelId}` });
      }
      if (!sceneIds.has(transition.onWinSceneId)) {
        issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown Match-3 win scene ${transition.onWinSceneId}` });
      }
    }
    if (transition.kind === 'branch') {
      for (const [option, targetSceneId] of Object.entries(transition.routes)) {
        if (!sceneIds.has(targetSceneId as StorySceneId)) {
          issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown branch ${option} scene ${targetSceneId}` });
        }
      }
    }
    if (transition.kind === 'ending') {
      if (!storyEndingIds.includes(transition.endingId)) issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown ending ${transition.endingId}` });
      if (transition.fallbackEndingId && !storyEndingIds.includes(transition.fallbackEndingId)) issues.push({ code: 'unknown-reference', detail: `${scene.id}: unknown fallback ending ${transition.fallbackEndingId}` });
    }
  }

  const sortedScenes = [...graph.scenes].sort((left, right) => left.legacyIndex - right.legacyIndex);
  for (let index = 1; index < sortedScenes.length; index += 1) {
    const previousEnd = numericLineId(sortedScenes[index - 1].source.endLineId);
    const currentStart = numericLineId(sortedScenes[index].source.startLineId);
    if (previousEnd === null || currentStart === null || currentStart !== previousEnd + 1) {
      issues.push({
        code: 'invalid-source-range',
        detail: `${sortedScenes[index - 1].id} -> ${sortedScenes[index].id}: screenplay ranges must stay contiguous`,
      });
    }
  }

  const reachable = new Set<StorySceneId>();
  const queue: StorySceneId[] = [graph.entrySceneId];
  while (queue.length > 0) {
    const cursor = queue.shift()!;
    if (reachable.has(cursor)) continue;
    reachable.add(cursor);
    const scene = graph.scenes.find((candidate) => candidate.id === cursor);
    if (!scene) continue;
    const transition = scene.transition;
    if (transition.kind === 'scene') queue.push(transition.targetSceneId);
    else if (transition.kind === 'match3') queue.push(transition.onWinSceneId);
    else if (transition.kind === 'branch') queue.push(...Object.values(transition.routes));
  }
  for (const scene of graph.scenes) {
    if (!reachable.has(scene.id)) issues.push({ code: 'unreachable-scene', detail: `${scene.id}: unreachable from ${graph.entrySceneId}` });
  }

  const match3Transitions = graph.scenes
    .map((scene) => scene.transition)
    .filter((transition): transition is Extract<StoryTransition, { kind: 'match3' }> => transition.kind === 'match3');
  const routedLevelIds = match3Transitions.map((transition) => transition.levelId).sort();
  const expectedLevelIds = levels.map((level) => level.id).sort();
  if (routedLevelIds.join(',') !== expectedLevelIds.join(',')) {
    issues.push({ code: 'match3-coverage', detail: `story Match-3 routes=${routedLevelIds.join(',')} production=${expectedLevelIds.join(',')}` });
  }

  const endingTransitions = graph.scenes.filter((scene) => scene.transition.kind === 'ending');
  if (endingTransitions.length !== storyEndingIds.length) {
    issues.push({ code: 'terminal-count', detail: `expected ${storyEndingIds.length} ending transitions, got ${endingTransitions.length}` });
  }
  const terminalEndingIds = new Set(endingTransitions.map((scene) => scene.transition.kind === 'ending' ? scene.transition.endingId : null));
  for (const endingId of storyEndingIds) {
    if (!terminalEndingIds.has(endingId)) issues.push({ code: 'terminal-count', detail: `missing terminal ending ${endingId}` });
  }

  return issues;
}
