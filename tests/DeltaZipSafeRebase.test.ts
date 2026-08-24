import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

type PatchManifest = Readonly<{
  format: 'upds-delta-v1' | 'upds-delta-v2';
  baseSha: string;
  feature: string;
  files: readonly string[];
  delete: readonly string[];
}>;

type RepoFixture = Readonly<{
  root: string;
  repo: string;
  baseSha: string;
}>;

const scratchRoots: string[] = [];
const scriptPath = resolve(process.cwd(), 'scripts/apply-delta-zip.py');

const resolvePython = (): string => {
  for (const command of ['python3', 'python']) {
    if (spawnSync(command, ['--version'], { stdio: 'ignore' }).status === 0) return command;
  }
  throw new Error('Python 3 is required for delta importer regression tests');
};

const python = resolvePython();

const exec = (command: string, args: readonly string[], cwd?: string): string => execFileSync(command, [...args], {
  cwd,
  encoding: 'utf8',
});

const git = (repo: string, ...args: string[]): string => exec('git', args, repo).trim();

const commitAll = (repo: string, message: string): string => {
  git(repo, 'add', '-A');
  git(repo, 'commit', '-m', message);
  return git(repo, 'rev-parse', 'HEAD');
};

const makeRepo = (): RepoFixture => {
  const root = mkdtempSync(join(tmpdir(), 'upds-delta-v2-'));
  scratchRoots.push(root);
  const repo = join(root, 'repo');
  mkdirSync(repo);
  git(repo, 'init', '-b', 'main');
  git(repo, 'config', 'user.email', 'delta-tests@upds.invalid');
  git(repo, 'config', 'user.name', 'UPDS Delta Tests');
  writeFileSync(join(repo, 'target.txt'), 'base target\n');
  writeFileSync(join(repo, 'delete.txt'), 'base delete\n');
  writeFileSync(join(repo, 'keep.txt'), 'base keep\n');
  const baseSha = commitAll(repo, 'base');
  return { root, repo, baseSha };
};

const copyTrackedTree = (repo: string, target: string): void => {
  mkdirSync(target, { recursive: true });
  const tracked = git(repo, 'ls-files').split('\n').filter(Boolean);
  for (const path of tracked) {
    const destination = join(target, path);
    mkdirSync(dirname(destination), { recursive: true });
    cpSync(join(repo, path), destination);
  }
};

const makePatch = (
  archive: string,
  manifest: PatchManifest,
  files: Readonly<Record<string, string>>,
): void => {
  const payload = JSON.stringify({ manifest, files });
  const code = [
    'import json, sys, zipfile',
    'payload = json.loads(sys.argv[2])',
    'with zipfile.ZipFile(sys.argv[1], "w") as archive:',
    '    archive.writestr("patch-manifest.json", json.dumps(payload["manifest"]))',
    '    for path, content in payload["files"].items():',
    '        archive.writestr("files/" + path, content)',
  ].join('\n');
  exec(python, ['-c', code, archive, payload]);
};

const runPatch = (
  archive: string,
  currentSha: string,
  target: string,
  repo: string,
) => spawnSync(
  python,
  [scriptPath, archive, currentSha, target, repo],
  { encoding: 'utf8' },
);

const v2Manifest = (
  baseSha: string,
  files: readonly string[],
  deleted: readonly string[] = [],
): PatchManifest => ({
  format: 'upds-delta-v2',
  baseSha,
  feature: 'ANM-010E test fixture',
  files,
  delete: deleted,
});

afterEach(() => {
  while (scratchRoots.length > 0) {
    const root = scratchRoots.pop();
    if (root) rmSync(root, { recursive: true, force: true });
  }
});

