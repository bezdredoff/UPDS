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

  it('documents and enforces a version bump for each production-facing PR', () => {
    const policy = read('docs/process/VERSIONING_POLICY_RU.md');
    const developmentGuide = read('docs/process/AI_DEVELOPMENT_RU.md');
    const pullRequestTemplate = read('.github/PULL_REQUEST_TEMPLATE.md');
    const workflow = read('.github/workflows/ci.yml');
    const policyScript = read('scripts/check-app-version-policy.mjs');
    const packageScripts = JSON.parse(read('package.json')) as { scripts: Record<string, string> };

    expect(policy).toContain('Каждый PR, меняющий player-facing production build, обязан повышать `APP_VERSION`');
    expect(policy).toContain('Обычный fix');
    expect(developmentGuide).toContain('VERSIONING_POLICY_RU.md');
    expect(pullRequestTemplate).toContain('## Versioning');
    expect(packageScripts.scripts['version:check']).toContain('check-app-version-policy.mjs');
    expect(workflow).toContain('Enforce player version policy');
    expect(workflow).toContain('npm run version:check');
    expect(policyScript).toContain('UPDS_BASE_REF');
    expect(policyScript).toContain('Production-facing PR must raise APP_VERSION');
  });

  it('keeps product version player-facing while feature/build identity stays in diagnostics', () => {
    const diagnostics = read('src/features/diagnostics/DiagnosticsController.ts');
    const menu = read('src/features/menu/MainMenuController.ts');
    expect(diagnostics).toContain('<small>VERSION</small><b>${escapeHtml(APP_VERSION)}</b><span>${escapeHtml(BUILD_LABEL)}</span>');
    expect(diagnostics).toContain('<small>BUILD</small><b>${escapeHtml(BUILD_ID)}</b><span>${escapeHtml(BUILD_TIMESTAMP)}</span>');
    expect(diagnostics).toContain('<small>SAVE SCHEMA</small><b>v${SAVE_SCHEMA_VERSION}</b>');
    expect(diagnostics).not.toContain('<small>SAVE SCHEMA</small><b>v1</b>');
    expect(menu).toContain('<footer><span class="menu-build-spacer" aria-hidden="true">&nbsp;</span><br><span>v${APP_VERSION}</span></footer>');
    expect(menu).not.toContain('BUILD_LABEL');
    expect(menu).not.toContain('menu.scriptLines');
    expect(menu).not.toContain('parsedLineCount');
  });
});
