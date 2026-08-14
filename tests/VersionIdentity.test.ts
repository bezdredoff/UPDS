import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_VERSION } from '../src/appVersion';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('product version and build identity', () => {
  it('keeps the product dev line independent from ANM feature labels', () => {
    expect(APP_VERSION).toBe('0.25.1-dev');
    expect(APP_VERSION).not.toContain('anm');
    expect(APP_VERSION).not.toBe(JSON.parse(read('package.json')).version);
  });

  it('keeps product version, feature baseline and unique build visibly distinct', () => {
    const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');
    const menu = read('src/features/menu/MainMenuController.ts');
    expect(diagnostics).toContain('<small>VERSION</small><b>${escapeHtml(APP_VERSION)}</b><span>${escapeHtml(BUILD_LABEL)}</span>');
    expect(diagnostics).toContain('<small>BUILD</small><b>${escapeHtml(BUILD_ID)}</b><span>${escapeHtml(BUILD_TIMESTAMP)}</span>');
    expect(menu).toContain("<footer>${BUILD_LABEL}<br><span>v${APP_VERSION} · ${t('menu.scriptLines', { count: parsedLineCount })}</span></footer>");
  });
});
