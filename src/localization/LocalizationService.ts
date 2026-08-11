import { DEFAULT_LOCALE, type Locale } from './Locale';
import { formatMessage, type LocaleCatalogs, type MessageParams } from './MessageCatalog';

export type LocaleListener = (locale: Locale) => void;

export class LocalizationService {
  private currentLocale: Locale;
  private readonly listeners = new Set<LocaleListener>();

  constructor(
    private readonly catalogs: LocaleCatalogs<Locale>,
    initialLocale: Locale = DEFAULT_LOCALE,
    private readonly fallbackLocale: Locale = DEFAULT_LOCALE,
  ) {
    this.currentLocale = initialLocale;
  }

  get locale(): Locale {
    return this.currentLocale;
  }

  setLocale(locale: Locale): void {
    if (locale === this.currentLocale) return;
    this.currentLocale = locale;
    for (const listener of this.listeners) listener(locale);
  }

  subscribe(listener: LocaleListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  has(key: string, locale: Locale = this.currentLocale): boolean {
    return this.catalogs[locale]?.[key] !== undefined || this.catalogs[this.fallbackLocale]?.[key] !== undefined;
  }

  t(key: string, params: MessageParams = {}): string {
    const template = this.catalogs[this.currentLocale]?.[key]
      ?? this.catalogs[this.fallbackLocale]?.[key];
    if (template === undefined) return `[${key}]`;
    return formatMessage(template, params);
  }
}
