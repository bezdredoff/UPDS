import { describe, expect, it } from 'vitest';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const MATCH3_CORE_KEY_COUNT = 83;
const deferredMatch3Prefixes = [
  'match3.level.',
  'match3.bark.blockers.',
  'match3.bark.fiveMoves.',
  'match3.bark.ingredient.',
  'match3.clue.',
  'match3.ingredient.',
] as const;

const isMatch3CoreKey = (key: string): boolean =>
  key.startsWith('match3Campaign.') ||
  (key.startsWith('match3.') && !deferredMatch3Prefixes.some((prefix) => key.startsWith(prefix)));

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isMatch3CoreKey(key)));

describe('ANM-029B2A Belarusian Match-3 core localization', () => {
  it('covers the bounded core/campaign scope exactly and preserves named placeholders', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(MATCH3_CORE_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(MATCH3_CORE_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(MATCH3_CORE_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('keeps level narrative, evidence labels and per-level barks out of B2A', () => {
    expect(Object.keys(beCatalog).some((key) => key.startsWith('match3.level.'))).toBe(false);
    expect(Object.keys(beCatalog).some((key) => key.startsWith('match3.clue.'))).toBe(false);
    expect(Object.keys(beCatalog).some((key) => key.startsWith('match3.ingredient.'))).toBe(false);
    expect(Object.keys(beCatalog).some((key) => key.startsWith('match3.bark.blockers.'))).toBe(false);
  });

  it('keeps Belarusian pending and out of runtime until the full catalog is complete', () => {
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });

  it('locks reviewed Match-3 terminology', () => {
    expect(beCatalog['match3.objective']).toBe('МЭТА');
    expect(beCatalog['match3.hint']).toBe('ПАДКАЗКА');
    expect(beCatalog['match3.feedback.match']).toBe('СУПАДЗЕННЕ');
    expect(beCatalog['match3.special.evidence']).toBe('Доказ');
    expect(beCatalog['match3Campaign.title']).toBe('Дошка спраў');
  });
});
