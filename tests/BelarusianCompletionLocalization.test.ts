import { describe, expect, it } from 'vitest';
import { storyGraph } from '../src/data/storyGraph';
import {
  auditMessageCatalog,
  isCatalogStructurallyComplete,
  selectMessageCatalogByPrefixes,
} from '../src/localization/CatalogAudit';
import { resolveLocale, supportedLocales } from '../src/localization/Locale';
import {
  getProductionLocaleProfile,
  runtimeSelectableLocaleProfiles,
  validateLocalizationProductionContract,
} from '../src/localization/LocalizationProduction';
import { appCatalogs } from '../src/localization/catalogs';
import { beCatalog, beCompletedCatalogPrefixes } from '../src/localization/catalogs/be';
import { match3ReactionCatalogs } from '../src/localization/catalogs/match3Reactions';
import { ruCatalog } from '../src/localization/catalogs/ru';

const SOURCE_KEY_COUNT = 3870;
const REACTION_KEY_COUNT = 132;
const SHELL_KEY_COUNT = 61;
const sourceCatalog: Readonly<Record<string, string>> = ruCatalog;
const targetCatalog: Readonly<Record<string, string>> = beCatalog;

const directiveKeys = Object.keys(sourceCatalog).filter((key) =>
  key.startsWith('vn.line.') && /^\{(?:ADD|CHOICE|SET|JUMP|BRANCH)/u.test(sourceCatalog[key]),
);

const finalProductionLabelKeys = Object.keys(sourceCatalog).filter((key) => {
  const match = key.match(/^vn\.line\.VN(\d{4})\.emotion$/u);
  if (!match || Number(match[1]) < 727) return false;
  return /^[\x00-\x7F]+$/u.test(sourceCatalog[key]);
});

describe('ANM-029B4 Belarusian production completion', () => {
  it('closes the complete stable source catalog with zero missing, extra, empty or placeholder drift', () => {
    const audit = auditMessageCatalog(ruCatalog, beCatalog);
    expect(audit.sourceKeyCount).toBe(SOURCE_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(SOURCE_KEY_COUNT);
    expect(audit.missingKeys).toEqual([]);
    expect(audit.extraKeys).toEqual([]);
    expect(audit.emptyKeys).toEqual([]);
    expect(audit.placeholderMismatches).toEqual([]);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
  });

  it('keeps the reviewed player shell structurally complete and terminology-stable', () => {
    const sourceShell = selectMessageCatalogByPrefixes(ruCatalog, beCompletedCatalogPrefixes);
    const targetShell = selectMessageCatalogByPrefixes(beCatalog, beCompletedCatalogPrefixes);
    const audit = auditMessageCatalog(sourceShell, targetShell);

    expect(audit.sourceKeyCount).toBe(SHELL_KEY_COUNT);
    expect(audit.targetKeyCount).toBe(SHELL_KEY_COUNT);
    expect(isCatalogStructurallyComplete(audit)).toBe(true);
    expect(beCatalog['menu.title']).toBe('Дэтэктывы');
    expect(beCatalog['menu.titleAccent']).toBe('класа U');
    expect(beCatalog['localization.language.label']).toBe('Мова');
    expect(beCatalog['common.settings']).toBe('Налады');
    expect(beCatalog['settings.installHeading']).toBe('Усталяванне і афлайн');
  });

  it('keeps all Match-3 reaction keys complete and exposes a no-fallback runtime catalog', () => {
    const reactionAudit = auditMessageCatalog(match3ReactionCatalogs.ru, match3ReactionCatalogs.be);
    expect(reactionAudit.sourceKeyCount).toBe(REACTION_KEY_COUNT);
    expect(reactionAudit.targetKeyCount).toBe(REACTION_KEY_COUNT);
    expect(isCatalogStructurallyComplete(reactionAudit)).toBe(true);
    expect(Object.keys(appCatalogs.be).sort()).toEqual(Object.keys(appCatalogs.ru).sort());
    expect(Object.keys(appCatalogs.be).sort()).toEqual(Object.keys(appCatalogs.en).sort());
  });

  it('ships Belarusian as a production-complete runtime locale', () => {
    expect(getProductionLocaleProfile('be')).toMatchObject({
      status: 'production-complete',
      runtimeSelectable: true,
      cjk: false,
    });
    expect(supportedLocales).toEqual(['ru', 'be', 'en']);
    expect(runtimeSelectableLocaleProfiles.map((profile) => profile.locale)).toEqual(['ru', 'be', 'en']);
    expect(resolveLocale('be')).toBe('be');
    expect(resolveLocale('be-BY')).toBe('be');
    expect(validateLocalizationProductionContract()).toEqual([]);
  });

  it('preserves every screenplay directive exactly and locks the final canonical routes', () => {
    expect(directiveKeys.length).toBeGreaterThan(0);
    for (const key of directiveKeys) expect(targetCatalog[key], key).toBe(sourceCatalog[key]);
    expect(finalProductionLabelKeys.length).toBeGreaterThan(0);
    for (const key of finalProductionLabelKeys) expect(targetCatalog[key], key).toBe(sourceCatalog[key]);

    const scene33 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_33_E16_PRE');
    const scene34 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_34_E16_POST');
    const scene35 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_35_E17_PRE');
    const scene36 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_36_E17_POST');
    const scene37 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_37_E18_PRE');
    const scene38 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_38_E18_POST');
    const scene39 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_39_E19_PRE');
    const scene40 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_40_E19_POST');
    const scene41 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_41_E20_PRE');
    const scene42 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_42_E20_POST');
    const scene43 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_43_E21_PRE');
    const scene44 = storyGraph.scenes.find((scene) => scene.id === 'VN_SCENE_44_E21_POST');

    expect(scene33?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0727', endLineId: 'VN0746' });
    expect(scene33?.transition).toEqual({ kind: 'match3', levelId: 'M3_16_PINK_RIBBON_SCANNER', onWinSceneId: 'VN_SCENE_34_E16_POST' });
    expect(scene34?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0747', endLineId: 'VN0765' });
    expect(scene35?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0766', endLineId: 'VN0785' });
    expect(scene35?.transition).toEqual({ kind: 'match3', levelId: 'M3_17_RINA_ARCHIVE_CATALOG', onWinSceneId: 'VN_SCENE_36_E17_POST' });
    expect(scene36?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0786', endLineId: 'VN0805' });
    expect(scene37?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0806', endLineId: 'VN0826' });
    expect(scene37?.transition).toEqual({ kind: 'match3', levelId: 'M3_18_FULL_TIMELINE_PROOF', onWinSceneId: 'VN_SCENE_38_E18_POST' });
    expect(scene38?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0827', endLineId: 'VN0845' });
    expect(scene38?.transition).toEqual({ kind: 'branch', gateId: 'final-strategy', routes: { A: 'VN_SCENE_39_E19_PRE', B: 'VN_SCENE_41_E20_PRE', C: 'VN_SCENE_43_E21_PRE' } });
    expect(scene39?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0846', endLineId: 'VN0865' });
    expect(scene39?.transition).toEqual({ kind: 'match3', levelId: 'M3_19_PRIVATE_RETURN', onWinSceneId: 'VN_SCENE_40_E19_POST' });
    expect(scene40?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0866', endLineId: 'VN0884' });
    expect(scene40?.transition).toEqual({ kind: 'ending', endingId: 'ENDING_B_CASE_CLOSED' });
    expect(scene41?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0885', endLineId: 'VN0904' });
    expect(scene41?.transition).toEqual({ kind: 'match3', levelId: 'M3_20_SERVER_CONSENT_LOGS', onWinSceneId: 'VN_SCENE_42_E20_POST' });
    expect(scene42?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0905', endLineId: 'VN0924' });
    expect(scene42?.transition).toEqual({ kind: 'ending', endingId: 'ENDING_A_FULL_TRUTH', fallbackEndingId: 'ENDING_B_CASE_CLOSED', successRequirement: { evidence: 7, teamTrust: 2, sourceTrust: 2 } });
    expect(scene43?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0925', endLineId: 'VN0944' });
    expect(scene43?.transition).toEqual({ kind: 'match3', levelId: 'M3_21_CONVENIENT_CASE', onWinSceneId: 'VN_SCENE_44_E21_POST' });
    expect(scene44?.source).toEqual({ format: 'screenplay-range-v1', startLineId: 'VN0945', endLineId: 'VN0964' });
    expect(scene44?.transition).toEqual({ kind: 'ending', endingId: 'ENDING_C_PERFECT_SUSPECT' });
    expect(beCatalog['vn.line.VN0754.text']).toBe('{ADD CUE_017}');
    expect(beCatalog['vn.line.VN0756.text']).toBe('{CHOICE trust-vincent}');
    expect(beCatalog['vn.line.VN0794.text']).toBe('{ADD CUE_018}');
    expect(beCatalog['vn.line.VN0834.text']).toBe('{ADD CUE_019}');
    expect(beCatalog['vn.line.VN0841.text']).toBe('{CHOICE final-strategy}');
    expect(beCatalog['vn.scene.VN_SCENE_42_E20_POST.title']).toBe('Уся праўда');
    expect(beCatalog['vn.scene.VN_SCENE_44_E21_POST.title']).toBe('Вядомасць замест праўды');
  });

  it('does not leave Russian-only Cyrillic letters in the Belarusian catalog', () => {
    for (const [key, value] of Object.entries(beCatalog)) {
      expect(value, key).not.toMatch(/[ИиЩщЪъ]/u);
    }
  });
});
