# UPDS browser E2E

ANM-023G1 introduces the isolated Playwright browser-test package. It intentionally does not run from the existing root `npm run check`; the parallel GitHub Browser Gate is deferred to ANM-023G7.

From the repository root:

```bash
npm run e2e:install
npm run e2e:install:chromium
npm run test:e2e
```

Useful local commands:

```bash
npm run test:e2e:chromium
npm run e2e:report
```

The Playwright web server builds the real Vite production bundle and serves it through `vite preview` on `127.0.0.1:4173`. G1 contains only the minimal production boot smoke. Stable QA selectors/reset helpers and VN/Match-3 coverage belong to G2+.

Playwright test files use the `*.pw.ts` suffix so the root Vitest suite does not collect them as unit tests.
