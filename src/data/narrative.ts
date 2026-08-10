import screenplay from '../content/ANM-003_Vertical_Slice_Screenplay.md?raw';

export type StoryLine = { id: string; speaker: string; emotion: string; text: string };
export type ChoiceId = 'A' | 'B' | 'C';

const sceneStarts = ['VN0001','VN0023','VN0058','VN0085','VN0114','VN0143','VN0167','VN0192','VN0217'];
const sceneEnds = ['VN0022','VN0057','VN0084','VN0113','VN0142','VN0166','VN0191','VN0216','VN0245'];
const linePattern = /`\[(VN\d{4}[ABC]?)\]\s*([^|]+)\|\s*([^|]+)\|\s*([^`]+)`/g;
const all: StoryLine[] = [];
for (const match of screenplay.matchAll(linePattern)) {
  all.push({ id: match[1], speaker: match[2].trim(), emotion: match[3].trim(), text: match[4].trim() });
}

const numberOf = (id: string) => Number(id.slice(2, 6));
export function getScene(index: number, choice: ChoiceId = 'A'): StoryLine[] {
  const start = numberOf(sceneStarts[index]);
  const end = numberOf(sceneEnds[index]);
  return all.filter(line => {
    const n = numberOf(line.id);
    if (n < start || n > end) return false;
    const suffix = line.id.match(/[ABC]$/)?.[0];
    return !suffix || suffix === choice;
  });
}

export const sceneMeta = [
  ['Клуб, которого почти нет','Комната детективного клуба'],
  ['Дело класса U','Раздевалка лёгкой атлетики'],
  ['То, что вор оставил','Раздевалка лёгкой атлетики'],
  ['Комната, которая всё объясняет слишком плохо','Квартира Кэнтаро'],
  ['Манекен с лучшим алиби','Квартира Кэнтаро'],
  ['Мокрые показания','Раздевалка клуба плавания'],
  ['Таблица без вкуса','Раздевалка клуба плавания'],
  ['Розовое признание','Квартира Норихиро'],
  ['Это не ткань','Квартира Норихиро'],
] as const;

export const choices: Record<ChoiceId, { title: string; effect: string }> = {
  A: { title: 'Сначала найдём вторую пострадавшую', effect: 'Доверие источников +1' },
  B: { title: 'Предупредим анонимно', effect: 'Сила слухов +1' },
  C: { title: 'Передадим дело администрации', effect: 'Доверие Оноэ +1' },
};

export const levels = [
  { id:'M3_00', title:'Шкафчик Эми', moves:24, target:18, clue:'Из партии прачечной исчезли не все вещи.' },
  { id:'M3_01', title:'Фотореквизит Кэнтаро', moves:22, target:20, clue:'Таймкоды съёмки подтверждают алиби Кэнтаро.' },
  { id:'M3_02', title:'Мокрые показания', moves:21, target:22, clue:'Тип, цена, цвет и владелец вещей не объясняют выбор.' },
  { id:'M3_03', title:'Идеальный порядок', moves:20, target:24, clue:'Под сервисной биркой обнаружена проводящая нить.' },
] as const;
