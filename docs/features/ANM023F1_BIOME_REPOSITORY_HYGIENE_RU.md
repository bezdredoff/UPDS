# ANM-023F1 — Biome Expansion & Repository Hygiene

Status: R1 COMPLETE / merged via PR #137. No gameplay, story, localization, save-schema, balance or asset behavior changes.

## Goal

Turn Biome from a narrow source-only lint step into a repository-wide high-signal static-analysis gate, while removing concrete repository debris and avoiding a noisy blanket style migration.

## Baseline

Before F1:

- `biome.json` used `preset: none` with unused import/variable/parameter checks plus debugger/duplicate-object-key checks;
- `tests/` received only a separate `noFocusedTests` CLI invocation instead of the same baseline lint policy as `src`;
- `format:check` existed but was not authoritative;
- `scripts/__pycache__/validate-upload-zip.cpython-313.pyc` was tracked in git;
- `.gitignore` did not exclude Python bytecode/cache directories.

## R1 changes

### One lint surface

`npm run lint` becomes:

`biome lint src tests vite.config.ts`

Production code, tests and Vite configuration now share one Biome invocation. Test-domain rules live in `biome.json` instead of a second CLI-only policy; existing test-only unused-code debt is surfaced through a scoped warning override rather than promoted to a blocking migration inside F1.

### Blocking rules

The existing blocking rules stay enabled and F1 adds:

- `suspicious/noFocusedTests = error`;
- `suspicious/noDuplicateTestHooks = error`.

These are low-noise defects that should fail CI immediately.

### Advisory rules

For `tests/**/*.ts`, the existing unused import/variable/parameter rules are downgraded from production `error` to `warn` for the first unified baseline; concrete pre-existing findings belong to F2 cleanup. F1 also enables a first repository-wide diagnostic cohort as warnings:

- `suspicious/noFallthroughSwitchClause`;
- `suspicious/noExplicitAny`;
- `complexity/noUselessCatch`;
- `complexity/noUselessConstructor`;
- `performance/noAccumulatingSpread`.

Warnings deliberately do not fail CI in R1. They expose useful cleanup/refactor candidates without forcing suppressions or unrelated code changes. A later feature may promote an advisory rule only after the repository baseline is clean and the signal is proven useful.

### Safe-fix commands

- `npm run lint:fix` applies Biome's lint fixes;
- `npm run quality:fix` uses `biome check --write --formatter-enabled=false` to apply safe lint/assist actions without turning F1 into a repository-wide formatter migration.

`format:check` remains available but is not added to `npm run check` in R1. Formatting should become blocking only after a dedicated formatting baseline proves that it does not create a large unrelated diff.

### Repository hygiene

F1 removes the tracked Python bytecode cache and adds:

- `__pycache__/`;
- `*.py[cod]`;
- `.pytest_cache/`

to `.gitignore`. `RepositoryHygiene.test.ts` scans active production roots and fails if Python cache/bytecode or `.DS_Store` debris returns.

## Guardrails

- keep `preset: none`; do not blindly enable Biome `recommended`/`all`;
- blocking rules must be low-noise and actionable;
- advisory diagnostics are allowed to guide F2/F3 cleanup without failing the current production path;
- no mass source reformat in F1;
- GitHub CI remains authoritative;
- `package.json.version` remains `0.25.4-dev`.

## Exit condition

F1 is complete when GitHub CI confirms the unified Biome lint surface, repository hygiene regression test and all existing product tests/builds on the candidate branch. The next active maintenance feature is **ANM-023F2 — Test Suite Simplification**.
