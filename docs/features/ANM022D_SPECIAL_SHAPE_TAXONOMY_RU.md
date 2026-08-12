# ANM-022D — Special Shape Taxonomy

Build: `0.22.0-anm022d`.

## Creation priority

Only the first player-authored resolution may create a special.
Automatic cascades may activate existing specials but do not create new ones.

Priority:
1. line-5+ → `prism`;
2. T/L overlap → `area`;
3. player-created 2×2 → `raven`;
4. line-4 → directional `row` / `column`.

A 2×2 involving a swapped tile is a legal player move even without a normal match-3.
No-op swaps of equal ordinary tiles do not qualify through a pre-existing square.

## Effects in 022D

- row → whole row;
- column → whole column;
- area → 3×3;
- raven → orthogonal neighbours + one deterministic useful remote tile, preferring unfinished collect objectives;
- prism → all ordinary tiles matching the prism's retained base tile.

This prism behavior is intentionally standalone. `Prism + normal` as a direct combination belongs to ANM-022E.

## Presentation

No new image generation is required.
All specials reuse the existing observation asset and receive distinct CSS classes and accessible localized labels.
Dedicated production art can replace this presentation later without changing engine semantics.

## Excluded

- special-special combination matrix;
- Prism + normal direct combo;
- balance tuning;
- move/objective changes;
- save migration;
- new boosters.

Next: ANM-022E — Special Combination Matrix.
