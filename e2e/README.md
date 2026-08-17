# UPDS browser E2E

ANM-023G1 introduced the isolated Playwright browser-test package. ANM-023G2 formalized the existing QA/product surfaces as automation harnesses without adding a second game implementation. ANM-023G3 added production-build and GitHub Pages `/preview/` topology smoke coverage. ANM-023G4 adds real VN browser coverage through QA Scene Navigation. The parallel GitHub Browser Gate is still deferred to ANM-023G7.

From the repository root:

```bash
npm run e2e:install
npm run e2e:install:chromium
npm run test:e2e
```

Useful focused commands:

```bash
npm run test:e2e:chromium
npm --prefix e2e run test:pages
npm --prefix e2e run test:vn
npm run e2e:report
```

## VN automation contract

VN coverage enters through the visible Main Menu → QA Scene Navigation UI. It must not call the VN controller directly, mutate the app save directly, or expose a browser-only scene/line jump API.

G4 representative journeys cover:

- Scene 0 / `VN0001`: real direction frame and browser-measured dialogue paging;
- Scene 0 / `VN0002`: normal production character fallback;
- Scene 0 / `VN0008`: approved authored `trio-central-speaker` shot with three real production actor assets;
- Scene 1 / `VN0040`: real `CHOICE_00`, selecting branch B and resuming at `VN0041B`.

The helper advances with the real `#next` control, including all intermediate dialogue pages. This deliberately exercises the production measured-paging path rather than jumping directly to a line.

## Production topology and health

Local Playwright runs build the real Vite production bundle and serve the same `dist/` at both `/` and `/preview/`. Browser navigation remains baseURL-relative so the same suite can later target a hosted GitHub Pages project path through `UPDS_E2E_BASE_URL`.

Browser suites record and reject uncaught `pageerror`, `console.error`, failed critical resource requests and HTTP errors for document/script/stylesheet/image/font assets.

## Automation harnesses

Browser tests should continue to prefer QA Scene Navigation for VN, Match-3 Campaign for production level entry/replay, Level Lab for exact-seed deterministic Match-3 entry, and only a small number of main-player journeys for cross-system integration.

Stable selectors live in `e2e/selectors.ts`. Browser persistence reset lives in `e2e/helpers/runtime.ts`; do not add test-only reset APIs to the game runtime.

Playwright test files use the `*.pw.ts` suffix so the root Vitest suite does not collect them as unit tests.
