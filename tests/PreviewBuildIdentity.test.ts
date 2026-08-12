import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('preview build identity contract', () => {
  it('derives GitHub deployment identity from job, run and source sha instead of one shared workflow sha', () => {
    const config = read('vite.config.ts');
    expect(config).toContain('process.env.GITHUB_JOB');
    expect(config).toContain('process.env.GITHUB_RUN_ID');
    expect(config).toContain("process.env.GITHUB_SHA?.slice(0, 12)");
    expect(config).toContain("process.env.VITE_BUILD_ID ?? (githubBuildId || 'local')");
  });

  it('marks only /preview/ pages with a persistent human-visible build id', () => {
    const main = read('src/main.ts');
    const css = read('src/buildIdentity.css');
    expect(main).toContain('/\\/preview(?:\\/|$)/');
    expect(main).toContain("document.documentElement.dataset.updsLane = 'preview'");
    expect(main).toContain('document.documentElement.dataset.updsBuild = BUILD_ID');
    expect(css).toContain("html[data-upds-lane='preview']::before");
    expect(css).toContain("content: 'PREVIEW · ' attr(data-upds-build)");
    expect(css).toContain('pointer-events: none');
  });
});
