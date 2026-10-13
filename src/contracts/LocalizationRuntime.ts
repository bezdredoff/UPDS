import type { Locale } from '../localization/Locale';
import type { MessageParams } from '../localization/MessageCatalog';

/** Runtime-neutral locale selection and message lookup used by application features. */
export interface LocalizationRuntime {
  readonly locale: Locale;

  has(key: string, locale?: Locale): boolean;
  t(key: string, params?: MessageParams): string;
  setLocale(locale: Locale): void;
  activateLocale(locale: Locale): Promise<void>;
  subscribe(listener: (locale: Locale) => void): () => void;
}
