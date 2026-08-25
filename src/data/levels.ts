import type { Match3LevelContext } from './match3Context';
import { match3TutorialConceptIds, type Match3TutorialConceptId } from './match3Tutorials';

export const BOARD_SIZE = 8;

export type Match3TileId =
  | 'camisole'
  | 'laundryTag'
  | 'panties'
  | 'pantiesSportWhite'
  | 'pantiesLacePink'
  | 'pantiesHighWaistBlack'
  | 'pantiesBoyshortBlue'
  | 'towel'
  | 'socks'
  | 'sportsBra';
/** Compatibility alias while older tests/tools migrate to concrete match identities. */
export type TileKey = Match3TileId;
export type Match3TileCategory = 'panties' | 'bra' | 'camisole' | 'socks' | 'towel' | 'tag';
export const ACTIVE_TILE_TYPE_LIMIT = 6;
export const MAX_PANTIES_TYPES_PER_LEVEL = 4;
export const MAX_OBJECTIVES_PER_LEVEL = 3;
export type IngredientKey = 'receipt' | 'memoryCard' | 'serviceKey' | 'damagedTowel' | 'laundryCalendar' | 'repairLog' | 'warrantyCard' | 'silverSpool' | 'asterionSpec' | 'missingNumberSheet' | 'handoffSlip' | 'stitchedWristband' | 'transferSeal' | 'routeCard' | 'transferManifest' | 'secondSkinTag' | 'pilotList' | 'familyReceipt' | 'atelierLedger' | 'markedPackage' | 'serviceKeyCard' | 'handheldScanner' | 'rinaCatalog' | 'recentMarkedItem' | 'returnConfirmation' | 'backupDrive' | 'finalSlide';
export type BlockerKey = 'lockedCell' | 'propBox' | 'foam' | 'cabinet' | 'rumorCard' | 'lockerLock' | 'garmentBag' | 'labCover' | 'sealedPackage' | 'supplyCrate' | 'signalNoise' | 'armorRack' | 'fabricStack' | 'debris' | 'ribbonTangle' | 'archiveSeal' | 'falseConclusion' | 'serverGate';
export type ClueId = 'CUE_001' | 'CUE_002' | 'CUE_003' | 'CUE_004' | 'CUE_005' | 'CUE_006' | 'CUE_007' | 'CUE_008' | 'CUE_009' | 'CUE_010' | 'CUE_011' | 'CUE_012' | 'CUE_013' | 'CUE_014' | 'CUE_015' | 'CUE_016' | 'CUE_017' | 'CUE_018' | 'CUE_019' | 'CUE_020' | 'CUE_021' | 'CUE_022';

export type BoardPlacement = Readonly<{ index: number; layers: 1 | 2 }>;
export type IngredientPlacement = Readonly<{ index: number; kind: IngredientKey }>;
export type InitialTilePlacement = Readonly<{ index: number; tile: Match3TileId }>;

export type LevelObjective =
  | Readonly<{ kind: 'collect'; tile: Match3TileId; target: number; label: string }>
  | Readonly<{ kind: 'clearBlockers'; target: number; label: string }>
  | Readonly<{ kind: 'drop'; ingredient: IngredientKey; target: number; label: string }>
  | Readonly<{ kind: 'dropGroup'; ingredients: readonly IngredientKey[]; target: number; label: string }>;

export function objectiveIngredientKeys(objective: LevelObjective): readonly IngredientKey[] {
  if (objective.kind === 'drop') return [objective.ingredient];
  if (objective.kind === 'dropGroup') return objective.ingredients;
  return [];
}

export type LevelDefinition = Readonly<{
  id: string;
  shortId: string;
  title: string;
  storyAction: string;
  context: Match3LevelContext;
  /** Tutorial concepts this level is allowed to introduce. */
  tutorialConcepts: readonly Match3TutorialConceptId[];
  /** Exactly six concrete match identities available to initial fill, refill and reshuffle. */
  activeTiles: readonly Match3TileId[];
  /** Optional relative spawn weights for active identities. Missing weights default to 1. */
  spawnWeights?: Readonly<Partial<Record<Match3TileId, number>>>;
  /** Optional inactive board indices. Omitted means the legacy full 8×8 board. */
  boardHoles?: readonly number[];
  /** Optional deterministic tile placements applied before seeded fill. */
  initialTiles?: readonly InitialTilePlacement[];
  moves: number;
  objectives: readonly LevelObjective[];
  blocker: BlockerKey;
  blockers: readonly BoardPlacement[];
  ingredients: readonly IngredientPlacement[];
  seed: number;
  clueId: ClueId;
  clueTitle: string;
  clueSummary: string;
  startBark: Readonly<{ speaker: string; text: string }>;
  winBark: Readonly<{ speaker: string; text: string }>;
  loseBark: Readonly<{ speaker: string; text: string }>;
}>;

export function isLevelBoardCellActive(level: Pick<LevelDefinition, 'boardHoles'>, index: number): boolean {
  return Number.isInteger(index) && index >= 0 && index < BOARD_SIZE * BOARD_SIZE && !(level.boardHoles?.includes(index) ?? false);
}

export const tileKeys: readonly Match3TileId[] = [
  'camisole', 'laundryTag', 'panties', 'pantiesSportWhite', 'pantiesLacePink', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'towel', 'socks', 'sportsBra',
];

export const tilePresentation: Record<Match3TileId, Readonly<{ label: string; asset: string; color: string; category: Match3TileCategory }>> = {
  camisole: { label: 'Ткань', asset: './assets/match3/tile_camisole_purple.png', color: '#7466ae', category: 'camisole' },
  laundryTag: { label: 'Бирка', asset: './assets/match3/tile_laundry_tag_gold.png', color: '#d8a347', category: 'tag' },
  panties: { label: 'Комплект', asset: './assets/match3/tile_panties_coral.png', color: '#df7181', category: 'panties' },
  pantiesSportWhite: { label: 'Белые спорт.', asset: './assets/match3/tile_panties_sport_white.png', color: '#dfe7f3', category: 'panties' },
  pantiesLacePink: { label: 'Розовые', asset: './assets/match3/tile_panties_lace_pink.png', color: '#f2a2bc', category: 'panties' },
  pantiesHighWaistBlack: { label: 'Чёрные', asset: './assets/match3/tile_panties_highwaist_black.png', color: '#45424b', category: 'panties' },
  pantiesBoyshortBlue: { label: 'Голубые', asset: './assets/match3/tile_panties_boyshort_blue.png', color: '#83bdf0', category: 'panties' },
  towel: { label: 'Полотенце', asset: './assets/match3/tile_rolled_towel_blue.png', color: '#6da9cf', category: 'towel' },
  socks: { label: 'Пара', asset: './assets/match3/tile_socks_cream.png', color: '#d8c7a8', category: 'socks' },
  sportsBra: { label: 'Спорт', asset: './assets/match3/tile_sports_bra_teal.png', color: '#45a6a3', category: 'bra' },
};

