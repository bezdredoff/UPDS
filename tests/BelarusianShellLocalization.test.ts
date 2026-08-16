import { describe, expect, it } from 'vitest';
import {
  auditMessageCatalog,
  isCatalogStructurallyComplete,
  selectMessageCatalogByPrefixes,
} from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { beCatalog, beCompletedCatalogPrefixes } from '../src/localization/catalogs/be';
import { appCatalogs } from '../src/localization/catalogs';
import { ruCatalog } from '../src/localization/catalogs/ru';

const SHELL_KEY_COUNT = 61;

describe('ANM-029B1 Belarusian player-shell localization', () => {
  it('covers the bounded shell scope exactly and preserves named placeholders', () => {
    const sourceShell = selectMessageCatalogByPrefixes(ruCatalog, beCompletedCatalogPrefixes);
    const targetShell = selectMessageCatalogByPrefixes(beCatalog, beCompletedCatalogPrefixes);
    const audit = auditMessageCatalog(sourceShell, targetShell);

    expect(Object.keys(sourceShell)).toHaveLength(SHELL_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(SHELL_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(SHELL_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('keeps completed Belarusian wired into runtime', () => {
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'production-complete',
      runtimeSelectable: true,
    });
    expect(supportedLocales).toEqual(['ru', 'be', 'en']);
    expect('be' in appCatalogs).toBe(true);
  });

  it('locks the reviewed Belarusian product-title split and shell terminology', () => {
    expect(beCatalog['menu.title']).toBe('Дэтэктывы');
    expect(beCatalog['menu.titleAccent']).toBe('класа U');
    expect(beCatalog['localization.language.label']).toBe('Мова');
    expect(beCatalog['common.settings']).toBe('Налады');
    expect(beCatalog['settings.installHeading']).toBe('Усталяванне і афлайн');
  });
});
