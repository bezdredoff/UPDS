export type SceneStudioWorkspaceCopy = Readonly<{
  workspace: string;
  composition: string;
  storyQa: string;
  compositionNote: string;
  storyQaNote: string;
  authoredLine: string;
  derivedPreset: string;
  derivedBackground: string;
  compositionSpeaker: string;
  compositionEmotion: string;
  compositionText: string;
}>;

export const sceneStudioWorkspaceCopy = (locale: string): SceneStudioWorkspaceCopy => locale === 'be'
  ? {
      workspace: 'Працоўны рэжым',
      composition: 'Кампазіцыя',
      storyQa: 'Story QA',
      compositionNote: 'Рэдагаванне staging-плана незалежна ад VN-радкоў. Пазіцыі і browser-local overrides не могуць быць перазапісаныя authored shot-ам.',
      storyQaNote: 'Прагляд рэальнага authored VN shot. План і фон бяруцца з production-дадзеных і тут толькі чытаюцца.',
      authoredLine: 'Authored VN line',
      derivedPreset: 'Production plan',
      derivedBackground: 'Production background',
      compositionSpeaker: 'КАМПАЗІЦЫЯ',
      compositionEmotion: 'STAGING PREVIEW',
      compositionText: 'Наладзьце план, фон і пазіцыі персанажаў. Гэты preview не прывязаны да сюжэтнага VN-радка.',
    }
  : locale === 'en'
    ? {
        workspace: 'Workspace',
        composition: 'Composition',
        storyQa: 'Story QA',
        compositionNote: 'Edit a staging plan independently from VN lines. Positions and browser-local overrides cannot be replaced by an authored shot.',
        storyQaNote: 'Inspect a real authored VN shot. The plan and background come from production data and are read-only here.',
        authoredLine: 'Authored VN line',
        derivedPreset: 'Production plan',
        derivedBackground: 'Production background',
        compositionSpeaker: 'COMPOSITION',
        compositionEmotion: 'STAGING PREVIEW',
        compositionText: 'Tune the plan, background and character placement. This preview is not bound to a story VN line.',
      }
    : {
        workspace: 'Рабочий режим',
        composition: 'Композиция',
        storyQa: 'Story QA',
        compositionNote: 'Редактирование staging-плана независимо от VN-реплик. Позиции и browser-local overrides не могут быть перезаписаны authored shot-ом.',
        storyQaNote: 'Просмотр реального authored VN shot. План и фон берутся из production-данных и здесь доступны только для чтения.',
        authoredLine: 'Authored VN line',
        derivedPreset: 'Production plan',
        derivedBackground: 'Production background',
        compositionSpeaker: 'КОМПОЗИЦИЯ',
        compositionEmotion: 'STAGING PREVIEW',
        compositionText: 'Настраивайте план, фон и положение персонажей. Этот preview не привязан к сюжетной VN-реплике.',
      };
