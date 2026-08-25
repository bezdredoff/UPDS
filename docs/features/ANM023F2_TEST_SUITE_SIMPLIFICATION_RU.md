# ANM-023F2 — Test Suite Simplification

Status: R1 COMPLETE / PR #138 / main `5ff24db25b7a9d865e508a4aa5278d5483926f4b`. No gameplay, story, localization content, save-schema, balance or asset behavior changes.

## Goal

Reduce maintenance cost and test startup/reading surface without weakening production contracts. F2 removes lifecycle-batch duplication that accumulated during Belarusian production, closes the two test-only Biome warnings exposed by F1 and turns the clean high-signal Biome cohort into a blocking gate.

## Baseline after merged F1

GitHub CI #276 on ANM-023F1 / PR #137 established a clean functional baseline:

- 110 `*.test.ts` files;
- 529 passing tests;
- one authoritative `npm run check` path;
- exactly two Biome warnings, both test-only dead code:
  - unused `characterForSpeaker` / `placeholderForSpeaker` imports in `ExpressionFrameContract.test.ts`;
  - unused `neighbours` helper in `Match3MoveLegality.test.ts`;
- no findings from the F1 advisory `noFallthroughSwitchClause`, `noExplicitAny`, `noUselessCatch`, `noUselessConstructor` or `noAccumulatingSpread` cohort.

## R1 changes

### Belarusian tests: lifecycle batches → domain contracts

The completed Belarusian production line no longer needs one permanent test file per historical translation batch.

F2 replaces 23 Belarusian test files with three current domain suites:

- `BelarusianCompletionLocalization.test.ts` — global 3855/3855 base parity after lean blocker-alias cleanup, 61-key shell contract, runtime readiness, screenplay directives, final routes and Russian-only Cyrillic guard;
- `BelarusianMatch3Localization.test.ts` — exact historical Match-3 slice counts `83 / 123 / 128 / 146`, full `480 + 132 = 612` surface and reviewed terminology/protected labels;
- `BelarusianVnLocalization.test.ts` — all 16 historical VN slot selectors remain explicit and data-driven, preserving their exact key counts, 149 representative copy/payload assertions, 45 scene-boundary assertions, four transition assertions and three explicit choice-gate assertions.

The old per-slot/per-batch files were useful while content was arriving independently. After B4 completion they duplicated the same catalog-audit and runtime-status setup. F2 removes that duplication while retaining the unique contracts as data.

Repository-level result: 110 → 90 `*.test.ts` files.

Historical ANM-029 feature documents may still name the test file that existed when that batch shipped. They remain delivery history; current executable authority is the three domain suites above plus the focused scripts in `package.json`.

### Focused localization commands

`localization:be:audit` now runs exactly the three Belarusian domain suites.

`localization:audit` keeps the broader production/global localization contracts, but references the domain suites instead of 22 retired batch/slot files.

### F1 warning closure and Biome promotion

The two F1 warnings are removed rather than suppressed.

Because the merged F1 baseline produced zero findings for the advisory cohort, F2 promotes the following rules from warning to error:

- `noFallthroughSwitchClause`;
- `noExplicitAny`;
- `noUselessCatch`;
- `noUselessConstructor`;
- `noAccumulatingSpread`.

The `tests/**/*.ts` unused-code warning override is removed. `noUnusedImports`, `noUnusedVariables` and `noUnusedFunctionParameters` are blocking for both production and tests.

This keeps the staged Biome rollout evidence-based: rules become blocking only after the repository demonstrates a clean baseline.

## Preserved contracts

F2 intentionally preserves:

- complete RU ↔ BE catalog parity and placeholders;
- all 132 Belarusian Match-3 reactions;
- runtime-selectable `ru / be / en` production state;
- every existing VN slot key-count boundary from B3A–B3P;
- representative reviewed Belarusian names/terminology;
- exact screenplay payloads/directives used by the previous slot tests;
- canonical scene ranges, selected transitions and choice checkpoints;
- the full existing non-localization test suite.

The success metric is lower test-code/file surface and cleaner static analysis, not an arbitrary reduction in assertions.

## QA

Authoritative acceptance remains GitHub CI:

1. `npm run lint` must finish with zero errors; after F2 the known F1 test warnings must also be gone;
2. full Vitest suite must pass;
3. production TypeScript/Vite build must pass;
4. focused `npm run localization:be:audit`, `npm run localization:audit` and `npm run tooling:audit` must remain valid;
5. no visual/mobile QA is required because F2 changes no runtime behavior.

## Next

ANM-023F2 is merged. ANM-023F3 is now the active track: bounded runtime/controller simplification in measured hotspots, with behavior-preserving cuts and mobile preview QA for runtime-touching changes.
