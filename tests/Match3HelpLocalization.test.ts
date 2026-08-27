import { describe, expect, it } from 'vitest';
import { supportedLocales } from '../src/localization/Locale';
import { loadRuntimeLocaleCatalog } from '../src/localization/catalogs';
import { match3HelpCatalogs } from '../src/localization/catalogs/match3Help';

const helpKeys = Object.keys(match3HelpCatalogs.ru).sort();

describe('ANM-025C2 Match-3 Help localization', () => {
  it('keeps the compact Help extension complete in RU, BE and EN', () => {
    expect(helpKeys).toHaveLength(16);
    for (const locale of supportedLocales) {
      const catalog: Readonly<Record<string, string>> = match3HelpCatalogs[locale];
      expect(Object.keys(catalog).sort()).toEqual(helpKeys);
      for (const key of helpKeys) expect(catalog[key], `${locale}:${key}`).toBeTruthy();
    }
  });

  it('exposes every Help key through the actual lazy runtime catalogs with no fallback', async () => {
    for (const locale of supportedLocales) {
      const runtime = await loadRuntimeLocaleCatalog(locale);
      const expected: Readonly<Record<string, string>> = match3HelpCatalogs[locale];
      for (const key of helpKeys) expect(runtime[key], `${locale}:${key}`).toBe(expected[key]);
    }
  });

  it('keeps Belarusian Help copy free of Russian-only Cyrillic letters', () => {
    for (const [key, value] of Object.entries(match3HelpCatalogs.be)) {
      expect(value, key).not.toMatch(/[ИиЩщЪъ]/u);
    }
  });
});
