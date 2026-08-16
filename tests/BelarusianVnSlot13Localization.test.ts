import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3N_KEY_COUNT = 121;
const SLOT13_SCENES = new Set(['VN_SCENE_27_E13_PRE', 'VN_SCENE_28_E13_POST']);

const isB3NKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT13_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  return line ? Number(line[1]) >= 608 && Number(line[1]) <= 646 : false;
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3NKey(key)));

describe('ANM-029B3N Belarusian VN story slot 13', () => {
  it('covers canonical runtime slot 13 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);
    expect(Object.keys(source)).toHaveLength(B3N_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3N_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3N_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0608–VN0646, M3_13 and the VN0647 next-slot boundary', () => {
    const scene27 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_27_E13_PRE');
    const scene28 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_28_E13_POST');
    const scene29 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_29_E14_PRE');
    expect(scene27?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0608', endLineId: 'VN0627' });
    expect(scene27?.transition).toEqual({ kind: 'match3', levelId: 'M3_13_KENDO_PILOT_LIST', onWinSceneId: 'VN_SCENE_28_E13_POST' });
    expect(scene28?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0628', endLineId: 'VN0646' });
    expect(scene29?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0647', endLineId: 'VN0666' });
  });

  it('locks reviewed kendo pilot-list terminology, payloads and runtime-enabled status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_27_E13_PRE.title']).toBe('Пад даспехамі');
    expect(beCatalog['vn.scene.VN_SCENE_28_E13_POST.title']).toBe('Закрыты спіс пілота');
    expect(beCatalog['vn.line.VN0615.text']).toContain('Рыны Сіраісі');
    expect(beCatalog['vn.line.VN0620.text'].toLocaleLowerCase('be')).toContain('сэрвісных бірках');
    expect(beCatalog['vn.line.VN0622.text']).toContain('Second Skin');
    expect(beCatalog['vn.line.VN0626.text'].toLocaleLowerCase('be')).toContain('закрыты спіс пілота');
    expect(beCatalog['vn.line.VN0634.text']).toBe('{ADD CUE_014}');
    expect(beCatalog['vn.line.VN0639.text']).toContain('серабрыстае шво');
    expect(beCatalog['vn.line.VN0645.text'].toLocaleLowerCase('be')).toContain('кніга заказаў');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3N_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({ status: 'production-complete', runtimeSelectable: true });
    expect(supportedLocales).toEqual(['ru', 'be', 'en']);
    expect('be' in appCatalogs).toBe(true);
  });
});
