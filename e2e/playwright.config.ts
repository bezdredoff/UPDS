import { defineConfig, devices } from '@playwright/test';

const isCI = Boolean(process.env.CI);
const localBaseURL = 'http://127.0.0.1:4173/';
const requestedBaseURL = process.env.UPDS_E2E_BASE_URL?.trim();
const baseURL = requestedBaseURL
  ? `${requestedBaseURL.replace(/\/+$/, '')}/`
  : localBaseURL;

const mobileCriticalTestMatch = [
  /boot\.pw\.ts/,
  /vn-navigation\.pw\.ts/,
  /match3\.pw\.ts/,
  /persistence-localization-flow\.pw\.ts/,
  /visual-regression\.pw\.ts/,
];

export default defineConfig({
  testDir: './tests',
  testMatch: /.*\.pw\.ts/,
  outputDir: './test-results',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'webkit-mobile',
      testMatch: mobileCriticalTestMatch,
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: requestedBaseURL
    ? undefined
    : {
        command: 'npm --prefix .. run build && node ./serve-production.mjs',
        url: localBaseURL,
        reuseExistingServer: !isCI,
        timeout: 120_000,
      },
});
