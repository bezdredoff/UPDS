# ANM-022A — Match-3 Mechanics & Feedback Audit

Build: `0.22.0-anm022a`.

## Scope

Documentation/contract feature. Gameplay behavior intentionally unchanged.

Compared:
- current UPDS `Match3Game` + `Match3Controller`;
- RavenManor Match-3 design;
- RavenManor FEATURE-048 Special Tiles;
- RavenManor FEATURE-078 Interaction Polish.

## Main findings

1. UPDS foundation is already suitable for incremental production work: deterministic engine, frames, objective-aware hints, motion, blockers, ingredients, telemetry and reshuffle.
2. Current special model is only row/column and does not differentiate strong match shapes.
3. UPDS currently permits special creation inside automatic cascades; RavenManor intentionally prevents it.
4. Hint and dead-board logic disagree about whether a special-containing swap is playable.
5. `MATCH / CHAIN / SPECIAL` feedback describes resolution events, not player-created move strength. This explains why match-4/5 feel like ordinary MATCH.
6. RavenManor's full combo matrix is useful as a reference but should not be copied in one large PR.

## Decision

ANM-022 is split into B–F:
- B shared legality;
- C feedback semantics;
- D special taxonomy;
- E special combinations;
- F interaction guidance.

ANM-023 remains balance-only and ANM-024 remains structured playtest.

## Character-production status

ANM-021 is not deleted. Emi is production-integrated through R6.1.
Kentaro/Norihiro/Mayu are temporarily deferred because new visual assets require a currently unreliable image-generation path.
The production contract is now precomposed expression frames + R5 virtual-camera staging, not the legacy face-overlay contract.

## Protected contracts

ANM-022A does not alter:
- Match3Game behavior;
- levels or move budgets;
- save schema/key;
- telemetry event schema;
- localization catalogs;
- VN;
- character runtime.
