# ANM-018 — Validation Report

Build: `0.18.0-anm018`

## Scope

Repository/documentation/test maintainability refactor. No intentional gameplay/content/art/balance/PWA behavior change.

## Repository cleanup

- root Markdown files: 40 → 1;
- historical release notes moved to `docs/archive/releases/`;
- validation/manual QA snapshots moved to `docs/archive/reports/`;
- superseded ANM-016 implementation notes moved to `docs/archive/feature-notes/`;
- active docs reorganized under architecture/process/features;
- `CHECK_COMMANDS.txt` removed;
- unused/non-package-runnable `scripts/balance-probe.ts` removed.

## Code/test cleanup

- shared escaped header markup extracted to `src/ui/viewMarkup.ts`;
- unused PWA `BUILD_ID` import removed;
- `noUnusedLocals` + `noUnusedParameters` enabled;
- test files: 22 → 20;
- test lines: 1374 → 1140;
- tests directly reading source files: 9 → 2;
- historical VN R3/R4/R5 source-string audits consolidated into current contracts.

## Local validation

- strict TypeScript + noUnused: PASS;
- all `src` and `tests` TypeScript syntax transpilation: PASS;
- active Markdown relative-link audit: PASS (66 Markdown files including README at final validation);
- package-lock dependency graph excluding expected version fields: UNCHANGED;
- repository-root hygiene: PASS;
- no `node_modules`, `dist`, `.git` intended in artifact.

## Byte-exact vs ANM-017 baseline

PASS:

- `.github/workflows/*`;
- `scripts/validate-upload-zip.py`;
- `src/content/ANM-003_Vertical_Slice_Screenplay.md`;
- `src/data/narrative.ts`;
- `src/data/levels.ts`;
- `src/data/characterRigs.ts`;
- `src/engine/CampaignStore.ts`;
- `src/engine/Match3Game.ts`;
- `public/assets/**`;
- `public/sw.js`;
- `public/manifest.webmanifest`.

## Full npm gate

Local clean `npm ci --offline --ignore-scripts` cannot complete because the sandbox npm cache does not contain `why-is-node-running@2.3.0.tgz`. Therefore full Vitest + Vite build must be treated as authoritative only after the GitHub importer executes `npm ci --ignore-scripts` and `npm run check`.
