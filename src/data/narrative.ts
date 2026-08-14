import { canonicalStoryLineCount, canonicalStoryLines } from '../content/storyRuntime';
import { storySceneFromLegacyIndex } from './storyGraph';

export type StoryLine = Readonly<{
  id: string;
  speaker: string;
  emotion: string;
  text: string;
}>;

export type ChoiceId = 'A' | 'B' | 'C';

export type ChoiceState = Readonly<{
  approach: 'verify' | 'warn' | 'report';
  sourceTrust: 0 | 1;
  onoeTrust: 0 | 1;
  rumorHeat: 0 | 1;
}>;

export type SceneMeta = Readonly<{
  id: string;
  title: string;
  location: string;
  defaultBackground: BackgroundKey;
}>;

export type BackgroundKey =
  | 'clubroom'
  | 'lockerAthletics'
  | 'kentaroApartment'
  | 'poolLocker'
  | 'norihiroApartment'
  | 'studentCouncilAuditorium'
  | 'basketballLocker'
  | 'textileWorkshop'
  | 'asterionLab'
  | 'lostFoundWarehouse'
  | 'maintenanceRoom'
  | 'combatClubHall'
  | 'serviceYard'
  | 'asterionTransferPoint'
  | 'oldGymNight';

const conditionalSpeakerPattern = /^\{IF\s+([^}]+)\}\s*/;

const parsedLines: readonly StoryLine[] = canonicalStoryLines;

const numberOf = (id: string): number => Number(id.slice(2, 6));

export const choices: Record<ChoiceId, Readonly<{
  title: string;
  effect: string;
  state: ChoiceState;
}>> = {
  A: {
    title: 'Сначала найдём вторую пострадавшую',
    effect: 'Доверие источников +1',
    state: { approach: 'verify', sourceTrust: 1, onoeTrust: 0, rumorHeat: 0 },
  },
  B: {
    title: 'Предупредим анонимно',
    effect: 'Сила слухов +1',
    state: { approach: 'warn', sourceTrust: 0, onoeTrust: 0, rumorHeat: 1 },
  },
  C: {
    title: 'Передадим дело администрации',
    effect: 'Доверие Оноэ +1',
    state: { approach: 'report', sourceTrust: 0, onoeTrust: 1, rumorHeat: 0 },
  },
};

const conditionMatches = (condition: string, state: ChoiceState): boolean => {
  const [rawKey, rawValue] = condition.split('=').map((part) => part.trim());
  const values: Record<string, string> = {
    approach: state.approach,
    source_trust: String(state.sourceTrust),
    onoe_trust: String(state.onoeTrust),
    rumor_heat: String(state.rumorHeat),
  };
  return values[rawKey] === rawValue;
};

const lineForChoice = (line: StoryLine, choice: ChoiceId): StoryLine | null => {
  const suffix = line.id.match(/[ABC]$/)?.[0];
  if (suffix && suffix !== choice) return null;

  const conditional = line.speaker.match(conditionalSpeakerPattern);
  if (!conditional) return line;
  if (!conditionMatches(conditional[1], choices[choice].state)) return null;
  return { ...line, speaker: line.speaker.replace(conditionalSpeakerPattern, '').trim() };
};

export function getScene(index: number, choice: ChoiceId = 'A'): StoryLine[] {
  const scene = storySceneFromLegacyIndex(index);
  if (!scene) return [];
  const start = numberOf(scene.source.startLineId);
  const end = numberOf(scene.source.endLineId);

  return parsedLines.flatMap((line) => {
    const number = numberOf(line.id);
    if (number < start || number > end) return [];
    const resolved = lineForChoice(line, choice);
    return resolved ? [resolved] : [];
  });
}

export function getReadHistory(readLineIds: readonly string[], choice: ChoiceId = 'A'): StoryLine[] {
  const read = new Set(readLineIds);
  return parsedLines.flatMap((line) => {
    if (!read.has(line.id)) return [];
    const resolved = lineForChoice(line, choice);
    return resolved ? [resolved] : [];
  });
}

