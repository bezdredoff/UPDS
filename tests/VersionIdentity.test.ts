import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const packageMetadata = JSON.parse(read('package.json')) as { name: string; version: string };

describe('product version and build identity', () => {
  it('uses package metadata as the single product-version source without coupling it to ANM feature labels', () => {
    expect(packageMetadata.name).toBe('class-u-detectives');
    expect(APP_VERSION).toBe(packageMetadata.version);
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
    expect(APP_VERSION.toLowerCase()).not.toContain('anm');
    expect(BUILD_LABEL).toMatch(/^ANM-/);
    expect(BUILD_LABEL).not.toContain(APP_VERSION);
  });

  it('keeps product version, feature baseline and unique build visibly distinct', () => {
    const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');
    const menu = read('src/features/menu/MainMenuController.ts');
    expect(diagnostics).toContain('<small>VERSION</small><b>${escapeHtml(APP_VERSION)}</b><span>${escapeHtml(BUILD_LABEL)}</span>');
    expect(diagnostics).toContain('<small>BUILD</small><b>${escapeHtml(BUILD_ID)}</b><span>${escapeHtml(BUILD_TIMESTAMP)}</span>');
    expect(menu).toContain("<footer>${BUILD_LABEL}<br><span>v${APP_VERSION} · ${t('menu.scriptLines', { count: parsedLineCount })}</span></footer>");
  });
});
