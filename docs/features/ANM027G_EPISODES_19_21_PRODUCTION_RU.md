# ANM-027G — Episodes 19–21 Canonical Ending Batch

Status: **R1 IN QA**. Base: merged `ANM-027G 16–18 R1`.

## Scope

- canonical ending screenplay `VN0846–VN0964` (119 lines);
- ending slots `19–21` become authored and production-configured;
- six VN scenes `VN_SCENE_39_E19_PRE` through `VN_SCENE_44_E21_POST`;
- three production Match-3 routes `M3_19–M3_21`;
- `final-strategy` at common scene 38 becomes a data-driven branch rather than a temporary frontier;
- three terminal ending IDs: `ENDING_B_CASE_CLOSED`, `ENDING_A_FULL_TRUTH`, `ENDING_C_PERFECT_SUSPECT`;
- save schema remains 2; Ending A eligibility is derived from already persisted evidence and visible choices.

## Branch contract

The player-facing `final-strategy` options preserve their authored semantics rather than matching ending letters mechanically:

- option **A** → slot 19 / Ending B, private return and a formally closed case;
- option **B** → slot 20 / Ending A attempt, full Second Skin investigation;
- option **C** → slot 21 / Ending C, the convenient suspect presentation.

The full-truth route is selectable regardless of current metrics, but `ENDING_A_FULL_TRUTH` is awarded only at `Evidence ≥ 7`, `Team Trust ≥ 2`, `Source Trust ≥ 2`. If the route is attempted below the threshold, the outcome explicitly falls back to `ENDING_B_CASE_CLOSED`; the game never grants the best ending for guessing the final button.

## Canon beats

### 19 — «Вор пойман»

The club returns items through anonymous codes, respects owner privacy and reports only the thefts that are independently proven against Rina. The college can stamp the case closed; Kurose frames the remaining tags as a failed test. The last silver stitch on Emi's replacement uniform makes the closure deliberately incomplete.

### 20 — «Под прачечной»

The service key opens the tunnel/server route. The club preserves consent logs and a backup that distinguish Rina's thefts from Kurose's continued hidden data collection. Kurose offers to sacrifice Rina to preserve the project. With sufficient independent evidence and trust, the pilot is frozen, participants are notified and responsibilities are separated rather than collapsed into one culprit.

### 21 — «Идеальный подозреваемый»

The club builds the clean sponsor-ready answer the college wants by removing contradictions and presenting a convenient suspect. The accused is later cleared but reputation damage remains, while Kurose proceeds toward PHASE II. The ending intentionally rewards presentation success while making the truth cost visible.

## Production budget

No new binary assets or Match-3 mechanics. `anonymousReturnCounter`, `serviceTunnel`, `serverRoom` and `disciplinaryAssembly` are semantic aliases of existing background masters until the external art pipeline supplies approved replacements. `server-evidence` remains a native evidence treatment until its separately budgeted hero close-up exists.

## Final canonical boundary

After acceptance: **976 authored lines / slots 0–21 / 45 VN scenes / 22 Match-3 routes / 23 chapters / three terminal endings**. ANM-027G screenplay production is complete; the next content phase is **ANM-029 Full Localization Production**.
