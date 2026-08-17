# UPDS browser E2E

ANM-023G1 introduced the isolated Playwright browser-test package. ANM-023G2 formalized the existing QA/product surfaces as automation harnesses without adding a second game implementation. ANM-023G3 added production-build and GitHub Pages `/preview/` topology smoke coverage. ANM-023G4 added real VN browser coverage through QA Scene Navigation. ANM-023G5 adds production Match-3 coverage through Campaign and deterministic Level Lab. The parallel GitHub Browser Gate is still deferred to ANM-023G7.

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
npm --prefix e2e run test:match3
npm run e2e:report
```

## VN automation contract

VN coverage enters through the visible Main Menu → QA Scene Navigation UI. It does not call the VN controller directly, mutate the app save directly, or expose a browser-only scene/line jump API.

## Match-3 automation contract

Match-3 coverage uses two existing product surfaces:

- Match-3 Campaign proves that the standalone campaign starts the production level and shared Match-3 board;
- Level Lab supplies exact seed and draft configuration for deterministic mechanics without mutating production level definitions.

G5's Level Lab fixture is authored entirely through visible editor controls. It defines a full 8×8 `initialTiles` board, removes blockers/ingredients from the draft, and substitutes a collect objective. The fixture deliberately has no immediate match and contains known legal and invalid swaps.

Representative coverage:

- objective-aware `#hint` returns a move that the real tap input accepts and spends exactly one move;
- seed `7` turns a known four-match into a deterministic cascade/refill case;
- seed `424242` keeps the created `flash-row` alive after settle, allowing production double-tap activation;
- an adjacent no-match swap leaves moves, objective progress and the touched cells unchanged;
- objective progress is observed from the production HUD, not from engine internals.

Reduced-motion media is used so the production controller follows its existing zero-delay animation path; tests do not add sleeps or bypass resolution.

## Production topology and health

Local Playwright runs build the real Vite production bundle and serve the same `dist/` at both `/` and `/preview/`. Browser navigation remains baseURL-relative so the same suite can later target a hosted GitHub Pages project path through `UPDS_E2E_BASE_URL`.

Browser suites record and reject uncaught `pageerror`, `console.error`, failed critical resource requests and HTTP errors for document/script/stylesheet/image/font assets.

## Automation harnesses

Browser tests should continue to prefer QA Scene Navigation for VN, Match-3 Campaign for production level entry/replay, Level Lab for exact-seed deterministic Match-3 entry, and only a small number of main-player journeys for cross-system integration.

Stable selectors live in `e2e/selectors.ts`. Browser persistence reset lives in `e2e/helpers/runtime.ts`; do not add test-only reset APIs to the game runtime.

Playwright test files use the `*.pw.ts` suffix so the root Vitest suite does not collect them as unit tests.
