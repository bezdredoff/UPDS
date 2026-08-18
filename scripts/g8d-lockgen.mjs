import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { gzipSync } from 'node:zlib';

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const rootPackage = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const workdir = mkdtempSync(join(tmpdir(), 'upds-g8d-lock-'));

try {
  const candidatePackage = structuredClone(rootPackage);
  candidatePackage.devDependencies = {
    ...candidatePackage.devDependencies,
    vite: '6.4.3',
    vitest: '3.2.7',
  };

  writeFileSync(join(workdir, 'package.json'), `${JSON.stringify(candidatePackage, null, 2)}\n`);

  execFileSync(
    npm,
    ['install', '--package-lock-only', '--ignore-scripts', '--audit=false', '--fund=false'],
    { cwd: workdir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] },
  );

  const lock = readFileSync(join(workdir, 'package-lock.json'), 'utf8');
  const parsedLock = JSON.parse(lock);
  const root = parsedLock.packages?.['']?.devDependencies ?? {};
  const vite = parsedLock.packages?.['node_modules/vite']?.version;
  const vitest = parsedLock.packages?.['node_modules/vitest']?.version;
  const esbuild = parsedLock.packages?.['node_modules/esbuild']?.version;

  if (root.vite !== '6.4.3' || root.vitest !== '3.2.7' || vite !== '6.4.3' || vitest !== '3.2.7') {
    throw new Error(`Unexpected resolved versions: root vite=${root.vite}, root vitest=${root.vitest}, vite=${vite}, vitest=${vitest}`);
  }

  const audit = JSON.parse(execFileSync(npm, ['audit', '--json'], { cwd: workdir, encoding: 'utf8' }));
  const vulnerabilities = audit.metadata?.vulnerabilities ?? {};
  const total = vulnerabilities.total ?? Object.values(vulnerabilities).reduce((sum, value) => sum + Number(value || 0), 0);
  if (total !== 0) {
    throw new Error(`Generated lock still has vulnerabilities: ${JSON.stringify(vulnerabilities)}`);
  }

  const outputPath = process.env.G8D_LOCK_OUTPUT?.trim();
  if (outputPath) {
    mkdirSync(dirname(outputPath), { recursive: true });
    writeFileSync(outputPath, lock);
    console.log(`G8D_LOCK_OUTPUT ${outputPath}`);
  }

  console.log(`G8D_RESOLVED vite=${vite} vitest=${vitest} esbuild=${esbuild}`);
  console.log(`G8D_AUDIT ${JSON.stringify(vulnerabilities)}`);
  console.log('G8D_LOCK_GZIP_B64_BEGIN');
  const encoded = gzipSync(Buffer.from(lock, 'utf8'), { level: 9 }).toString('base64');
  for (let index = 0; index < encoded.length; index += 120) {
    console.log(encoded.slice(index, index + 120));
  }
  console.log('G8D_LOCK_GZIP_B64_END');
} finally {
  rmSync(workdir, { recursive: true, force: true });
}
