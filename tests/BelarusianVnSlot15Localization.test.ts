import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3P_KEY_COUNT = 124;
const SLOT15_SCENES = new Set(['VN_SCENE_31_E15_PRE', 'VN_SCENE_32_E15_POST']);

const isB3PKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT15_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  return Boolean(line && Number(line[1]) >= 687 && Number(line[1]) <= 726);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3PKey(key)));

describe('ANM-029B3P Belarusian VN story slot 15', () => {
  it('covers canonical runtime slot 15 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);
    expect(Object.keys(source)).toHaveLength(B3P_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3P_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3P_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0687–VN0726, M3_15 and the VN0727 next-slot boundary', () => {
    const scene31 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_31_E15_PRE');
    const scene32 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_32_E15_POST');
    const scene33 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_33_E16_PRE');
    expect(scene31?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0687', endLineId: 'VN0707' });
    expect(scene31?.transition).toEqual({ kind: 'match3', levelId: 'M3_15_ABANDONED_LAUNDRY_ROUTE', onWinSceneId: 'VN_SCENE_32_E15_POST' });
    expect(scene32?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0708', endLineId: 'VN0726' });
    expect(scene33?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0727', endLineId: 'VN0746' });
  });

  it('locks reviewed abandoned-laundry terminology, payloads, production labels and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_31_E15_PRE.title']).toBe('Кот з рэчавым доказам');
    expect(beCatalog['vn.scene.VN_SCENE_32_E15_POST.title']).toBe('Маршрут згоды');
    expect(beCatalog['vn.line.VN0697.text'].toLocaleLowerCase('be')).toContain('серабрыстай ніткі');
    expect(beCatalog['vn.line.VN0705.text'].toLocaleLowerCase('be')).toContain('пагадзіліся ўладальнікі');
    expect(beCatalog['vn.line.VN0708.text']).toContain('Asterion');
    expect(beCatalog['vn.line.VN0714.text']).toContain('Second Skin');
    expect(beCatalog['vn.line.VN0715.text']).toBe('{ADD CUE_016}');
    expect(beCatalog['vn.line.VN0718.text']).toBe('Рына.');
    expect(beCatalog['vn.line.VN0723.text'].toLocaleLowerCase('be')).toContain('ружовыя стужкі');
    expect(beCatalog['vn.line.VN0687.emotion']).toBe('BG_CAMPUS_PATH / CHASE');
    expect(beCatalog['vn.line.VN0707.emotion']).toBe('TRANSITION TO MATCH-3');
    expect(beCatalog['vn.line.VN0726.emotion']).toBe('EPISODE CARD / FRONTIER');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3P_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({ status: 'translation-pending', runtimeSelectable: false });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
