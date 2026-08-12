import { describe, expect, it } from 'vitest';
import { readFile } from 'node:fs/promises';

describe('ANM-022H1 delta ZIP foundation', () => {
  it('documents delta before architecture work in the production roadmap', async () => {
    const roadmap = await readFile(new URL('../docs/ROADMAP_RU.md', import.meta.url), 'utf8');
    const delta = roadmap.indexOf('ANM-022H — Mobile/GitHub Development Flow v2');
    const architecture = roadmap.indexOf('ANM-023 — Architecture & Test Health Pass');
    expect(delta).toBeGreaterThan(0);
    expect(delta).toBeLessThan(architecture);
    expect(roadmap).toContain('FULL_PROJECT ZIP as recovery/binary/art path');
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
