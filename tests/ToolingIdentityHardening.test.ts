import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');
const packageMetadata = JSON.parse(read('package.json')) as {
  name: string;
  version: string;
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
};
const lock = JSON.parse(read('package-lock.json')) as {
  name: string;
  version: string;
  packages: Record<string, { name?: string; version?: string; devDependencies?: Record<string, string> }>;
};
const biomeConfig = JSON.parse(read('biome.json')) as {
  overrides?: Array<{ includes: string[]; linter: { rules: { correctness: Record<string, string> } } }>;
  linter: {
    rules: {
      preset: string;
      correctness: Record<string, string>;
      suspicious: Record<string, string>;
      complexity: Record<string, string>;
      performance: Record<string, string>;
    };
  };
};

describe('ANM-023E test, tooling and identity hardening', () => {
  it('keeps product package identity and runtime APP_VERSION on one source of truth', () => {
    expect(packageMetadata.name).toBe('class-u-detectives');
    expect(APP_VERSION).toBe(packageMetadata.version);
    expect(lock.name).toBe(packageMetadata.name);
    expect(lock.version).toBe(packageMetadata.version);
    expect(lock.packages[''].name).toBe(packageMetadata.name);
    expect(lock.packages[''].version).toBe(packageMetadata.version);
    expect(BUILD_LABEL).toMatch(/^ANM-/);
    expect(BUILD_LABEL).not.toContain(APP_VERSION);
  });

  it('pins Biome and keeps it in the authoritative check path without mass style migration', () => {
    const biomeVersion = packageMetadata.devDependencies['@biomejs/biome'];
    expect(biomeVersion).toMatch(/^\d+\.\d+\.\d+$/);
    expect(lock.packages[''].devDependencies?.['@biomejs/biome']).toBe(biomeVersion);
    expect(lock.packages['node_modules/@biomejs/biome'].version).toBe(biomeVersion);
    expect(packageMetadata.scripts.lint).toBe('biome lint src tests vite.config.ts');
    expect(packageMetadata.scripts['lint:fix']).toBe('biome lint --write src tests vite.config.ts');
    expect(packageMetadata.scripts['quality:fix']).toBe(
      'biome check --write --formatter-enabled=false src tests vite.config.ts',
    );
    expect(packageMetadata.scripts.check).toBe('npm run lint && npm run test && npm run build');
    expect(biomeConfig.linter.rules.preset).toBe('none');
    expect(biomeConfig.linter.rules.correctness.noUnusedImports).toBe('error');
    expect(biomeConfig.linter.rules.correctness.noUnusedVariables).toBe('error');
    expect(biomeConfig.linter.rules.correctness.noUnusedFunctionParameters).toBe('error');
    expect(biomeConfig.linter.rules.suspicious.noDebugger).toBe('error');
    expect(biomeConfig.linter.rules.suspicious.noDuplicateObjectKeys).toBe('error');
    expect(biomeConfig.linter.rules.suspicious.noFocusedTests).toBe('error');
    expect(biomeConfig.linter.rules.suspicious.noDuplicateTestHooks).toBe('error');
    expect(biomeConfig.linter.rules.suspicious.noFallthroughSwitchClause).toBe('error');
    expect(biomeConfig.linter.rules.suspicious.noExplicitAny).toBe('error');
    expect(biomeConfig.linter.rules.complexity.noUselessCatch).toBe('error');
    expect(biomeConfig.linter.rules.complexity.noUselessConstructor).toBe('error');
    expect(biomeConfig.linter.rules.performance.noAccumulatingSpread).toBe('error');
    expect(biomeConfig.overrides ?? []).toEqual([]);
  });

  it('keeps focused Belarusian audits domain-based instead of lifecycle-batch based', () => {
    expect(packageMetadata.scripts['localization:be:audit']).toBe(
      'vitest run tests/BelarusianCompletionLocalization.test.ts tests/BelarusianMatch3Localization.test.ts tests/BelarusianVnLocalization.test.ts',
    );
    expect(packageMetadata.scripts['localization:audit']).toContain('tests/BelarusianCompletionLocalization.test.ts');
    expect(packageMetadata.scripts['localization:audit']).toContain('tests/BelarusianMatch3Localization.test.ts');
    expect(packageMetadata.scripts['localization:audit']).toContain('tests/BelarusianVnLocalization.test.ts');
    expect(packageMetadata.scripts['localization:audit']).not.toContain('BelarusianVnSlot');
    expect(packageMetadata.scripts['localization:audit']).not.toContain('BelarusianMatch3Levels');
  });

  it('prevents durable documentation tests from freezing transitional workflow states', () => {
    const traceabilityTest = read('tests/DocumentationTraceability.test.ts');
    expect(traceabilityTest).not.toContain('is IN QA');
    expect(traceabilityTest).not.toContain('CURRENT QA');
    expect(traceabilityTest).not.toMatch(/APP_VERSION\)\.toBe\(['"]\d/);
  });
});
