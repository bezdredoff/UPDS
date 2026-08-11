# ANM-016D — Validation Report

Version: `0.16.8-anm016d`

## Scope

Unified high-contrast header/navigation contract on top of the accepted ANM-016B R6 + ANM-016C R2 build.

## Implemented

- shared `headerActionMarkup` and `panelHeaderMarkup`;
- shared `.app-header`, `.app-header-actions`, `.app-header-action`, `.app-header-title`;
- dark navy header with white icons and gold boundary;
- Settings + Main Menu access in VN, choice, Match intro/board, loss result, ending and utility panels;
- contextual LOG/DOSSIER/Back;
- VN bottom controls reduced from five to four by removing duplicate CONFIG;
- VN header Settings opens existing reading/audio config overlay;
- context-aware full Settings screen returns to the calling screen;
- active Match-3 Menu exit protected by confirmation.

## Local checks

- `tsc -p tsconfig.json --noEmit`: PASS
- ANM-016D static navigation/contrast contract: PASS
- stale pinned version scan in `src/tests/package*.json`: PASS (none)
- project scope diff vs ANM-016B R6 restricted to app UI/CSS/tests/version/docs
- workflows / validator / narrative / screenplay / levels / rigs / Match3 / CampaignStore / assets: expected BYTE-EXACT (rechecked before packing)
- package-lock dependency graph: UNCHANGED; only root version metadata changed
- pre-pack ZIP validator: PASS (215 entries; 9,780,737 bytes uncompressed)

## npm environment

`npm ci --ignore-scripts --offline` returns `ENOTCACHED` for `why-is-node-running@2.3.0.tgz`; therefore full Vitest/Vite cannot be run locally. The GitHub importer remains the authoritative clean `npm ci -> npm run check` gate.
