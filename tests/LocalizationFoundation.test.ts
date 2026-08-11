import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCALE, resolveLocale } from '../src/localization/Locale';
import { LocalizationService } from '../src/localization/LocalizationService';
import { LOCALE_SETTINGS_KEY, LocaleSettingsStore } from '../src/localization/LocaleSettingsStore';
import { formatMessage } from '../src/localization/MessageCatalog';
import type { StorageLike } from '../src/platform/SafeStorage';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  setItem(key: string, value: string): void { this.values.set(key, value); }
  removeItem(key: string): void { this.values.delete(key); }
}

describe('ANM-019A localization foundation', () => {
  it('resolves supported locale tags and falls back to the Russian source locale', () => {
    expect(DEFAULT_LOCALE).toBe('ru');
    expect(resolveLocale('ru-RU')).toBe('ru');
    expect(resolveLocale('en_US')).toBe('en');
    expect(resolveLocale('de-DE')).toBe('ru');
    expect(resolveLocale(null)).toBe('ru');
  });

  it('formats named parameters while leaving unresolved tokens visible', () => {
    expect(formatMessage('Ход {current} из {total}', { current: 2, total: 5 })).toBe('Ход 2 из 5');
    expect(formatMessage('ID: {id} / {missing}', { id: 'VN0001' })).toBe('ID: VN0001 / {missing}');
  });

  it('falls back per key and exposes missing keys deterministically', () => {
    const localization = new LocalizationService({
      ru: { greeting: 'Привет, {name}', sourceOnly: 'Только источник' },
      en: { greeting: 'Hello, {name}' },
    }, 'en');

    expect(localization.t('greeting', { name: 'Miku' })).toBe('Hello, Miku');
    expect(localization.t('sourceOnly')).toBe('Только источник');
    expect(localization.t('unknown.key')).toBe('[unknown.key]');
    expect(localization.has('sourceOnly')).toBe(true);
    expect(localization.has('unknown.key')).toBe(false);
  });

  it('notifies only on actual locale changes', () => {
    const localization = new LocalizationService({ ru: {}, en: {} });
    const listener = vi.fn();
    localization.subscribe(listener);
    localization.setLocale('ru');
    localization.setLocale('en');
    localization.setLocale('en');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('en');
  });

  it('persists locale independently from campaign and audio settings', () => {
    const storage = new MemoryStorage();
    const settings = new LocaleSettingsStore(storage);
    expect(settings.load()).toBe('ru');
    settings.save('en');
    expect(storage.getItem(LOCALE_SETTINGS_KEY)).toBe('en');
    expect(LOCALE_SETTINGS_KEY).toBe('seiran-detectives-locale-v1');
    expect(new LocaleSettingsStore(storage).load()).toBe('en');
  });
});
