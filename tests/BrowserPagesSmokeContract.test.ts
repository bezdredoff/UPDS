import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (path: string): string => readFileSync(resolve(process.cwd(), path), 'utf8');

const viteConfig = read('vite.config.ts');
const playwrightConfig = read('e2e/playwright.config.ts');
const topologyServer = read('e2e/serve-production.mjs');
const browserHealth = read('e2e/helpers/browserHealth.ts');
const runtimeHelper = read('e2e/helpers/runtime.ts');
const bootSmoke = read('e2e/tests/boot.pw.ts');
const pagesSmoke = read('e2e/tests/pages-smoke.pw.ts');
const e2ePackage = JSON.parse(read('e2e/package.json')) as { scripts: Record<string, string> };

describe('ANM-023G3 production build and Pages preview smoke contract', () => {
  it('keeps emitted asset URLs relative so the same build can live under /preview/', () => {
    expect(viteConfig).toContain("base: './'");
    expect(playwrightConfig).toContain('UPDS_E2E_BASE_URL');
    expect(playwrightConfig).toContain("requestedBaseURL.replace(/\\/+$/, '')");
    expect(playwrightConfig).toContain('webServer: requestedBaseURL');
  });

  it('mirrors the stable root and candidate /preview/ mount with one exact dist build', () => {
    expect(topologyServer).toContain("pathname.startsWith('/preview/')");
    expect(topologyServer).toContain("pathname.slice('/preview'.length)");
    expect(topologyServer).toContain("join(distRoot, 'index.html')");
    expect(topologyServer).toContain("if (!extname(safePath))");
    expect(topologyServer).toContain("response.writeHead(404");
    expect(playwrightConfig).toContain('node ./serve-production.mjs');
  });

  it('uses baseURL-relative browser navigation for GitHub Pages project subpaths', () => {
    expect(runtimeHelper).toContain("page.goto('./?qa=1')");
    expect(runtimeHelper).not.toContain("page.goto('/?qa=1')");
    expect(bootSmoke).toContain("page.goto('./')");
    expect(bootSmoke).not.toContain("page.goto('/')");
    expect(pagesSmoke).toContain("{ name: 'stable-root', path: './' }");
    expect(pagesSmoke).toContain("{ name: 'candidate-preview', path: './preview/' }");
    expect(pagesSmoke).toContain("page.goto(`${lane.path}?qa=1`)");
    expect(pagesSmoke).toContain("toHaveAttribute('data-qa-surface', 'enabled')");
  });

  it('fails on critical browser/runtime and asset health problems while ignoring only known local WebKit PWA probe diagnostics', () => {
    expect(browserHealth).toContain("new Set(['document', 'script', 'stylesheet', 'image', 'font'])");
    expect(browserHealth).toContain("page.on('pageerror'");
    expect(browserHealth).toContain('isKnownLocalPwaAccessError');
    expect(browserHealth).toContain("127.0.0.1:4173/sw.js");
    expect(browserHealth).toContain("127.0.0.1:4173/build.json");
    expect(browserHealth).toContain('due to access control checks');
    expect(browserHealth).toContain("message.type() === 'error'");
    expect(browserHealth).toContain("page.on('requestfailed'");
    expect(browserHealth).toContain("page.on('response'");
    expect(browserHealth).toContain("response.status() < 400");
    expect(pagesSmoke).toContain('health.assertClean()');
  });

  it('checks critical menu navigation on both deployment lanes without entering gameplay scope', () => {
    expect(pagesSmoke).toContain('qaSelectors.sceneNavigationButton');
    expect(pagesSmoke).toContain('qaSelectors.match3CampaignButton');
    expect(pagesSmoke).toContain('qaSelectors.levelLabButton');
    expect(pagesSmoke).not.toContain('match3Cell');
    expect(pagesSmoke).not.toContain('vnDialogue');
    expect(e2ePackage.scripts['test:pages']).toBe(
      'playwright test boot.pw.ts pages-smoke.pw.ts --project=chromium',
    );
  });
});
