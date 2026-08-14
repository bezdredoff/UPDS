import { DEFAULT_LOCALE, supportedLocales, type Locale } from './Locale';

export const productionLocales = ['ru', 'be', 'en', 'zh-CN', 'ja', 'ko', 'pt-BR'] as const;

export type ProductionLocale = (typeof productionLocales)[number];
export type LocalizationProductionStatus = 'source-complete' | 'production-complete' | 'translation-pending';
export type LocalizationScript = 'cyrillic' | 'latin' | 'han' | 'japanese' | 'hangul';

export type ProductionLocaleProfile = Readonly<{
  locale: ProductionLocale;
  nativeName: string;
  englishName: string;
  script: LocalizationScript;
  cjk: boolean;
  status: LocalizationProductionStatus;
  runtimeSelectable: boolean;
}>;

export const productionLocaleProfiles: readonly ProductionLocaleProfile[] = [
  { locale: 'ru', nativeName: 'Русский', englishName: 'Russian', script: 'cyrillic', cjk: false, status: 'source-complete', runtimeSelectable: true },
  { locale: 'be', nativeName: 'Беларуская', englishName: 'Belarusian', script: 'cyrillic', cjk: false, status: 'translation-pending', runtimeSelectable: false },
  { locale: 'en', nativeName: 'English', englishName: 'English', script: 'latin', cjk: false, status: 'production-complete', runtimeSelectable: true },
  { locale: 'zh-CN', nativeName: '简体中文', englishName: 'Simplified Chinese', script: 'han', cjk: true, status: 'translation-pending', runtimeSelectable: false },
  { locale: 'ja', nativeName: '日本語', englishName: 'Japanese', script: 'japanese', cjk: true, status: 'translation-pending', runtimeSelectable: false },
  { locale: 'ko', nativeName: '한국어', englishName: 'Korean', script: 'hangul', cjk: true, status: 'translation-pending', runtimeSelectable: false },
  { locale: 'pt-BR', nativeName: 'Português (Brasil)', englishName: 'Brazilian Portuguese', script: 'latin', cjk: false, status: 'translation-pending', runtimeSelectable: false },
] as const;

const normalizedLocale = (value: string): string => value.trim().toLowerCase().replace(/_/g, '-');

export const isCjkLocaleTag = (value: string): boolean => /^(?:ja|zh|ko)(?:-|$)/iu.test(normalizedLocale(value));

export const getProductionLocaleProfile = (locale: ProductionLocale): ProductionLocaleProfile => {
  const profile = productionLocaleProfiles.find((candidate) => candidate.locale === locale);
  if (!profile) throw new Error(`Missing production locale profile: ${locale}`);
  return profile;
};

export const productionReadyLocales = productionLocaleProfiles
  .filter((profile) => profile.status !== 'translation-pending')
  .map((profile) => profile.locale);

export const runtimeSelectableLocaleProfiles = productionLocaleProfiles
  .filter((profile): profile is ProductionLocaleProfile & Readonly<{ locale: Locale; runtimeSelectable: true }> =>
    profile.runtimeSelectable && supportedLocales.includes(profile.locale as Locale),
  );

export const validateLocalizationProductionContract = (): string[] => {
  const issues: string[] = [];
  const localeIds = productionLocaleProfiles.map((profile) => profile.locale);
  const uniqueLocaleIds = new Set(localeIds);

  if (uniqueLocaleIds.size !== localeIds.length) issues.push('Production locale registry contains duplicate locale IDs.');
  if (localeIds.join('|') !== productionLocales.join('|')) issues.push('Production locale registry order must match productionLocales.');

  const runtimeProfiles = productionLocaleProfiles.filter((profile) => profile.runtimeSelectable);
  const runtimeIds = runtimeProfiles.map((profile) => profile.locale);
  if (runtimeIds.join('|') !== supportedLocales.join('|')) {
    issues.push('Only fully shipped supportedLocales may be runtime-selectable.');
  }

  for (const profile of productionLocaleProfiles) {
    if (profile.runtimeSelectable && profile.status === 'translation-pending') {
      issues.push(`${profile.locale} is translation-pending but exposed as runtime-selectable.`);
    }
    if (profile.cjk !== isCjkLocaleTag(profile.locale)) {
      issues.push(`${profile.locale} CJK metadata does not match its locale tag.`);
    }
  }

  const sourceProfile = productionLocaleProfiles.find((profile) => profile.locale === DEFAULT_LOCALE);
  if (!sourceProfile || sourceProfile.status !== 'source-complete') {
    issues.push('DEFAULT_LOCALE must be the source-complete production locale.');
  }

  return issues;
};

export const isRuntimeSelectableProductionLocale = (locale: ProductionLocale): locale is Locale =>
  getProductionLocaleProfile(locale).runtimeSelectable && supportedLocales.includes(locale as Locale);
