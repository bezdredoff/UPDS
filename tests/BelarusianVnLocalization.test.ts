import { describe, expect, it } from 'vitest';
import { storyChoiceGates } from '../src/data/storyChoices';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

type Catalog = Readonly<Record<string, string>>;
type CatalogCheckMode = 'equal' | 'contain' | 'lowerContain' | 'localeLowerContain';
type CatalogCheck = { key: string; mode: CatalogCheckMode; expected: string };
type SceneCheck = { sceneId: string; source: unknown; transition?: unknown };
type GateCheck = { id: string; expected: unknown };
type VnSlotSpec = {
  slot: number;
  keyCount: number;
  startLine: number;
  endLine: number;
  sceneIds: readonly string[];
  choicePrefixes: readonly string[];
  sceneChecks: readonly SceneCheck[];
  gateChecks: readonly GateCheck[];
  catalogChecks: readonly CatalogCheck[];
};

const slotSpecs: readonly VnSlotSpec[] = [
  {
    slot: 0,
    keyCount: 302,
    startLine: 1,
    endLine: 84,
    sceneIds: ['VN_SCENE_00_PROLOGUE', 'VN_SCENE_01_E0_PRE', 'VN_SCENE_02_E0_POST'],
    choicePrefixes: ['vn.choice.'],
    sceneChecks: [
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_01_E0_PRE.title", mode: "equal", expected: "Справа класа U" },
      { key: "vn.choice.prompt", mode: "equal", expected: "З чаго пачаць?" },
      { key: "vn.line.VN0024.text", mode: "contain", expected: "Эмі Такахасі" },
      { key: "vn.line.VN0043C.text", mode: "contain", expected: "Маю Хаясакай" },
      { key: "vn.line.VN0044B.text", mode: "contain", expected: "Кэнтаро" },
      { key: "vn.line.VN0031.text", mode: "equal", expected: "Undergarment." },
      { key: "vn.line.VN0046A.text", mode: "equal", expected: "{approach=verify; source_trust+1; bonus_laundry_detail=true}" },
      { key: "vn.line.VN0046B.text", mode: "equal", expected: "{approach=warn; rumor_heat+1}" },
      { key: "vn.line.VN0047C.text", mode: "equal", expected: "{approach=report; onoe_trust+1}" },
      { key: "vn.line.VN0069.text", mode: "equal", expected: "{dossier_unlocked=true; ADD CUE_001_SELECTIVE_THEFT}" },
    ],
  },
  {
    slot: 1,
    keyCount: 178,
    startLine: 85,
    endLine: 142,
    sceneIds: ['VN_SCENE_03_E1_PRE', 'VN_SCENE_04_E1_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_03_E1_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0085', endLineId: 'VN0113' } },
      { sceneId: 'VN_SCENE_04_E1_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0114', endLineId: 'VN0142' } },
      { sceneId: 'VN_SCENE_05_E2_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0143', endLineId: 'VN0166' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_03_E1_PRE.title", mode: "equal", expected: "Пакой, які ўсё тлумачыць занадта дрэнна" },
      { key: "vn.line.VN0093.text", mode: "contain", expected: "Кэнтаро" },
      { key: "vn.line.VN0101.text", mode: "contain", expected: "эмодзі трусікаў" },
      { key: "vn.line.VN0111.text", mode: "contain", expected: "часавая лінія" },
      { key: "vn.line.VN0123.text", mode: "contain", expected: "87 да 12 працэнтаў" },
      { key: "vn.line.VN0136.text", mode: "equal", expected: "{ADD CUE_002_SERVICE_CART; SET SUS_KENTARO=cleared}" },
      { key: "vn.line.VN0141.text", mode: "equal", expected: "«Эпізод 2 — Мокрыя паказанні»" },
      { key: "vn.line.VN0142.text", mode: "contain", expected: "Пустая распранальня" },
    ],
  },
  {
    slot: 2,
    keyCount: 151,
    startLine: 143,
    endLine: 191,
    sceneIds: ['VN_SCENE_05_E2_PRE', 'VN_SCENE_06_E2_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_05_E2_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0143', endLineId: 'VN0166' } },
      { sceneId: 'VN_SCENE_06_E2_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0167', endLineId: 'VN0191' } },
      { sceneId: 'VN_SCENE_07_E3_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0192', endLineId: 'VN0216' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_05_E2_PRE.title", mode: "equal", expected: "Мокрыя паказанні" },
      { key: "vn.scene.VN_SCENE_06_E2_POST.title", mode: "equal", expected: "Табліца без густу" },
      { key: "vn.line.VN0149.text", mode: "contain", expected: "Норыхіра" },
      { key: "vn.line.VN0158.text", mode: "contain", expected: "службовай шафы" },
      { key: "vn.line.VN0173.text", mode: "contain", expected: "тыпе бялізны" },
      { key: "vn.line.VN0175.text", mode: "equal", expected: "{ADD CUE_003_MIXED_TARGETS}" },
      { key: "vn.line.VN0184.text", mode: "contain", expected: "згодзе" },
      { key: "vn.line.VN0188.text", mode: "equal", expected: "«Эпізод 3 — Ружовыя тапачкі»" },
      { key: "vn.line.VN0190.text", mode: "contain", expected: "Кэнтаро" },
    ],
  },
  {
    slot: 3,
    keyCount: 181,
    startLine: 192,
    endLine: 250,
    sceneIds: ['VN_SCENE_07_E3_PRE', 'VN_SCENE_08_E3_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_07_E3_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0192', endLineId: 'VN0216' } },
      { sceneId: 'VN_SCENE_08_E3_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0217', endLineId: 'VN0250' } },
      { sceneId: 'VN_SCENE_09_E4_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0251', endLineId: 'VN0270' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_07_E3_PRE.title", mode: "equal", expected: "Ружовае прызнанне" },
      { key: "vn.scene.VN_SCENE_08_E3_POST.title", mode: "equal", expected: "Гэта не тканіна" },
      { key: "vn.line.VN0195.text", mode: "contain", expected: "згоду" },
      { key: "vn.line.VN0201.text", mode: "contain", expected: "Ружовыя тапачкі" },
      { key: "vn.line.VN0221.text", mode: "contain", expected: "Норыхіра" },
      { key: "vn.line.VN0239.text", mode: "contain", expected: "злодзей" },
      { key: "vn.line.VN0242.text", mode: "equal", expected: "{ADD CUE_004_SILVER_THREAD; SET SUS_NORIHIRO=cleared}" },
      { key: "vn.line.VN0246.text", mode: "equal", expected: "Гэта не тканіна." },
      { key: "vn.line.VN0249.text", mode: "equal", expected: "«Першая нітка знойдзена»" },
    ],
  },
  {
    slot: 4,
    keyCount: 125,
    startLine: 251,
    endLine: 288,
    sceneIds: ['VN_SCENE_09_E4_PRE', 'VN_SCENE_10_E4_POST'],
    choicePrefixes: ['vn.storyChoice.meeting-tone.'],
    sceneChecks: [
      { sceneId: 'VN_SCENE_09_E4_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0251', endLineId: 'VN0270' } },
      { sceneId: 'VN_SCENE_10_E4_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0271', endLineId: 'VN0288' } },
      { sceneId: 'VN_SCENE_11_E5_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0289', endLineId: 'VN0308' } },
    ],
    gateChecks: [
      { id: 'meeting-tone', expected: { id: 'meeting-tone', checkpointLineId: 'VN0262', options: ['A', 'B', 'C'] } },
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_09_E4_PRE.title", mode: "equal", expected: "Надзвычайная бялізнавая нарада" },
      { key: "vn.scene.VN_SCENE_10_E4_POST.title", mode: "equal", expected: "Рытм пральні" },
      { key: "vn.line.VN0252.text", mode: "contain", expected: "без імёнаў" },
      { key: "vn.line.VN0262.text", mode: "equal", expected: "{CHOICE meeting-tone}" },
      { key: "vn.line.VN0278.text", mode: "equal", expected: "{ADD CUE_005}" },
      { key: "vn.storyChoice.meeting-tone.prompt", mode: "equal", expected: "Як Міку правядзе закрытую нараду?" },
      { key: "vn.storyChoice.meeting-tone.A.effect", mode: "equal", expected: "Давер Оноэ +1" },
      { key: "vn.storyChoice.meeting-tone.B.effect", mode: "equal", expected: "Давер Аюкі +1" },
      { key: "vn.storyChoice.meeting-tone.C.effect", mode: "equal", expected: "Давер крыніц +1" },
      { key: "vn.line.VN0288.text", mode: "equal", expected: "«Эпізод 5 — Заслон для злодзея»" },
    ],
  },
  {
    slot: 5,
    keyCount: 118,
    startLine: 289,
    endLine: 326,
    sceneIds: ['VN_SCENE_11_E5_PRE', 'VN_SCENE_12_E5_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_11_E5_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0289', endLineId: 'VN0308' } },
      { sceneId: 'VN_SCENE_12_E5_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0309', endLineId: 'VN0326' } },
      { sceneId: 'VN_SCENE_13_E6_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0327', endLineId: 'VN0347' } },
    ],
    gateChecks: [
      { id: 'apology-to-hinata', expected: { id: 'apology-to-hinata', checkpointLineId: 'VN0356', options: ['A', 'B', 'C'] } },
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_11_E5_PRE.title", mode: "equal", expected: "Заслон для злодзея" },
      { key: "vn.scene.VN_SCENE_12_E5_POST.title", mode: "equal", expected: "Сэрвісная строчка" },
      { key: "vn.line.VN0295.text", mode: "contain", expected: "Ціхару Хіната" },
      { key: "vn.line.VN0300.text", mode: "contain", expected: "сэрвісная строчка" },
      { key: "vn.line.VN0316.text", mode: "contain", expected: "цэнтральная пральня" },
      { key: "vn.line.VN0323.text", mode: "equal", expected: "{ADD CUE_006}" },
      { key: "vn.line.VN0326.text", mode: "equal", expected: "«Эпізод 6 — Майстэрня падазронага памеру»" },
    ],
  },
  {
    slot: 6,
    keyCount: 140,
    startLine: 327,
    endLine: 369,
    sceneIds: ['VN_SCENE_13_E6_PRE', 'VN_SCENE_14_E6_POST'],
    choicePrefixes: ['vn.storyChoice.apology-to-hinata.'],
    sceneChecks: [
      { sceneId: 'VN_SCENE_13_E6_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0327', endLineId: 'VN0347' } },
      { sceneId: 'VN_SCENE_14_E6_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0348', endLineId: 'VN0369' } },
      { sceneId: 'VN_SCENE_15_E7_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0370', endLineId: 'VN0390' } },
    ],
    gateChecks: [
      { id: 'apology-to-hinata', expected: { id: 'apology-to-hinata', checkpointLineId: 'VN0356', options: ['A', 'B', 'C'] } },
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_13_E6_PRE.title", mode: "equal", expected: "Майстэрня падазронага памеру" },
      { key: "vn.line.VN0343.text", mode: "contain", expected: "сэрвісная строчка" },
      { key: "vn.line.VN0349.text", mode: "contain", expected: "не падтрымлівае гэтую нітку" },
      { key: "vn.line.VN0356.text", mode: "equal", expected: "{CHOICE apology-to-hinata}" },
      { key: "vn.storyChoice.apology-to-hinata.A.effect", mode: "equal", expected: "Давер крыніц +1" },
      { key: "vn.line.VN0359.text", mode: "equal", expected: "{ADD CUE_007; SET SUS_HINATA=cleared}" },
      { key: "vn.line.VN0364.text", mode: "contain", expected: "Asterion Sports Lab" },
      { key: "vn.line.VN0365.text", mode: "contain", expected: "Куросэ" },
      { key: "vn.line.VN0369.text", mode: "equal", expected: "{AUTHORED FRONTIER: SLOT_07 / NEXT BATCH 7-9}" },
    ],
  },
  {
    slot: 7,
    keyCount: 124,
    startLine: 370,
    endLine: 409,
    sceneIds: ['VN_SCENE_15_E7_PRE', 'VN_SCENE_16_E7_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_15_E7_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0370', endLineId: 'VN0390' } },
      { sceneId: 'VN_SCENE_16_E7_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0391', endLineId: 'VN0409' } },
      { sceneId: 'VN_SCENE_17_E8_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0410', endLineId: 'VN0429' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_15_E7_PRE.title", mode: "equal", expected: "Чалавек, у якога ёсць тлумачэнне" },
      { key: "vn.line.VN0370.text", mode: "contain", expected: "серабрыстай ніткі" },
      { key: "vn.line.VN0376.text", mode: "contain", expected: "Asterion" },
      { key: "vn.line.VN0385.text", mode: "contain", expected: "сэрвісная строчка" },
      { key: "vn.line.VN0394.text", mode: "contain", expected: "асабістую бялізну" },
      { key: "vn.line.VN0401.text", mode: "equal", expected: "{ADD CUE_008}" },
      { key: "vn.line.VN0406.text", mode: "contain", expected: "цэнтральнай пральні" },
      { key: "vn.line.VN0409.text", mode: "equal", expected: "«Эпізод 8 — Восемдзесят сем пакетаў»" },
    ],
  },
  {
    slot: 8,
    keyCount: 121,
    startLine: 410,
    endLine: 448,
    sceneIds: ['VN_SCENE_17_E8_PRE', 'VN_SCENE_18_E8_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_17_E8_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0410', endLineId: 'VN0429' } },
      { sceneId: 'VN_SCENE_18_E8_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0430', endLineId: 'VN0448' } },
      { sceneId: 'VN_SCENE_19_E9_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0449', endLineId: 'VN0469' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_17_E8_PRE.title", mode: "equal", expected: "Восемдзесят сем пакетаў" },
      { key: "vn.scene.VN_SCENE_17_E8_PRE.location", mode: "equal", expected: "Склад знаходак пральні" },
      { key: "vn.line.VN0412.text", mode: "contain", expected: "Рына Сіраісі" },
      { key: "vn.line.VN0421.text", mode: "contain", expected: "сэрвісных кодах" },
      { key: "vn.line.VN0436.text", mode: "contain", expected: "Цэнтральная пральня" },
      { key: "vn.line.VN0440.text", mode: "equal", expected: "{ADD CUE_009}" },
      { key: "vn.line.VN0443.text", mode: "contain", expected: "Asterion" },
      { key: "vn.line.VN0445.text", mode: "contain", expected: "ўніверсальным ключом" },
      { key: "vn.line.VN0448.text", mode: "equal", expected: "«Эпізод 9 — Кароль згубленых шкарпэтак»" },
    ],
  },
  {
    slot: 9,
    keyCount: 131,
    startLine: 449,
    endLine: 488,
    sceneIds: ['VN_SCENE_19_E9_PRE', 'VN_SCENE_20_E9_POST'],
    choicePrefixes: ['vn.storyChoice.protect-gen-source.'],
    sceneChecks: [
      { sceneId: 'VN_SCENE_19_E9_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0449', endLineId: 'VN0469' } },
      { sceneId: 'VN_SCENE_20_E9_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0470', endLineId: 'VN0488' } },
      { sceneId: 'VN_SCENE_21_E10_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0489', endLineId: 'VN0508' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.line.VN0480.text", mode: "equal", expected: "{CHOICE protect-gen-source}" },
      { key: "vn.scene.VN_SCENE_19_E9_PRE.title", mode: "equal", expected: "Кароль згубленых шкарпэтак" },
      { key: "vn.scene.VN_SCENE_20_E9_POST.title", mode: "equal", expected: "Начныя кантэйнеры" },
      { key: "vn.line.VN0452.text", mode: "contain", expected: "ўніверсальны ключ" },
      { key: "vn.line.VN0465.text", mode: "contain", expected: "Рына" },
      { key: "vn.line.VN0467.text", mode: "contain", expected: "Asterion" },
      { key: "vn.line.VN0474.text", mode: "contain", expected: "сэрвісны прэфікс Asterion" },
      { key: "vn.storyChoice.protect-gen-source.B.effect", mode: "equal", expected: "Давер крыніц +1" },
      { key: "vn.line.VN0485.text", mode: "equal", expected: "{ADD CUE_010}" },
    ],
  },
  {
    slot: 10,
    keyCount: 121,
    startLine: 489,
    endLine: 527,
    sceneIds: ['VN_SCENE_21_E10_PRE', 'VN_SCENE_22_E10_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_21_E10_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0489', endLineId: 'VN0508' } },
      { sceneId: 'VN_SCENE_22_E10_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0509', endLineId: 'VN0527' } },
      { sceneId: 'VN_SCENE_23_E11_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0528', endLineId: 'VN0547' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_21_E10_PRE.title", mode: "equal", expected: "Чорны пояс, белыя трусы" },
      { key: "vn.scene.VN_SCENE_22_E10_POST.title", mode: "equal", expected: "Кантрольная выбарка" },
      { key: "vn.line.VN0490.text", mode: "contain", expected: "Аоі Кагава" },
      { key: "vn.line.VN0502.text", mode: "contain", expected: "сэрвісныя біркі" },
      { key: "vn.line.VN0512.text", mode: "lowerContain", expected: "кантрольныя рэчы" },
      { key: "vn.line.VN0516.text", mode: "contain", expected: "кантрольную выбарку" },
      { key: "vn.line.VN0517.text", mode: "equal", expected: "{ADD CUE_011}" },
      { key: "vn.line.VN0524.text", mode: "contain", expected: "Asterion" },
    ],
  },
  {
    slot: 11,
    keyCount: 131,
    startLine: 528,
    endLine: 567,
    sceneIds: ['VN_SCENE_23_E11_PRE', 'VN_SCENE_24_E11_POST'],
    choicePrefixes: ['vn.storyChoice.photo-permission.'],
    sceneChecks: [
      { sceneId: 'VN_SCENE_23_E11_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0528', endLineId: 'VN0547' } },
      { sceneId: 'VN_SCENE_24_E11_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0548', endLineId: 'VN0567' } },
      { sceneId: 'VN_SCENE_25_E12_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0568', endLineId: 'VN0588' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.line.VN0560.text", mode: "equal", expected: "{CHOICE photo-permission}" },
      { key: "vn.scene.VN_SCENE_23_E11_PRE.title", mode: "equal", expected: "Самы прыкметны таемны груз" },
      { key: "vn.scene.VN_SCENE_24_E11_POST.title", mode: "equal", expected: "Ланцужок перадачы" },
      { key: "vn.line.VN0537.text", mode: "contain", expected: "маніфеста" },
      { key: "vn.line.VN0540.text", mode: "lowerContain", expected: "перагрузачнага пункта asterion" },
      { key: "vn.line.VN0545.text", mode: "contain", expected: "бесперапынны ланцужок" },
      { key: "vn.line.VN0556.text", mode: "contain", expected: "лабараторыю Asterion" },
      { key: "vn.storyChoice.photo-permission.A.effect", mode: "contain", expected: "Давер крыніц +1" },
      { key: "vn.storyChoice.photo-permission.B.effect", mode: "contain", expected: "Прыватнасць +1" },
      { key: "vn.storyChoice.photo-permission.C.effect", mode: "contain", expected: "Доказы +1" },
      { key: "vn.line.VN0557.text", mode: "equal", expected: "{ADD CUE_012}" },
    ],
  },
  {
    slot: 12,
    keyCount: 131,
    startLine: 568,
    endLine: 607,
    sceneIds: ['VN_SCENE_25_E12_PRE', 'VN_SCENE_26_E12_POST'],
    choicePrefixes: ['vn.storyChoice.publish-tag.'],
    sceneChecks: [
      { sceneId: 'VN_SCENE_25_E12_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0568', endLineId: 'VN0588' }, transition: { kind: 'match3', levelId: 'M3_12_SECOND_SKIN_SIGNAL', onWinSceneId: 'VN_SCENE_26_E12_POST' } },
      { sceneId: 'VN_SCENE_26_E12_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0589', endLineId: 'VN0607' } },
      { sceneId: 'VN_SCENE_27_E13_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0608', endLineId: 'VN0627' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.line.VN0601.text", mode: "equal", expected: "{CHOICE publish-tag}" },
      { key: "vn.scene.VN_SCENE_25_E12_PRE.title", mode: "equal", expected: "ПанцуІтэр існуе?!" },
      { key: "vn.scene.VN_SCENE_26_E12_POST.title", mode: "equal", expected: "Second Skin" },
      { key: "vn.line.VN0579.text", mode: "localeLowerContain", expected: "сэрвісная бірка" },
      { key: "vn.line.VN0588.text", mode: "localeLowerContain", expected: "актыўную мікраметку" },
      { key: "vn.line.VN0594.text", mode: "localeLowerContain", expected: "знешняя экіпіроўка" },
      { key: "vn.line.VN0596.text", mode: "contain", expected: "`Second Skin`" },
      { key: "vn.storyChoice.publish-tag.A.effect", mode: "contain", expected: "Аюкі +1" },
      { key: "vn.storyChoice.publish-tag.B.effect", mode: "contain", expected: "Доказы +1" },
      { key: "vn.storyChoice.publish-tag.C.effect", mode: "contain", expected: "тэхнічны ID" },
      { key: "vn.line.VN0597.text", mode: "equal", expected: "{ADD CUE_013}" },
      { key: "vn.line.VN0601.text", mode: "equal", expected: "{CHOICE publish-tag}" },
    ],
  },
  {
    slot: 13,
    keyCount: 121,
    startLine: 608,
    endLine: 646,
    sceneIds: ['VN_SCENE_27_E13_PRE', 'VN_SCENE_28_E13_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_27_E13_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0608', endLineId: 'VN0627' }, transition: { kind: 'match3', levelId: 'M3_13_KENDO_PILOT_LIST', onWinSceneId: 'VN_SCENE_28_E13_POST' } },
      { sceneId: 'VN_SCENE_28_E13_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0628', endLineId: 'VN0646' } },
      { sceneId: 'VN_SCENE_29_E14_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0647', endLineId: 'VN0666' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_27_E13_PRE.title", mode: "equal", expected: "Пад даспехамі" },
      { key: "vn.scene.VN_SCENE_28_E13_POST.title", mode: "equal", expected: "Закрыты спіс пілота" },
      { key: "vn.line.VN0615.text", mode: "contain", expected: "Рыны Сіраісі" },
      { key: "vn.line.VN0620.text", mode: "localeLowerContain", expected: "сэрвісных бірках" },
      { key: "vn.line.VN0622.text", mode: "contain", expected: "Second Skin" },
      { key: "vn.line.VN0626.text", mode: "localeLowerContain", expected: "закрыты спіс пілота" },
      { key: "vn.line.VN0634.text", mode: "equal", expected: "{ADD CUE_014}" },
      { key: "vn.line.VN0639.text", mode: "contain", expected: "серабрыстае шво" },
      { key: "vn.line.VN0645.text", mode: "localeLowerContain", expected: "кніга заказаў" },
    ],
  },
  {
    slot: 14,
    keyCount: 131,
    startLine: 647,
    endLine: 686,
    sceneIds: ['VN_SCENE_29_E14_PRE', 'VN_SCENE_30_E14_POST'],
    choicePrefixes: ['vn.storyChoice.family-ledger-permission.'],
    sceneChecks: [
      { sceneId: 'VN_SCENE_29_E14_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0647', endLineId: 'VN0666' }, transition: { kind: 'match3', levelId: 'M3_14_KUBO_ATELIER_LEDGER', onWinSceneId: 'VN_SCENE_30_E14_POST' } },
      { sceneId: 'VN_SCENE_30_E14_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0667', endLineId: 'VN0686' } },
      { sceneId: 'VN_SCENE_31_E15_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0687', endLineId: 'VN0707' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_29_E14_PRE.title", mode: "equal", expected: "Дом, дзе бялізна ні пры чым" },
      { key: "vn.scene.VN_SCENE_30_E14_POST.title", mode: "equal", expected: "Рына ведала раней" },
      { key: "vn.line.VN0652.text", mode: "contain", expected: "Рыны Сіраісі" },
      { key: "vn.line.VN0656.text", mode: "localeLowerContain", expected: "сэрвіснай біркі" },
      { key: "vn.line.VN0666.text", mode: "localeLowerContain", expected: "кнігай заказаў" },
      { key: "vn.line.VN0673.text", mode: "equal", expected: "{ADD CUE_015}" },
      { key: "vn.line.VN0678.text", mode: "equal", expected: "{CHOICE family-ledger-permission}" },
      { key: "vn.storyChoice.family-ledger-permission.C.title", mode: "contain", expected: "закрыты дадатак" },
      { key: "vn.line.VN0683.text", mode: "contain", expected: "Рэй" },
    ],
  },
  {
    slot: 15,
    keyCount: 124,
    startLine: 687,
    endLine: 726,
    sceneIds: ['VN_SCENE_31_E15_PRE', 'VN_SCENE_32_E15_POST'],
    choicePrefixes: [],
    sceneChecks: [
      { sceneId: 'VN_SCENE_31_E15_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0687', endLineId: 'VN0707' }, transition: { kind: 'match3', levelId: 'M3_15_ABANDONED_LAUNDRY_ROUTE', onWinSceneId: 'VN_SCENE_32_E15_POST' } },
      { sceneId: 'VN_SCENE_32_E15_POST', source: { format: 'screenplay-range-v1', startLineId: 'VN0708', endLineId: 'VN0726' } },
      { sceneId: 'VN_SCENE_33_E16_PRE', source: { format: 'screenplay-range-v1', startLineId: 'VN0727', endLineId: 'VN0746' } },
    ],
    gateChecks: [
    ],
    catalogChecks: [
      { key: "vn.scene.VN_SCENE_31_E15_PRE.title", mode: "equal", expected: "Кот з рэчавым доказам" },
      { key: "vn.scene.VN_SCENE_32_E15_POST.title", mode: "equal", expected: "Маршрут згоды" },
      { key: "vn.line.VN0697.text", mode: "localeLowerContain", expected: "серабрыстай ніткі" },
      { key: "vn.line.VN0705.text", mode: "localeLowerContain", expected: "пагадзіліся ўладальнікі" },
      { key: "vn.line.VN0708.text", mode: "contain", expected: "Asterion" },
      { key: "vn.line.VN0714.text", mode: "contain", expected: "Second Skin" },
      { key: "vn.line.VN0715.text", mode: "equal", expected: "{ADD CUE_016}" },
      { key: "vn.line.VN0718.text", mode: "equal", expected: "Рына." },
      { key: "vn.line.VN0723.text", mode: "localeLowerContain", expected: "ружовыя стужкі" },
      { key: "vn.line.VN0687.emotion", mode: "equal", expected: "BG_CAMPUS_PATH / CHASE" },
      { key: "vn.line.VN0707.emotion", mode: "equal", expected: "TRANSITION TO MATCH-3" },
      { key: "vn.line.VN0726.emotion", mode: "equal", expected: "EPISODE CARD / FRONTIER" },
    ],
  },
];

