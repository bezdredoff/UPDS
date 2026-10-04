import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(path, 'utf8');
const extract = (source, name) => {
  const match = source.match(new RegExp(`export const ${name} = '([^']+)'`));
  if (!match) throw new Error(`Could not find ${name} in src/appVersion.ts`);
  return match[1];
};

const parseSemver = (version) => {
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?$/);
  if (!match) throw new Error(`Invalid APP_VERSION semver: ${version}`);
  return { core: match.slice(1, 4).map(Number), prerelease: match[4] ?? null };
};

const compareSemver = (leftVersion, rightVersion) => {
  const left = parseSemver(leftVersion);
  const right = parseSemver(rightVersion);
  for (let index = 0; index < 3; index += 1) {
    if (left.core[index] !== right.core[index]) return Math.sign(left.core[index] - right.core[index]);
  }
  if (left.prerelease === right.prerelease) return 0;
  if (left.prerelease === null) return 1;
  if (right.prerelease === null) return -1;
  return left.prerelease.localeCompare(right.prerelease, undefined, { numeric: true });
};

const source = read('src/appVersion.ts');
const appVersion = extract(source, 'APP_VERSION');
const buildLabel = extract(source, 'BUILD_LABEL');
const roadmap = read('docs/ROADMAP_RU.md');
const buildFeature = buildLabel.split(' · ')[0];
if (!roadmap.includes(`Technical product version: \`${appVersion}\``)) {
  throw new Error(`docs/ROADMAP_RU.md must name APP_VERSION ${appVersion}`);
}
if (!roadmap.includes(buildFeature)) {
  throw new Error(`docs/ROADMAP_RU.md must name the BUILD_LABEL milestone ${buildFeature}`);
}

const baseRef = process.env.UPDS_BASE_REF?.trim();
if (!baseRef) {
  console.log(`Version metadata is synchronized at ${appVersion} (${buildFeature}); no PR base supplied for bump comparison.`);
  process.exit(0);
}

const runGit = (args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const changedFiles = runGit(['diff', '--name-only', `${baseRef}...HEAD`]).split(/\r?\n/).filter(Boolean);
const changesProduction = changedFiles.some((path) =>
  path.startsWith('src/') || path.startsWith('public/') || path === 'index.html' || path === 'vite.config.ts',
);

if (!changesProduction) {
  console.log('No player-facing production paths changed; APP_VERSION bump is not required.');
  process.exit(0);
}

const baseAppVersion = extract(runGit(['show', `${baseRef}:src/appVersion.ts`]), 'APP_VERSION');
if (compareSemver(appVersion, baseAppVersion) <= 0) {
  throw new Error(`Production-facing PR must raise APP_VERSION above ${baseAppVersion}; current version is ${appVersion}.`);
}

console.log(`Player-facing version advanced: ${baseAppVersion} → ${appVersion}.`);