export const ingredientPresentation: Record<IngredientKey, Readonly<{ label: string; asset: string }>> = {
  receipt: { label: 'Квитанция', asset: './assets/match3/goal_receipt.png' },
  memoryCard: { label: 'Карта памяти', asset: './assets/match3/goal_memory_card.png' },
  serviceKey: { label: 'Сервисный ключ', asset: './assets/clues/clue_service_key.png' },
  damagedTowel: { label: 'Полотенце со швом', asset: './assets/clues/clue_towel_conductive_seam.png' },
  laundryCalendar: { label: 'Календарь стирки', asset: './assets/match3/goal_receipt.png' },
  repairLog: { label: 'Журнал ремонта', asset: './assets/match3/goal_memory_card.png' },
  warrantyCard: { label: 'Гарантийная карта', asset: './assets/match3/goal_receipt.png' },
  silverSpool: { label: 'Серебристая катушка', asset: './assets/clues/clue_towel_conductive_seam.png' },
  asterionSpec: { label: 'Спецификация Asterion', asset: './assets/match3/goal_receipt.png' },
  missingNumberSheet: { label: 'Лист пропущенных номеров', asset: './assets/match3/goal_memory_card.png' },
  handoffSlip: { label: 'Транспортная накладная', asset: './assets/match3/goal_receipt.png' },
  stitchedWristband: { label: 'Напульсник со швом', asset: './assets/clues/clue_towel_conductive_seam.png' },
  transferSeal: { label: 'Пломба контейнера', asset: './assets/match3/goal_memory_card.png' },
  routeCard: { label: 'Маршрутная карточка', asset: './assets/match3/goal_receipt.png' },
  transferManifest: { label: 'Транспортный манифест', asset: './assets/match3/goal_receipt.png' },
  secondSkinTag: { label: 'Активная метка Second Skin', asset: './assets/clues/clue_towel_conductive_seam.png' },
  pilotList: { label: 'Закрытый список пилота', asset: './assets/match3/goal_memory_card.png' },
  familyReceipt: { label: 'Квитанция ателье', asset: './assets/match3/goal_receipt.png' },
  atelierLedger: { label: 'Книга заказов', asset: './assets/match3/goal_memory_card.png' },
  markedPackage: { label: 'Помеченный пакет', asset: './assets/clues/clue_towel_conductive_seam.png' },
  serviceKeyCard: { label: 'Служебная ключ-карта', asset: './assets/clues/clue_service_key.png' },
  handheldScanner: { label: 'Ручной сканер', asset: './assets/match3/goal_memory_card.png' },
  rinaCatalog: { label: 'Каталог Рины', asset: './assets/match3/goal_receipt.png' },
  recentMarkedItem: { label: 'Новый помеченный предмет', asset: './assets/clues/clue_towel_conductive_seam.png' },
  returnConfirmation: { label: 'Подтверждение возврата', asset: './assets/match3/goal_receipt.png' },
  backupDrive: { label: 'Резервный накопитель', asset: './assets/match3/goal_memory_card.png' },
  finalSlide: { label: 'Финальный слайд', asset: './assets/match3/goal_memory_card.png' },
};

export const blockerPresentation: Record<BlockerKey, Readonly<{ label: string; asset: string }>> = {
  lockedCell: { label: 'Закрытая клетка', asset: './assets/match3/obstacle_locked_cell.png' },
  propBox: { label: 'Коробка реквизита', asset: './assets/match3/obstacle_prop_box_2layer.png' },
  foam: { label: 'Пена', asset: './assets/match3/obstacle_soap_foam.png' },
  cabinet: { label: 'Секция шкафа', asset: './assets/match3/obstacle_service_cabinet.png' },
  rumorCard: { label: 'Карточка слуха', asset: './assets/match3/obstacle_prop_box_2layer.png' },
  lockerLock: { label: 'Замок шкафчика', asset: './assets/match3/obstacle_locked_cell.png' },
  garmentBag: { label: 'Чехол с заказом', asset: './assets/match3/obstacle_service_cabinet.png' },
  labCover: { label: 'Защитная крышка', asset: './assets/match3/obstacle_locked_cell.png' },
  sealedPackage: { label: 'Запечатанный пакет', asset: './assets/match3/obstacle_prop_box_2layer.png' },
  supplyCrate: { label: 'Хозяйственная коробка', asset: './assets/match3/obstacle_service_cabinet.png' },
  signalNoise: { label: 'Радиопомеха', asset: './assets/match3/obstacle_soap_foam.png' },
  armorRack: { label: 'Стойка с бронёй', asset: './assets/match3/obstacle_service_cabinet.png' },
  fabricStack: { label: 'Стопка ткани', asset: './assets/match3/obstacle_prop_box_2layer.png' },
  debris: { label: 'Строительный мусор', asset: './assets/match3/obstacle_soap_foam.png' },
  ribbonTangle: { label: 'Ленточный узел', asset: './assets/match3/obstacle_soap_foam.png' },
  archiveSeal: { label: 'Архивная пломба', asset: './assets/match3/obstacle_locked_cell.png' },
  falseConclusion: { label: 'Ложный вывод', asset: './assets/match3/obstacle_prop_box_2layer.png' },
  serverGate: { label: 'Серверный шлюз', asset: './assets/match3/obstacle_locked_cell.png' },
};

export const specialAsset = './assets/match3/special_observation_magnifier.png';
export const specialAssets = {
  'flash-row': './assets/match3/specials/flash-row.svg',
  'flash-column': './assets/match3/specials/flash-column.svg',
  evidence: './assets/match3/specials/evidence.svg',
  lead: './assets/match3/specials/lead.svg',
  insight: './assets/match3/specials/insight.svg',
} as const;

const positions = (items: readonly (number | readonly [number, 1 | 2])[]): BoardPlacement[] => items.map((item) => (
  typeof item === 'number' ? { index: item, layers: 1 } : { index: item[0], layers: item[1] }
));

