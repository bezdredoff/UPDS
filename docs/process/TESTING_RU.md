# UPDS — test strategy

## Gate

Authoritative CI command:

```bash
npm ci --ignore-scripts
npm run check
```

`npm run check` runs tests and production build.

## Test categories

### Behavioral unit tests

Preferred. Test pure/data/engine functions directly:

- narrative parsing/branching;
- CampaignStore normalization/import/export;
- Match3Game rules/hints/frames;
- gesture decisions;
- VN paging/staging/playback;
- telemetry aggregation;
- audio settings/cues;
- platform safety.

### Render smoke

`UiSmoke.test.ts` verifies that major screens can render with a lightweight test root and missing browser capabilities without crashing.

### Presentation contracts

A small number of tests read CSS/UI source because no full browser layout runner is included. They protect only stable visual invariants such as:

- VN stage/dialogue geometry;
- two-line dialogue viewport;
- compact header presence;
- Match-3 feedback classes.

Do **not** add a new source-string test for every feature implementation detail. That caused brittle failures during ANM-016B refactors.

### Repository/pipeline contracts

- GitHub workflows remain read-only/write-separated as designed;
- repository root stays clean;
- version metadata stays consistent;
- protected save key remains unchanged.

## TypeScript hygiene

`strict`, `noUnusedLocals` and `noUnusedParameters` are enabled. Dead imports/parameters fail the build.

## Manual regression matrix

Minimum phone viewports:

- 320×568
- 375×667
- 390×844
- 393×852
- 430×932

Critical manual flows:

- new game / continue / save/load;
- all VN scenes + A/B/C choice;
- two-line paging / Large Text / AUTO / SKIP / LOG;
- all 4 Match-3 levels, drag/swipe/tap, invalid swap, hint, win/loss;
- Settings return-to-caller;
- audio foreground/background;
- telemetry export/clear;
- PWA stable/preview isolation and offline startup.

## Historical reports

Past validation and manual QA files are under `docs/archive/reports/`. They show what was tested at the time, not what the current implementation is required to look like.
