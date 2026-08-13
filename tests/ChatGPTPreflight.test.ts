import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

describe('ChatGPT preflight CI contract', () => {
  it('runs the normal quality gate for reusable preflight branches', () => {
    const workflow = read('.github/workflows/ci.yml');
    expect(workflow).toContain('push:');
    expect(workflow).toContain("- 'preflight/**'");
    expect(workflow).toContain('name: Quality gate');
    expect(workflow).toContain('npm run check');
  });
});
