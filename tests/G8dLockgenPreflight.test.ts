import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const expectedLockSha256 = '2f1d4bebc563f179900a94b7781209877e5d3004473ffa5ee64a8eecd5b64e33';

const finalSecurityContract = String.raw`import { readFileSync } from 'node:fs';
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
`;

const removeIfPresent = (path: string): void => {
  if (existsSync(path)) unlinkSync(path);
};

describe('ANM-023G8D temporary exact-candidate preflight', () => {
  it(
    'runs the final audit-clean package, lock, tests and Vite 6 build through npm run check',
    () => {
      const workdir = mkdtempSync(join(tmpdir(), 'upds-g8d-exact-'));
      const archive = join(workdir, 'repo.tar');
      const candidate = join(workdir, 'candidate');

      try {
        execFileSync('mkdir', ['-p', candidate]);
        execFileSync('git', ['archive', '--format=tar', '-o', archive, 'HEAD']);
        execFileSync('tar', ['-xf', archive, '-C', candidate]);

        removeIfPresent(join(candidate, 'tests/G8dLockgenPreflight.test.ts'));
        removeIfPresent(join(candidate, 'scripts/g8d-lockgen.mjs'));
        removeIfPresent(join(candidate, 'e2e/tests/g8d-lockgen.pw.ts'));
        writeFileSync(join(candidate, 'tests/DependencySecurityClosureContract.test.ts'), finalSecurityContract);

        const rootPackage = JSON.parse(readFileSync('package.json', 'utf8')) as {
          scripts: Record<string, string>;
          devDependencies: Record<string, string>;
          [key: string]: unknown;
        };
        rootPackage.scripts = {
          ...rootPackage.scripts,
          'security:audit': 'npm audit --audit-level=high',
          precheck: 'npm run security:audit',
        };
        rootPackage.devDependencies = {
          ...rootPackage.devDependencies,
          vite: '6.4.3',
          vitest: '3.2.7',
        };
        writeFileSync(join(candidate, 'package.json'), `${JSON.stringify(rootPackage, null, 2)}\n`);

        const generatorOutput = execFileSync(process.execPath, ['scripts/g8d-lockgen.mjs'], {
          encoding: 'utf8',
          env: { ...process.env, G8D_LOCK_OUTPUT: join(candidate, 'package-lock.json') },
          timeout: 30_000,
        });
        expect(generatorOutput).toContain('"total":0');

        const lockBytes = readFileSync(join(candidate, 'package-lock.json'));
        expect(createHash('sha256').update(lockBytes).digest('hex')).toBe(expectedLockSha256);

        execFileSync('npm', ['ci', '--ignore-scripts'], {
          cwd: candidate,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 60_000,
        });
        const checkOutput = execFileSync('npm', ['run', 'check'], {
          cwd: candidate,
          encoding: 'utf8',
          stdio: ['ignore', 'pipe', 'pipe'],
          timeout: 90_000,
        });
        const plainOutput = checkOutput.replace(/\u001b\[[0-9;]*m/g, '');

        expect(plainOutput).toContain('security:audit');
        expect(plainOutput).toContain('found 0 vulnerabilities');
        expect(plainOutput).toContain('v3.2.7');
        expect(plainOutput).toContain('vite v6.4.3');
        console.log('G8D_EXACT_CANDIDATE_PASS vite=6.4.3 vitest=3.2.7 esbuild=0.25.12 audit=0');
      } finally {
        rmSync(workdir, { recursive: true, force: true });
      }
    },
    120_000,
  );
});
