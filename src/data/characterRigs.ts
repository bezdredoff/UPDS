export type CharacterKey = 'miku' | 'onoe' | 'ayuki';
export type RuntimeExpression = 'neutral' | 'smile' | 'serious' | 'surprised' | 'embarrassed' | 'speaking' | 'blink';
export type PlaceholderKey = 'emi' | 'kentaro' | 'norihiro' | 'mayu';

export type CharacterRig = Readonly<{
  displayName: string;
  shortName: string;
  base: string;
  faces: Readonly<Record<Exclude<RuntimeExpression, 'neutral'>, string>>;
  poseB: string;
  medallion: string;
}>;

const rig = (key: CharacterKey, displayName: string, shortName: string, poseBFile: string): CharacterRig => {
  const root = `./assets/characters/${key}`;
  return {
    displayName,
    shortName,
    base: `${root}/rig/pose_a/base-neutral.png`,
    faces: {
      smile: `${root}/rig/pose_a/face-smile.png`,
      serious: `${root}/rig/pose_a/face-serious.png`,
      surprised: `${root}/rig/pose_a/face-surprised.png`,
      embarrassed: `${root}/rig/pose_a/face-embarrassed.png`,
      speaking: `${root}/rig/pose_a/face-speaking.png`,
      blink: `${root}/rig/pose_a/face-blink.png`,
    },
    poseB: `${root}/poses/${poseBFile}`,
    medallion: `${root}/medallions/portrait_neutral_256.png`,
  };
};

export const characterRigs: Record<CharacterKey, CharacterRig> = {
  miku: rig('miku', 'Мику Араи', 'Мику', 'pose_b_pointing_sketchbook.png'),
  onoe: rig('onoe', 'Сацуки Оноэ', 'Оноэ', 'pose_b_evidence_bag.png'),
  ayuki: rig('ayuki', 'Аюки Момосэ', 'Аюки', 'pose_b_phone_theory.png'),
};

export const placeholderCharacters: Record<PlaceholderKey, Readonly<{
  displayName: string;
  initials: string;
  accent: string;
}>> = {
  emi: { displayName: 'Эми', initials: 'Э', accent: '#d8667d' },
  kentaro: { displayName: 'Кэнтаро', initials: 'К', accent: '#6588b0' },
  norihiro: { displayName: 'Норихиро', initials: 'Н', accent: '#4a9a8b' },
  mayu: { displayName: 'Маю', initials: 'М', accent: '#a970a5' },
};

export function characterForSpeaker(speaker: string): CharacterKey | null {
  if (speaker.startsWith('МИКУ')) return 'miku';
  if (speaker === 'ОНОЭ') return 'onoe';
  if (speaker === 'АЮКИ') return 'ayuki';
  return null;
}

export function placeholderForSpeaker(speaker: string): PlaceholderKey | null {
  if (speaker === 'ЭМИ') return 'emi';
  if (speaker === 'КЭНТАРО') return 'kentaro';
  if (speaker === 'НОРИХИРО') return 'norihiro';
  if (speaker === 'МАЮ') return 'mayu';
  return null;
}

export function expressionForDirection(direction: string): RuntimeExpression {
  const value = direction.toLocaleUpperCase('ru-RU');
  if (/СМУЩ|НЕРВ|ВИНОВ|НЕУДОБ|ЗАКРЫВАЕТ ЛИЦО|ЗАСТИГНУТА/.test(value)) return 'embarrassed';
  if (/УДИВ|НЕ ВЕРИТ|СБИТА|НЕ ПОНИМАЕТ|ВСТРЕВОЖ|МГНОВЕННО/.test(value)) return 'surprised';
  if (/ВЕС[ЕЁ]Л|УЛЫБ|СИЯЕТ|ДОВЕРИТ|МЯГЧ|ОБЛЕГЧ|ВОСХИЩ|ИСКРЕН|ТОРЖЕСТВ/.test(value)) return 'smile';
  if (/СЕР[ЬЪ]ЁЗ|СОСРЕД|РЕШИТ|ВНИМАТ|ХОЛОД|НАПРЯЖ|АНАЛИТ|ПОДОЗР|ТВ[ЕЁ]РД|РАЗДРАЖ|ОЦЕНИВ|ПРЯМО/.test(value)) return 'serious';
  return 'neutral';
}

export function faceAsset(character: CharacterKey, expression: RuntimeExpression): string | null {
  if (expression === 'neutral') return null;
  return characterRigs[character].faces[expression];
}
