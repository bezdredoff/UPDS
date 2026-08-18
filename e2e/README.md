# UPDS browser E2E

ANM-023G1–G6 established the isolated Playwright package, production Pages topology smoke, VN navigation coverage, deterministic Match-3 coverage, persistence/localization and short real-player flow journeys. ANM-023G7A turns that accumulated suite into a real GitHub Browser Gate. ANM-023G7B adds a deliberately small mobile WebKit Golden Sample layer on top of the proven browser infrastructure. ANM-023G7C closes product/build/save-schema identity drift, and ANM-023G7D hardens the CI runtime by moving both browser lanes onto the version-pinned official Playwright container with deterministic hosted-runner font mapping.

## Framework policy

**Playwright is the only browser/E2E automation framework for UPDS. Selenium/WebDriver is not part of the UPDS test stack and is not planned as a parallel framework.**

The project already gets Chromium, Mobile WebKit, device profiles, traces, retries, screenshots, visual regression and production-build execution from Playwright. A second Selenium stack would duplicate browser provisioning, fixtures, selectors, diagnostics and CI maintenance without protecting a distinct product boundary.

A future replacement would require an explicit technical/product decision. Until then, browser automation work extends this Playwright package and Browser Gate rather than adding Selenium dependencies or workflows.

From the repository root:

```bash
npm run e2e:install
npm run e2e:install:chromium
npm run test:e2e
```

Focused commands:

```bash
npm --prefix e2e run test:pages
npm --prefix e2e run test:vn
npm --prefix e2e run test:match3
npm --prefix e2e run test:flow
npm --prefix e2e run test:visual
npm --prefix e2e run test:webkit-mobile
```

## G7A Browser Gate

`.github/workflows/browser-gate.yml` is deliberately separate from the existing root Quality Gate. `npm run check` remains lint + Vitest + production build and continues to be the fast validation path used by the mobile ZIP importer.

The Browser Gate runs on pull requests to `main`, pushes to `main`, and manual dispatches. It has two independent matrix lanes:

- **Chromium full E2E** — every `*.pw.ts` functional browser test accumulated in G1–G6 and later Playwright coverage;
- **Mobile WebKit critical E2E** — boot, VN, Match-3, persistence/localization/main-flow coverage and the G7B visual Golden Samples on the Playwright `iPhone 13` device profile.

Both lanes run inside `mcr.microsoft.com/playwright:v1.62.1-noble`, exactly matching the pinned `@playwright/test` version in `e2e/package.json`. The image already contains the matching Chromium/WebKit browser binaries and Linux browser dependencies, so CI does not run `playwright install --with-deps` or reinstall the large WebKit apt dependency set on every fresh GitHub runner. The isolated E2E npm package is still installed from the repository so the tests remain controlled by project dependencies. The production Vite bundle is still built by the Playwright web server command and served through the G3 production-topology server.

The application currently relies on host font fallback stacks (`Inter`, `Georgia`, `system-ui`) rather than shipping repository-owned webfonts. To keep the already-reviewed G7B Ubuntu/WebKit Golden Samples stable while using the Playwright container, the workflow mounts the hosted runner's `/usr/share/fonts` read-only into the container and refreshes fontconfig before tests. The job logs the resolved `Georgia`, `Inter`, `serif` and `sans-serif` mappings so future runner-image font drift is diagnosable without changing snapshots blindly.

On success or failure, the workflow uploads `playwright-report` and `test-results` for 14 days. Retained-on-failure traces and failure screenshots therefore remain available for diagnosis from GitHub Actions.

## G7B mobile Golden Samples

`visual-regression.pw.ts` is authoritative only in the `webkit-mobile` project. It stores four reviewed Ubuntu/WebKit baselines:

- Main Menu;
- authored VN trio at `VN0008`;
- `CHOICE_00`;
- deterministic Match-3 Level Lab seed `7`.

Screenshots use reduced motion, disabled screenshot animations, CSS-pixel scale and a `0.002` maximum diff-pixel ratio. The test waits for loaded images and `document.fonts.ready` before comparison.

The Main Menu baseline intentionally hides only the dynamic build footer because `BUILD_LABEL` changes between candidates. Gameplay and VN content are not masked.

Golden Samples must not be refreshed merely to make CI green. When an intended visual change occurs, inspect expected/actual/diff artifacts first, approve the new appearance, then regenerate the Linux WebKit baselines in a controlled baseline-refresh cut.

## Persistence and localization

Campaign persistence uses only visible player behavior:

`New Game → VN0002 → reload → Main Menu → Continue → VN0002`.

Localization uses production Settings and locale persistence:

`Main Menu (RU) → Settings → EN → reload → EN`.

## Short main-flow contract

The representative player flow begins at `#new`, not QA Scene Navigation:

`New Game → Scene 0 → Scene 1 → VN0040 → CHOICE_00 B → VN0057 → M3_00 intro → Start Match`.

It then reloads and verifies that `Continue` restores the same story Match-3 boundary.

## Existing automation surfaces

- **QA Scene Navigation** — deterministic focused VN cases and authored visual states;
- **Match-3 Campaign** — direct production campaign entry and progression surface;
- **Level Lab** — deterministic production Match-3 mechanics/configuration and the Match-3 Golden Sample;
- **New Game / Continue / Settings** — real-player persistence, localization and cross-system boundaries.

These surfaces are automation entry points, not alternate game implementations. After a deterministic setup, tests must exercise the same VN/Match-3/controller/render code used by the player.

## ANM-023G8 — Playwright Production-Flow Coverage — NEXT

G8 extends the existing Playwright stack now that G7C/G7D are merged and art-dependent ANM-030 work is waiting for externally produced approved graphics.

Planned split:

- **G8A Coverage Audit & QA/Production Parity Matrix** — map every current `*.pw.ts` test to the production boundary it proves; verify that QA Scene Navigation, Match-3 Campaign and Level Lab converge on the same runtime/controller/render paths as normal play; identify gaps instead of adding duplicate tests.
- **G8B Story/VN Production-Flow Expansion** — add a small set of representative New Game/Continue journeys across later story/choice/save boundaries. Do not replay all 976 lines in every PR; use deterministic QA entry for narrow VN rendering cases and real player entry for cross-system behavior.
- **G8C Match-3 Completion & Progression Flow** — cover production level completion/result, unlock/progression/replay and Story handoff, while retaining Level Lab for deterministic mechanics defects.

Success means the Browser Gate protects the important production paths with one Playwright stack, without browser-only game logic, full-story CI bloat or a parallel Selenium implementation.

Playwright files use `*.pw.ts` so root Vitest never collects them.
