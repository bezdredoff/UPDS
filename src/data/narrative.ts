import screenplay from '../content/ANM-003_Vertical_Slice_Screenplay.md?raw';

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
  | 'norihiroApartment';

const sceneStarts = ['VN0001', 'VN0023', 'VN0058', 'VN0085', 'VN0114', 'VN0143', 'VN0167', 'VN0192', 'VN0217'];
const sceneEnds = ['VN0022', 'VN0057', 'VN0084', 'VN0113', 'VN0142', 'VN0166', 'VN0191', 'VN0216', 'VN0245'];
const linePattern = /`\[(VN\d{4}[ABC]?)\]\s*([^|]+)\|\s*([^|]+)\|\s*([^`]+)`/g;
const conditionalSpeakerPattern = /^\{IF\s+([^}]+)\}\s*/;

const parsedLines: StoryLine[] = [];
for (const match of screenplay.matchAll(linePattern)) {
  parsedLines.push({
    id: match[1],
    speaker: match[2].trim(),
    emotion: match[3].trim(),
    text: match[4].trim(),
  });
}

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

export function getScene(index: number, choice: ChoiceId = 'A'): StoryLine[] {
  const start = numberOf(sceneStarts[index]);
  const end = numberOf(sceneEnds[index]);
  const state = choices[choice].state;

  return parsedLines.flatMap((line) => {
    const number = numberOf(line.id);
    if (number < start || number > end) return [];

    const suffix = line.id.match(/[ABC]$/)?.[0];
    if (suffix && suffix !== choice) return [];

    const conditional = line.speaker.match(conditionalSpeakerPattern);
    if (!conditional) return [line];
    if (!conditionMatches(conditional[1], state)) return [];

    return [{ ...line, speaker: line.speaker.replace(conditionalSpeakerPattern, '').trim() }];
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
] as const;

export const backgroundAssets: Record<BackgroundKey, string> = {
  clubroom: './assets/backgrounds/BG_CLUBROOM_DAY.webp',
  lockerAthletics: './assets/backgrounds/BG_LOCKER_ATHLETICS_DAY.webp',
  kentaroApartment: './assets/backgrounds/BG_KENTARO_APARTMENT_EVENING.webp',
  poolLocker: './assets/backgrounds/BG_POOL_LOCKER_EVENING.webp',
  norihiroApartment: './assets/backgrounds/BG_NORIHIRO_APARTMENT_NIGHT.webp',
};

export function getBackgroundForLine(sceneIndex: number, lineIndex: number, story: readonly StoryLine[]): BackgroundKey {
  let background = sceneMeta[sceneIndex]?.defaultBackground ?? 'clubroom';
  for (let index = 0; index <= lineIndex && index < story.length; index += 1) {
    const direction = `${story[index].emotion} ${story[index].text}`;
    if (direction.includes('BG_LOCKER_ATHLETICS')) background = 'lockerAthletics';
    else if (direction.includes('BG_KENTARO_APARTMENT')) background = 'kentaroApartment';
    else if (direction.includes('BG_POOL_LOCKER')) background = 'poolLocker';
    else if (direction.includes('BG_NORIHIRO_APARTMENT')) background = 'norihiroApartment';
    else if (direction.includes('BG_CLUBROOM')) background = 'clubroom';
  }
  return background;
}

export const isDirection = (line: StoryLine): boolean => line.speaker === 'РЕЖИССУРА' || line.speaker === 'СИСТЕМА';
export const parsedLineCount = parsedLines.length;
