import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const selectors = read('e2e/selectors.ts');
const helper = read('e2e/helpers/flow.ts');
const spec = read('e2e/tests/persistence-localization-flow.pw.ts');
const campaignStore = read('src/engine/CampaignStore.ts');
const appSession = read('src/app/AppSession.ts');
const menu = read('src/features/menu/MainMenuController.ts');
const runtimeServices = read('src/platform/RuntimeServices.ts');
const localeStore = read('src/localization/LocaleSettingsStore.ts');
const systemControls = read('src/ui/systemControls.ts');
const vnController = read('src/features/vn/VnController.ts');
const storyGraph = read('src/data/storyGraph.ts');
const match3Controller = read('src/features/match3/Match3Controller.ts');

describe('ANM-023G6 persistence, localization and main-flow browser contract', () => {
  it('uses real browser reload + Main Menu Continue instead of direct save mutation', () => {
    expect(helper).toContain('page.reload()');
    expect(helper).toContain('qaSelectors.continueGame');
    expect(helper).toContain("advanceToLine(page, 'VN0002')");
    expect(helper).not.toContain('localStorage.setItem');
    expect(helper).not.toContain('window.__');
    expect(spec).not.toContain('localStorage.setItem');

    expect(campaignStore).toContain("ANM009_SAVE_KEY = 'seiran-detectives-anm009-v1'");
    expect(campaignStore).toContain('this.storage.setItem(this.key');
    expect(appSession).toContain('this.save = this.services.store.load()');
    expect(menu).toContain('this.session.reload()');
    expect(menu).toContain("this.root.querySelector('#continue')");
    expect(menu).toContain('this.navigation.openScene(this.session.save.scene, this.session.save.line)');
  });

  it('covers runtime locale activation and persisted locale restore through visible settings', () => {
    expect(selectors).toContain("settingsButton: '#settings'");
    expect(selectors).toContain("languageSelect: '[data-language-select]'");
    expect(helper).toContain('export async function switchLocaleAndReload(');
    expect(helper).not.toContain("switchLocaleAndReload(page, 'en')");
    expect(spec).toContain("switchLocaleAndReload(page, 'en')");

    expect(localeStore).toContain("LOCALE_SETTINGS_KEY = 'seiran-detectives-locale-v1'");
    expect(runtimeServices).toContain('localization.subscribe((locale) => localeSettings.save(locale))');
    expect(runtimeServices).toContain('const requestedLocale = localeSettings.load()');
    expect(runtimeServices).toContain('localization.activateLocale(requestedLocale)');
    expect(systemControls).toContain('data-language-select');
    expect(systemControls).toContain('services.localization.activateLocale(locale)');
    expect(systemControls).toContain('document.documentElement.lang = locale');
  });

  it('runs the first story boundary from New Game through VN and CHOICE_00 into M3_00', () => {
    expect(helper).toContain('qaSelectors.newGame');
    expect(helper).toContain("advanceToLine(page, 'VN0040', 240)");
    expect(helper).toContain('data-choice="B"');
    expect(helper).toContain("currentVnLineId(page)).toBe('VN0041B')");
    expect(helper).toContain("advanceToLine(page, 'VN0057', 180)");
    expect(helper).toContain("toHaveText('M3_00_LOCKER_TUTORIAL')");
    expect(helper).toContain('qaSelectors.matchStart');
    expect(helper).toContain('await expect(start).toBeVisible()');
    expect(helper).toContain('await expect(start).toBeEnabled()');
    expect(helper).toContain('start.click({ force: true })');
    expect(spec).toContain('test.slow()');
    expect(helper).toContain("toHaveText('M3_00')");
    expect(helper).toContain("toHaveText('24')");

    expect(storyGraph).toContain("id:'VN_SCENE_01_E0_PRE'");
    expect(storyGraph).toContain("transition:{kind:'match3',levelId:'M3_00_LOCKER_TUTORIAL',onWinSceneId:'VN_SCENE_02_E0_POST'}");
    expect(vnController).toContain('this.navigation.showMatchIntro(route.levelIndex)');
  });

  it('locks the existing win route to the post-Match-3 VN scene without browser-only completion hooks', () => {
    expect(storyGraph).toContain("id:'VN_SCENE_02_E0_POST'");
    expect(storyGraph).toContain("startLineId:'VN0058'");
    expect(match3Controller).toContain('const postScene = storyWinSceneIndexForLevelId(level.id)');
    expect(match3Controller).toContain('this.session.save.scene = postScene');
    expect(match3Controller).toContain('this.session.save.line = 0');
    expect(match3Controller).toContain('this.session.persist()');
    expect(helper).not.toContain('completeLevel');
    expect(helper).not.toContain('Match3Controller');
  });
});