const selectSlot = (catalog: Catalog, spec: VnSlotSpec): Catalog =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => {
    if (spec.choicePrefixes.some((prefix) => key.startsWith(prefix))) return true;
    const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
    if (scene) return spec.sceneIds.includes(scene[1]);
    const line = key.match(/^vn\.line\.VN(\d{4})[A-C]?\.(?:speaker|emotion|text)$/u);
    if (!line) return false;
    const index = Number(line[1]);
    return index >= spec.startLine && index <= spec.endLine;
  }));

const targetCatalog: Catalog = beCatalog;

const assertCatalogCheck = (slot: number, check: CatalogCheck): void => {
  const actual = targetCatalog[check.key];
  const message = `slot ${slot}: ${check.key}`;
  if (check.mode === 'equal') {
    expect(actual, message).toBe(check.expected);
    return;
  }
  if (check.mode === 'lowerContain') {
    expect(actual.toLowerCase(), message).toContain(check.expected);
    return;
  }
  if (check.mode === 'localeLowerContain') {
    expect(actual.toLocaleLowerCase('be'), message).toContain(check.expected);
    return;
  }
  expect(actual, message).toContain(check.expected);
};

describe('Belarusian canonical VN localization', () => {
  it('keeps every historical slot slice structurally complete with its exact bounded key count', () => {
    for (const spec of slotSpecs) {
      const source = selectSlot(ruCatalog, spec);
      const target = selectSlot(beCatalog, spec);
      const audit = auditMessageCatalog(source, target);
      const message = `slot ${spec.slot}`;

      expect(Object.keys(source), message).toHaveLength(spec.keyCount);
      expect(audit.sourceKeyCount, message).toBe(spec.keyCount);
      expect(audit.targetKeyCount, message).toBe(spec.keyCount);
      expect(audit.missingKeys, message).toEqual([]);
      expect(audit.extraKeys, message).toEqual([]);
      expect(audit.emptyKeys, message).toEqual([]);
      expect(audit.placeholderMismatches, message).toEqual([]);
      expect(isCatalogStructurallyComplete(audit), message).toBe(true);
    }
  });

  it('preserves the canonical scene boundaries, transitions and choice checkpoints formerly split by slot', () => {
    for (const spec of slotSpecs) {
      for (const check of spec.sceneChecks) {
        const scene = storyGraph.scenes.find((candidate) => candidate.id === check.sceneId);
        expect(scene?.source, `slot ${spec.slot}: ${check.sceneId} source`).toEqual(check.source);
        if (check.transition !== undefined) {
          expect(scene?.transition, `slot ${spec.slot}: ${check.sceneId} transition`).toEqual(check.transition);
        }
      }
      for (const check of spec.gateChecks) {
        const gate = storyChoiceGates.find((candidate) => candidate.id === check.id);
        expect(gate, `slot ${spec.slot}: ${check.id}`).toEqual(check.expected);
      }
    }
  });

  it('preserves reviewed names, terminology and exact screenplay payloads across slots 0–15', () => {
    for (const spec of slotSpecs) {
      for (const check of spec.catalogChecks) assertCatalogCheck(spec.slot, check);
    }
  });
});

