import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

describe('ANM-022H1 / ANM-010E delta ZIP foundation', () => {
  it('keeps FULL_PROJECT as the recovery/binary/art path alongside delta imports', async () => {
    const setup = await readFile(new URL('../docs/setup/import-zip.delta-v1.yml', import.meta.url), 'utf8');
    expect(setup).toContain('manifest.format == "upds-delta-v1"');
    expect(setup).toContain('FULL_PROJECT ZIP stays supported as recovery/binary/art path');
    expect(setup).toContain('A stale patch FAILS instead of silently rebasing');
  });

  it('keeps v1 exact while exposing v2 ancestry and touched-path safe rebase checks', async () => {
    const script = await readFile(new URL('../scripts/apply-delta-zip.py', import.meta.url), 'utf8');
    expect(script).toContain('.github/workflows/');
    expect(script).toContain('scripts/validate-upload-zip.py');
    expect(script).toContain('SUPPORTED_FORMATS = {"upds-delta-v1", "upds-delta-v2"}');
    expect(script).toContain('if format_name == "upds-delta-v1"');
    expect(script).toContain('stale baseSha');
    expect(script).toContain('merge-base');
    expect(script).toContain('--is-ancestor');
    expect(script).toContain('"diff"');
    expect(script).toContain('"--quiet"');
    expect(script).toContain('safe rebase conflict: touched paths changed since baseSha');
    expect(script).toContain('unexpected archive entries');
  });

  it('keeps the v1 setup workflow explicit as a historical exact-base contract', async () => {
    const setup = await readFile(new URL('../docs/setup/import-zip.delta-v1.yml', import.meta.url), 'utf8');
    expect(setup).toContain('upds-delta-v1');
    expect(setup).toContain('Existing FULL_PROJECT ZIP path exactly as before');
    expect(setup).toContain('npm run check');
  });
});
