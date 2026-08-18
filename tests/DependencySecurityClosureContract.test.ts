import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');
const packageMetadata = JSON.parse(read('package.json')) as {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
};
const lock = JSON.parse(read('package-lock.json')) as {
  packages: Record<string, { version?: string; devDependencies?: Record<string, string> }>;
};
const feature = read('docs/features/ANM023G8D_DEPENDENCY_SECURITY_CLOSURE_RU.md');

describe('ANM-023G8D dependency security closure contract', () => {
  it('pins the security-fixed Vite/Vitest toolchain in both package metadata and the lockfile', () => {
    expect(packageMetadata.devDependencies.vite).toBe('6.4.3');
    expect(packageMetadata.devDependencies.vitest).toBe('3.2.7');
    expect(lock.packages[''].devDependencies?.vite).toBe('6.4.3');
    expect(lock.packages[''].devDependencies?.vitest).toBe('3.2.7');
    expect(lock.packages['node_modules/vite'].version).toBe('6.4.3');
    expect(lock.packages['node_modules/vitest'].version).toBe('3.2.7');
    expect(lock.packages['node_modules/esbuild'].version).toMatch(/^0\.25\./);
    expect(lock.packages['node_modules/esbuild'].version).not.toBe('0.21.5');
  });

  it('makes high/critical npm advisories block the authoritative check without rewriting its durable pipeline', () => {
    expect(packageMetadata.scripts['security:audit']).toBe('npm audit --audit-level=high');
    expect(packageMetadata.scripts.precheck).toBe('npm run security:audit');
    expect(packageMetadata.scripts.check).toBe('npm run lint && npm run test && npm run build');
  });

  it('records the audited scope and keeps runtime/gameplay out of the dependency-security slice', () => {
    expect(feature).toContain('5 vulnerable packages');
    expect(feature).toContain('0 vulnerabilities');
    expect(feature).toContain('GHSA-fx2h-pf6j-xcff');
    expect(feature).toContain('GHSA-5xrq-8626-4rwp');
    expect(feature).toContain('GHSA-p63j-vcc4-9vmv');
    expect(feature).toContain('Production runtime не меняется');
    expect(feature).toContain('G8C2');
  });
});
