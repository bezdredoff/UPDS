export const supportedLocales = ['ru', 'en'] as const;

export type Locale = (typeof supportedLocales)[number];

export const DEFAULT_LOCALE: Locale = 'ru';

export const isSupportedLocale = (value: string): value is Locale =>
  supportedLocales.includes(value as Locale);

export const resolveLocale = (value: string | null | undefined, fallback: Locale = DEFAULT_LOCALE): Locale => {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase().replace('_', '-');
  if (isSupportedLocale(normalized)) return normalized;
  const language = normalized.split('-')[0];
  return isSupportedLocale(language) ? language : fallback;
};
