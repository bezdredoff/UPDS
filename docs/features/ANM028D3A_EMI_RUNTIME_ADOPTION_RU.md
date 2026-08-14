# ANM-028D3A R1 — Emi Approved Frames Runtime Adoption

Status: **candidate / iPhone QA required**.  
Baseline: `main` commit `4c1cadabeee859705b40056da53ca0d62fea4ba7` (ANM-028D3 R1 / PR #100).

## Product decision

Character-art production is paused while the remaining character work moves to an external Stable Diffusion workflow.
The already accepted Emi frames must not stay hidden behind the rejected legacy runtime set, so this slice adopts the
four approved Pose A frames into playable VN immediately:

- `neutral` → `anm028d0-r1`;
- `smile` → `anm028d1-r1`;
- `serious` → `anm028d2-r1`;
- `surprised` → `anm028d3-r1`.

`embarrassed`, Pose B and the medallion intentionally remain on the existing rig until replacements are supplied.
No generated image is modified by this slice.

## Runtime contract

A narrow `upds-character-runtime-override-v1` layer lives in
`src/data/characterRuntimeOverrides.ts`. It overrides only an expression asset and the matching measured frame
geometry. The complete seven-asset `upds-character-production-v2` manifest remains intact as the fallback set and is
not rewritten into an incomplete production package.

The four adopted frames share:

- canvas `1024×1536`;
- alpha bounds `330,80,737,1508`;
- eye line `y=244`;
- bottom padding `28 px`.

`expressionAsset()` resolves the override first and falls back to the legacy rig for every expression without an
explicit override. Shared scene staging resolves the same override geometry, so Scene Studio runtime guides cannot
show the old `397 px` Emi eye line while rendering a new frame.

## Why the fallback files remain

The old rig is deliberately retained during this transition:

- current authored lines still request `embarrassed`;
- Pose B and medallion have no accepted replacements yet;
- rollback remains deterministic;
- the full-stage seven-asset validator does not need fake or duplicated assets.

When the Stable Diffusion replacement family is complete, a later atomic cleanup removes this override layer and
promotes the final seven-asset set into the canonical rig.

## Automated gate

`tests/CharacterRuntimeOverrides.test.ts` verifies:

1. exactly the four intended Emi expressions resolve to the accepted D0–D3 assets;
2. `embarrassed` still resolves to the legacy rig;
3. runtime duo/trio staging uses `330,80,737,1508` and eye line `244` for adopted Emi frames;
4. adopted frames report approved frame-level visual status without changing the full legacy rig status.

## iPhone QA

On `/preview/`:

1. start a new game and confirm Emi's first `ВСТРЕВОЖЕННАЯ` appearance uses the new surprised frame;
2. continue through the early Emi dialogue and confirm `НЕРВНАЯ` / `СМУЩЁННАЯ` still use the old embarrassed fallback without missing images;
3. open Scene Studio, select `runtime`, then check Emi in a two-shot: image, alpha guide and eye guide must match the new frame (`330,80,737,1508`, `y=244`);
4. verify no double face, halo, top-lock regression or missing preload image;
5. confirm Miku/Onoe/Ayuki are unchanged.

This slice does not resume character-art production and does not create ANM-028D4.
