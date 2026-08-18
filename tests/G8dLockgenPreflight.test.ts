import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

describe('ANM-023G8D temporary lock generation preflight', () => {
  it('generates an audit-clean Vite 6.4.3 / Vitest 3.2.7 lock in an online CI environment', () => {
    const output = execFileSync(process.execPath, ['scripts/g8d-lockgen.mjs'], {
      encoding: 'utf8',
      env: process.env,
    });
    console.log(output);
    expect(output).toContain('G8D_AUDIT');
    expect(output).toContain('"total":0');
    expect(output).toContain('G8D_LOCK_GZIP_B64_BEGIN');
    expect(output).toContain('G8D_LOCK_GZIP_B64_END');
  });
});
