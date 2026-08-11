# ANM-016B Validation Report

Version: `0.16.2-anm016b`

## Scope

VN dialogue text fit and adaptive internal paging only.

## Automated/static checks

- strict TypeScript source compile: PASS
- R2 sentence-boundary regression (exact minimum natural cut): PASS
- full screenplay pagination audit across supported viewport profiles: PASS
- authored text round-trip (no dropped/reordered words): PASS
- maximum generated pages for current screenplay: 2
- screenplay / narrative IDs: unchanged
- character staging assets: unchanged
- Match-3 engine/data: unchanged
- save key/schema: unchanged
- GitHub workflows/ZIP validator: unchanged from ANM-016A baseline

## Paging audit snapshot

- 320×568 normal: 11 / 262 authored rows split; max 2 pages
- 320×568 large: 45 / 262 split; max 2 pages
- 375×667 normal: 3 / 262 split; max 2 pages
- 390×844 normal: 0 / 262 split
- 390×844 large: 3 / 262 split; max 2 pages
- 430×932 normal: 0 / 262 split

All generated pages remained within their profile word/character budgets.

## Environment note

A clean local `npm ci && npm run check` is not claimed unless dependencies are available in the sandbox. GitHub importer remains the authoritative clean install + Vitest + build gate.
