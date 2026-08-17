import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');
const rootPackage = JSON.parse(read('package.json')) as {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
};
const e2ePackage = JSON.parse(read('e2e/package.json')) as {
  scripts: Record<string, string>;
  devDependencies: Record<string, string>;
};
const config = read('e2e/playwright.config.ts');
const bootSmoke = read('e2e/tests/boot.pw.ts');
const gitignore = read('.gitignore');

describe('ANM-023G1 Playwright foundation', () => {
  it('keeps browser tooling isolated from the existing fast quality gate', () => {
    expect(rootPackage.scripts.check).toBe('npm run lint && npm run test && npm run build');
    expect(rootPackage.devDependencies['@playwright/test']).toBeUndefined();
    expect(rootPackage.scripts['e2e:install']).toBe('npm --prefix e2e install --ignore-scripts --package-lock=false');
    expect(rootPackage.scripts['e2e:install:chromium']).toContain('playwright install chromium');
    expect(rootPackage.scripts['test:e2e']).toBe('npm --prefix e2e test');
    expect(e2ePackage.devDependencies['@playwright/test']).toBe('1.62.1');
  });

  it('runs the minimal smoke against a real production build', () => {
    expect(config).toContain("testMatch: /.*\\.pw\\.ts/");
    expect(config).toContain("const localBaseURL = 'http://127.0.0.1:4173/'");
    expect(config).toContain('npm --prefix .. run build');
    expect(config).toContain('node ./serve-production.mjs');
    expect(config).toContain("name: 'chromium'");
    expect(config).toContain("trace: 'retain-on-failure'");
    expect(config).toContain("screenshot: 'only-on-failure'");
    expect(bootSmoke).toContain("page.goto('./')");
    expect(bootSmoke).toContain("page.locator('.menu-screen')");
    expect(bootSmoke).toContain("page.locator('#new')");
    expect(bootSmoke).toContain('observeBrowserHealth(page)');
  });

  it('keeps generated browser artifacts out of source control', () => {
    expect(gitignore).toContain('e2e/test-results/');
    expect(gitignore).toContain('e2e/playwright-report/');
  });
});
