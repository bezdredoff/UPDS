import { describe, expect, it } from 'vitest';
import { supportedLocales } from '../src/localization/Locale';
import { loadRuntimeLocaleCatalog } from '../src/localization/catalogs';
import { match3GuidanceCatalogs } from '../src/localization/catalogs/match3Guidance';

describe('ANM-025C3 Match-3 story-object guidance localization', () => {
  it('keeps RU, BE and EN guidance copy structurally complete', () => {
    const expectedKeys = Object.keys(match3GuidanceCatalogs.ru).sort();
    expect(expectedKeys).toEqual(['match3.storyObjectGuidance']);

    for (const locale of supportedLocales) {
      expect(Object.keys(match3GuidanceCatalogs[locale]).sort()).toEqual(expectedKeys);
      expect(match3GuidanceCatalogs[locale]['match3.storyObjectGuidance']).toContain('{object}');
    }
  });

  it('ships the guidance extension through every actual runtime catalog', async () => {
    for (const locale of supportedLocales) {
      const runtime = await loadRuntimeLocaleCatalog(locale);
      expect(runtime['match3.storyObjectGuidance']).toBe(match3GuidanceCatalogs[locale]['match3.storyObjectGuidance']);
    }
  });

  it('keeps Belarusian guidance free of Russian-only Cyrillic letters', () => {
    expect(match3GuidanceCatalogs.be['match3.storyObjectGuidance']).not.toMatch(/[ИиЩщЪъ]/u);
  });
});
