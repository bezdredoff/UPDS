# ANM-017 · Validation Report

Version: `0.17.0-anm017`

## Scope

Playtest & Distribution Foundation поверх принятого ANM-016E:

- локальная telemetry + JSON export/clear;
- installable PWA;
- offline warm-cache;
- update flow;
- stable `/` / candidate `/preview/` service-worker isolation.

## Local PASS

- production strict TypeScript: PASS (`tsc --noEmit -p tsconfig.json`);
- 22 `tests/*.ts` syntax transpile: PASS;
- `public/sw.js` Node syntax: PASS;
- `manifest.webmanifest` JSON parse: PASS;
- PlaytestTelemetry executable smoke: PASS;
  - session persistence;
  - per-level summary;
  - median moves used;
  - offline/installed launch counters;
  - telemetry clear rotates session identity;
- PWA controller headless snapshot: PASS;
- service-worker scope isolation VM smoke: PASS;
  - stable worker does not intercept `/preview/*`;
  - preview worker handles its own scope;
- app icons: 180×180 / 192×192 / 512×512 PNG;
- package-lock dependency graph: UNCHANGED except two root version metadata fields;
- stale pinned app-version scan in `src/tests/package*.json`: no old build literals.

## Protected byte-exact vs accepted ANM-016E baseline

- `.github/workflows/ci.yml`;
- `.github/workflows/pages.yml`;
- `.github/workflows/import-zip.yml`;
- `scripts/validate-upload-zip.py`;
- `src/data/narrative.ts`;
- `src/data/levels.ts`;
- `src/data/characterRigs.ts`;
- `src/engine/Match3Game.ts`;
- `src/engine/CampaignStore.ts`;
- `src/content/ANM-003_Vertical_Slice_Screenplay.md`;
- existing `public/assets/**` production assets.

New PWA icons are isolated under `public/icons/**`; existing production art is not modified.

## npm environment limitation

`npm ci --ignore-scripts --offline` fails with `ENOTCACHED` for `why-is-node-running@2.3.0.tgz`. A normal online `npm ci` is unavailable in this sandbox, so full local `npm run check` is not claimed as PASS.

The mobile importer remains the authoritative clean gate: `npm ci --ignore-scripts` → `npm run check` before candidate branch/PR creation.
