# ANM-018A — Validation Report

Build: `0.18.1-anm018a`.

## Scope

Behavior-neutral decomposition of the UI orchestrator. No intentional gameplay/content/visual/PWA/save changes.

## Structural result

- `src/ui/AnimeDetectiveApp.ts`: 1510 → 114 lines;
- VN ownership: `src/features/vn/VnController.ts` — 522 lines;
- Match-3 ownership: `src/features/match3/Match3Controller.ts` — 680 lines;
- small controllers: menu/settings/diagnostics/dossier/ending;
- shared app seams: `AppSession`, `AppShell`, `AppNavigation`;
- shared audio/PWA settings markup: `ui/systemControls.ts`.

VN and Match-3 controllers have no direct imports of one another.

## Automated/local checks

- strict TypeScript + `noUnusedLocals` + `noUnusedParameters`: PASS;
- all 20 test files TypeScript syntax/transpile: PASS;
- direct headless UI smoke: PASS (menu, VN rig, settings, diagnostics, 8×8 Match-3 board);
- direct compact VN paging smoke: PASS (`VN0001` 1/2 → 2/2 → authored line advance, read/save semantics preserved);
- architecture/source contracts: PASS;
- documentation relative links: checked before final packaging;
- final ZIP validator: checked after packaging.

Full Vitest/Vite is intentionally left to the GitHub importer because the local sandbox does not have a complete clean npm dependency cache/runtime install.

## Byte-exact protected scope vs ANM-018

Unchanged:

- `.github/workflows/*`;
- `scripts/validate-upload-zip.py`;
- screenplay;
- `src/data/narrative.ts`;
- `src/data/levels.ts`;
- `src/data/characterRigs.ts`;
- `src/engine/CampaignStore.ts`;
- `src/engine/Match3Game.ts`;
- `src/style.css`;
- baseline `public/**`, including service worker and manifest.

`package-lock.json` dependency graph is unchanged; only project version metadata changes.