export const levels: readonly LevelDefinition[] = [
  {
    id: 'M3_00_LOCKER_TUTORIAL',
    shortId: 'M3_00', title: 'Шкафчик Эми', storyAction: 'Зафиксировать содержимое шкафчика и найти связь с прачечной.',
    context: { sourceSceneId: 'VN_SCENE_01_E0_PRE', pageBackground: 'lockerAthletics', boardSurface: 'locker-bench', boardFrame: 'evidence-file', narrativeProfile: 'locker-search', tilePresentationProfile: 'locker-laundry', participants: ['miku', 'onoe', 'ayuki', 'emi'], narrativeTags: ['locker-room', 'laundry', 'missing-underwear', 'evidence-sort'] },
    tutorialConcepts: ['basic-swap', 'clear-blocker', 'drop-ingredient', 'activate-special', 'combine-specials'],
    activeTiles: ['pantiesSportWhite', 'pantiesLacePink', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'sportsBra', 'laundryTag'],
    initialTiles: [
      { index: 0, tile: 'pantiesSportWhite' }, { index: 1, tile: 'pantiesSportWhite' },
      { index: 2, tile: 'pantiesLacePink' }, { index: 3, tile: 'pantiesSportWhite' },
      { index: 4, tile: 'pantiesHighWaistBlack' }, { index: 10, tile: 'pantiesSportWhite' },
    ],
    moves: 24,
    objectives: [{ kind: 'clearBlockers', target: 6, label: 'Клетки' }, { kind: 'drop', ingredient: 'receipt', target: 1, label: 'Квитанция' }],
    blocker: 'lockedCell', blockers: positions([18, 19, 26, 27, 34, 35]), ingredients: [{ index: 51, kind: 'receipt' }], seed: 9001,
    clueId: 'CUE_001', clueTitle: 'Выборочная пропажа', clueSummary: 'Из партии прачечной исчезли не все вещи; цена и заметность не объясняют выбор.',
    startBark: { speaker: 'Оноэ', text: 'Сначала категории. Потом выводы.' }, winBark: { speaker: 'Эми', text: 'Нашли что-нибудь настоящее?' }, loseBark: { speaker: 'Оноэ', text: 'Мы нарушили порядок поиска. Повторим без потери прогресса сцены.' },
  },
  {
    id: 'M3_01_PHOTO_PROPS', shortId: 'M3_01', title: 'Фотореквизит Кэнтаро', storyAction: 'Разобрать реквизит по номерам и найти карту памяти с таймкодами.',
    context: { sourceSceneId: 'VN_SCENE_03_E1_PRE', pageBackground: 'kentaroApartment', boardSurface: 'photo-contact-sheet', boardFrame: 'photo-file', narrativeProfile: 'photo-alibi', tilePresentationProfile: 'photo-props', participants: ['miku', 'onoe', 'ayuki', 'kentaro'], narrativeTags: ['apartment', 'photo-props', 'timeline', 'alibi'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['pantiesLacePink', 'pantiesHighWaistBlack', 'panties', 'camisole', 'sportsBra', 'laundryTag'], moves: 26,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Коробки' }, { kind: 'drop', ingredient: 'memoryCard', target: 1, label: 'Карта' }],
    blocker: 'propBox', blockers: positions([[9, 2], [10, 2], 17, 18, [25, 2], 26, 33, [34, 2], 41, 42]), ingredients: [{ index: 50, kind: 'memoryCard' }], seed: 9002,
    clueId: 'CUE_002', clueTitle: 'Проверяемое алиби', clueSummary: 'Таймкоды съёмки подтверждают алиби Кэнтаро; сервисная тележка остаётся общей связью.',
    startBark: { speaker: 'Кэнтаро', text: 'Сначала номера. И ничего не надевайте — это реквизит.' }, winBark: { speaker: 'Мику', text: 'Нашла. Теперь посмотрим не на комнату, а на время.' }, loseBark: { speaker: 'Аюки', text: 'Комната победила. Требую реванш и более узкую специализацию коробок.' },
  },
  {
    id: 'M3_02_POOL_LAUNDRY', shortId: 'M3_02', title: 'Мокрые показания', storyAction: 'Восстановить партию стирки, очистить пену и открыть сервисный шкаф.',
    context: { sourceSceneId: 'VN_SCENE_05_E2_PRE', pageBackground: 'poolLocker', boardSurface: 'pool-service-tile', boardFrame: 'wet-service', narrativeProfile: 'pool-laundry', tilePresentationProfile: 'pool-service', participants: ['miku', 'onoe', 'ayuki', 'norihiro'], narrativeTags: ['pool-locker', 'laundry', 'foam', 'service-access'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['pantiesSportWhite', 'pantiesBoyshortBlue', 'sportsBra', 'towel', 'laundryTag', 'socks'],
    boardHoles: [0, 1, 6, 7, 8, 15, 48, 55, 56, 57, 62, 63], moves: 25,
    objectives: [{ kind: 'clearBlockers', target: 18, label: 'Пена' }, { kind: 'drop', ingredient: 'serviceKey', target: 1, label: 'Ключ' }],
    blocker: 'foam', blockers: positions([[16, 2], 17, 18, [19, 2], 20, 21, 24, [25, 2], 26, 29, [30, 2], 31, 34, 35, [36, 2], 37, 38, 39]), ingredients: [{ index: 42, kind: 'serviceKey' }], seed: 9003,
    clueId: 'CUE_003', clueTitle: 'Смешанные цели', clueSummary: 'Тип, цена, цвет и владелец вещей не объясняют выбор; вещи смешали до возврата.',
    startBark: { speaker: 'Норихиро', text: 'Бирки сначала. Мокрые догадки сушатся дольше полотенец.' }, winBark: { speaker: 'Оноэ', text: 'Партия восстановлена. Теперь сравним пропавшее.' }, loseBark: { speaker: 'Норихиро', text: 'Пена победила дедукцию. Начните с краёв.' },
  },
  {
    id: 'M3_03_ORDERED_APARTMENT', shortId: 'M3_03', title: 'Идеальный порядок', storyAction: 'Проверить возвращённый мешок и найти предмет с новым повреждением.',
    context: { sourceSceneId: 'VN_SCENE_07_E3_PRE', pageBackground: 'norihiroApartment', boardSurface: 'ordered-cabinet', boardFrame: 'precision-file', narrativeProfile: 'ordered-inspection', tilePresentationProfile: 'ordered-return', participants: ['miku', 'onoe', 'ayuki', 'norihiro'], narrativeTags: ['apartment', 'ordered-storage', 'returned-laundry', 'tampering'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['pantiesSportWhite', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'camisole', 'socks', 'laundryTag'], moves: 27,
    objectives: [{ kind: 'clearBlockers', target: 8, label: 'Секции' }, { kind: 'dropGroup', ingredients: ['receipt', 'damagedTowel'], target: 2, label: 'Улики' }],
    blocker: 'cabinet', blockers: positions([17, 18, 21, 22, 33, 34, 37, 38]), ingredients: [{ index: 50, kind: 'receipt' }, { index: 53, kind: 'damagedTowel' }], seed: 9004,
    clueId: 'CUE_004', clueTitle: 'Серебристая нить', clueSummary: 'Ничего не украли, но под сервисной биркой появился новый проводящий шов.',
    startBark: { speaker: 'Норихиро', text: 'Слева направо. Если нарушите порядок, вы его восстановите.' }, winBark: { speaker: 'Мику', text: 'Здесь ничего не украли. Но кое-что добавили.' }, loseBark: { speaker: 'Норихиро', text: 'Вы проиграли шкафу. Он согласен на повторную проверку.' },
  },
  {
    id: 'M3_04_EMERGENCY_MEETING', shortId: 'M3_04', title: 'Семь клубов, один календарь', storyAction: 'Отделить подтверждённые заявления от слухов и восстановить общий календарь стирки.',
    context: { sourceSceneId: 'VN_SCENE_09_E4_PRE', pageBackground: 'studentCouncilAuditorium', boardSurface: 'meeting-grid', boardFrame: 'audit-file', narrativeProfile: 'laundry-cadence', tilePresentationProfile: 'meeting-reports', participants: ['miku', 'onoe', 'ayuki', 'mayu'], narrativeTags: ['student-council', 'seven-clubs', 'laundry-calendar', 'rumor-control'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'pantiesSportWhite', 'pantiesLacePink', 'sportsBra', 'socks', 'towel'],
    boardHoles: [3, 4, 11, 12, 51, 52, 59, 60], moves: 28,
    objectives: [{ kind: 'collect', tile: 'laundryTag', target: 14, label: 'Подтверждённые бирки' }, { kind: 'clearBlockers', target: 8, label: 'Слухи' }, { kind: 'drop', ingredient: 'laundryCalendar', target: 1, label: 'Календарь' }],
    blocker: 'rumorCard', blockers: positions([9, 18, 21, 22, 42, 45, 49, 54]), ingredients: [{ index: 27, kind: 'laundryCalendar' }], seed: 9005,
    clueId: 'CUE_005', clueTitle: 'Ритм прачечной', clueSummary: 'Все подтверждённые случаи проходят через центральную прачечную за 24–48 часов до пропажи.',
    startBark: { speaker: 'Маю', text: 'Факты отдельно. Слухи отдельно. И никаких скриншотов.' }, winBark: { speaker: 'Мику', text: 'Семь клубов, один повторяющийся маршрут. Теперь это система.' }, loseBark: { speaker: 'Оноэ', text: 'Мы смешали свидетельства и версии. Пересоберём таблицу.' },
  },
  {
    id: 'M3_05_BASKETBALL_LOCKERS', shortId: 'M3_05', title: 'Высокие шкафчики', storyAction: 'Открыть секции, сверить сервисные бирки и восстановить журнал ремонта.',
    context: { sourceSceneId: 'VN_SCENE_11_E5_PRE', pageBackground: 'basketballLocker', boardSurface: 'locker-columns', boardFrame: 'service-file', narrativeProfile: 'basketball-repair', tilePresentationProfile: 'basketball-service', participants: ['miku', 'onoe', 'ayuki', 'hinata'], narrativeTags: ['basketball-locker', 'repair-log', 'service-stitch', 'false-suspect'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'pantiesSportWhite', 'pantiesHighWaistBlack', 'sportsBra', 'camisole', 'socks'], moves: 27,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Замки' }, { kind: 'collect', tile: 'laundryTag', target: 12, label: 'Сервисные бирки' }, { kind: 'drop', ingredient: 'repairLog', target: 1, label: 'Журнал ремонта' }],
    blocker: 'lockerLock', blockers: positions([8, 15, 16, 23, 24, 31, 32, 39, 40, 47]), ingredients: [{ index: 28, kind: 'repairLog' }], seed: 9006,
    clueId: 'CUE_006', clueTitle: 'Сервисная строчка', clueSummary: 'Размер, стиль и владелец не связаны с пропажами; на спорных вещах повторяется одинаковая сервисная строчка.',
    startBark: { speaker: 'Хината', text: 'Сначала журнал и ярлыки. Потом можете подозревать кого угодно.' }, winBark: { speaker: 'Оноэ', text: 'Корреляции с внешним видом нет. А строчка повторяется.' }, loseBark: { speaker: 'Аюки', text: 'Шкафчики выше моей теории. Ещё раз, но теперь по ярлыкам.' },
  },
  {
    id: 'M3_06_TEXTILE_WORKSHOP', shortId: 'M3_06', title: 'Мастерская Хинаты', storyAction: 'Сопоставить заказы, убрать чехлы и найти гарантийную карту вместе с серебристой катушкой.',
    context: { sourceSceneId: 'VN_SCENE_13_E6_PRE', pageBackground: 'textileWorkshop', boardSurface: 'workbench-clusters', boardFrame: 'workshop-file', narrativeProfile: 'post-repair-seam', tilePresentationProfile: 'textile-workshop', participants: ['miku', 'onoe', 'ayuki', 'hinata'], narrativeTags: ['textile-workshop', 'warranty-card', 'conductive-thread', 'exoneration'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['sportsBra', 'camisole', 'laundryTag', 'pantiesSportWhite', 'pantiesLacePink', 'towel'],
    boardHoles: [3, 4, 11, 12, 19, 20], moves: 32,
    objectives: [{ kind: 'clearBlockers', target: 8, label: 'Чехлы' }, { kind: 'collect', tile: 'sportsBra', target: 12, label: 'Заказы' }, { kind: 'dropGroup', ingredients: ['warrantyCard', 'silverSpool'], target: 2, label: 'Проверка машины' }],
    blocker: 'garmentBag', blockers: positions([[10, 2], 13, [18, 2], 21, 42, [45, 2], 50, 53]), ingredients: [{ index: 26, kind: 'warrantyCard' }, { index: 29, kind: 'silverSpool' }], seed: 9007,
    clueId: 'CUE_007', clueTitle: 'Шов после ремонта', clueSummary: 'До центральной прачечной серебристого шва не было; оборудование Хинаты не поддерживает такую проводящую нить.',
    startBark: { speaker: 'Хината', text: 'Заказы слева, образцы справа. Машину не обвиняйте без спецификации.' }, winBark: { speaker: 'Мику', text: 'Хината исключена. Шов появился после её мастерской — на маршруте прачечной.' }, loseBark: { speaker: 'Хината', text: 'Вы смешали заказы и образцы. В мастерской это хуже плохой гипотезы.' },
  },
  {
    id: 'M3_07_ASTERION_THREAD', shortId: 'M3_07', title: 'Образцы Asterion', storyAction: 'Сопоставить серебристую нить, лабораторные карточки и официальную спецификацию.',
    context: { sourceSceneId: 'VN_SCENE_15_E7_PRE', pageBackground: 'asterionLab', boardSurface: 'signal-cross', boardFrame: 'lab-file', narrativeProfile: 'asterion-thread', tilePresentationProfile: 'asterion-lab', participants: ['miku', 'onoe', 'ayuki', 'kurose'], narrativeTags: ['asterion-lab', 'conductive-thread', 'serial-code', 'assignment-registry'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'towel', 'socks', 'pantiesSportWhite'], moves: 28,
    objectives: [{ kind: 'clearBlockers', target: 8, label: 'Крышки' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Образцы' }, { kind: 'drop', ingredient: 'asterionSpec', target: 1, label: 'Спецификация' }],
    blocker: 'labCover', blockers: positions([9, 12, 18, 21, 42, 45, 50, 53]), ingredients: [{ index: 27, kind: 'asterionSpec' }], seed: 9008,
    clueId: 'CUE_008', clueTitle: 'Нить Asterion', clueSummary: 'Серебристая нить принадлежит Asterion, но открытый реестр не содержит назначений на личные вещи студентов.',
    startBark: { speaker: 'Куросэ', text: 'Состав, шаг шва, код партии. Если образец наш — прибор это покажет.' }, winBark: { speaker: 'Мику', text: 'Нить совпала. А официального назначения на личные вещи всё равно нет.' }, loseBark: { speaker: 'Оноэ', text: 'Мы смешали техническое совпадение и административную запись. Разделим их.' },
  },
  {
    id: 'M3_08_LOST_FOUND_LEDGER', shortId: 'M3_08', title: 'Восемьдесят семь пакетов', storyAction: 'Восстановить сервисные ряды склада и последовательность пропущенных номеров.',
    context: { sourceSceneId: 'VN_SCENE_17_E8_PRE', pageBackground: 'lostFoundWarehouse', boardSurface: 'service-lanes', boardFrame: 'warehouse-file', narrativeProfile: 'missing-package-ranges', tilePresentationProfile: 'lost-found', participants: ['miku', 'onoe', 'ayuki', 'rina', 'mayu'], narrativeTags: ['lost-found', 'sealed-packages', 'service-codes', 'missing-ranges'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'pantiesSportWhite', 'pantiesHighWaistBlack', 'sportsBra', 'socks', 'towel'], moves: 30,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Пакеты' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Сервисные коды' }, { kind: 'drop', ingredient: 'missingNumberSheet', target: 1, label: 'Пропуски' }],
    blocker: 'sealedPackage', blockers: positions([[8, 2], 14, [16, 2], 19, 42, [43, 2], 48, 51, 56, 59]), ingredients: [{ index: 28, kind: 'missingNumberSheet' }], seed: 9009,
    clueId: 'CUE_009', clueTitle: 'Пропуски в журнале', clueSummary: 'Спорные пакеты удалены из обычной последовательности целыми диапазонами, совпадающими с датами подтверждённых пропаж.',
    startBark: { speaker: 'Рина', text: 'Номера важнее содержимого. Если последовательность сломана, сначала найдите место разрыва.' }, winBark: { speaker: 'Оноэ', text: 'Это не случайные потери. Из журнала вырезаны диапазоны одной сервисной цепочки.' }, loseBark: { speaker: 'Рина', text: 'Вы смешали секции и статусы. Склад прощает это хуже, чем музей.' },
  },
  {
    id: 'M3_09_MAINTENANCE_KEYS', shortId: 'M3_09', title: 'Журнал универсального ключа', storyAction: 'Разобрать хозяйственный склад, восстановить передачу ключа и транспортную накладную.',
    context: { sourceSceneId: 'VN_SCENE_19_E9_PRE', pageBackground: 'maintenanceRoom', boardSurface: 'service-lanes', boardFrame: 'maintenance-file', narrativeProfile: 'night-containers', tilePresentationProfile: 'maintenance-service', participants: ['miku', 'onoe', 'ayuki', 'gen'], narrativeTags: ['maintenance-room', 'master-key', 'lost-socks', 'asterion-containers'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['socks', 'laundryTag', 'towel', 'sportsBra', 'camisole', 'pantiesSportWhite'], moves: 29,
    objectives: [{ kind: 'clearBlockers', target: 8, label: 'Коробки' }, { kind: 'collect', tile: 'socks', target: 14, label: 'Пары носков' }, { kind: 'dropGroup', ingredients: ['serviceKey', 'handoffSlip'], target: 2, label: 'Ключ и накладная' }],
    blocker: 'supplyCrate', blockers: positions([10, 13, 18, 21, 42, 45, 50, 53]), ingredients: [{ index: 26, kind: 'serviceKey' }, { index: 29, kind: 'handoffSlip' }], seed: 9010,
    clueId: 'CUE_010', clueTitle: 'Ночные контейнеры', clueSummary: 'После закрытия прачечной контейнеры Asterion входят в тот же физический маршрут; накладная связывает ночную передачу с лабораторным префиксом Куросэ.',
    startBark: { speaker: 'Гэн', text: 'Ключи слева, возвраты справа. Носки — отдельная система и прошу её уважать.' }, winBark: { speaker: 'Мику', text: 'Гэн не сходится по времени. А контейнер Asterion сходится с маршрутом слишком хорошо.' }, loseBark: { speaker: 'Аюки', text: 'Я проиграла стенду носков. Он требует реванш по форме U.' },
  },
  {
    id: 'M3_10_CONTROL_SAMPLE_GEAR', shortId: 'M3_10', title: 'Контрольная экипировка', storyAction: 'Открыть секции клуба карате, отделить перемещённую экипировку и проверить повторяющийся серебристый шов.',
    context: { sourceSceneId: 'VN_SCENE_21_E10_PRE', pageBackground: 'combatClubHall', boardSurface: 'locker-columns', boardFrame: 'service-file', narrativeProfile: 'control-sample-gear', tilePresentationProfile: 'karate-control', participants: ['miku', 'onoe', 'ayuki', 'aoi', 'kentaro'], narrativeTags: ['karate-club', 'control-sample', 'sports-monitoring', 'silver-stitch'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'socks', 'towel', 'pantiesSportWhite', 'pantiesHighWaistBlack'], moves: 28,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Замки' }, { kind: 'collect', tile: 'laundryTag', target: 12, label: 'Сервисные ярлыки' }, { kind: 'drop', ingredient: 'stitchedWristband', target: 1, label: 'Напульсник со швом' }],
    blocker: 'lockerLock', blockers: positions([5, 6, 10, 13, 26, 29, 42, 45, 50, 53]), ingredients: [{ index: 46, kind: 'stitchedWristband' }], seed: 9011,
    clueId: 'CUE_011', clueTitle: 'Контрольная выборка', clueSummary: 'Серебристая система встречается на белье и внешней экипировке участников мониторинга: бельё — основная выборка, но не единственная.',
    startBark: { speaker: 'Аой', text: 'Открываем секции по порядку. Честь клуба переживёт контрольную выборку.' }, winBark: { speaker: 'Мику', text: 'Шов повторяется на внешней экипировке. Значит, критерий технический, а не личный.' }, loseBark: { speaker: 'Оноэ', text: 'Мы смешали перемещение и пропажу. Разделим выборку и повторим.' },
  },
  {
    id: 'M3_11_ASTERION_TRANSFER', shortId: 'M3_11', title: 'Цепочка контейнера', storyAction: 'Сопоставить пломбы, маршрут и манифест между прачечной, перегрузочным пунктом и лабораторией Asterion.',
    context: { sourceSceneId: 'VN_SCENE_23_E11_PRE', pageBackground: 'asterionTransferPoint', boardSurface: 'service-lanes', boardFrame: 'lab-file', narrativeProfile: 'lab-transfer-chain', tilePresentationProfile: 'asterion-transfer', participants: ['miku', 'onoe', 'ayuki', 'kentaro'], narrativeTags: ['service-yard', 'asterion-transfer', 'container-seals', 'photo-chain'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'socks', 'towel', 'sportsBra', 'camisole', 'pantiesSportWhite'], boardHoles: [1, 2, 5, 6, 57, 58, 61, 62], moves: 33,
    objectives: [{ kind: 'clearBlockers', target: 8, label: 'Упаковка' }, { kind: 'dropGroup', ingredients: ['transferSeal', 'routeCard'], target: 2, label: 'Пломба и маршрут' }, { kind: 'drop', ingredient: 'transferManifest', target: 1, label: 'Манифест' }],
    blocker: 'sealedPackage', blockers: positions([8, 15, 24, 31, 32, 39, 48, 55]), ingredients: [{ index: 28, kind: 'transferSeal' }, { index: 45, kind: 'routeCard' }, { index: 36, kind: 'transferManifest' }], seed: 9012,
    clueId: 'CUE_012', clueTitle: 'Цепочка передачи Asterion', clueSummary: 'Фотографии, пломбы и манифест доказывают маршрут спорных вещей из прачечной в лабораторный контур Asterion и обратно.',
    startBark: { speaker: 'Кэнтаро', text: 'Номер контейнера есть в оригинале. Теперь докажем весь путь, а не только красивый кадр.' }, winBark: { speaker: 'Оноэ', text: 'Цепочка непрерывна. Лаборатория входит в физический маршрут вещей.' }, loseBark: { speaker: 'Мику', text: 'У нас есть части маршрута, но нет непрерывной цепочки. Соберём её заново.' },
  },
  {
    id: 'M3_12_SECOND_SKIN_SIGNAL', shortId: 'M3_12', title: 'Сигнал Second Skin', storyAction: 'Отделить радиопомехи от повторяющегося сигнала и извлечь активную микрометку из сервисной бирки.',
    context: { sourceSceneId: 'VN_SCENE_25_E12_PRE', pageBackground: 'oldGymNight', boardSurface: 'signal-cross', boardFrame: 'evidence-file', narrativeProfile: 'second-skin-tag', tilePresentationProfile: 'second-skin-signal', participants: ['miku', 'onoe', 'ayuki'], narrativeTags: ['old-gym-night', 'occult-bait', 'radio-signal', 'second-skin'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'socks', 'pantiesLacePink', 'pantiesSportWhite'], boardHoles: [0, 1, 6, 7, 8, 9, 14, 15, 48, 49, 54, 55, 56, 57, 62, 63], moves: 28,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Помехи' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Сигнальные узлы' }, { kind: 'drop', ingredient: 'secondSkinTag', target: 1, label: 'Микрометка' }],
    blocker: 'signalNoise', blockers: positions([11, 19, 25, 26, 27, 28, 29, 30, 35, 43]), ingredients: [{ index: 20, kind: 'secondSkinTag' }], seed: 9013,
    clueId: 'CUE_013', clueTitle: 'Метка Second Skin', clueSummary: 'Активная микрометка передаёт данные под внутренним именем Second Skin и объясняет технический критерий выбора вещей.',
    startBark: { speaker: 'Аюки', text: 'Если ПанцуИтер настоящий, сейчас у него будет очень плохая ночь.' }, winBark: { speaker: 'Мику', text: 'Не демон. Активная метка, радиопакет и имя Second Skin.' }, loseBark: { speaker: 'Оноэ', text: 'Шум победил измерение. Повторяем с разделёнными частотами.' },
  },
  {
    id: 'M3_13_KENDO_PILOT_LIST', shortId: 'M3_13', title: 'Под бронёй', storyAction: 'Расчистить стойки кэндо и сопоставить сервисные коды с закрытым списком участников пилота.',
    context: { sourceSceneId: 'VN_SCENE_27_E13_PRE', pageBackground: 'combatClubHall', boardSurface: 'locker-columns', boardFrame: 'service-file', narrativeProfile: 'pilot-participant-codes', tilePresentationProfile: 'kendo-pilot', participants: ['miku', 'onoe', 'ayuki', 'kubo'], narrativeTags: ['kendo-hall', 'armor', 'pilot-list', 'second-skin'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'socks', 'pantiesSportWhite', 'camisole', 'towel'], moves: 30,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Стойки с бронёй' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Коды участников' }, { kind: 'drop', ingredient: 'pilotList', target: 1, label: 'Список пилота' }],
    blocker: 'armorRack', blockers: positions([9, 12, 18, 21, 42, 45, 50, 53, 58, 61]), ingredients: [{ index: 27, kind: 'pilotList' }], seed: 9014,
    clueId: 'CUE_014', clueTitle: 'Закрытый список пилота', clueSummary: 'Все подтверждённые владельцы пропавших вещей входят в закрытый список участников Second Skin.',
    startBark: { speaker: 'Кубо', text: 'Прошу отделить мои перемещения мешков от того, что было внутри них.' }, winBark: { speaker: 'Мику', text: 'Совпало всё. Пропажи следуют списку участников пилота.' }, loseBark: { speaker: 'Оноэ', text: 'Список не восстановлен. Повторяем без выводов о посреднике.' },
  },
  {
    id: 'M3_14_KUBO_ATELIER_LEDGER', shortId: 'M3_14', title: 'Книга семейного ателье', storyAction: 'Сопоставить квитанции, изделия и книгу заказов, не смешивая записи посторонних клиентов.',
    context: { sourceSceneId: 'VN_SCENE_29_E14_PRE', pageBackground: 'textileWorkshop', boardSurface: 'workbench-clusters', boardFrame: 'workshop-file', narrativeProfile: 'rina-pretheft-search', tilePresentationProfile: 'kubo-atelier', participants: ['miku', 'onoe', 'ayuki', 'kubo', 'kubo-mother'], narrativeTags: ['family-atelier', 'order-ledger', 'pretheft', 'silver-seam'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'pantiesLacePink', 'pantiesSportWhite', 'towel'], moves: 29,
    objectives: [{ kind: 'clearBlockers', target: 8, label: 'Стопки ткани' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Коды заказов' }, { kind: 'dropGroup', ingredients: ['familyReceipt', 'atelierLedger'], target: 2, label: 'Квитанция + книга' }],
    blocker: 'fabricStack', blockers: positions([[10, 2], 13, 18, 21, 42, [45, 2], 50, 53]), ingredients: [{ index: 26, kind: 'familyReceipt' }, { index: 29, kind: 'atelierLedger' }], seed: 9015,
    clueId: 'CUE_015', clueTitle: 'Рина знала заранее', clueSummary: 'Книга заказов доказывает: Рина искала серебристые швы и записывала коды ещё до первых публичных краж.',
    startBark: { speaker: 'Мать Кубо', text: 'Сначала даты и изделия. Чужие имена в расследование не входят автоматически.' }, winBark: { speaker: 'Оноэ', text: 'Хронология готова. Рина искала метки до начала публичных пропаж.' }, loseBark: { speaker: 'Кубо', text: 'Семейная книга заслуживает более аккуратного второго прохода.' },
  },
  {
    id: 'M3_15_ABANDONED_LAUNDRY_ROUTE', shortId: 'M3_15', title: 'Старый сервисный маршрут', storyAction: 'Расчистить заброшенную прачечную, собрать следы нити и вывести помеченный пакет с действующей ключ-картой.',
    context: { sourceSceneId: 'VN_SCENE_31_E15_PRE', pageBackground: 'abandonedLaundry', boardSurface: 'service-lanes', boardFrame: 'maintenance-file', narrativeProfile: 'consent-note-route', tilePresentationProfile: 'abandoned-laundry', participants: ['miku', 'onoe', 'ayuki'], narrativeTags: ['abandoned-laundry', 'service-route', 'anonymous-note', 'consent'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'towel', 'socks', 'camisole', 'pantiesLacePink', 'pantiesSportWhite'], moves: 30,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Мусор' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Следы нити' }, { kind: 'dropGroup', ingredients: ['markedPackage', 'serviceKeyCard'], target: 2, label: 'Пакет + ключ-карта' }],
    blocker: 'debris', blockers: positions([8, 11, 16, 19, 24, 27, 40, 43, 48, 51]), ingredients: [{ index: 28, kind: 'markedPackage' }, { index: 31, kind: 'serviceKeyCard' }], seed: 9016,
    clueId: 'CUE_016', clueTitle: 'Маршрут согласия', clueSummary: 'Старый корпус остаётся действующим служебным маршрутом; анонимный источник знает о согласиях участников и ведёт клуб по следу Рины.',
    startBark: { speaker: 'Аюки', text: 'Если кот сейчас ещё и откроет шкаф, я внесу его в штат.' }, winBark: { speaker: 'Мику', text: 'Маршрут действующий. И записка переводит дело от краж к вопросу согласия.' }, loseBark: { speaker: 'Оноэ', text: 'Мусор скрыл цепочку. Повторяем и держим пакет отдельно от версии.' },
  },
  {
    id: 'M3_16_PINK_RIBBON_SCANNER', shortId: 'M3_16', title: 'Розовые ленты не лгут', storyAction: 'Распутать ленты, восстановить сервисные коды и подтвердить свежую активацию Second Skin ручным сканером.',
    context: { sourceSceneId: 'VN_SCENE_33_E16_PRE', pageBackground: 'gymnasticsCostume', boardSurface: 'signal-cross', boardFrame: 'evidence-file', narrativeProfile: 'post-rina-activation', tilePresentationProfile: 'gymnastics-scanner', participants: ['miku', 'onoe', 'ayuki', 'vincent'], narrativeTags: ['gymnastics', 'pink-ribbons', 'scanner', 'post-rina-activation'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'socks', 'pantiesLacePink', 'pantiesSportWhite'], moves: 29,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Ленточные узлы' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Коды меток' }, { kind: 'drop', ingredient: 'handheldScanner', target: 1, label: 'Сканер' }],
    blocker: 'ribbonTangle', blockers: positions([11, 12, 18, 21, 42, 45, 50, 53, 58, 61]), ingredients: [{ index: 27, kind: 'handheldScanner' }], seed: 9017,
    clueId: 'CUE_017', clueTitle: 'Активация после Рины', clueSummary: 'Новая метка Second Skin активировалась после ухода Рины, а SS-EDGE ответил через действующий кампусный ретранслятор.',
    startBark: { speaker: 'Винсент', text: 'Ленты отдельно, сервисные ярлыки отдельно. Сканер не любит, когда ему помогают догадками.' }, winBark: { speaker: 'Мику', text: 'Новая активация позже доступа Рины. Second Skin продолжает работать без неё.' }, loseBark: { speaker: 'Оноэ', text: 'Мы потеряли время активации в шуме. Повторяем и сохраняем порядок кодов.' },
  },
  {
    id: 'M3_17_RINA_ARCHIVE_CATALOG', shortId: 'M3_17', title: 'Каталог Рины', storyAction: 'Открыть архивные ряды, отделить реальные цели от контрольных предметов и сверить каталог с подтверждёнными пропажами.',
    context: { sourceSceneId: 'VN_SCENE_35_E17_PRE', pageBackground: 'oldArchive', boardSurface: 'archive-rows', boardFrame: 'warehouse-file', narrativeProfile: 'rina-catalog', tilePresentationProfile: 'rina-archive', participants: ['miku', 'onoe', 'ayuki', 'rina'], narrativeTags: ['old-archive', 'sealed-evidence', 'rina-catalog', 'physical-theft'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'socks', 'pantiesHighWaistBlack', 'pantiesSportWhite'], boardHoles: [2, 3, 10, 11, 12, 13, 60, 61], moves: 30,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Архивные пломбы' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Коды целей' }, { kind: 'drop', ingredient: 'rinaCatalog', target: 1, label: 'Каталог' }],
    blocker: 'archiveSeal', blockers: positions([[8, 2], 14, [16, 2], 19, 42, [43, 2], 48, 51, 56, 59]), ingredients: [{ index: 28, kind: 'rinaCatalog' }], seed: 9018,
    clueId: 'CUE_018', clueTitle: 'Каталог Рины', clueSummary: 'Запечатанный каталог полностью совпадает с подтверждёнными кражами и отделяет реальные цели Second Skin от случайной маскирующей выборки.',
    startBark: { speaker: 'Рина', text: 'Сначала коды и пломбы. Мотив не станет точнее, если вы перепутаете контрольную полку с целями.' }, winBark: { speaker: 'Оноэ', text: 'Совпадение полное. Рина физически забирала вещи и каталогизировала каждую цель.' }, loseBark: { speaker: 'Рина', text: 'Вы смешали цели и статистический шум. Архив требует более строгого второго прохода.' },
  },
  {
    id: 'M3_18_FULL_TIMELINE_PROOF', shortId: 'M3_18', title: 'Полная временная линия', storyAction: 'Убрать опровергнутые версии, свести ключевые улики по датам и доказать продолжение Second Skin после отзыва доступа Рины.',
    context: { sourceSceneId: 'VN_SCENE_37_E18_PRE', pageBackground: 'clubroomNight', boardSurface: 'ordered-grid', boardFrame: 'audit-file', narrativeProfile: 'continued-project-proof', tilePresentationProfile: 'final-timeline', participants: ['miku', 'onoe', 'ayuki', 'rina', 'emi'], narrativeTags: ['final-timeline', 'continued-project', 'kurose', 'strategy-pivot'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'socks', 'pantiesLacePink', 'pantiesSportWhite'], moves: 31,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Ложные выводы' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Ключевые коды' }, { kind: 'drop', ingredient: 'recentMarkedItem', target: 1, label: 'Новый предмет' }],
    blocker: 'falseConclusion', blockers: positions([10, 15, 18, 21, 42, 45, 50, 53, 58, 61]), ingredients: [{ index: 26, kind: 'recentMarkedItem' }], seed: 9019,
    clueId: 'CUE_019', clueTitle: 'Продолжение Second Skin', clueSummary: 'Новая маркировка и SS-EDGE продолжаются после отзыва доступа Рины; её кражи и скрытый эксперимент Куросэ являются разными доказанными нарушениями.',
    startBark: { speaker: 'Эми', text: 'Отмечайте отдельно всё, что проект и Рина решили за владельцев. Не смешивайте вред.' }, winBark: { speaker: 'Мику', text: 'Линия сходится. Рина — похититель, но Second Skin продолжился независимо от неё.' }, loseBark: { speaker: 'Оноэ', text: 'Мы смешали доказанные действия и гипотезу об организаторе. Пересобираем временную линию.' },
  },
  {
    id: 'M3_19_PRIVATE_RETURN', shortId: 'M3_19', title: 'Приватный возврат', storyAction: 'Вернуть пакеты правильным владельцам по анонимным кодам, не раскрывая чужие данные.',
    context: { sourceSceneId: 'VN_SCENE_39_E19_PRE', pageBackground: 'anonymousReturnCounter', boardSurface: 'archive-rows', boardFrame: 'warehouse-file', narrativeProfile: 'private-return', tilePresentationProfile: 'private-return', participants: ['miku', 'onoe', 'ayuki', 'rina', 'emi'], narrativeTags: ['anonymous-return', 'privacy', 'case-closed', 'rina'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'socks', 'pantiesHighWaistBlack', 'pantiesSportWhite'], moves: 30,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Возвратные пломбы' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Анонимные коды' }, { kind: 'drop', ingredient: 'returnConfirmation', target: 1, label: 'Подтверждение' }],
    blocker: 'archiveSeal', blockers: positions([8, 14, 16, 19, 42, 43, 48, 51, 56, 59]), ingredients: [{ index: 28, kind: 'returnConfirmation' }], seed: 9020,
    clueId: 'CUE_020', clueTitle: 'Формально закрыто', clueSummary: 'Все украденные вещи возвращены приватно, а администрация закрывает серию краж на Рине, не объясняя продолжающийся Second Skin.',
    startBark: { speaker: 'Эми', text: 'Коды — отдельно от имён. Никто не должен платить приватностью за возврат своей вещи.' }, winBark: { speaker: 'Оноэ', text: 'Выдача сходится. Кражи Рины закрыты доказательно и без раскрытия владельцев.' }, loseBark: { speaker: 'Мику', text: 'Мы смешали коды выдачи. Повторяем — здесь ошибка сама станет новым нарушением.' },
  },
  {
    id: 'M3_20_SERVER_CONSENT_LOGS', shortId: 'M3_20', title: 'Карта согласий', storyAction: 'Сохранить серверные журналы Second Skin до удаления и вывести резервный накопитель из сервисной зоны.',
    context: { sourceSceneId: 'VN_SCENE_41_E20_PRE', pageBackground: 'serviceTunnel', boardSurface: 'service-lanes', boardFrame: 'lab-file', narrativeProfile: 'server-consent-logs', tilePresentationProfile: 'server-logs', participants: ['miku', 'onoe', 'ayuki', 'rina', 'emi', 'kurose', 'mayu'], narrativeTags: ['service-tunnel', 'server-room', 'consent', 'second-skin'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'socks', 'pantiesLacePink', 'pantiesSportWhite'], moves: 31,
    objectives: [{ kind: 'clearBlockers', target: 10, label: 'Серверные шлюзы' }, { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Журналы согласия' }, { kind: 'drop', ingredient: 'backupDrive', target: 1, label: 'Резервная копия' }],
    blocker: 'serverGate', blockers: positions([10, 13, 18, 21, 42, 45, 50, 53, 58, 61]), ingredients: [{ index: 26, kind: 'backupDrive' }], seed: 9021,
    clueId: 'CUE_021', clueTitle: 'Логи согласия', clueSummary: 'Серверные логи доказывают скрытую маркировку личных вещей, подмену области согласия и продолжение пилота после первых сигналов риска.',
    startBark: { speaker: 'Мику', text: 'Только журнал согласий и резервная копия. Мы расследуем нарушение, а не выгружаем чужую жизнь.' }, winBark: { speaker: 'Эми', text: 'Вот оно. Согласие на форму превратили в разрешение на личные вещи уже после подписи.' }, loseBark: { speaker: 'Оноэ', text: 'Удаление обгоняет копирование. Повторяем и приоритизируем журнал согласий.' },
  },
  {
    id: 'M3_21_CONVENIENT_CASE', shortId: 'M3_21', title: 'Идеальный подозреваемый', storyAction: 'Собрать удобные совпадения, убрать противоречащие карточки и подготовить эффектный, но ложный финальный слайд.',
    context: { sourceSceneId: 'VN_SCENE_43_E21_PRE', pageBackground: 'disciplinaryAssembly', boardSurface: 'ordered-grid', boardFrame: 'audit-file', narrativeProfile: 'convenient-case', tilePresentationProfile: 'convenient-presentation', participants: ['miku', 'onoe', 'ayuki', 'mayu', 'kurose'], narrativeTags: ['assembly', 'false-case', 'presentation', 'discarded-contradictions'] },
    tutorialConcepts: ['activate-special', 'combine-specials'], activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'socks', 'pantiesBoyshortBlue', 'pantiesSportWhite'], boardHoles: [0, 7, 17, 23, 24, 30, 33, 39, 40, 46, 56, 62], moves: 29,
    objectives: [{ kind: 'collect', tile: 'laundryTag', target: 14, label: 'Удобные совпадения' }, { kind: 'clearBlockers', target: 10, label: 'Возражения' }, { kind: 'drop', ingredient: 'finalSlide', target: 1, label: 'Финальный слайд' }],
    blocker: 'falseConclusion', blockers: positions([10, 15, 18, 21, 42, 45, 50, 53, 58, 61]), ingredients: [{ index: 27, kind: 'finalSlide' }], seed: 9022,
    clueId: 'CUE_022', clueTitle: 'Удалённые противоречия', clueSummary: 'Публичная версия выглядит убедительно только после сознательного удаления фактов, которые оправдывают удобного подозреваемого и указывают на Second Skin.',
    startBark: { speaker: 'Оноэ', text: 'Я отмечу каждое возражение, которое мы сейчас убираем. Хотя бы между собой не будем называть это доказательством.' }, winBark: { speaker: 'Аюки', text: 'Слайд идеальный. И теперь я очень хорошо вижу, почему идеальная история может быть неправильной.' }, loseBark: { speaker: 'Мику', text: 'Даже ложная версия развалилась. Пересобираем и смотрим, какие факты приходится скрывать.' },
  },
] as const;

export const cluePresentation: Record<ClueId, Readonly<{ asset: string; label: string }>> = {
  CUE_001: { asset: './assets/clues/clue_laundry_receipt.png', label: 'Квитанция прачечной' },
  CUE_002: { asset: './assets/clues/clue_memory_card.png', label: 'Карта памяти' },
  CUE_003: { asset: './assets/clues/clue_service_key.png', label: 'Сервисный ключ' },
  CUE_004: { asset: './assets/clues/clue_towel_conductive_seam.png', label: 'Проводящий шов' },
  CUE_005: { asset: './assets/clues/clue_laundry_receipt.png', label: 'Ритм прачечной' },
  CUE_006: { asset: './assets/clues/clue_service_key.png', label: 'Сервисная строчка' },
  CUE_007: { asset: './assets/clues/clue_towel_conductive_seam.png', label: 'Шов после ремонта' },
  CUE_008: { asset: './assets/clues/clue_towel_conductive_seam.png', label: 'Нить Asterion' },
  CUE_009: { asset: './assets/clues/clue_laundry_receipt.png', label: 'Пропуски в журнале' },
  CUE_010: { asset: './assets/clues/clue_service_key.png', label: 'Ночные контейнеры' },
  CUE_011: { asset: './assets/clues/clue_towel_conductive_seam.png', label: 'Контрольная выборка' },
  CUE_012: { asset: './assets/match3/goal_memory_card.png', label: 'Цепочка передачи Asterion' },
  CUE_013: { asset: './assets/clues/clue_towel_conductive_seam.png', label: 'Метка Second Skin' },
  CUE_014: { asset: './assets/match3/goal_memory_card.png', label: 'Закрытый список пилота' },
  CUE_015: { asset: './assets/match3/goal_receipt.png', label: 'Рина знала заранее' },
  CUE_016: { asset: './assets/clues/clue_service_key.png', label: 'Маршрут согласия' },
  CUE_017: { asset: './assets/match3/goal_memory_card.png', label: 'Активация после Рины' },
  CUE_018: { asset: './assets/match3/goal_receipt.png', label: 'Каталог Рины' },
  CUE_019: { asset: './assets/clues/clue_towel_conductive_seam.png', label: 'Продолжение Second Skin' },
  CUE_020: { asset: './assets/match3/goal_receipt.png', label: 'Формально закрыто' },
  CUE_021: { asset: './assets/match3/goal_memory_card.png', label: 'Логи согласия' },
  CUE_022: { asset: './assets/match3/goal_receipt.png', label: 'Удалённые противоречия' },
};

export function validateLevelDefinitions(definitions: readonly LevelDefinition[] = levels): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const level of definitions) {
    if (ids.has(level.id)) errors.push(`Duplicate level id: ${level.id}`);
    ids.add(level.id);
    if (level.moves <= 0) errors.push(`${level.id}: moves must be positive`);
    if (level.objectives.length === 0) errors.push(`${level.id}: no objectives`);
    if (level.objectives.length > MAX_OBJECTIVES_PER_LEVEL) errors.push(`${level.id}: more than ${MAX_OBJECTIVES_PER_LEVEL} objectives`);
    if (level.context.participants.length === 0) errors.push(`${level.id}: no narrative participants`);
    if (new Set(level.context.participants).size !== level.context.participants.length) errors.push(`${level.id}: duplicate narrative participant`);
    if (level.context.narrativeTags.length === 0) errors.push(`${level.id}: no narrative tags`);
    if (new Set(level.context.narrativeTags).size !== level.context.narrativeTags.length) errors.push(`${level.id}: duplicate narrative tag`);
    if (new Set(level.tutorialConcepts).size !== level.tutorialConcepts.length) errors.push(`${level.id}: duplicate tutorial concept`);
    const unknownTutorialConcepts = level.tutorialConcepts.filter((concept) => !match3TutorialConceptIds.includes(concept));
    if (unknownTutorialConcepts.length > 0) errors.push(`${level.id}: unknown tutorial concept ${unknownTutorialConcepts.join(',')}`);
    if (level.activeTiles.length !== ACTIVE_TILE_TYPE_LIMIT) errors.push(`${level.id}: active tile set must contain exactly ${ACTIVE_TILE_TYPE_LIMIT} types`);
    if (new Set(level.activeTiles).size !== level.activeTiles.length) errors.push(`${level.id}: duplicate active tile id`);
    const unknownActiveTiles = level.activeTiles.filter((tile) => !tilePresentation[tile]);
    if (unknownActiveTiles.length > 0) errors.push(`${level.id}: unknown active tile id ${unknownActiveTiles.join(',')}`);
    const activePresentations = level.activeTiles.map((tile) => tilePresentation[tile]).filter(Boolean);
    const activeAssets = activePresentations.map((presentation) => presentation.asset);
    if (new Set(activeAssets).size !== activeAssets.length) errors.push(`${level.id}: different active tile ids share the same asset`);
    const pantiesTypes = activePresentations.filter((presentation) => presentation.category === 'panties').length;
    if (pantiesTypes > MAX_PANTIES_TYPES_PER_LEVEL) errors.push(`${level.id}: more than ${MAX_PANTIES_TYPES_PER_LEVEL} panties match types`);
    if (level.spawnWeights) {
      for (const [tile, rawWeight] of Object.entries(level.spawnWeights)) {
        if (!level.activeTiles.includes(tile as Match3TileId)) errors.push(`${level.id}: spawn weight for inactive tile ${tile}`);
        if (typeof rawWeight !== 'number' || !Number.isFinite(rawWeight) || rawWeight <= 0) errors.push(`${level.id}: spawn weight for ${tile} must be a finite positive number`);
      }
    }
    const boardHoles = level.boardHoles ?? [];
    if (boardHoles.some((index) => !Number.isInteger(index) || index < 0 || index >= BOARD_SIZE * BOARD_SIZE)) errors.push(`${level.id}: board hole outside board`);
    if (new Set(boardHoles).size !== boardHoles.length) errors.push(`${level.id}: duplicate board hole`);
    if (boardHoles.length >= BOARD_SIZE * BOARD_SIZE - 2) errors.push(`${level.id}: board shape needs at least three active cells`);
    const inactive = new Set(boardHoles);
    const initialTiles = level.initialTiles ?? [];
    if (initialTiles.some(({ index }) => !Number.isInteger(index) || index < 0 || index >= BOARD_SIZE * BOARD_SIZE)) errors.push(`${level.id}: initial tile outside board`);
    if (new Set(initialTiles.map(({ index }) => index)).size !== initialTiles.length) errors.push(`${level.id}: duplicate initial tile cell`);
    if (initialTiles.some(({ index }) => inactive.has(index))) errors.push(`${level.id}: initial tile placed in board hole`);
    if (initialTiles.some(({ tile }) => !level.activeTiles.includes(tile))) errors.push(`${level.id}: initial tile uses inactive match type`);
    for (const objective of level.objectives) {
      if (!Number.isInteger(objective.target) || objective.target <= 0) errors.push(`${level.id}: objective target must be a positive integer`);
      if (objective.kind === 'collect' && !level.activeTiles.includes(objective.tile)) errors.push(`${level.id}: collect objective tile ${objective.tile} is not active`);
      if (objective.kind === 'dropGroup') {
        if (objective.ingredients.length < 2) errors.push(`${level.id}: dropGroup must contain at least two ingredient types`);
        if (new Set(objective.ingredients).size !== objective.ingredients.length) errors.push(`${level.id}: duplicate ingredient type in dropGroup`);
      }
    }
    if (level.blockers.some(({ index }) => index < 0 || index >= BOARD_SIZE * BOARD_SIZE)) errors.push(`${level.id}: blocker outside board`);
    if (level.blockers.some(({ index }) => inactive.has(index))) errors.push(`${level.id}: blocker placed in board hole`);
    if (new Set(level.blockers.map(({ index }) => index)).size !== level.blockers.length) errors.push(`${level.id}: duplicate blocker cell`);
    if (level.ingredients.some(({ index }) => index < 0 || index >= BOARD_SIZE * BOARD_SIZE)) errors.push(`${level.id}: ingredient outside board`);
    if (level.ingredients.some(({ index }) => inactive.has(index))) errors.push(`${level.id}: ingredient placed in board hole`);
    if (initialTiles.some(({ index }) => level.ingredients.some((ingredient) => ingredient.index === index))) errors.push(`${level.id}: initial tile overlaps ingredient`);
    if (level.ingredients.some(({ index }) => level.blockers.some((blocker) => blocker.index === index))) errors.push(`${level.id}: ingredient overlaps blocker`);
    const blockerGoal = level.objectives.find((objective) => objective.kind === 'clearBlockers');
    if (blockerGoal && blockerGoal.target !== level.blockers.length) errors.push(`${level.id}: blocker objective does not match placement count`);
    if (!blockerGoal && level.blockers.length > 0) errors.push(`${level.id}: blockers require a clearBlockers objective`);
    for (const ingredient of level.ingredients) {
      const coverage = level.objectives.filter((objective) => objectiveIngredientKeys(objective).includes(ingredient.kind));
      if (coverage.length === 0) errors.push(`${level.id}: missing objective for ${ingredient.kind}`);
      if (coverage.length > 1) errors.push(`${level.id}: ingredient ${ingredient.kind} covered by multiple objectives`);
    }
    for (const objective of level.objectives) {
      const ingredientKeys = objectiveIngredientKeys(objective);
      if (ingredientKeys.length === 0) continue;
      for (const ingredient of ingredientKeys) {
        if (!level.ingredients.some((placement) => placement.kind === ingredient)) errors.push(`${level.id}: objective includes unplaced ingredient ${ingredient}`);
      }
      const placementCount = level.ingredients.filter((placement) => ingredientKeys.includes(placement.kind)).length;
      if (objective.target !== placementCount) errors.push(`${level.id}: ingredient objective does not match placement count`);
    }
  }
  return errors;
}
