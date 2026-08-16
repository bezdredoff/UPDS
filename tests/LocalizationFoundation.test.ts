import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCALE, resolveLocale, type Locale } from '../src/localization/Locale';
import { LocalizationService } from '../src/localization/LocalizationService';
import { LOCALE_SETTINGS_KEY, LocaleSettingsStore } from '../src/localization/LocaleSettingsStore';
import { initialAppCatalogs, loadRuntimeLocaleCatalog } from '../src/localization/catalogs';
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
    expect(resolveLocale('be_BY')).toBe('be');
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
      be: { greeting: 'Прывітанне, {name}' },
      en: { greeting: 'Hello, {name}' },
    }, 'en');

    expect(localization.t('greeting', { name: 'Miku' })).toBe('Hello, Miku');
    expect(localization.t('sourceOnly')).toBe('Только источник');
    expect(localization.t('unknown.key')).toBe('[unknown.key]');
    expect(localization.has('sourceOnly')).toBe(true);
    expect(localization.has('unknown.key')).toBe(false);
  });

  it('notifies only on actual locale changes', () => {
    const localization = new LocalizationService({ ru: {}, be: {}, en: {} });
    const listener = vi.fn();
    localization.subscribe(listener);
    localization.setLocale('ru');
    localization.setLocale('en');
    localization.setLocale('en');
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith('en');
  });

  it('loads non-default runtime catalogs on demand and reuses concurrent loads', async () => {
    const loader = vi.fn(async (locale: Locale) => ({ greeting: locale }));
    const localization = new LocalizationService({ ru: { greeting: 'ru' } }, 'ru', 'ru', loader);

    expect(localization.locale).toBe('ru');
    const [first, second] = await Promise.all([
      localization.ensureLocale('en'),
      localization.ensureLocale('en'),
    ]);
    expect(first).toBeUndefined();
    expect(second).toBeUndefined();
    expect(loader).toHaveBeenCalledTimes(1);

    await localization.activateLocale('en');
    expect(localization.locale).toBe('en');
    expect(localization.t('greeting')).toBe('en');
    expect(loader).toHaveBeenCalledTimes(1);
  });

  it('keeps only Russian in the startup catalog and loads complete BE/EN runtime catalogs dynamically', async () => {
    expect(Object.keys(initialAppCatalogs)).toEqual(['ru']);
    const [beRuntime, enRuntime] = await Promise.all([
      loadRuntimeLocaleCatalog('be'),
      loadRuntimeLocaleCatalog('en'),
    ]);
    expect(beRuntime['menu.newGame']).toBe('Новая гульня');
    expect(enRuntime['menu.newGame']).toBe('New Game');
    expect(Object.keys(beRuntime).sort()).toEqual(Object.keys(initialAppCatalogs.ru).sort());
    expect(Object.keys(enRuntime).sort()).toEqual(Object.keys(initialAppCatalogs.ru).sort());
  });

  it('keeps non-default locale modules outside the static startup dependency graph', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/localization/catalogs/index.ts'), 'utf8');
    expect(source).toContain("await import('./be')");
    expect(source).toContain("await import('./en')");
    expect(source).not.toContain("import { beCatalog } from './be'");
    expect(source).not.toContain("import { enCatalog } from './en'");
  });

  it('persists locale independently from campaign and audio settings', () => {
    const storage = new MemoryStorage();
    const settings = new LocaleSettingsStore(storage);
    expect(settings.load()).toBe('ru');
    settings.save('be');
    expect(storage.getItem(LOCALE_SETTINGS_KEY)).toBe('be');
    settings.save('en');
    expect(storage.getItem(LOCALE_SETTINGS_KEY)).toBe('en');
    expect(LOCALE_SETTINGS_KEY).toBe('seiran-detectives-locale-v1');
    expect(new LocaleSettingsStore(storage).load()).toBe('en');
  });

  it('ships complete source/runtime catalogs through the localization foundation', async () => {
    const [{ ruCatalog }, { enCatalog }] = await Promise.all([
      import('../src/localization/catalogs/ru'),
      import('../src/localization/catalogs/en'),
    ]);
    expect(enCatalog['menu.newGame']).toBe('New Game');
    expect(enCatalog['settings.audioHeading']).toBe('Audio & Feedback');
    expect(enCatalog['pwa.checkUpdate']).toBe('Check for update');
    expect(enCatalog['vn.choice.A.title']).toBe('Find the second victim first');
    expect(enCatalog['vn.scene.VN_SCENE_00_PROLOGUE.title']).toBe('The Club That Barely Exists');
    expect(ruCatalog['menu.newGame']).toBe('Новая игра');
    expect(Object.keys(enCatalog).sort()).toEqual(Object.keys(ruCatalog).sort());
  });

});
