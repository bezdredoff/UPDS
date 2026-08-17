# UPDS browser E2E

ANM-023G1–G5 established the isolated Playwright package, production Pages topology smoke, VN navigation coverage and deterministic Match-3 coverage. ANM-023G6 adds persistence, localization and short real-player flow journeys. The GitHub Browser Gate itself remains ANM-023G7.

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
```

## G6 persistence contract

The campaign persistence test uses only visible player behavior:

`New Game → VN0002 → reload → Main Menu → Continue → VN0002`.

No browser test writes the campaign save directly. This verifies the real `AppSession → CampaignStore → localStorage → reload → MainMenuController.reload → Continue` path.

## G6 localization contract

The localization journey starts from the default locale, opens normal Settings, changes `[data-language-select]` to English, verifies immediate rerender/document language, returns to Main Menu, reloads the page, and verifies that the locale remains active.

The test does not seed the locale storage key. Production `LocalizationService` and `LocaleSettingsStore` own persistence.

## G6 short main-flow contract

The representative player flow begins at `#new`, not QA Scene Navigation:

`New Game → Scene 0 → Scene 1 → VN0040 → CHOICE_00 B → VN0057 → M3_00 intro → Start Match`.

It then reloads and verifies that `Continue` restores the same story Match-3 boundary.

The browser suite intentionally does not auto-solve the 24-move level. Production unit/static contracts already bind a successful `M3_00` completion to `VN_SCENE_02_E0_POST` starting at `VN0058`; browser-side forced completion would add a brittle test hook or a slow/flaky solver.

## Existing automation surfaces

- QA Scene Navigation: focused VN cases.
- Match-3 Campaign: production campaign entry.
- Level Lab: deterministic mechanics.
- New Game / Continue / Settings: real-player persistence, localization and cross-system boundaries.

Playwright files use `*.pw.ts` so root Vitest never collects them.
