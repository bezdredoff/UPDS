import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const selectors = read('e2e/selectors.ts');
const helper = read('e2e/helpers/flow.ts');
const spec = read('e2e/tests/persistence-localization-flow.pw.ts');

const expectNoPersistenceShortcut = (source: string): void => {
  expect(source).not.toContain('localStorage.setItem');
  expect(source).not.toContain('sessionStorage.setItem');
  expect(source).not.toContain('__UPDS_TEST__');
};

describe('ANM-023G6 browser journey integrity contract', () => {
  it('keeps save/resume proof on reload + visible Continue without browser storage injection', () => {
    expect(spec).toContain('persistAtVn0002AndReload(page)');
    expect(helper).toContain('export async function persistAtVn0002AndReload');
    expect(helper).toContain("advanceToLine(page, 'VN0002')");
    expect(helper).toContain('page.reload()');
    expect(helper).toContain('qaSelectors.continueGame');
    expect(helper).toContain("currentVnLineId(page)).toBe('VN0002')");
    expectNoPersistenceShortcut(helper);
    expectNoPersistenceShortcut(spec);
  });

  it('keeps locale persistence proof on visible Settings controls and a real reload', () => {
    expect(selectors).toContain("settingsButton: '#settings'");
    expect(selectors).toContain("languageSelect: '[data-language-select]'");
    expect(spec).toContain("switchLocaleAndReload(page, 'en')");
    expect(helper).toContain('export async function switchLocaleAndReload');
    expect(helper).toContain('qaSelectors.languageSelect).selectOption(locale)');
    expect(helper).toContain("page.locator('html').getAttribute('lang')");
    expect(helper).toContain('page.reload()');
    expect(helper).toContain('qaSelectors.languageSelect)).toHaveValue(locale)');
    expectNoPersistenceShortcut(helper);
  });

  it('keeps the first Story → Match-3 resume boundary browser-driven and controller-free', () => {
    expect(spec).toContain('startFirstStoryMatchAndVerifyResumeBoundary(page)');
    expect(helper).toContain('export async function startFirstStoryMatchAndVerifyResumeBoundary');
    expect(helper).toContain("advanceToLine(page, 'VN0040', 240)");
    expect(helper).toContain('data-choice="B"');
    expect(helper).toContain("advanceToLine(page, 'VN0057', 180)");
    expect(helper).toContain("toHaveText('M3_00_LOCKER_TUTORIAL')");
    expect(helper).toContain("toHaveText('M3_00')");
    expect(helper).toContain('page.reload()');
    expect(helper).toContain('qaSelectors.continueGame');
    expect(helper).not.toContain('Match3Controller');
    expect(helper).not.toContain('completeLevel');
    expectNoPersistenceShortcut(helper);
  });
});
