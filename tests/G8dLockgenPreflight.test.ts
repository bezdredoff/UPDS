import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, unlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const expectedLockSha256 = '2f1d4bebc563f179900a94b7781209877e5d3004473ffa5ee64a8eecd5b64e33';

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

        expect(checkOutput).toContain('security:audit');
        expect(checkOutput).toContain('found 0 vulnerabilities');
        expect(checkOutput).toContain('RUN  v3.2.7');
        expect(checkOutput).toContain('vite v6.4.3 building for production');
        console.log('G8D_EXACT_CANDIDATE_PASS vite=6.4.3 vitest=3.2.7 esbuild=0.25.12 audit=0');
      } finally {
        rmSync(workdir, { recursive: true, force: true });
      }
    },
    120_000,
  );
});
