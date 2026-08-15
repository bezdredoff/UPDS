import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3L_KEY_COUNT = 131;
const SLOT11_SCENES = new Set([
  'VN_SCENE_23_E11_PRE',
  'VN_SCENE_24_E11_POST',
]);
const SLOT11_CHOICE = 'photo-permission';

const isB3LKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT11_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 528 && Number(line[1]) <= 567;
  return key.startsWith(`vn.storyChoice.${SLOT11_CHOICE}.`);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3LKey(key)));

describe('ANM-029B3L Belarusian VN story slot 11', () => {
  it('covers canonical runtime slot 11 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3L_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3L_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3L_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0528–VN0567, photo-permission and the VN0568 next-slot boundary', () => {
    const scene23 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_23_E11_PRE');
    const scene24 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_24_E11_POST');
    const scene25 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_25_E12_PRE');

    expect(scene23?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0528', endLineId: 'VN0547' });
    expect(scene24?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0548', endLineId: 'VN0567' });
    expect(scene25?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0568', endLineId: 'VN0588' });
    expect(beCatalog['vn.line.VN0560.text']).toBe('{CHOICE photo-permission}');
  });

  it('locks reviewed transfer-chain terminology, choice copy, payload and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_23_E11_PRE.title']).toBe('Самы прыкметны таемны груз');
    expect(beCatalog['vn.scene.VN_SCENE_24_E11_POST.title']).toBe('Ланцужок перадачы');
    expect(beCatalog['vn.line.VN0537.text']).toContain('маніфеста');
    expect(beCatalog['vn.line.VN0540.text'].toLowerCase()).toContain('перагрузачнага пункта asterion');
    expect(beCatalog['vn.line.VN0545.text']).toContain('бесперапынны ланцужок');
    expect(beCatalog['vn.line.VN0556.text']).toContain('лабараторыю Asterion');
    expect(beCatalog['vn.storyChoice.photo-permission.A.effect']).toContain('Давер крыніц +1');
    expect(beCatalog['vn.storyChoice.photo-permission.B.effect']).toContain('Прыватнасць +1');
    expect(beCatalog['vn.storyChoice.photo-permission.C.effect']).toContain('Доказы +1');
    expect(beCatalog['vn.line.VN0557.text']).toBe('{ADD CUE_012}');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3L_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
