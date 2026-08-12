# ANM-022E — Narrative Special Combination Matrix

Build: `0.22.0-anm022e-r1`.

## Matrix

Production names:
- Flash = `flash-row` / `flash-column`;
- Evidence = `evidence`;
- Lead = `lead`;
- Insight = `insight`.

Direct swap rules:
- Flash + Flash → cross: whole row + whole column;
- Flash + Evidence → expanded cross: 3 rows + 3 columns;
- Evidence + Evidence → 5×5 area;
- Lead + Flash → cross + Lead objective-aware target;
- Lead + Evidence → 5×5 area + Lead objective-aware target;
- Insight + normal tile → clear every tile of the partner base type;
- Insight + any special → clear every tile of partner base type and activate both swapped cells;
- unsupported pair → deterministic fallback: both swapped specials activate through normal effects.

## Protected contracts

- one direct combo costs one move;
- combo expansion happens only on first resolution;
- cascades still do not create new specials;
- ANM-022D R1.3 2×2 Lead behavior remains unchanged;
- no level, move-budget, scoring or objective tuning;
- no new art required;
- feedback remains SPECIAL for direct special activation.

## Next

ANM-022F — Interaction Guidance.
