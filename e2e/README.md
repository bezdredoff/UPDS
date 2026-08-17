# UPDS browser E2E

ANM-023G1 introduced the isolated Playwright browser-test package. ANM-023G2 formalizes the existing QA/product surfaces as automation harnesses without adding a second game implementation. The parallel GitHub Browser Gate is still deferred to ANM-023G7.

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

The Playwright web server builds the real Vite production bundle and serves it through `vite preview` on `127.0.0.1:4173`.

Playwright test files use the `*.pw.ts` suffix so the root Vitest suite does not collect them as unit tests.

## Automation harnesses

Browser tests should prefer the existing production surfaces:

- QA Scene Navigation for targeted VN entry;
- Match-3 Campaign for production level entry/replay;
- Level Lab for exact-seed deterministic Match-3 entry;
- only a small number of main-player journeys for cross-system integration.

Stable selectors live in `e2e/selectors.ts`. Browser persistence reset lives in `e2e/helpers/runtime.ts`; do not add test-only reset APIs to the game runtime.
