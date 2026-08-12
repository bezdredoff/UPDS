import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('ANM-022H1 delta ZIP foundation', () => {
  it('keeps FULL_PROJECT as the recovery/binary/art path alongside delta imports', async () => {
    const setup = await readFile(new URL('../docs/setup/import-zip.delta-v1.yml', import.meta.url), 'utf8');
    expect(setup).toContain('manifest.format == "upds-delta-v1"');
    expect(setup).toContain('FULL_PROJECT ZIP stays supported as recovery/binary/art path');
    expect(setup).toContain('A stale patch FAILS instead of silently rebasing');
  });

  it('protects pipeline files and uses exact base SHA in delta v1', async () => {
    const script = await readFile(new URL('../scripts/apply-delta-zip.py', import.meta.url), 'utf8');
    expect(script).toContain('.github/workflows/');
    expect(script).toContain('scripts/validate-upload-zip.py');
    expect(script).toContain('base_sha != actual_base');
    expect(script).toContain('unexpected archive entries');
  });

  it('keeps the setup workflow explicit about full and delta paths', async () => {
    const setup = await readFile(new URL('../docs/setup/import-zip.delta-v1.yml', import.meta.url), 'utf8');
    expect(setup).toContain('upds-delta-v1');
    expect(setup).toContain('Existing FULL_PROJECT ZIP path exactly as before');
    expect(setup).toContain('npm run check');
  });
});
