import { DEFAULT_LOCALE, type Locale } from './Locale';
import { formatMessage, type LocaleCatalogs, type MessageCatalog, type MessageParams } from './MessageCatalog';

export type LocaleListener = (locale: Locale) => void;
export type LocaleCatalogLoader = (locale: Locale) => Promise<MessageCatalog>;

export class LocalizationService {
  private currentLocale: Locale;
  private readonly catalogs: Partial<Record<Locale, MessageCatalog>>;
  private readonly listeners = new Set<LocaleListener>();
  private readonly pendingLoads = new Map<Locale, Promise<void>>();

  constructor(
    catalogs: LocaleCatalogs<Locale>,
    initialLocale: Locale = DEFAULT_LOCALE,
    private readonly fallbackLocale: Locale = DEFAULT_LOCALE,
    private readonly catalogLoader?: LocaleCatalogLoader,
  ) {
    this.catalogs = { ...catalogs };
    this.currentLocale = this.catalogs[initialLocale] ? initialLocale : fallbackLocale;
  }

  get locale(): Locale {
    return this.currentLocale;
  }

  async ensureLocale(locale: Locale): Promise<void> {
    if (this.catalogs[locale]) return;
    const pending = this.pendingLoads.get(locale);
    if (pending) return pending;
    if (!this.catalogLoader) throw new Error(`Locale catalog is not loaded: ${locale}`);

    const load = this.catalogLoader(locale).then((catalog) => {
      this.catalogs[locale] = catalog;
    }).finally(() => {
      this.pendingLoads.delete(locale);
    });
    this.pendingLoads.set(locale, load);
    return load;
  }

  async activateLocale(locale: Locale): Promise<void> {
    await this.ensureLocale(locale);
    this.setLocale(locale);
  }

  setLocale(locale: Locale): void {
    if (!this.catalogs[locale]) throw new Error(`Locale catalog is not loaded: ${locale}`);
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
