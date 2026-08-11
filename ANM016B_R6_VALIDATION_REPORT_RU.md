# ANM-016B R6 — Validation Report

Version: `0.16.7-anm016b-r6`

## Scope

Two-line balanced render-measured VN dialogue paging. Built on R5 while preserving ANM-016C R2 visual seam/nameplate fixes.

## Implemented contract

- `.dialogue-text` reserves two rendered lines plus padding and a safety buffer;
- measured pagination only activates when the viewport geometry can physically hold approximately two lines;
- render-measured fit remains the browser runtime source of truth;
- every non-final internal page displays a presentation-only `…`;
- the continuation marker is included in the fit predicate, so it cannot push an otherwise fitting page onto a third/clipped line;
- split priority: sentence → word → grapheme only as a last resort;
- whitespace languages prefer a 4-word continuation and enforce a 3-word hard floor when the layout permits rebalancing;
- ja/zh/ko use locale-aware grapheme thresholds instead of whitespace word counts;
- short tails are rebalanced backwards across page boundaries when the target page still fits;
- page boundaries next to opening/closing punctuation are rejected;
- whitespace-language word segmentation preserves original punctuation/operator tokens, avoiding invented spaces inside quoted words or variable expressions;
- authored `VNxxxx`, `save.line`, `readLines`, LOG, SKIP and choice semantics are unchanged.

## Local checks

- `tsc -p tsconfig.json --noEmit`: PASS
- TypeScript syntax, `src + tests` (46 `.ts` files): PASS
- R3 regression smoke RU/DE/JA: PASS
- R6 continuation ellipsis smoke: PASS
- R6 Russian 3-word orphan-tail floor smoke: PASS
- R6 Japanese no-space round-trip + punctuation smoke: PASS
- authored screenplay extraction: 262 rows
- proxy paging audit across all 262 authored rows at 60/68/76-character synthetic fit thresholds: round-trip PASS, punctuation-boundary violations 0, continuation orphan tails 0
- workflows / validator / narrative / screenplay / levels / rigs / Match3 / CampaignStore: BYTE-EXACT to R5
- `public/assets/**`: BYTE-EXACT to R5
- package-lock dependency graph: UNCHANGED (only root version metadata changes)

## npm environment

`npm ci --ignore-scripts --offline` cannot complete in this sandbox because `why-is-node-running@2.3.0.tgz` is not present in the local npm cache (`ENOTCACHED`). Full Vitest + Vite build therefore remains the authoritative GitHub importer gate.
