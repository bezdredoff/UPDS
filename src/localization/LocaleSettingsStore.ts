import type { KeyValueStorage } from '../contracts/KeyValueStorage';
import { DEFAULT_LOCALE, resolveLocale, type Locale } from './Locale';

export const LOCALE_SETTINGS_KEY = 'seiran-detectives-locale-v1';

export class LocaleSettingsStore {
  constructor(private readonly storage: KeyValueStorage) {}

  load(): Locale {
    try {
      return resolveLocale(this.storage.getItem(LOCALE_SETTINGS_KEY), DEFAULT_LOCALE);
    } catch {
      return DEFAULT_LOCALE;
    }
  }

  save(locale: Locale): void {
    try {
      this.storage.setItem(LOCALE_SETTINGS_KEY, locale);
    } catch {
      // SafeStorage normally prevents storage failures. Keep locale changes usable
      // even when a custom/test KeyValueStorage becomes unavailable at runtime.
    }
  }
}
