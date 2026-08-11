# ANM-018 · Repository & Maintenance Refactor

## Цель

Снизить стоимость дальнейшего расширения vertical slice без изменения пользовательского поведения игры.

## Repository cleanup

- historical feature README files moved from root to `docs/archive/releases/`;
- historical validation/manual QA files moved to `docs/archive/reports/`;
- superseded ANM-016 implementation notes moved to `docs/archive/feature-notes/`;
- active documentation split into `architecture/`, `process/`, `features/`;
- obsolete root `CHECK_COMMANDS.txt` removed; commands live in `docs/process/TESTING_RU.md` and `package.json`;
- unused `scripts/balance-probe.ts` removed because current balance workflow is telemetry-driven and the script was not executable from package scripts.

## Code cleanup

- shared escaping/icon/header markup extracted from `AnimeDetectiveApp.ts` into pure `src/ui/viewMarkup.ts`;
- unused `BUILD_ID` import removed from PWA controller;
- `strict + noUnusedLocals + noUnusedParameters` is now an explicit TypeScript contract;
- feature-history comments in production CSS were changed to semantic section labels;
- no narrative, Match-3 rules, save format, PWA behavior or assets were intentionally changed.

## Test cleanup

Historical source-string suites were consolidated into current semantic suites:

- `NarrativeContract` owns scene order/choice/finale/transitions;
- `VnPlayback` owns LOG/SKIP/AUTO behavior;
- `VnPresentation` owns the small unavoidable CSS/markup presentation contract;
- `VnDialoguePaging` owns current fallback/measured/localisation/balancing behavior;
- `Match3Presentation` owns current motion/feedback presentation invariants;
- `ViewMarkup` directly tests the extracted shared header markup;
- `RepositoryHygiene` protects root cleanliness, version/save-key and TypeScript hygiene.

The test suite no longer contains separate R3/R4/R5 presentation test files whose main purpose was to assert superseded implementation strings.

## Documentation source of truth

Start at `docs/README.md`. Archived files are traceability only and must not override active architecture/process/feature docs.
