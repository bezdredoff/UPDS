import { describe, expect, it } from 'vitest';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3A_KEY_COUNT = 302;
const SLOT0_SCENES = new Set([
  'VN_SCENE_00_PROLOGUE',
  'VN_SCENE_01_E0_PRE',
  'VN_SCENE_02_E0_POST',
]);

const isB3AKey = (key: string): boolean => {
  if (key.startsWith('vn.choice.')) return true;
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT0_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})[A-C]?\.(?:speaker|emotion|text)$/u);
  return Boolean(line && Number(line[1]) >= 1 && Number(line[1]) <= 84);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3AKey(key)));

describe('ANM-029B3A Belarusian VN story slot 0', () => {
  it('covers VN0001–VN0084, CHOICE_00 and scenes 00–02 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3A_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3A_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3A_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks the reviewed opening terminology, names and branch variables', () => {
    expect(beCatalog['vn.scene.VN_SCENE_01_E0_PRE.title']).toBe('Справа класа U');
    expect(beCatalog['vn.choice.prompt']).toBe('З чаго пачаць?');
    expect(beCatalog['vn.line.VN0024.text']).toContain('Эмі Такахасі');
    expect(beCatalog['vn.line.VN0043C.text']).toContain('Маю Хаясакай');
    expect(beCatalog['vn.line.VN0044B.text']).toContain('Кэнтаро');
    expect(beCatalog['vn.line.VN0031.text']).toBe('Undergarment.');
    expect(beCatalog['vn.line.VN0046A.text']).toBe('{approach=verify; source_trust+1; bonus_laundry_detail=true}');
    expect(beCatalog['vn.line.VN0046B.text']).toBe('{approach=warn; rumor_heat+1}');
    expect(beCatalog['vn.line.VN0047C.text']).toBe('{approach=report; onoe_trust+1}');
    expect(beCatalog['vn.line.VN0069.text']).toBe('{dossier_unlocked=true; ADD CUE_001_SELECTIVE_THEFT}');
  });

  it('keeps its bounded selector stable while Belarusian remains unavailable at runtime', () => {
    expect(Object.keys(select(beCatalog))).toHaveLength(B3A_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