describe('ANM-010E delta v2 safe rebase', () => {
  it('rebases over unrelated main changes and applies the candidate to current main', () => {
    const fixture = makeRepo();
    writeFileSync(join(fixture.repo, 'keep.txt'), 'current unrelated change\n');
    const currentSha = commitAll(fixture.repo, 'unrelated main change');
    const target = join(fixture.root, 'candidate');
    copyTrackedTree(fixture.repo, target);
    const archive = join(fixture.root, 'candidate.zip');
    makePatch(archive, v2Manifest(fixture.baseSha, ['target.txt']), { 'target.txt': 'patched target\n' });

    const result = runPatch(archive, currentSha, target, fixture.repo);

    expect(result.status).toBe(0);
    expect(result.stdout).toContain('DELTA safe rebase PASS');
    expect(readFileSync(join(target, 'target.txt'), 'utf8')).toBe('patched target\n');
    expect(readFileSync(join(target, 'keep.txt'), 'utf8')).toBe('current unrelated change\n');
  });

  it('rejects a stale v2 patch when a replaced path changed on main', () => {
    const fixture = makeRepo();
    writeFileSync(join(fixture.repo, 'target.txt'), 'main changed target\n');
    const currentSha = commitAll(fixture.repo, 'change touched file');
    const target = join(fixture.root, 'candidate');
    copyTrackedTree(fixture.repo, target);
    const archive = join(fixture.root, 'candidate.zip');
    makePatch(archive, v2Manifest(fixture.baseSha, ['target.txt']), { 'target.txt': 'patch target\n' });

    const result = runPatch(archive, currentSha, target, fixture.repo);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('safe rebase conflict');
    expect(result.stderr).toContain('target.txt');
    expect(readFileSync(join(target, 'target.txt'), 'utf8')).toBe('main changed target\n');
  });

  it('rejects create collisions and changed delete targets', () => {
    const createFixture = makeRepo();
    writeFileSync(join(createFixture.repo, 'new.txt'), 'main owns new path\n');
    const createCurrent = commitAll(createFixture.repo, 'create colliding file');
    const createTarget = join(createFixture.root, 'candidate-create');
    copyTrackedTree(createFixture.repo, createTarget);
    const createArchive = join(createFixture.root, 'create.zip');
    makePatch(createArchive, v2Manifest(createFixture.baseSha, ['new.txt']), { 'new.txt': 'patch new path\n' });

    const createResult = runPatch(createArchive, createCurrent, createTarget, createFixture.repo);
    expect(createResult.status).toBe(1);
    expect(createResult.stderr).toContain('new.txt');
    expect(readFileSync(join(createTarget, 'new.txt'), 'utf8')).toBe('main owns new path\n');

    const deleteFixture = makeRepo();
    writeFileSync(join(deleteFixture.repo, 'delete.txt'), 'main changed delete target\n');
    const deleteCurrent = commitAll(deleteFixture.repo, 'change delete target');
    const deleteTarget = join(deleteFixture.root, 'candidate-delete');
    copyTrackedTree(deleteFixture.repo, deleteTarget);
    const deleteArchive = join(deleteFixture.root, 'delete.zip');
    makePatch(deleteArchive, v2Manifest(deleteFixture.baseSha, [], ['delete.txt']), {});

    const deleteResult = runPatch(deleteArchive, deleteCurrent, deleteTarget, deleteFixture.repo);
    expect(deleteResult.status).toBe(1);
    expect(deleteResult.stderr).toContain('delete.txt');
    expect(existsSync(join(deleteTarget, 'delete.txt'))).toBe(true);
  });

  it('keeps delta v1 on the exact baseSha contract', () => {
    const fixture = makeRepo();
    writeFileSync(join(fixture.repo, 'keep.txt'), 'current unrelated change\n');
    const currentSha = commitAll(fixture.repo, 'move main');
    const target = join(fixture.root, 'candidate');
    copyTrackedTree(fixture.repo, target);
    const archive = join(fixture.root, 'candidate.zip');
    makePatch(archive, {
      ...v2Manifest(fixture.baseSha, ['target.txt']),
      format: 'upds-delta-v1',
    }, { 'target.txt': 'patch target\n' });

    const result = runPatch(archive, currentSha, target, fixture.repo);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('stale baseSha');
  });

  it('rejects a v2 baseSha that is not an ancestor of current main', () => {
    const fixture = makeRepo();
    writeFileSync(join(fixture.repo, 'keep.txt'), 'main continuation\n');
    const currentSha = commitAll(fixture.repo, 'main continuation');
    git(fixture.repo, 'switch', '-c', 'sibling', fixture.baseSha);
    writeFileSync(join(fixture.repo, 'sibling.txt'), 'sibling\n');
    const siblingSha = commitAll(fixture.repo, 'sibling commit');
    git(fixture.repo, 'switch', 'main');
    git(fixture.repo, 'reset', '--hard', currentSha);
    const target = join(fixture.root, 'candidate');
    copyTrackedTree(fixture.repo, target);
    const archive = join(fixture.root, 'candidate.zip');
    makePatch(archive, v2Manifest(siblingSha, ['target.txt']), { 'target.txt': 'patch target\n' });

    const result = runPatch(archive, currentSha, target, fixture.repo);

    expect(result.status).toBe(1);
    expect(result.stderr).toContain('baseSha is not an ancestor of current main');
  });
});
