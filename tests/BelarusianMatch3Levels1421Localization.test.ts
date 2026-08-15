import { describe, expect, it } from 'vitest';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B2B3_KEY_COUNT = 146;

const ingredientKeys = new Set([
  'match3.ingredient.familyReceipt',
  'match3.ingredient.atelierLedger',
  'match3.ingredient.markedPackage',
  'match3.ingredient.serviceKeyCard',
  'match3.ingredient.handheldScanner',
  'match3.ingredient.rinaCatalog',
  'match3.ingredient.recentMarkedItem',
  'match3.ingredient.returnConfirmation',
  'match3.ingredient.backupDrive',
  'match3.ingredient.finalSlide',
]);

const isB2B3Key = (key: string): boolean => {
  const level = key.match(/^match3\.level\.M3_(\d{2})_/u);
  if (level) {
    const index = Number(level[1]);
    return index >= 14 && index <= 21;
  }

  const bark = key.match(/^match3\.bark\.(?:fiveMoves|blockers|ingredient)\.(\d+)$/u);
  if (bark) {
    const index = Number(bark[1]);
    return index >= 14 && index <= 21;
  }

  const clue = key.match(/^match3\.clue\.CUE_(\d{3})$/u);
  if (clue) {
    const cue = Number(clue[1]);
    return cue >= 15 && cue <= 22;
  }

  return ingredientKeys.has(key);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB2B3Key(key)));

describe('ANM-029B2B3 Belarusian Match-3 levels 14–21', () => {
  it('covers the bounded level/evidence/bark scope exactly and preserves placeholders', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B2B3_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B2B3_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B2B3_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks protected project names, consent/privacy terms and reviewed Belarusian names', () => {
    expect(beCatalog['match3.level.M3_14_KUBO_ATELIER_LEDGER.startBark.speaker']).toBe('Маці Кубо');
    expect(beCatalog['match3.level.M3_16_PINK_RIBBON_SCANNER.startBark.speaker']).toBe('Вінсент');
    expect(beCatalog['match3.level.M3_17_RINA_ARCHIVE_CATALOG.startBark.speaker']).toBe('Рына');
    expect(beCatalog['match3.level.M3_18_FULL_TIMELINE_PROOF.clueTitle']).toBe('Працяг Second Skin');
    expect(beCatalog['match3.level.M3_20_SERVER_CONSENT_LOGS.clueTitle']).toBe('Журналы згоды');
    expect(beCatalog['match3.level.M3_21_CONVENIENT_CASE.title']).toBe('Ідэальны падазраваны');
    expect(beCatalog['match3.ingredient.backupDrive']).toBe('Рэзервовы назапашвальнік');
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
