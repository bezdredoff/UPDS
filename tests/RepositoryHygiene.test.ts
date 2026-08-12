import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';
import { ANM009_SAVE_KEY } from '../src/engine/CampaignStore';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
const tsconfig = JSON.parse(readFileSync(new URL('../tsconfig.json', import.meta.url), 'utf8')) as { compilerOptions: Record<string, unknown> };
const repositoryRoot = process.cwd();
const activeRoots = ['.github', 'tests', 'src', 'docs', 'scripts'];

const collectFiles = (relativeRoot: string, predicate: (path: string) => boolean): string[] => {
  const absolute = resolve(repositoryRoot, relativeRoot);
  if (!existsSync(absolute)) return [];

  return readdirSync(absolute, { withFileTypes: true }).flatMap((entry) => {
    const child = join(relativeRoot, entry.name);
    if (entry.isDirectory()) return collectFiles(child, predicate);
    return predicate(child) ? [child.replace(/\\/g, '/')] : [];
  });
};

const collectBakFiles = (relativeRoot: string): string[] => collectFiles(relativeRoot, (path) => path.endsWith('.bak'));
const featureTsFiles = collectFiles('src/features', (path) => path.endsWith('.ts'));
const srcTsFiles = collectFiles('src', (path) => path.endsWith('.ts'));
const sourceFor = (path: string): string => readFileSync(resolve(repositoryRoot, path), 'utf8');
const featureControllerNames = featureTsFiles.flatMap((file) =>
  [...sourceFor(file).matchAll(/export\s+class\s+([A-Z][A-Za-z0-9]*Controller)\b/g)].map((match) => match[1]),
);

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

const animeAppSource = sourceFor('src/ui/AnimeDetectiveApp.ts');

describe('UI architecture boundaries', () => {
  it('keeps AnimeDetectiveApp as a small composition root', () => {
    expect(animeAppSource.split('\n').length).toBeLessThanOrEqual(200);
    expect(animeAppSource).toContain('new VnController');
    expect(animeAppSource).toContain('new Match3Controller');
    expect(animeAppSource).toContain('const navigation: AppNavigation');
  });

  it('prevents feature modules from importing sibling feature modules', () => {
    for (const file of featureTsFiles) {
      const sourceFeature = file.split('/')[2];
      const absoluteSource = resolve(repositoryRoot, file);
      const imports = [...sourceFor(file).matchAll(/from\s+['"]([^'"]+)['"]/g)].map((match) => match[1]);

      for (const specifier of imports) {
        if (!specifier.startsWith('.')) continue;
        const target = relative(repositoryRoot, resolve(dirname(absoluteSource), specifier)).replace(/\\/g, '/');
        if (!target.startsWith('src/features/')) continue;
        const targetFeature = target.split('/')[2];
        expect(targetFeature, `${file} imports sibling feature via ${specifier}`).toBe(sourceFeature);
      }
    }
  });

  it('keeps feature-controller construction in the composition root only', () => {
    expect(featureControllerNames.length).toBeGreaterThan(0);
    const featureControllerConstruction = new RegExp(`new\\s+(?:${featureControllerNames.join('|')})\\s*\\(`);
    const constructionSites = srcTsFiles
      .filter((file) => featureControllerConstruction.test(sourceFor(file)))
      .sort();
    expect(constructionSites).toEqual(['src/ui/AnimeDetectiveApp.ts']);
  });

  it('keeps campaign persistence centralized behind AppSession rather than recreated by features', () => {
    for (const file of featureTsFiles) {
      expect(sourceFor(file), `${file} must not construct CampaignStore`).not.toContain('new CampaignStore');
    }
    expect(animeAppSource).toContain('new AppSession');
  });
});
