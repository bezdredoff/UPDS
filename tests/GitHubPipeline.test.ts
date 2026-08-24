import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('GitHub/phone pipeline contract', () => {
  it('keeps CI as a read-only npm run check gate', () => {
    const workflow = read('.github/workflows/ci.yml');
    expect(workflow).toContain('name: Quality gate');
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('npm ci --ignore-scripts');
    expect(workflow).toContain('npm run check');
    expect(workflow).toContain('pull_request:');
  });

  it('deploys stable main through official GitHub Pages actions and syncs incoming without retriggering the importer', () => {
    const workflow = read('.github/workflows/pages.yml');
    expect(workflow).toContain('actions/upload-pages-artifact@v5');
    expect(workflow).toContain('actions/deploy-pages@v4');
    expect(workflow).toContain('name: github-pages');
    expect(workflow).toContain('branches:');
    expect(workflow).toContain('- main');
    expect(workflow).toContain('Sync mobile inbox branch to stable main');
    expect(workflow.match(/if: github\.ref == 'refs\/heads\/main'/g)).toHaveLength(3);
    expect(workflow).toContain('ref: main');
    expect(workflow).toContain('git commit-tree "$clean_tree" -p HEAD');
    expect(workflow).toContain('Sync incoming inbox to stable main [skip ci]');
    expect(workflow).toContain('git push --force origin "$sync_commit:incoming"');
  });

  it('validates mobile ZIPs before write-capable jobs and publishes a Pages preview slot', () => {
    const workflow = read('.github/workflows/import-zip.yml');
    expect(workflow).toContain('branches:');
    expect(workflow).toContain('- incoming');
    expect(workflow).toContain("- 'incoming/*.zip'");
    expect(workflow).toContain('Validate candidate in read-only sandbox');
    expect(workflow).toContain('Detect candidate archive mode');
    expect(workflow).toContain('"upds-delta-v1", "upds-delta-v2"');
    expect(workflow).toContain("steps.archive-mode.outputs.mode == 'full'");
    expect(workflow).toContain('python3 baseline/scripts/validate-upload-zip.py');
    expect(workflow).toContain("steps.archive-mode.outputs.mode == 'delta'");
    expect(workflow).toContain('python3 baseline/scripts/apply-delta-zip.py');
    expect(workflow).toContain('"$(realpath baseline)"');
    expect(workflow).toContain('npm run check');
    expect(workflow).toContain('Create candidate branch and pull request');
    expect(workflow).toContain('Create or reuse candidate branch');
    expect(workflow).toContain('git ls-remote --exit-code --heads origin "$branch"');
    expect(workflow).toContain('Candidate branch already contains this validated tree; reusing it.');
    expect(workflow).toContain('Open or reuse pull request');
    expect(workflow).toContain('gh pr list --base main --head "$BRANCH" --state open');
    expect(workflow).toContain('A non-open pull request already exists for $BRANCH');
    expect(workflow).toContain('path: ${{ runner.temp }}/site/preview');
    expect(workflow).toContain('actions/deploy-pages@v4');
    expect(workflow).toContain('Reject pipeline self-modification from mobile ZIP');
    expect(workflow).toContain('diff -qr baseline/.github/workflows');
    expect(workflow).toContain('cmp baseline/scripts/validate-upload-zip.py');
    expect(workflow).toContain('cmp baseline/scripts/apply-delta-zip.py');
    expect(workflow).toContain('Reset binary inbox branch');
  });

  it('pins candidate branch creation to the exact main commit used for validation', () => {
    const workflow = read('.github/workflows/import-zip.yml');
    expect(workflow).toContain('validated_main_sha: ${{ steps.baseline-meta.outputs.validated_main_sha }}');
    expect(workflow).toContain('fetch-depth: 0');
    expect(workflow).toContain('Pin validated main commit');
    expect(workflow).toContain('Check out the exact main commit used for candidate validation');
    expect(workflow).toContain('ref: ${{ needs.validate-candidate.outputs.validated_main_sha }}');
    expect(workflow).toContain('Candidate validation baseline:');
  });

  it('cleans rejected mobile ZIPs while preserving the failed import result and avoiding a zero-ZIP follow-up run', () => {
    const workflow = read('.github/workflows/import-zip.yml');
    expect(workflow).toContain('always() &&');
    expect(workflow).toContain("needs.validate-candidate.result == 'failure'");
    expect(workflow).toContain("needs.validate-candidate.result == 'success'");
    expect(workflow).toContain('git commit-tree "$clean_tree" -p HEAD');
    expect(workflow).toContain('Reset incoming inbox after mobile import [skip ci]');
    expect(workflow).toContain('git push --force origin "$reset_commit:incoming"');
    expect(workflow).not.toContain('git push --force origin HEAD:incoming');
  });
});
