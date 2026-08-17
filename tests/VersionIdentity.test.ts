import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const packageMetadata = JSON.parse(read('package.json')) as { name: string; version: string };

describe('product version and build identity', () => {
  it('keeps player-facing product version independent from npm package and ANM feature lifecycles', () => {
    const appVersionSource = read('src/appVersion.ts');
    expect(packageMetadata.name).toBe('class-u-detectives');
    expect(packageMetadata.version).toMatch(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/);
    expect(APP_VERSION.toLowerCase()).not.toContain('anm');
    expect(appVersionSource).not.toContain("../package.json");
    expect(BUILD_LABEL).toMatch(/^ANM-/);
    expect(BUILD_LABEL).not.toContain(APP_VERSION);
  });

  it('keeps product version, feature baseline, concrete build and save schema visibly distinct', () => {
    const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');
    const menu = read('src/features/menu/MainMenuController.ts');
    expect(diagnostics).toContain('<small>VERSION</small><b>${escapeHtml(APP_VERSION)}</b><span>${escapeHtml(BUILD_LABEL)}</span>');
    expect(diagnostics).toContain('<small>BUILD</small><b>${escapeHtml(BUILD_ID)}</b><span>${escapeHtml(BUILD_TIMESTAMP)}</span>');
    expect(diagnostics).toContain('<small>SAVE SCHEMA</small><b>v${SAVE_SCHEMA_VERSION}</b>');
    expect(diagnostics).not.toContain('<small>SAVE SCHEMA</small><b>v1</b>');
    expect(menu).toContain('<footer>${BUILD_LABEL}<br><span>v${APP_VERSION}</span></footer>');
    expect(menu).not.toContain('menu.scriptLines');
    expect(menu).not.toContain('parsedLineCount');
  });
});
