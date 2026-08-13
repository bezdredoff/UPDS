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
export type IngredientKey = 'receipt' | 'memoryCard' | 'serviceKey' | 'damagedTowel';
export type BlockerKey = 'lockedCell' | 'propBox' | 'foam' | 'cabinet';
export type ClueId = 'CUE_001' | 'CUE_002' | 'CUE_003' | 'CUE_004';

export type BoardPlacement = Readonly<{ index: number; layers: 1 | 2 }>;
export type IngredientPlacement = Readonly<{ index: number; kind: IngredientKey }>;

export type LevelObjective =
  | Readonly<{ kind: 'collect'; tile: Match3TileId; target: number; label: string }>
  | Readonly<{ kind: 'clearBlockers'; target: number; label: string }>
  | Readonly<{ kind: 'drop'; ingredient: IngredientKey; target: number; label: string }>;

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
};

export const blockerPresentation: Record<BlockerKey, Readonly<{ label: string; asset: string }>> = {
  lockedCell: { label: 'Закрытая клетка', asset: './assets/match3/obstacle_locked_cell.png' },
  propBox: { label: 'Коробка реквизита', asset: './assets/match3/obstacle_prop_box_2layer.png' },
  foam: { label: 'Пена', asset: './assets/match3/obstacle_soap_foam.png' },
  cabinet: { label: 'Секция шкафа', asset: './assets/match3/obstacle_service_cabinet.png' },
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
    tutorialConcepts: ['basic-swap', 'clear-blocker', 'drop-ingredient'],
    activeTiles: ['pantiesSportWhite', 'pantiesLacePink', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'sportsBra', 'laundryTag'],
    moves: 24,
    objectives: [
      { kind: 'collect', tile: 'pantiesSportWhite', target: 8, label: 'Белые' },
      { kind: 'collect', tile: 'laundryTag', target: 8, label: 'Бирки' },
      { kind: 'collect', tile: 'pantiesLacePink', target: 8, label: 'Розовые' },
      { kind: 'clearBlockers', target: 6, label: 'Клетки' },
      { kind: 'drop', ingredient: 'receipt', target: 1, label: 'Квитанция' },
    ],
    blocker: 'lockedCell',
    blockers: positions([18, 19, 26, 27, 34, 35]),
    ingredients: [{ index: 3, kind: 'receipt' }],
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
    tutorialConcepts: [],
    activeTiles: ['pantiesLacePink', 'pantiesHighWaistBlack', 'panties', 'camisole', 'sportsBra', 'laundryTag'],
    moves: 26,
    objectives: [
      { kind: 'clearBlockers', target: 10, label: 'Коробки' },
      { kind: 'collect', tile: 'laundryTag', target: 12, label: 'Бирки' },
      { kind: 'drop', ingredient: 'memoryCard', target: 1, label: 'Карта' },
    ],
    blocker: 'propBox',
    blockers: positions([[9, 2], [10, 2], 17, 18, [25, 2], 26, 33, [34, 2], 41, 42]),
    ingredients: [{ index: 5, kind: 'memoryCard' }],
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
    tutorialConcepts: [],
    activeTiles: ['pantiesSportWhite', 'pantiesBoyshortBlue', 'sportsBra', 'towel', 'laundryTag', 'socks'],
    moves: 25,
    objectives: [
      { kind: 'clearBlockers', target: 18, label: 'Пена' },
      { kind: 'collect', tile: 'laundryTag', target: 4, label: 'Бирки' },
      { kind: 'drop', ingredient: 'serviceKey', target: 1, label: 'Ключ' },
    ],
    blocker: 'foam',
    blockers: positions([[16, 2], 17, 18, [19, 2], 20, 21, 24, [25, 2], 26, 29, [30, 2], 31, 34, 35, [36, 2], 37, 38, 39]),
    ingredients: [{ index: 6, kind: 'serviceKey' }],
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
    tutorialConcepts: [],
    activeTiles: ['pantiesSportWhite', 'pantiesHighWaistBlack', 'pantiesBoyshortBlue', 'camisole', 'socks', 'laundryTag'],
    moves: 27,
    objectives: [
      { kind: 'clearBlockers', target: 8, label: 'Секции' },
      { kind: 'collect', tile: 'socks', target: 12, label: 'Пары' },
      { kind: 'drop', ingredient: 'receipt', target: 1, label: 'Чек' },
      { kind: 'drop', ingredient: 'damagedTowel', target: 1, label: 'Полотенце' },
    ],
    blocker: 'cabinet',
    blockers: positions([17, 18, 21, 22, 33, 34, 37, 38]),
    ingredients: [{ index: 1, kind: 'receipt' }, { index: 6, kind: 'damagedTowel' }],
    seed: 9004,
    clueId: 'CUE_004',
    clueTitle: 'Серебристая нить',
    clueSummary: 'Ничего не украли, но под сервисной биркой появился новый проводящий шов.',
    startBark: { speaker: 'Норихиро', text: 'Слева направо. Если нарушите порядок, вы его восстановите.' },
    winBark: { speaker: 'Мику', text: 'Здесь ничего не украли. Но кое-что добавили.' },
    loseBark: { speaker: 'Норихиро', text: 'Вы проиграли шкафу. Он согласен на повторную проверку.' },
  },
] as const;

export const cluePresentation: Record<ClueId, Readonly<{ asset: string; label: string }>> = {
  CUE_001: { asset: './assets/clues/clue_laundry_receipt.png', label: 'Квитанция прачечной' },
  CUE_002: { asset: './assets/clues/clue_memory_card.png', label: 'Карта памяти' },
  CUE_003: { asset: './assets/clues/clue_service_key.png', label: 'Сервисный ключ' },
  CUE_004: { asset: './assets/clues/clue_towel_conductive_seam.png', label: 'Проводящий шов' },
};

export function validateLevelDefinitions(definitions: readonly LevelDefinition[] = levels): string[] {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const level of definitions) {
    if (ids.has(level.id)) errors.push(`Duplicate level id: ${level.id}`);
    ids.add(level.id);
    if (level.moves <= 0) errors.push(`${level.id}: moves must be positive`);
    if (level.objectives.length === 0) errors.push(`${level.id}: no objectives`);
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
    for (const objective of level.objectives) {
      if (objective.kind === 'collect' && !level.activeTiles.includes(objective.tile)) errors.push(`${level.id}: collect objective tile ${objective.tile} is not active`);
    }
    if (level.blockers.some(({ index }) => index < 0 || index >= BOARD_SIZE * BOARD_SIZE)) errors.push(`${level.id}: blocker outside board`);
    if (new Set(level.blockers.map(({ index }) => index)).size !== level.blockers.length) errors.push(`${level.id}: duplicate blocker cell`);
    if (level.ingredients.some(({ index }) => index < 0 || index >= BOARD_SIZE * BOARD_SIZE)) errors.push(`${level.id}: ingredient outside board`);
    if (level.ingredients.some(({ index }) => level.blockers.some((blocker) => blocker.index === index))) errors.push(`${level.id}: ingredient overlaps blocker`);
    const blockerGoal = level.objectives.find((objective) => objective.kind === 'clearBlockers');
    if (blockerGoal?.target !== level.blockers.length) errors.push(`${level.id}: blocker objective does not match placement count`);
    for (const ingredient of level.ingredients) {
      const objective = level.objectives.find((candidate) => candidate.kind === 'drop' && candidate.ingredient === ingredient.kind);
      if (!objective) errors.push(`${level.id}: missing objective for ${ingredient.kind}`);
    }
  }
  return errors;
}
