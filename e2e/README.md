# UPDS browser E2E

ANM-023G1–G6 established the isolated Playwright package, production Pages topology smoke, VN navigation coverage, deterministic Match-3 coverage, persistence/localization and short real-player flow journeys. ANM-023G7A turns that accumulated suite into a real GitHub Browser Gate. Visual screenshot baselines remain the follow-up G7B cut so they can be approved only after the browser infrastructure is proven stable.

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
npm --prefix e2e run test:webkit-mobile
```

## G7A Browser Gate

`.github/workflows/browser-gate.yml` is deliberately separate from the existing root Quality Gate. `npm run check` remains lint + Vitest + production build and continues to be the fast validation path used by the mobile ZIP importer.

The Browser Gate runs on pull requests to `main`, pushes to `main`, and manual dispatches. It has two independent matrix lanes:

- **Chromium full E2E** — every `*.pw.ts` browser test accumulated in G1–G6;
- **Mobile WebKit critical E2E** — boot, VN, Match-3 and persistence/localization/main-flow coverage on the Playwright `iPhone 13` device profile.

Each lane installs only the requested browser plus its Linux dependencies. The production Vite bundle is still built by the Playwright web server command and served through the G3 production-topology server.

On success or failure, the workflow uploads `playwright-report` and `test-results` for 14 days. Retained-on-failure traces and failure screenshots therefore remain available for diagnosis from GitHub Actions.

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

- QA Scene Navigation: focused VN cases.
- Match-3 Campaign: production campaign entry.
- Level Lab: deterministic mechanics.
- New Game / Continue / Settings: real-player persistence, localization and cross-system boundaries.

Playwright files use `*.pw.ts` so root Vitest never collects them.
