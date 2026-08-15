import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3M_KEY_COUNT = 131;
const SLOT12_SCENES = new Set(['VN_SCENE_25_E12_PRE', 'VN_SCENE_26_E12_POST']);
const SLOT12_CHOICE = 'publish-tag';

const isB3MKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT12_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 568 && Number(line[1]) <= 607;
  return key.startsWith(`vn.storyChoice.${SLOT12_CHOICE}.`);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3MKey(key)));

describe('ANM-029B3M Belarusian VN story slot 12', () => {
  it('covers canonical runtime slot 12 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);
    expect(Object.keys(source)).toHaveLength(B3M_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3M_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3M_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0568–VN0607, publish-tag and the VN0608 next-slot boundary', () => {
    const scene25 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_25_E12_PRE');
    const scene26 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_26_E12_POST');
    const scene27 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_27_E13_PRE');
    expect(scene25?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0568', endLineId: 'VN0588' });
    expect(scene25?.transition).toEqual({ kind: 'match3', levelId: 'M3_12_SECOND_SKIN_SIGNAL', onWinSceneId: 'VN_SCENE_26_E12_POST' });
    expect(scene26?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0589', endLineId: 'VN0607' });
    expect(scene27?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0608', endLineId: 'VN0627' });
    expect(beCatalog['vn.line.VN0601.text']).toBe('{CHOICE publish-tag}');
  });

  it('locks reviewed Second Skin terminology, choice copy, payloads and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_25_E12_PRE.title']).toBe('ПанцуІтэр існуе?!');
    expect(beCatalog['vn.scene.VN_SCENE_26_E12_POST.title']).toBe('Second Skin');
    expect(beCatalog['vn.line.VN0579.text'].toLocaleLowerCase('be')).toContain('сэрвісная бірка');
    expect(beCatalog['vn.line.VN0588.text'].toLocaleLowerCase('be')).toContain('актыўную мікраметку');
    expect(beCatalog['vn.line.VN0594.text'].toLocaleLowerCase('be')).toContain('знешняя экіпіроўка');
    expect(beCatalog['vn.line.VN0596.text']).toContain('`Second Skin`');
    expect(beCatalog['vn.storyChoice.publish-tag.A.effect']).toContain('Аюкі +1');
    expect(beCatalog['vn.storyChoice.publish-tag.B.effect']).toContain('Доказы +1');
    expect(beCatalog['vn.storyChoice.publish-tag.C.effect']).toContain('тэхнічны ID');
    expect(beCatalog['vn.line.VN0597.text']).toBe('{ADD CUE_013}');
    expect(beCatalog['vn.line.VN0601.text']).toBe('{CHOICE publish-tag}');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3M_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({ status: 'translation-pending', runtimeSelectable: false });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
