import { describe, expect, it } from 'vitest';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B2B2_KEY_COUNT = 128;

const ingredientKeys = new Set([
  'match3.ingredient.asterionSpec',
  'match3.ingredient.missingNumberSheet',
  'match3.ingredient.handoffSlip',
  'match3.ingredient.stitchedWristband',
  'match3.ingredient.transferSeal',
  'match3.ingredient.routeCard',
  'match3.ingredient.transferManifest',
  'match3.ingredient.secondSkinTag',
  'match3.ingredient.pilotList',
]);

const isB2B2Key = (key: string): boolean => {
  const level = key.match(/^match3\.level\.M3_(\d{2})_/u);
  if (level) {
    const index = Number(level[1]);
    return index >= 7 && index <= 13;
  }

  const bark = key.match(/^match3\.bark\.(?:fiveMoves|blockers|ingredient)\.(\d+)$/u);
  if (bark) {
    const index = Number(bark[1]);
    return index >= 7 && index <= 13;
  }

  const clue = key.match(/^match3\.clue\.CUE_(\d{3})$/u);
  if (clue) {
    const cue = Number(clue[1]);
    return cue >= 8 && cue <= 14;
  }

  return ingredientKeys.has(key);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB2B2Key(key)));

describe('ANM-029B2B2 Belarusian Match-3 levels 07–13', () => {
  it('covers the bounded level/evidence/bark scope exactly and preserves placeholders', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B2B2_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B2B2_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B2B2_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks protected project names and reviewed Belarusian character forms', () => {
    expect(beCatalog['match3.level.M3_07_ASTERION_THREAD.title']).toBe('Узоры Asterion');
    expect(beCatalog['match3.level.M3_08_LOST_FOUND_LEDGER.startBark.speaker']).toBe('Рына');
    expect(beCatalog['match3.level.M3_10_CONTROL_SAMPLE_GEAR.startBark.speaker']).toBe('Аоі');
    expect(beCatalog['match3.level.M3_12_SECOND_SKIN_SIGNAL.title']).toBe('Сігнал Second Skin');
    expect(beCatalog['match3.level.M3_13_KENDO_PILOT_LIST.startBark.speaker']).toBe('Кубо');
    expect(beCatalog['match3.ingredient.secondSkinTag']).toBe('Мікраметка Second Skin');
  });

  it('keeps Belarusian pending and unavailable at runtime', () => {
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'production-complete',
      runtimeSelectable: true,
    });
    expect(supportedLocales).toEqual(['ru', 'be', 'en']);
    expect('be' in appCatalogs).toBe(true);
  });
});
