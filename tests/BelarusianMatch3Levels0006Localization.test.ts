import { describe, expect, it } from 'vitest';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B2B1_KEY_COUNT = 123;

const isB2B1Key = (key: string): boolean => {
  const level = key.match(/^match3\.level\.M3_(\d{2})_/u);
  if (level) return Number(level[1]) <= 6;

  const bark = key.match(/^match3\.bark\.(?:fiveMoves|blockers|ingredient)\.(\d+)$/u);
  if (bark) return Number(bark[1]) <= 6;

  const clue = key.match(/^match3\.clue\.CUE_(\d{3})$/u);
  if (clue) {
    const cue = Number(clue[1]);
    return cue >= 1 && cue <= 7;
  }

  return [
    'match3.ingredient.receipt',
    'match3.ingredient.memoryCard',
    'match3.ingredient.serviceKey',
    'match3.ingredient.damagedTowel',
    'match3.ingredient.laundryCalendar',
    'match3.ingredient.repairLog',
    'match3.ingredient.warrantyCard',
    'match3.ingredient.silverSpool',
  ].includes(key);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB2B1Key(key)));

describe('ANM-029B2B1 Belarusian Match-3 levels 00–06', () => {
  it('covers the bounded level/evidence/bark scope exactly and preserves placeholders', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B2B1_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B2B1_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B2B1_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks reviewed Belarusian name forms and investigation terminology', () => {
    expect(beCatalog['match3.level.M3_00_LOCKER_TUTORIAL.title']).toBe('Шафка Эмі');
    expect(beCatalog['match3.level.M3_01_PHOTO_PROPS.winBark.speaker']).toBe('Міку');
    expect(beCatalog['match3.level.M3_05_BASKETBALL_LOCKERS.startBark.speaker']).toBe('Хіната');
    expect(beCatalog['match3.level.M3_02_POOL_LAUNDRY.startBark.speaker']).toBe('Норыхіра');
    expect(beCatalog['match3.clue.CUE_004']).toBe('Электраправодны шво');
    expect(beCatalog['match3.ingredient.serviceKey']).toBe('Сэрвісны ключ');
  });

  it('keeps Belarusian pending and unavailable at runtime', () => {
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