export const sceneMeta: readonly SceneMeta[] = [
  { id: 'VN_SCENE_00_PROLOGUE', title: 'Клуб, которого почти нет', location: 'Комната детективного клуба', defaultBackground: 'clubroom' },
  { id: 'VN_SCENE_01_E0_PRE', title: 'Дело класса U', location: 'Комната клуба → раздевалка', defaultBackground: 'clubroom' },
  { id: 'VN_SCENE_02_E0_POST', title: 'То, что вор оставил', location: 'Раздевалка лёгкой атлетики', defaultBackground: 'lockerAthletics' },
  { id: 'VN_SCENE_03_E1_PRE', title: 'Комната, которая всё объясняет слишком плохо', location: 'Квартира Кэнтаро', defaultBackground: 'kentaroApartment' },
  { id: 'VN_SCENE_04_E1_POST', title: 'Манекен с лучшим алиби', location: 'Квартира Кэнтаро', defaultBackground: 'kentaroApartment' },
  { id: 'VN_SCENE_05_E2_PRE', title: 'Мокрые показания', location: 'Раздевалка клуба плавания', defaultBackground: 'poolLocker' },
  { id: 'VN_SCENE_06_E2_POST', title: 'Таблица без вкуса', location: 'Раздевалка клуба плавания', defaultBackground: 'poolLocker' },
  { id: 'VN_SCENE_07_E3_PRE', title: 'Розовое признание', location: 'Квартира Норихиро', defaultBackground: 'norihiroApartment' },
  { id: 'VN_SCENE_08_E3_POST', title: 'Это не ткань', location: 'Квартира Норихиро', defaultBackground: 'norihiroApartment' },
  { id: 'VN_SCENE_09_E4_PRE', title: 'Чрезвычайное бельевое совещание', location: 'Аудитория студсовета', defaultBackground: 'studentCouncilAuditorium' },
  { id: 'VN_SCENE_10_E4_POST', title: 'Ритм прачечной', location: 'Аудитория студсовета', defaultBackground: 'studentCouncilAuditorium' },
  { id: 'VN_SCENE_11_E5_PRE', title: 'Заслон для вора', location: 'Баскетбольная раздевалка', defaultBackground: 'basketballLocker' },
  { id: 'VN_SCENE_12_E5_POST', title: 'Сервисная строчка', location: 'Баскетбольная раздевалка', defaultBackground: 'basketballLocker' },
  { id: 'VN_SCENE_13_E6_PRE', title: 'Мастерская подозрительного размера', location: 'Текстильная мастерская Хинаты', defaultBackground: 'textileWorkshop' },
  { id: 'VN_SCENE_14_E6_POST', title: 'Шов после ремонта', location: 'Текстильная мастерская Хинаты', defaultBackground: 'textileWorkshop' },
  { id: 'VN_SCENE_15_E7_PRE', title: 'Человек, у которого есть объяснение', location: 'Лаборатория Asterion Sports Lab', defaultBackground: 'asterionLab' },
  { id: 'VN_SCENE_16_E7_POST', title: 'Нить Asterion', location: 'Лаборатория Asterion Sports Lab', defaultBackground: 'asterionLab' },
  { id: 'VN_SCENE_17_E8_PRE', title: 'Восемьдесят семь пакетов', location: 'Центральный склад lost-and-found', defaultBackground: 'lostFoundWarehouse' },
  { id: 'VN_SCENE_18_E8_POST', title: 'Пропуски в журнале', location: 'Центральный склад lost-and-found', defaultBackground: 'lostFoundWarehouse' },
  { id: 'VN_SCENE_19_E9_PRE', title: 'Король потерянных носков', location: 'Хозяйственная комната', defaultBackground: 'maintenanceRoom' },
  { id: 'VN_SCENE_20_E9_POST', title: 'Ночные контейнеры', location: 'Хозяйственная комната', defaultBackground: 'maintenanceRoom' },
  { id: 'VN_SCENE_21_E10_PRE', title: 'Чёрный пояс, белые трусы', location: 'Зал клуба карате', defaultBackground: 'combatClubHall' },
  { id: 'VN_SCENE_22_E10_POST', title: 'Контрольная выборка', location: 'Зал клуба карате', defaultBackground: 'combatClubHall' },
  { id: 'VN_SCENE_23_E11_PRE', title: 'Самый заметный тайный груз', location: 'Служебный двор → перегрузочный пункт Asterion', defaultBackground: 'serviceYard' },
  { id: 'VN_SCENE_24_E11_POST', title: 'Цепочка передачи', location: 'Перегрузочный пункт Asterion', defaultBackground: 'asterionTransferPoint' },
  { id: 'VN_SCENE_25_E12_PRE', title: 'ПанцуИтер существует?!', location: 'Старый спортивный зал ночью', defaultBackground: 'oldGymNight' },
  { id: 'VN_SCENE_26_E12_POST', title: 'Second Skin', location: 'Старый спортивный зал ночью', defaultBackground: 'oldGymNight' },
] as const;

