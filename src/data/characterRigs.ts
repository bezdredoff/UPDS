import {
  characterProductionManifest,
  productionCharacterKeys,
  type CharacterStaging,
  type ProductionCharacterKey,
  type RuntimeExpression,
} from './characterProduction';
import {
  browserLocalCharacterStaging,
  browserLocalCharacterXPercent,
  browserLocalExpressionOverride,
  browserLocalMedallionOverride,
  browserLocalPoseOverride,
} from './characterRuntimeOverrides';

export type CharacterKey = ProductionCharacterKey;
export type { CharacterStaging, RuntimeExpression } from './characterProduction';

export type CharacterRig = Readonly<{
  displayName: string;
  shortName: string;
  frames: Readonly<Record<RuntimeExpression, string>>;
  poseB: string;
  medallion: string;
}>;

export const characterStaging = Object.fromEntries(
  productionCharacterKeys.map((key) => {
    const definition = characterProductionManifest.characters[key];
    return [key, definition.staging];
  }),
) as Record<CharacterKey, CharacterStaging>;

export const characterRigs = Object.fromEntries(
  productionCharacterKeys.map((key) => {
    const definition = characterProductionManifest.characters[key];
    const rig: CharacterRig = {
      displayName: definition.displayName,
      shortName: definition.shortName,
      frames: definition.assets.frames,
      poseB: definition.assets.poseB,
      medallion: definition.assets.medallion,
    };
    return [key, rig];
  }),
) as Record<CharacterKey, CharacterRig>;

function speakerMatches(speaker: string, token: string, match: 'exact' | 'prefix'): boolean {
  return match === 'prefix' ? speaker.startsWith(token) : speaker === token;
}

export function characterForSpeaker(speaker: string): CharacterKey | null {
  for (const key of productionCharacterKeys) {
    const definition = characterProductionManifest.characters[key];
    if (speakerMatches(speaker, definition.speakerToken, definition.speakerMatch)) return key;
  }
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

export function expressionAsset(character: CharacterKey, expression: RuntimeExpression): string {
  return browserLocalExpressionOverride(character, expression)?.asset ?? characterRigs[character].frames[expression];
}

export function poseAsset(character: CharacterKey): string {
  return browserLocalPoseOverride(character)?.asset ?? characterRigs[character].poseB;
}

export function medallionAsset(character: CharacterKey): string {
  return browserLocalMedallionOverride(character)?.asset ?? characterRigs[character].medallion;
}

export function resolvedCharacterStaging(character: CharacterKey): CharacterStaging {
  return browserLocalCharacterStaging(character, characterStaging[character]);
}

export function resolvedCharacterXPercent(character: CharacterKey): number {
  return browserLocalCharacterXPercent(character);
}
