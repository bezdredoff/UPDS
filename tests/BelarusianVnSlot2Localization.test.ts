import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3C_KEY_COUNT = 151;
const SLOT2_SCENES = new Set([
  'VN_SCENE_05_E2_PRE',
  'VN_SCENE_06_E2_POST',
]);

const isB3CKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT2_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  return Boolean(line && Number(line[1]) >= 143 && Number(line[1]) <= 191);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3CKey(key)));

describe('ANM-029B3C Belarusian VN story slot 2', () => {
  it('covers the canonical runtime graph boundary VN0143–VN0191 and scenes 05–06 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3C_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3C_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3C_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('tracks the canonical storyGraph ranges and next-slot boundary', () => {
    const scene05 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_05_E2_PRE');
    const scene06 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_06_E2_POST');
    const scene07 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_07_E3_PRE');

    expect(scene05?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0143', endLineId: 'VN0166' });
    expect(scene06?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0167', endLineId: 'VN0191' });
    expect(scene07?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0192', endLineId: 'VN0216' });
  });

  it('locks reviewed terminology, dossier payload and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_05_E2_PRE.title']).toBe('Мокрыя паказанні');
    expect(beCatalog['vn.scene.VN_SCENE_06_E2_POST.title']).toBe('Табліца без густу');
    expect(beCatalog['vn.line.VN0149.text']).toContain('Норыхіра');
    expect(beCatalog['vn.line.VN0158.text']).toContain('службовай шафы');
    expect(beCatalog['vn.line.VN0173.text']).toContain('тыпе бялізны');
    expect(beCatalog['vn.line.VN0175.text']).toBe('{ADD CUE_003_MIXED_TARGETS}');
    expect(beCatalog['vn.line.VN0184.text']).toContain('згодзе');
    expect(beCatalog['vn.line.VN0188.text']).toBe('«Эпізод 3 — Ружовыя тапачкі»');
    expect(beCatalog['vn.line.VN0190.text']).toContain('Кэнтаро');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3C_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
