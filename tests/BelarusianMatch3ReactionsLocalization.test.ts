import { describe, expect, it } from 'vitest';
import {
  auditMessageCatalog,
  isCatalogStructurallyComplete,
  selectMessageCatalogByPrefixes,
} from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { match3ReactionCatalogs } from '../src/localization/catalogs/match3Reactions';
import { ruCatalog } from '../src/localization/catalogs/ru';

const MATCH3_MAIN_KEY_COUNT = 480;
const MATCH3_REACTION_KEY_COUNT = 132;
const MATCH3_TOTAL_KEY_COUNT = 612;

const selectMainMatch3 = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  selectMessageCatalogByPrefixes(catalog, ['match3', 'match3Campaign']);

describe('ANM-029B2C Belarusian Match-3 reactions and full coverage', () => {
  it('covers all 132 F2 reaction strings exactly and preserves placeholders', () => {
    const audit = auditMessageCatalog(match3ReactionCatalogs.ru, match3ReactionCatalogs.be);

    expect(Object.keys(match3ReactionCatalogs.ru)).toHaveLength(MATCH3_REACTION_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(MATCH3_REACTION_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(MATCH3_REACTION_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('closes the complete Belarusian Match-3 production surface at 612/612', () => {
    const sourceMain = selectMainMatch3(ruCatalog);
    const targetMain = selectMainMatch3(beCatalog);
    const mainAudit = auditMessageCatalog(sourceMain, targetMain);
    const source = { ...sourceMain, ...match3ReactionCatalogs.ru };
    const target = { ...targetMain, ...match3ReactionCatalogs.be };
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(sourceMain)).toHaveLength(MATCH3_MAIN_KEY_COUNT);
    expect(mainAudit.sourceKeyCount).toBe(MATCH3_MAIN_KEY_COUNT);
    expect(mainAudit.targetKeyCount).toBe(MATCH3_MAIN_KEY_COUNT);
    expect(isCatalogStructurallyComplete(mainAudit)).toBe(true);

    expect(Object.keys(source)).toHaveLength(MATCH3_TOTAL_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(MATCH3_TOTAL_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(MATCH3_TOTAL_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks protected project terms and reviewed Belarusian reaction terminology', () => {
    expect(match3ReactionCatalogs.be['match3.reaction.specialCombo.11']).toContain('Asterion');
    expect(match3ReactionCatalogs.be['match3.reaction.nearWin.18']).toContain('Second Skin');
    expect(match3ReactionCatalogs.be['match3.reaction.danger.19']).toContain('CASE CLOSED');
    expect(match3ReactionCatalogs.be['match3.reaction.specialCombo.7']).toContain('Куросэ');
    expect(match3ReactionCatalogs.be['match3.reaction.specialActivated.16']).toContain('Вінсент');
    expect(match3ReactionCatalogs.be['match3.reaction.objectiveComplete.20']).toContain('згоду');
    expect(match3ReactionCatalogs.be['match3.reaction.objectiveComplete.19']).toContain('Прыватнасць');
  });

  it('keeps Belarusian pending and unavailable at runtime after Match-3 completion', () => {
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
