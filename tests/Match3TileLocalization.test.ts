import { describe, expect, it } from 'vitest';
import { LocalizationService } from '../src/localization/LocalizationService';
import { loadRuntimeLocaleCatalog, ruRuntimeCatalog } from '../src/localization/catalogs';
import { tileKeys } from '../src/data/levels';

const concreteTileIds = tileKeys.filter((tile) => tile.startsWith('panties') && tile !== 'panties');

describe('Match-3 concrete tile localization', () => {
  it('resolves every dynamic tile label through the runtime catalogs', async () => {
    const expectedLocales = {
      ru: ['Белые спорт.', 'Розовые', 'Чёрные', 'Голубые'],
      be: ['Белыя спорт.', 'Ружовыя', 'Чорныя', 'Блакітныя'],
      en: ['White sports', 'Pink lace', 'Black high-waist', 'Blue boyshorts'],
    } as const;

    for (const locale of ['ru', 'be', 'en'] as const) {
      const service = new LocalizationService(
        { ru: ruRuntimeCatalog },
        'ru',
        'ru',
        async (requestedLocale) => loadRuntimeLocaleCatalog(requestedLocale),
      );
      await service.activateLocale(locale);

      concreteTileIds.forEach((tile, index) => {
        const value = service.t(`match3.tile.${tile}`);
        expect(value, `${locale}:${tile}`).toBe(expectedLocales[locale][index]);
        expect(value, `${locale}:${tile}`).not.toMatch(/^\[match3\.tile\./u);
      });
    }
  });
});