export const backgroundAssets: Record<BackgroundKey, string> = {
  clubroom: './assets/backgrounds/BG_CLUBROOM_DAY.webp',
  lockerAthletics: './assets/backgrounds/BG_LOCKER_ATHLETICS_DAY.webp',
  kentaroApartment: './assets/backgrounds/BG_KENTARO_APARTMENT_EVENING.webp',
  poolLocker: './assets/backgrounds/BG_POOL_LOCKER_EVENING.webp',
  norihiroApartment: './assets/backgrounds/BG_NORIHIRO_APARTMENT_NIGHT.webp',
  studentCouncilAuditorium: './assets/backgrounds/BG_CLUBROOM_DAY.webp',
  basketballLocker: './assets/backgrounds/BG_LOCKER_ATHLETICS_DAY.webp',
  textileWorkshop: './assets/backgrounds/BG_KENTARO_APARTMENT_EVENING.webp',
  // ANM-027G 7–9 semantic variants: no fake/new binaries; replace mappings when external masters arrive.
  asterionLab: './assets/backgrounds/BG_NORIHIRO_APARTMENT_NIGHT.webp',
  lostFoundWarehouse: './assets/backgrounds/BG_LOCKER_ATHLETICS_DAY.webp',
  maintenanceRoom: './assets/backgrounds/BG_LOCKER_ATHLETICS_DAY.webp',
  // ANM-027G 10–12 semantic variants. External masters replace only these mappings.
  combatClubHall: './assets/backgrounds/BG_LOCKER_ATHLETICS_DAY.webp',
  serviceYard: './assets/backgrounds/BG_CLUBROOM_DAY.webp',
  asterionTransferPoint: './assets/backgrounds/BG_NORIHIRO_APARTMENT_NIGHT.webp',
  oldGymNight: './assets/backgrounds/BG_POOL_LOCKER_EVENING.webp',
};

export function getBackgroundForLine(sceneIndex: number, lineIndex: number, story: readonly StoryLine[]): BackgroundKey {
  let background = sceneMeta[sceneIndex]?.defaultBackground ?? 'clubroom';
  for (let index = 0; index <= lineIndex && index < story.length; index += 1) {
    const direction = `${story[index].emotion} ${story[index].text}`;
    if (direction.includes('BG_ASTERION_TRANSFER_POINT')) background = 'asterionTransferPoint';
    else if (direction.includes('BG_SERVICE_YARD')) background = 'serviceYard';
    else if (direction.includes('BG_COMBAT_CLUB_HALL')) background = 'combatClubHall';
    else if (direction.includes('BG_OLD_GYM_NIGHT')) background = 'oldGymNight';
    else if (direction.includes('BG_ASTERION_LAB')) background = 'asterionLab';
    else if (direction.includes('BG_LOST_FOUND_WAREHOUSE')) background = 'lostFoundWarehouse';
    else if (direction.includes('BG_MAINTENANCE_ROOM')) background = 'maintenanceRoom';
    else if (direction.includes('BG_STUDENT_COUNCIL_AUDITORIUM')) background = 'studentCouncilAuditorium';
    else if (direction.includes('BG_BASKETBALL_LOCKER')) background = 'basketballLocker';
    else if (direction.includes('BG_TEXTILE_WORKSHOP')) background = 'textileWorkshop';
    else if (direction.includes('BG_LOCKER_ATHLETICS')) background = 'lockerAthletics';
    else if (direction.includes('BG_KENTARO_APARTMENT')) background = 'kentaroApartment';
    else if (direction.includes('BG_POOL_LOCKER')) background = 'poolLocker';
    else if (direction.includes('BG_NORIHIRO_APARTMENT')) background = 'norihiroApartment';
    else if (direction.includes('BG_CLUBROOM')) background = 'clubroom';
  }
  return background;
}

export const isDirection = (line: StoryLine): boolean => line.speaker === 'РЕЖИССУРА' || line.speaker === 'СИСТЕМА';
export const parsedLineCount = canonicalStoryLineCount;
