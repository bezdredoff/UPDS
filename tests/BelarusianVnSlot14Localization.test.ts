import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3O_KEY_COUNT = 131;
const SLOT14_SCENES = new Set(['VN_SCENE_29_E14_PRE', 'VN_SCENE_30_E14_POST']);
const SLOT14_CHOICE = 'family-ledger-permission';

const isB3OKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT14_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 647 && Number(line[1]) <= 686;
  return key.startsWith(`vn.storyChoice.${SLOT14_CHOICE}.`);
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3OKey(key)));

describe('ANM-029B3O Belarusian VN story slot 14', () => {
  it('covers canonical runtime slot 14 exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);
    expect(Object.keys(source)).toHaveLength(B3O_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3O_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3O_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks VN0647–VN0686, M3_14 and the VN0687 next-slot boundary', () => {
    const scene29 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_29_E14_PRE');
    const scene30 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_30_E14_POST');
    const scene31 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_31_E15_PRE');
    expect(scene29?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0647', endLineId: 'VN0666' });
    expect(scene29?.transition).toEqual({ kind: 'match3', levelId: 'M3_14_KUBO_ATELIER_LEDGER', onWinSceneId: 'VN_SCENE_30_E14_POST' });
    expect(scene30?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0667', endLineId: 'VN0686' });
    expect(scene31?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0687', endLineId: 'VN0707' });
  });

  it('locks reviewed atelier-ledger terminology, payloads, privacy choice and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_29_E14_PRE.title']).toBe('Дом, дзе бялізна ні пры чым');
    expect(beCatalog['vn.scene.VN_SCENE_30_E14_POST.title']).toBe('Рына ведала раней');
    expect(beCatalog['vn.line.VN0652.text']).toContain('Рыны Сіраісі');
    expect(beCatalog['vn.line.VN0656.text'].toLocaleLowerCase('be')).toContain('сэрвіснай біркі');
    expect(beCatalog['vn.line.VN0666.text'].toLocaleLowerCase('be')).toContain('кнігай заказаў');
    expect(beCatalog['vn.line.VN0673.text']).toBe('{ADD CUE_015}');
    expect(beCatalog['vn.line.VN0678.text']).toBe('{CHOICE family-ledger-permission}');
    expect(beCatalog['vn.storyChoice.family-ledger-permission.C.title']).toContain('закрыты дадатак');
    expect(beCatalog['vn.line.VN0683.text']).toContain('Рэй');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3O_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({ status: 'translation-pending', runtimeSelectable: false });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
