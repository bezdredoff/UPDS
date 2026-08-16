import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3D_KEY_COUNT = 181;
const SLOT3_SCENES = new Set([
  'VN_SCENE_07_E3_PRE',
  'VN_SCENE_08_E3_POST',
]);

const isB3DKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT3_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  return Boolean(line && Number(line[1]) >= 192 && Number(line[1]) <= 250);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3DKey(key)));

describe('ANM-029B3D Belarusian VN story slot 3', () => {
  it('covers the canonical runtime graph boundary VN0192–VN0250 and scenes 07–08 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3D_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3D_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3D_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('tracks the canonical vertical-slice ending and VN0251 bridge boundary', () => {
    const scene07 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_07_E3_PRE');
    const scene08 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_08_E3_POST');
    const scene09 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_09_E4_PRE');

    expect(scene07?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0192', endLineId: 'VN0216' });
    expect(scene08?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0217', endLineId: 'VN0250' });
    expect(scene09?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0251', endLineId: 'VN0270' });
  });

  it('locks reviewed consent/evidence terminology, dossier payload and runtime-enabled status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_07_E3_PRE.title']).toBe('Ружовае прызнанне');
    expect(beCatalog['vn.scene.VN_SCENE_08_E3_POST.title']).toBe('Гэта не тканіна');
    expect(beCatalog['vn.line.VN0195.text']).toContain('згоду');
    expect(beCatalog['vn.line.VN0201.text']).toContain('Ружовыя тапачкі');
    expect(beCatalog['vn.line.VN0221.text']).toContain('Норыхіра');
    expect(beCatalog['vn.line.VN0239.text']).toContain('злодзей');
    expect(beCatalog['vn.line.VN0242.text']).toBe('{ADD CUE_004_SILVER_THREAD; SET SUS_NORIHIRO=cleared}');
    expect(beCatalog['vn.line.VN0246.text']).toBe('Гэта не тканіна.');
    expect(beCatalog['vn.line.VN0249.text']).toBe('«Першая нітка знойдзена»');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3D_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'production-complete',
      runtimeSelectable: true,
    });
    expect(supportedLocales).toEqual(['ru', 'be', 'en']);
    expect('be' in appCatalogs).toBe(true);
  });
});
