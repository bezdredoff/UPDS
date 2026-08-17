import { expect, type Page, type Request } from '@playwright/test';

const criticalResourceTypes = new Set(['document', 'script', 'stylesheet', 'image', 'font']);

function isCriticalRequest(request: Request): boolean {
  return criticalResourceTypes.has(request.resourceType());
}

export type BrowserHealthProbe = Readonly<{
  assertClean: () => void;
}>;

export function observeBrowserHealth(page: Page): BrowserHealthProbe {
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const failedRequests: string[] = [];
  const badResponses: string[] = [];

  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('requestfailed', (request) => {
    if (!isCriticalRequest(request)) return;
    failedRequests.push(`${request.resourceType()} ${request.url()} :: ${request.failure()?.errorText ?? 'request failed'}`);
  });
  page.on('response', (response) => {
    const request = response.request();
    if (!isCriticalRequest(request) || response.status() < 400) return;
    badResponses.push(`${response.status()} ${request.resourceType()} ${response.url()}`);
  });

  return {
    assertClean: () => {
      expect(pageErrors, 'uncaught page errors').toEqual([]);
      expect(consoleErrors, 'browser console errors').toEqual([]);
      expect(failedRequests, 'failed critical requests').toEqual([]);
      expect(badResponses, 'HTTP errors for critical resources').toEqual([]);
    },
  };
}
