import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('ANM-010 GitHub/phone pipeline contract', () => {
  it('keeps CI as a read-only npm run check gate', () => {
    const workflow = read('.github/workflows/ci.yml');
    expect(workflow).toContain('name: Quality gate');
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('npm ci --ignore-scripts');
    expect(workflow).toContain('npm run check');
    expect(workflow).toContain('pull_request:');
  });

  it('deploys stable main through official GitHub Pages actions', () => {
    const workflow = read('.github/workflows/pages.yml');
    expect(workflow).toContain('actions/upload-pages-artifact@v5');
    expect(workflow).toContain('actions/deploy-pages@v4');
    expect(workflow).toContain('name: github-pages');
    expect(workflow).toContain('branches:');
    expect(workflow).toContain('- main');
    expect(workflow).toContain('Sync mobile inbox branch to stable main');
  });

  it('validates mobile ZIPs before write-capable jobs and publishes a Pages preview slot', () => {
    const workflow = read('.github/workflows/import-zip.yml');
    expect(workflow).toContain('branches:');
    expect(workflow).toContain('- incoming');
    expect(workflow).toContain("- 'incoming/*.zip'");
    expect(workflow).toContain('Validate candidate in read-only sandbox');
    expect(workflow).toContain('python3 scripts/validate-upload-zip.py');
    expect(workflow).toContain('npm run check');
    expect(workflow).toContain('Create candidate branch and pull request');
    expect(workflow).toContain('path: ${{ runner.temp }}/site/preview');
    expect(workflow).toContain('actions/deploy-pages@v4');
    expect(workflow).toContain('Reject pipeline self-modification from mobile ZIP');
    expect(workflow).toContain('diff -qr baseline/.github/workflows');
    expect(workflow).toContain('Reset binary inbox branch');
  });

  it('keeps the current save key contract untouched', () => {
    const campaign = read('src/engine/CampaignStore.ts');
    expect(campaign).toContain("seiran-detectives-anm009-v1");
  });
});
