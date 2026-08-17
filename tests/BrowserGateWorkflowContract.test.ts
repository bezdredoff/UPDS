import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const browserWorkflow = read('.github/workflows/browser-gate.yml');
const qualityWorkflow = read('.github/workflows/ci.yml');
const rootPackage = read('package.json');
const e2ePackage = read('e2e/package.json');
const playwrightConfig = read('e2e/playwright.config.ts');

describe('ANM-023G7A Browser Gate workflow contract', () => {
  it('keeps browser execution separate from the existing fast quality gate', () => {
    expect(browserWorkflow).toContain('name: Browser Gate');
    expect(browserWorkflow).toContain('pull_request:');
    expect(browserWorkflow).toContain('push:');
    expect(browserWorkflow).toContain('- main');
    expect(browserWorkflow).not.toContain('npm run check');

    expect(qualityWorkflow).toContain('name: UPDS CI');
    expect(qualityWorkflow).toContain('run: npm run check');
    expect(qualityWorkflow).not.toContain('playwright');
    expect(rootPackage).toContain('"check": "npm run lint && npm run test && npm run build"');
  });

  it('runs the full Chromium suite and a mobile-critical WebKit subset', () => {
    expect(browserWorkflow).toContain('name: Chromium full E2E');
    expect(browserWorkflow).toContain('browser: chromium');
    expect(browserWorkflow).toContain('command: test:chromium');
    expect(browserWorkflow).toContain('name: Mobile WebKit critical E2E');
    expect(browserWorkflow).toContain('browser: webkit');
    expect(browserWorkflow).toContain('command: test:webkit-mobile');

    expect(e2ePackage).toContain('"test:chromium": "playwright test --project=chromium"');
    expect(e2ePackage).toContain('"test:webkit-mobile": "playwright test --project=webkit-mobile"');
    expect(playwrightConfig).toContain("name: 'chromium'");
    expect(playwrightConfig).toContain("name: 'webkit-mobile'");
    expect(playwrightConfig).toContain("devices['iPhone 13']");
    expect(playwrightConfig).toContain('mobileCriticalTestMatch');
    expect(playwrightConfig).toContain('/boot\\.pw\\.ts/');
    expect(playwrightConfig).toContain('/vn-navigation\\.pw\\.ts/');
    expect(playwrightConfig).toContain('/match3\\.pw\\.ts/');
    expect(playwrightConfig).toContain('/persistence-localization-flow\\.pw\\.ts/');
  });

  it('uses the pinned Playwright runtime image instead of reinstalling browser system dependencies', () => {
    expect(browserWorkflow).toContain('image: mcr.microsoft.com/playwright:v1.62.1-noble');
    expect(browserWorkflow).toContain('options: --user 1001');
    expect(browserWorkflow).not.toContain('playwright install --with-deps');
    expect(browserWorkflow).toContain('npm ci --ignore-scripts');
    expect(browserWorkflow).toContain('npm --prefix e2e install --ignore-scripts --package-lock=false');
  });

  it('always publishes browser diagnostics', () => {
    expect(browserWorkflow).toContain('if: always()');
    expect(browserWorkflow).toContain('e2e/playwright-report');
    expect(browserWorkflow).toContain('e2e/test-results');
    expect(browserWorkflow).toContain('retention-days: 14');
    expect(browserWorkflow).toContain('github.run_attempt');
  });

  it('retains CI anti-flake and failure diagnostics in Playwright config', () => {
    expect(playwrightConfig).toContain('forbidOnly: isCI');
    expect(playwrightConfig).toContain('retries: isCI ? 1 : 0');
    expect(playwrightConfig).toContain('workers: isCI ? 1 : undefined');
    expect(playwrightConfig).toContain("trace: 'retain-on-failure'");
    expect(playwrightConfig).toContain("screenshot: 'only-on-failure'");
  });
});
