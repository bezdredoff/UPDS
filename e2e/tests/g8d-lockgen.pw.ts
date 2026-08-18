import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from '@playwright/test';

test('ANM-023G8D emits the verified dependency lock for artifact pickup', async () => {
  const outputPath = resolve(process.cwd(), 'test-results/g8d-lock/package-lock.json');
  const output = execFileSync(process.execPath, ['../scripts/g8d-lockgen.mjs'], {
    encoding: 'utf8',
    env: { ...process.env, G8D_LOCK_OUTPUT: outputPath },
    timeout: 30_000,
  });
  const lock = JSON.parse(readFileSync(outputPath, 'utf8')) as {
    packages: Record<string, { version?: string }>;
  };

  expect(output).toContain('"total":0');
  expect(lock.packages['node_modules/vite'].version).toBe('6.4.3');
  expect(lock.packages['node_modules/vitest'].version).toBe('3.2.7');
  expect(lock.packages['node_modules/esbuild'].version).toBe('0.25.12');
});
