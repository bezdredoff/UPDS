import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';
import { ANM009_SAVE_KEY } from '../src/engine/CampaignStore';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
const tsconfig = JSON.parse(readFileSync(new URL('../tsconfig.json', import.meta.url), 'utf8')) as { compilerOptions: Record<string, unknown> };
const repositoryRoot = process.cwd();
const activeRoots = ['.github', 'tests', 'src', 'docs', 'scripts'];

const collectBakFiles = (relative: string): string[] => {
  const absolute = resolve(repositoryRoot, relative);
  if (!existsSync(absolute)) return [];

  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = join(relative, entry.name);
    if (entry.isDirectory()) return collectBakFiles(child);
    return child.endsWith('.bak') ? [child] : [];
  });
};

describe('repository maintenance contract', () => {
  it('keeps runtime version metadata dynamic and the stable campaign save key unchanged', () => {
    expect(APP_VERSION).toBe(packageJson.version);
    expect(BUILD_LABEL).toMatch(/^ANM-/);
    expect(ANM009_SAVE_KEY).toBe('seiran-detectives-anm009-v1');
  });

  it('keeps the repository root free from historical feature reports and release notes', () => {
    const rootFiles = readdirSync(new URL('..', import.meta.url), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
    expect(rootFiles.some((name) => /^README_ANM/i.test(name))).toBe(false);
    expect(rootFiles.some((name) => /VALIDATION_REPORT|MANUAL_QA/i.test(name))).toBe(false);
    expect(rootFiles).not.toContain('CHECK_COMMANDS.txt');
  });

  it('keeps backup copies out of the active production tree', () => {
    expect(activeRoots.flatMap(collectBakFiles).sort()).toEqual([]);
  });

  it('guards the current precomposed expression-frame runtime contract', () => {
    const template = readFileSync(resolve(repositoryRoot, '.github/PULL_REQUEST_TEMPLATE.md'), 'utf8');
    expect(template).toContain('precomposed 1024×1536 expression frames');
    expect(template).toContain('retired transparent face-overlay composition is not reintroduced');
    expect(template).not.toContain('`base-neutral + face overlay` rig structure');
  });

  it('enforces unused-code checks in strict TypeScript builds', () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noUnusedLocals).toBe(true);
    expect(tsconfig.compilerOptions.noUnusedParameters).toBe(true);
  });
});

const animeAppSource = readFileSync(new URL('../src/ui/AnimeDetectiveApp.ts', import.meta.url), 'utf8');
const vnControllerSource = readFileSync(new URL('../src/features/vn/VnController.ts', import.meta.url), 'utf8');
const matchControllerSource = readFileSync(new URL('../src/features/match3/Match3Controller.ts', import.meta.url), 'utf8');

describe('UI architecture boundaries', () => {
  it('keeps AnimeDetectiveApp as a small composition root', () => {
    expect(animeAppSource.split('\n').length).toBeLessThanOrEqual(200);
    expect(animeAppSource).toContain('new VnController');
    expect(animeAppSource).toContain('new Match3Controller');
    expect(animeAppSource).toContain('const navigation: AppNavigation');
  });

  it('keeps VN and Match-3 feature controllers independent from each other', () => {
    expect(vnControllerSource).not.toContain("features/match3");
    expect(vnControllerSource).not.toContain('Match3Controller');
    expect(matchControllerSource).not.toContain("features/vn");
    expect(matchControllerSource).not.toContain('VnController');
  });

  it('keeps campaign persistence centralized behind AppSession rather than recreated by feature controllers', () => {
    expect(vnControllerSource).not.toContain('new CampaignStore');
    expect(matchControllerSource).not.toContain('new CampaignStore');
    expect(animeAppSource).toContain('new AppSession');
  });
});
