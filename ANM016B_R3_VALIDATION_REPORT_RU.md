# ANM-016B R3 — Validation Report

Version: `0.16.4-anm016b-r3`

## Scope

Замена word/character-count heuristic как browser source of truth на render-measured pagination. ANM-016C R2 stage/dialogue seam и nameplate layering сохранены.

## Реализованный контракт

- authored VN IDs не меняются;
- внутренняя пагинация остаётся `VNxxxx · 1/N ... N/N`;
- `save.line` и `readLines` меняются только после последней внутренней страницы;
- browser runtime измеряет реальный `.dialogue-text` через `scrollHeight/clientHeight` и `scrollWidth/clientWidth`;
- оставлен 1px measured safety reserve плюс 4px внутреннего bottom padding для descenders;
- locale берётся из `<html lang>`;
- `Intl.Segmenter` используется capability-based без поднятия TypeScript target выше ES2020;
- при отсутствии Segmenter: sentence/word/grapheme fallback;
- reflow выполняется на `resize`, `orientationchange` и после `document.fonts.ready`;
- deterministic ANM-016B R2 budget остаётся только headless/non-DOM fallback.

## Проверки

- `npx tsc -p tsconfig.json --noEmit`: PASS
- measured multilingual executable smoke: PASS
  - ru: sentence-aware split, no content loss
  - de: oversized compound-token fallback, no content loss
  - ja: no-whitespace/grapheme path, no content loss
  - en: full line stays one page when measured viewport accepts it
- ANM-016B R2 sentence-boundary fallback regression: PASS
- workflows + ZIP validator vs ANM-016C R2: BYTE-EXACT
- narrative / levels / rigs / Match3 / CampaignStore / screenplay: BYTE-EXACT
- `public/assets/**`: BYTE-EXACT
- stale pinned app-version literals in src/tests/package metadata: NONE

## npm environment

`npm ci --ignore-scripts --offline` cannot complete in the sandbox because `why-is-node-running@2.3.0.tgz` is not available in the local npm cache (`ENOTCACHED`). Therefore full Vitest + Vite build is intentionally left to the GitHub importer, which remains the authoritative clean-install gate.
