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
export type IngredientKey = 'receipt' | 'memoryCard' | 'serviceKey' | 'damagedTowel' | 'laundryCalendar' | 'repairLog' | 'warrantyCard' | 'silverSpool' | 'asterionSpec' | 'missingNumberSheet' | 'handoffSlip';
export type BlockerKey = 'lockedCell' | 'propBox' | 'foam' | 'cabinet' | 'rumorCard' | 'lockerLock' | 'garmentBag' | 'labCover' | 'sealedPackage' | 'supplyCrate';
export type ClueId = 'CUE_001' | 'CUE_002' | 'CUE_003' | 'CUE_004' | 'CUE_005' | 'CUE_006' | 'CUE_007' | 'CUE_008' | 'CUE_009' | 'CUE_010';

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
  'camisole',
  'laundryTag',
  'panties',
  'pantiesSportWhite',
  'pantiesLacePink',
  'pantiesHighWaistBlack',
  'pantiesBoyshortBlue',
  'towel',
  'socks',
  'sportsBra',
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
    shortId: 'M3_00',
    title: 'Шкафчик Эми',
    storyAction: 'Зафиксировать содержимое шкафчика и найти связь с прачечной.',
    context: {
      sourceSceneId: 'VN_SCENE_01_E0_PRE',
      pageBackground: 'lockerAthletics',
      boardSurface: 'locker-bench',
      boardFrame: 'evidence-file',
      narrativeProfile: 'locker-search',
      tilePresentationProfile: 'locker-laundry',
      participants: ['miku', 'onoe', 'ayuki', 'emi'],
      narrativeTags: ['locker-room', 'laundry', 'missing-underwear', 'evidence-sort'],
    },
    tutorialConcepts: ['basic-swap', 'clear-blocker', 'drop-ingredient', 'activate-special', 'combine-specials'],
    activeTiles: ['pantiesSportWhite', 'pantiesLacePink', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'sportsBra', 'laundryTag'],
    moves: 24,
    objectives: [
      { kind: 'clearBlockers', target: 6, label: 'Клетки' },
      { kind: 'drop', ingredient: 'receipt', target: 1, label: 'Квитанция' },
    ],
    blocker: 'lockedCell',
    blockers: positions([18, 19, 26, 27, 34, 35]),
    ingredients: [{ index: 51, kind: 'receipt' }],
    seed: 9001,
    clueId: 'CUE_001',
    clueTitle: 'Выборочная пропажа',
    clueSummary: 'Из партии прачечной исчезли не все вещи; цена и заметность не объясняют выбор.',
    startBark: { speaker: 'Оноэ', text: 'Сначала категории. Потом выводы.' },
    winBark: { speaker: 'Эми', text: 'Нашли что-нибудь настоящее?' },
    loseBark: { speaker: 'Оноэ', text: 'Мы нарушили порядок поиска. Повторим без потери прогресса сцены.' },
  },
  {
    id: 'M3_01_PHOTO_PROPS',
    shortId: 'M3_01',
    title: 'Фотореквизит Кэнтаро',
    storyAction: 'Разобрать реквизит по номерам и найти карту памяти с таймкодами.',
    context: {
      sourceSceneId: 'VN_SCENE_03_E1_PRE',
      pageBackground: 'kentaroApartment',
      boardSurface: 'photo-contact-sheet',
      boardFrame: 'photo-file',
      narrativeProfile: 'photo-alibi',
      tilePresentationProfile: 'photo-props',
      participants: ['miku', 'onoe', 'ayuki', 'kentaro'],
      narrativeTags: ['apartment', 'photo-props', 'timeline', 'alibi'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['pantiesLacePink', 'pantiesHighWaistBlack', 'panties', 'camisole', 'sportsBra', 'laundryTag'],
    moves: 26,
    objectives: [
      { kind: 'clearBlockers', target: 10, label: 'Коробки' },
      { kind: 'drop', ingredient: 'memoryCard', target: 1, label: 'Карта' },
    ],
    blocker: 'propBox',
    blockers: positions([[9, 2], [10, 2], 17, 18, [25, 2], 26, 33, [34, 2], 41, 42]),
    ingredients: [{ index: 50, kind: 'memoryCard' }],
    seed: 9002,
    clueId: 'CUE_002',
    clueTitle: 'Проверяемое алиби',
    clueSummary: 'Таймкоды съёмки подтверждают алиби Кэнтаро; сервисная тележка остаётся общей связью.',
    startBark: { speaker: 'Кэнтаро', text: 'Сначала номера. И ничего не надевайте — это реквизит.' },
    winBark: { speaker: 'Мику', text: 'Нашла. Теперь посмотрим не на комнату, а на время.' },
    loseBark: { speaker: 'Аюки', text: 'Комната победила. Требую реванш и более узкую специализацию коробок.' },
  },
  {
    id: 'M3_02_POOL_LAUNDRY',
    shortId: 'M3_02',
    title: 'Мокрые показания',
    storyAction: 'Восстановить партию стирки, очистить пену и открыть сервисный шкаф.',
    context: {
      sourceSceneId: 'VN_SCENE_05_E2_PRE',
      pageBackground: 'poolLocker',
      boardSurface: 'pool-service-tile',
      boardFrame: 'wet-service',
      narrativeProfile: 'pool-laundry',
      tilePresentationProfile: 'pool-service',
      participants: ['miku', 'onoe', 'ayuki', 'norihiro'],
      narrativeTags: ['pool-locker', 'laundry', 'foam', 'service-access'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['pantiesSportWhite', 'pantiesBoyshortBlue', 'sportsBra', 'towel', 'laundryTag', 'socks'],
    moves: 25,
    objectives: [
      { kind: 'clearBlockers', target: 18, label: 'Пена' },
      { kind: 'drop', ingredient: 'serviceKey', target: 1, label: 'Ключ' },
    ],
    blocker: 'foam',
    blockers: positions([[16, 2], 17, 18, [19, 2], 20, 21, 24, [25, 2], 26, 29, [30, 2], 31, 34, 35, [36, 2], 37, 38, 39]),
    ingredients: [{ index: 42, kind: 'serviceKey' }],
    seed: 9003,
    clueId: 'CUE_003',
    clueTitle: 'Смешанные цели',
    clueSummary: 'Тип, цена, цвет и владелец вещей не объясняют выбор; вещи смешали до возврата.',
    startBark: { speaker: 'Норихиро', text: 'Бирки сначала. Мокрые догадки сушатся дольше полотенец.' },
    winBark: { speaker: 'Оноэ', text: 'Партия восстановлена. Теперь сравним пропавшее.' },
    loseBark: { speaker: 'Норихиро', text: 'Пена победила дедукцию. Начните с краёв.' },
  },
  {
    id: 'M3_03_ORDERED_APARTMENT',
    shortId: 'M3_03',
    title: 'Идеальный порядок',
    storyAction: 'Проверить возвращённый мешок и найти предмет с новым повреждением.',
    context: {
      sourceSceneId: 'VN_SCENE_07_E3_PRE',
      pageBackground: 'norihiroApartment',
      boardSurface: 'ordered-cabinet',
      boardFrame: 'precision-file',
      narrativeProfile: 'ordered-inspection',
      tilePresentationProfile: 'ordered-return',
      participants: ['miku', 'onoe', 'ayuki', 'norihiro'],
      narrativeTags: ['apartment', 'ordered-storage', 'returned-laundry', 'tampering'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['pantiesSportWhite', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'camisole', 'socks', 'laundryTag'],
    moves: 27,
    objectives: [
      { kind: 'clearBlockers', target: 8, label: 'Секции' },
      { kind: 'dropGroup', ingredients: ['receipt', 'damagedTowel'], target: 2, label: 'Улики' },
    ],
    blocker: 'cabinet',
    blockers: positions([17, 18, 21, 22, 33, 34, 37, 38]),
    ingredients: [{ index: 50, kind: 'receipt' }, { index: 53, kind: 'damagedTowel' }],
    seed: 9004,
    clueId: 'CUE_004',
    clueTitle: 'Серебристая нить',
    clueSummary: 'Ничего не украли, но под сервисной биркой появился новый проводящий шов.',
    startBark: { speaker: 'Норихиро', text: 'Слева направо. Если нарушите порядок, вы его восстановите.' },
    winBark: { speaker: 'Мику', text: 'Здесь ничего не украли. Но кое-что добавили.' },
    loseBark: { speaker: 'Норихиро', text: 'Вы проиграли шкафу. Он согласен на повторную проверку.' },
  },
  {
    id: 'M3_04_EMERGENCY_MEETING',
    shortId: 'M3_04',
    title: 'Семь клубов, один календарь',
    storyAction: 'Отделить подтверждённые заявления от слухов и восстановить общий календарь стирки.',
    context: {
      sourceSceneId: 'VN_SCENE_09_E4_PRE', pageBackground: 'studentCouncilAuditorium',
      boardSurface: 'meeting-grid', boardFrame: 'audit-file', narrativeProfile: 'laundry-cadence', tilePresentationProfile: 'meeting-reports',
      participants: ['miku', 'onoe', 'ayuki', 'mayu'], narrativeTags: ['student-council', 'seven-clubs', 'laundry-calendar', 'rumor-control'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['laundryTag', 'pantiesSportWhite', 'pantiesLacePink', 'sportsBra', 'socks', 'towel'],
    moves: 28,
    objectives: [
      { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Подтверждённые бирки' },
      { kind: 'clearBlockers', target: 8, label: 'Слухи' },
      { kind: 'drop', ingredient: 'laundryCalendar', target: 1, label: 'Календарь' },
    ],
    blocker: 'rumorCard', blockers: positions([9, 18, 21, 22, 42, 45, 49, 54]),
    ingredients: [{ index: 27, kind: 'laundryCalendar' }], seed: 9005,
    clueId: 'CUE_005', clueTitle: 'Ритм прачечной',
    clueSummary: 'Все подтверждённые случаи проходят через центральную прачечную за 24–48 часов до пропажи.',
    startBark: { speaker: 'Маю', text: 'Факты отдельно. Слухи отдельно. И никаких скриншотов.' },
    winBark: { speaker: 'Мику', text: 'Семь клубов, один повторяющийся маршрут. Теперь это система.' },
    loseBark: { speaker: 'Оноэ', text: 'Мы смешали свидетельства и версии. Пересоберём таблицу.' },
  },
  {
    id: 'M3_05_BASKETBALL_LOCKERS',
    shortId: 'M3_05',
    title: 'Высокие шкафчики',
    storyAction: 'Открыть секции, сверить сервисные бирки и восстановить журнал ремонта.',
    context: {
      sourceSceneId: 'VN_SCENE_11_E5_PRE', pageBackground: 'basketballLocker',
      boardSurface: 'locker-columns', boardFrame: 'service-file', narrativeProfile: 'basketball-repair', tilePresentationProfile: 'basketball-service',
      participants: ['miku', 'onoe', 'ayuki', 'hinata'], narrativeTags: ['basketball-locker', 'repair-log', 'service-stitch', 'false-suspect'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['laundryTag', 'pantiesSportWhite', 'pantiesHighWaistBlack', 'sportsBra', 'camisole', 'socks'],
    moves: 27,
    objectives: [
      { kind: 'clearBlockers', target: 10, label: 'Замки' },
      { kind: 'collect', tile: 'laundryTag', target: 12, label: 'Сервисные бирки' },
      { kind: 'drop', ingredient: 'repairLog', target: 1, label: 'Журнал ремонта' },
    ],
    blocker: 'lockerLock', blockers: positions([8, 15, 16, 23, 24, 31, 32, 39, 40, 47]),
    ingredients: [{ index: 28, kind: 'repairLog' }], seed: 9006,
    clueId: 'CUE_006', clueTitle: 'Сервисная строчка',
    clueSummary: 'Размер, стиль и владелец не связаны с пропажами; на спорных вещах повторяется одинаковая сервисная строчка.',
    startBark: { speaker: 'Хината', text: 'Сначала журнал и ярлыки. Потом можете подозревать кого угодно.' },
    winBark: { speaker: 'Оноэ', text: 'Корреляции с внешним видом нет. А строчка повторяется.' },
    loseBark: { speaker: 'Аюки', text: 'Шкафчики выше моей теории. Ещё раз, но теперь по ярлыкам.' },
  },
  {
    id: 'M3_06_TEXTILE_WORKSHOP',
    shortId: 'M3_06',
    title: 'Мастерская Хинаты',
    storyAction: 'Сопоставить заказы, убрать чехлы и найти гарантийную карту вместе с серебристой катушкой.',
    context: {
      sourceSceneId: 'VN_SCENE_13_E6_PRE', pageBackground: 'textileWorkshop',
      boardSurface: 'workbench-clusters', boardFrame: 'workshop-file', narrativeProfile: 'post-repair-seam', tilePresentationProfile: 'textile-workshop',
      participants: ['miku', 'onoe', 'ayuki', 'hinata'], narrativeTags: ['textile-workshop', 'warranty-card', 'conductive-thread', 'exoneration'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['sportsBra', 'camisole', 'laundryTag', 'pantiesSportWhite', 'pantiesLacePink', 'towel'],
    moves: 29,
    objectives: [
      { kind: 'clearBlockers', target: 8, label: 'Чехлы' },
      { kind: 'collect', tile: 'sportsBra', target: 12, label: 'Заказы' },
      { kind: 'dropGroup', ingredients: ['warrantyCard', 'silverSpool'], target: 2, label: 'Проверка машины' },
    ],
    blocker: 'garmentBag', blockers: positions([[10,2], 13, [18,2], 21, 42, [45,2], 50, 53]),
    ingredients: [{ index: 26, kind: 'warrantyCard' }, { index: 29, kind: 'silverSpool' }], seed: 9007,
    clueId: 'CUE_007', clueTitle: 'Шов после ремонта',
    clueSummary: 'До центральной прачечной серебристого шва не было; оборудование Хинаты не поддерживает такую проводящую нить.',
    startBark: { speaker: 'Хината', text: 'Заказы слева, образцы справа. Машину не обвиняйте без спецификации.' },
    winBark: { speaker: 'Мику', text: 'Хината исключена. Шов появился после её мастерской — на маршруте прачечной.' },
    loseBark: { speaker: 'Хината', text: 'Вы смешали заказы и образцы. В мастерской это хуже плохой гипотезы.' },
  },
  {
    id: 'M3_07_ASTERION_THREAD',
    shortId: 'M3_07',
    title: 'Образцы Asterion',
    storyAction: 'Сопоставить серебристую нить, лабораторные карточки и официальную спецификацию.',
    context: {
      sourceSceneId: 'VN_SCENE_15_E7_PRE', pageBackground: 'asterionLab',
      boardSurface: 'signal-cross', boardFrame: 'lab-file', narrativeProfile: 'asterion-thread', tilePresentationProfile: 'asterion-lab',
      participants: ['miku', 'onoe', 'ayuki', 'kurose'], narrativeTags: ['asterion-lab', 'conductive-thread', 'serial-code', 'assignment-registry'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['laundryTag', 'sportsBra', 'camisole', 'towel', 'socks', 'pantiesSportWhite'],
    moves: 28,
    objectives: [
      { kind: 'clearBlockers', target: 8, label: 'Крышки' },
      { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Образцы' },
      { kind: 'drop', ingredient: 'asterionSpec', target: 1, label: 'Спецификация' },
    ],
    blocker: 'labCover', blockers: positions([9, 12, 18, 21, 42, 45, 50, 53]),
    ingredients: [{ index: 27, kind: 'asterionSpec' }], seed: 9008,
    clueId: 'CUE_008', clueTitle: 'Нить Asterion',
    clueSummary: 'Серебристая нить принадлежит Asterion, но открытый реестр не содержит назначений на личные вещи студентов.',
    startBark: { speaker: 'Куросэ', text: 'Состав, шаг шва, код партии. Если образец наш — прибор это покажет.' },
    winBark: { speaker: 'Мику', text: 'Нить совпала. А официального назначения на личные вещи всё равно нет.' },
    loseBark: { speaker: 'Оноэ', text: 'Мы смешали техническое совпадение и административную запись. Разделим их.' },
  },
  {
    id: 'M3_08_LOST_FOUND_LEDGER',
    shortId: 'M3_08',
    title: 'Восемьдесят семь пакетов',
    storyAction: 'Восстановить сервисные ряды склада и последовательность пропущенных номеров.',
    context: {
      sourceSceneId: 'VN_SCENE_17_E8_PRE', pageBackground: 'lostFoundWarehouse',
      boardSurface: 'service-lanes', boardFrame: 'warehouse-file', narrativeProfile: 'missing-package-ranges', tilePresentationProfile: 'lost-found',
      participants: ['miku', 'onoe', 'ayuki', 'rina', 'mayu'], narrativeTags: ['lost-found', 'sealed-packages', 'service-codes', 'missing-ranges'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['laundryTag', 'pantiesSportWhite', 'pantiesHighWaistBlack', 'sportsBra', 'socks', 'towel'],
    moves: 30,
    objectives: [
      { kind: 'clearBlockers', target: 10, label: 'Пакеты' },
      { kind: 'collect', tile: 'laundryTag', target: 14, label: 'Сервисные коды' },
      { kind: 'drop', ingredient: 'missingNumberSheet', target: 1, label: 'Пропуски' },
    ],
    blocker: 'sealedPackage', blockers: positions([[8,2], 14, [16,2], 19, 42, [43,2], 48, 51, 56, 59]),
    ingredients: [{ index: 28, kind: 'missingNumberSheet' }], seed: 9009,
    clueId: 'CUE_009', clueTitle: 'Пропуски в журнале',
    clueSummary: 'Спорные пакеты удалены из обычной последовательности целыми диапазонами, совпадающими с датами подтверждённых пропаж.',
    startBark: { speaker: 'Рина', text: 'Номера важнее содержимого. Если последовательность сломана, сначала найдите место разрыва.' },
    winBark: { speaker: 'Оноэ', text: 'Это не случайные потери. Из журнала вырезаны диапазоны одной сервисной цепочки.' },
    loseBark: { speaker: 'Рина', text: 'Вы смешали секции и статусы. Склад прощает это хуже, чем музей.' },
  },
  {
    id: 'M3_09_MAINTENANCE_KEYS',
    shortId: 'M3_09',
    title: 'Журнал универсального ключа',
    storyAction: 'Разобрать хозяйственный склад, восстановить передачу ключа и транспортную накладную.',
    context: {
      sourceSceneId: 'VN_SCENE_19_E9_PRE', pageBackground: 'maintenanceRoom',
      boardSurface: 'service-lanes', boardFrame: 'maintenance-file', narrativeProfile: 'night-containers', tilePresentationProfile: 'maintenance-service',
      participants: ['miku', 'onoe', 'ayuki', 'gen'], narrativeTags: ['maintenance-room', 'master-key', 'lost-socks', 'asterion-containers'],
    },
    tutorialConcepts: ['activate-special', 'combine-specials'],
    activeTiles: ['socks', 'laundryTag', 'towel', 'sportsBra', 'camisole', 'pantiesSportWhite'],
    moves: 29,
    objectives: [
      { kind: 'clearBlockers', target: 8, label: 'Коробки' },
      { kind: 'collect', tile: 'socks', target: 14, label: 'Пары носков' },
      { kind: 'dropGroup', ingredients: ['serviceKey', 'handoffSlip'], target: 2, label: 'Ключ и накладная' },
    ],
    blocker: 'supplyCrate', blockers: positions([10, 13, 18, 21, 42, 45, 50, 53]),
    ingredients: [{ index: 26, kind: 'serviceKey' }, { index: 29, kind: 'handoffSlip' }], seed: 9010,
    clueId: 'CUE_010', clueTitle: 'Ночные контейнеры',
    clueSummary: 'После закрытия прачечной контейнеры Asterion входят в тот же физический маршрут; накладная связывает ночную передачу с лабораторным префиксом Куросэ.',
    startBark: { speaker: 'Гэн', text: 'Ключи слева, возвраты справа. Носки — отдельная система и прошу её уважать.' },
    winBark: { speaker: 'Мику', text: 'Гэн не сходится по времени. А контейнер Asterion сходится с маршрутом слишком хорошо.' },
    loseBark: { speaker: 'Аюки', text: 'Я проиграла стенду носков. Он требует реванш по форме U.' },
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
