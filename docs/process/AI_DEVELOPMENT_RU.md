# UPDS — инструкция для AI/разработчика

## Before editing

1. Read `docs/architecture/PROJECT_CONTRACTS_RU.md`.
2. Read `docs/architecture/ARCHITECTURE_RU.md`.
3. Read the active feature document relevant to the task.
4. Use current repository `main` as baseline whenever possible.
5. Treat `docs/archive/` as history only.

## Source hierarchy

Narrative authority:

1. Story Bible;
2. 22-episode plot;
3. vertical-slice screenplay;
4. current runtime parser/tests.

Art authority:

1. approved model sheets;
2. golden samples;
3. current Art Bible;
4. existing production assets.

Raven Manor may be used as an **engineering donor/reference** for architecture, Match-3 interaction, storage, audio, PWA, diagnostics and QA patterns. Do not copy its gothic content, narrative, characters, room meta, asset names or save keys into UPDS.

## Safe implementation workflow

- Keep one feature/subfeature narrow enough to validate independently.
- Do not modify `.github/workflows/*` or `scripts/validate-upload-zip.py` in ordinary mobile feature ZIPs.
- Do not change protected narrative/rig contracts unless the task explicitly requires it.
- Prefer pure helpers for rules/decisions; keep DOM/API boundaries thin.
- Browser-only code must tolerate missing APIs in headless tests.
- Do not pin tests to a specific historical app version; compare against `APP_VERSION` / `package.json` when version matters.
- Do not write tests that merely require a historical implementation string if observable behavior can be tested directly.
- CSS/source-string assertions are acceptable only for a small number of presentation invariants that cannot be exercised in the current headless environment.

## Mobile archive rules

- Full project ZIP must have `package.json` at archive root.
- Do not include `.git`, `node_modules` or `dist`.
- Use a new filename (`R2`, `R3`, etc.) after any failed/cached upload.
- Ensure only one candidate ZIP is present under `incoming/`.
- Protected pipeline files must remain byte-for-byte identical to current `main`.

## PWA warning

Never broaden stable service-worker behavior into `/preview/`. Candidate QA must not be contaminated by stable caches.

## Completion definition

A change is ready for preview when:

- strict TypeScript passes;
- relevant unit/contracts pass;
- protected files are unchanged unless explicitly in scope;
- archive validator passes;
- GitHub importer completes clean `npm ci` + `npm run check`;
- manual iPhone preview verifies the feature.
