import { readdirSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { APP_VERSION, BUILD_LABEL } from '../src/appVersion';
import { ANM009_SAVE_KEY } from '../src/engine/CampaignStore';

const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
const tsconfig = JSON.parse(readFileSync(new URL('../tsconfig.json', import.meta.url), 'utf8')) as { compilerOptions: Record<string, unknown> };

describe('repository maintenance contract', () => {
  it('keeps runtime version metadata dynamic and the stable campaign save key unchanged', () => {
    expect(APP_VERSION).toBe(packageJson.version);
    expect(BUILD_LABEL).toMatch(/^ANM-/);
    expect(ANM009_SAVE_KEY).toBe('seiran-detectives-anm009-v1');
  });

  it('keeps the repository root free from historical feature reports and release notes', () => {
    const rootFiles = readdirSync(new URL('..', import.meta.url), { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name);
    expect(rootFiles.some((name) => /^README_ANM/i.test(name))).toBe(false);
    expect(rootFiles.some((name) => /VALIDATION_REPORT|MANUAL_QA/i.test(name))).toBe(false);
    expect(rootFiles).not.toContain('CHECK_COMMANDS.txt');
  });

  it('enforces unused-code checks in strict TypeScript builds', () => {
    expect(tsconfig.compilerOptions.strict).toBe(true);
    expect(tsconfig.compilerOptions.noUnusedLocals).toBe(true);
    expect(tsconfig.compilerOptions.noUnusedParameters).toBe(true);
  });
});
