import { describe, expect, it } from 'vitest';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { localizationGlossary, validateLocalizationGlossary } from '../src/localization/LocalizationGlossary';
import {
  isCjkLocaleTag,
  productionLocaleProfiles,
  productionLocales,
  runtimeSelectableLocaleProfiles,
  validateLocalizationProductionContract,
} from '../src/localization/LocalizationProduction';
import { enCatalog } from '../src/localization/catalogs/en';
import { ruCatalog } from '../src/localization/catalogs/ru';

const expectedTargets = ['ru', 'be', 'en', 'zh-CN', 'ja', 'ko', 'pt-BR'] as const;

describe('ANM-029A localization production foundation', () => {
  it('locks the seven production targets without exposing translation-pending locales in runtime', () => {
    expect(productionLocales).toEqual(expectedTargets);
    expect(productionLocaleProfiles.map((profile) => profile.locale)).toEqual(expectedTargets);
    expect(runtimeSelectableLocaleProfiles.map((profile) => profile.locale)).toEqual([...supportedLocales]);
    expect(runtimeSelectableLocaleProfiles.map((profile) => profile.locale)).toEqual(['ru', 'en']);
    expect(productionLocaleProfiles.filter((profile) => profile.status === 'translation-pending').map((profile) => profile.locale))
      .toEqual(['be', 'zh-CN', 'ja', 'ko', 'pt-BR']);
    expect(validateLocalizationProductionContract()).toEqual([]);
  });

  it('centralizes CJK readiness metadata for dialogue pagination and typography QA', () => {
    expect(isCjkLocaleTag('zh-CN')).toBe(true);
    expect(isCjkLocaleTag('zh_Hans_CN')).toBe(true);
    expect(isCjkLocaleTag('ja-JP')).toBe(true);
    expect(isCjkLocaleTag('ko-KR')).toBe(true);
    expect(isCjkLocaleTag('ru-RU')).toBe(false);
    expect(isCjkLocaleTag('pt-BR')).toBe(false);
  });

  it('audits shipped catalogs for key parity, empty values and placeholder preservation', () => {
    const enAudit = auditMessageCatalog(ruCatalog, enCatalog);
    expect(enAudit.sourceKeyCount).toBeGreaterThan(0);
    expect(enAudit.targetKeyCount).toBe(enAudit.sourceKeyCount);
    expect(enAudit.missingKeys).toEqual([]);
    expect(enAudit.extraKeys).toEqual([]);
    expect(enAudit.emptyKeys).toEqual([]);
    expect(enAudit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(enAudit)).toBe(true);
  });

  it('locks a translator glossary with unique stable IDs and explicit handling rules', () => {
    expect(localizationGlossary.length).toBeGreaterThanOrEqual(12);
    expect(validateLocalizationGlossary()).toEqual([]);
    expect(localizationGlossary.find((entry) => entry.id === 'second-skin')).toMatchObject({ en: 'Second Skin', rule: 'preserve' });
    expect(localizationGlossary.find((entry) => entry.id === 'category-u')).toMatchObject({ en: 'Category U', rule: 'translate' });
  });
});
