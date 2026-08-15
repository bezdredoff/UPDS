import { describe, expect, it } from 'vitest';
import { storyChoiceGates } from '../src/data/storyChoices';
import { storyGraph } from '../src/data/storyGraph';
import { auditMessageCatalog, isCatalogStructurallyComplete } from '../src/localization/CatalogAudit';
import { supportedLocales } from '../src/localization/Locale';
import { getProductionLocaleProfile } from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog } from '../src/localization/catalogs/be';
import { ruCatalog } from '../src/localization/catalogs/ru';

const B3E_KEY_COUNT = 125;
const SLOT4_SCENES = new Set([
  'VN_SCENE_09_E4_PRE',
  'VN_SCENE_10_E4_POST',
]);

const isB3EKey = (key: string): boolean => {
  const scene = key.match(/^vn\.scene\.([^.]+)\.(?:title|location)$/u);
  if (scene) return SLOT4_SCENES.has(scene[1]);
  const line = key.match(/^vn\.line\.VN(\d{4})\.(?:speaker|emotion|text)$/u);
  if (line) return Number(line[1]) >= 251 && Number(line[1]) <= 288;
  return key.startsWith('vn.storyChoice.meeting-tone.');
};

const select = (catalog: Readonly<Record<string, string>>): Readonly<Record<string, string>> =>
  Object.fromEntries(Object.entries(catalog).filter(([key]) => isB3EKey(key)));

describe('ANM-029B3E Belarusian VN story slot 4', () => {
  it('covers canonical runtime slot 4 plus its meeting-tone choice exactly', () => {
    const source = select(ruCatalog);
    const target = select(beCatalog);
    const audit = auditMessageCatalog(source, target);

    expect(Object.keys(source)).toHaveLength(B3E_KEY_COUNT);
    expect(audit.sourceKeyCount).toBe(B3E_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(B3E_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('locks the canonical VN0251–VN0288 graph boundary and meeting-tone checkpoint', () => {
    const scene09 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_09_E4_PRE');
    const scene10 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_10_E4_POST');
    const scene11 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_11_E5_PRE');
    const gate = storyChoiceGates.find((candidate) => candidate.id === 'meeting-tone');

    expect(scene09?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0251', endLineId: 'VN0270' });
    expect(scene10?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0271', endLineId: 'VN0288' });
    expect(scene11?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0289', endLineId: 'VN0308' });
    expect(gate).toEqual({ id: 'meeting-tone', checkpointLineId: 'VN0262', options: ['A', 'B', 'C'] });
  });

  it('locks reviewed privacy/evidence terminology, choice copy, payloads and runtime-hidden status', () => {
    expect(beCatalog['vn.scene.VN_SCENE_09_E4_PRE.title']).toBe('Надзвычайная бялізнавая нарада');
    expect(beCatalog['vn.scene.VN_SCENE_10_E4_POST.title']).toBe('Рытм пральні');
    expect(beCatalog['vn.line.VN0252.text']).toContain('без імёнаў');
    expect(beCatalog['vn.line.VN0262.text']).toBe('{CHOICE meeting-tone}');
    expect(beCatalog['vn.line.VN0278.text']).toBe('{ADD CUE_005}');
    expect(beCatalog['vn.storyChoice.meeting-tone.prompt']).toBe('Як Міку правядзе закрытую нараду?');
    expect(beCatalog['vn.storyChoice.meeting-tone.A.effect']).toBe('Давер Оноэ +1');
    expect(beCatalog['vn.storyChoice.meeting-tone.B.effect']).toBe('Давер Аюкі +1');
    expect(beCatalog['vn.storyChoice.meeting-tone.C.effect']).toBe('Давер крыніц +1');
    expect(beCatalog['vn.line.VN0288.text']).toBe('«Эпізод 5 — Заслон для злодзея»');
    expect(Object.keys(select(beCatalog))).toHaveLength(B3E_KEY_COUNT);
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'translation-pending',
      runtimeSelectable: false,
    });
    expect(supportedLocales).toEqual(['ru', 'en']);
    expect('be' in appCatalogs).toBe(false);
  });
});
