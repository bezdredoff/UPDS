# UPDS browser E2E

ANM-023G1 introduced the isolated Playwright browser-test package. ANM-023G2 formalized the existing QA/product surfaces as automation harnesses without adding a second game implementation. ANM-023G3 adds production-build and GitHub Pages `/preview/` topology smoke coverage. The parallel GitHub Browser Gate is still deferred to ANM-023G7.

From the repository root:

```bash
npm run e2e:install
npm run e2e:install:chromium
npm run test:e2e
```

Useful local commands:

```bash
npm run test:e2e:chromium
npm --prefix e2e run test:pages
npm run e2e:report
```

## Production topology

Local Playwright runs build the real Vite production bundle and serve the same `dist/` at both:

- `/` — stable-root semantics;
- `/preview/` — mobile candidate preview semantics.

This intentionally mirrors the relevant GitHub Pages topology rather than relying on a normal `vite preview` server, which does not physically mount the candidate build under `/preview/`.

All browser navigation uses baseURL-relative `./` paths. A later CI/manual run can target a real hosted site without changing tests:

```bash
UPDS_E2E_BASE_URL=https://example.invalid/UPDS/ npm --prefix e2e run test:pages
```

When `UPDS_E2E_BASE_URL` is set, Playwright does not start the local production topology server.

## Health contract

G3 records and rejects:

- uncaught `pageerror`;
- browser `console.error`;
- failed document/script/stylesheet/image/font requests;
- HTTP 4xx/5xx for those critical resource types.

The Pages smoke checks Main Menu plus navigation into QA Scene Navigation, Match-3 Campaign and Level Lab on both lanes.

## Automation harnesses

Browser tests should prefer the existing production surfaces:

- QA Scene Navigation for targeted VN entry;
- Match-3 Campaign for production level entry/replay;
- Level Lab for exact-seed deterministic Match-3 entry;
- only a small number of main-player journeys for cross-system integration.

Stable selectors live in `e2e/selectors.ts`. Browser persistence reset lives in `e2e/helpers/runtime.ts`; do not add test-only reset APIs to the game runtime.

Playwright test files use the `*.pw.ts` suffix so the root Vitest suite does not collect them as unit tests.
