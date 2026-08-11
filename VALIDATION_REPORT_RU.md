# VALIDATION REPORT — ANM-014

**Build:** `0.14.0-anm014`  
**Feature:** Match-3 Pre-release UX + Feedback  
**Baseline:** merged ANM-013 (`0.13.0-anm013`)

## Scope

ANM-014 changes presentation/feedback and hinting for the existing four match-3 levels without changing `levels.ts`, move budgets, screenplay, stable VN IDs, save key, character rigs or GitHub pipeline.

## Implemented

- objective-aware `Match3Game.getHintMove()` that evaluates only legal adjacent swaps and does not mutate game state;
- immutable successful-move visual frames: `swap`, `clear`, `settle`, optional `reshuffle`;
- visible invalid-swap reject feedback without spending a move;
- cascade/special/reshuffle/win/loss feedback;
- input remains locked during the visual transaction;
- reduced-motion path skips animation waits while retaining final information;
- Match-3 HUD aligned toward the approved `2000s Hybrid` Golden Sample using existing runtime assets only;
- cream/green case HUD, framed navy board, detective medallions and hint tray;
- regression tests for hint non-mutation, move frames and presentation contract.

## Checks actually executed in this session

### PASS — TypeScript strict

```text
tsc -p tsconfig.json --noEmit
exit 0
```

### PASS — executable engine smoke

Compiled `levels.ts` + `Match3Game.ts` with strict TypeScript into a temporary CommonJS harness and executed 25 deterministic seeds for each of the 4 levels.

Result:

```text
ANM-014 100-seed hint/trace smoke: PASS (100)
```

For every checked board:

- hint existed;
- hint did not change board or move count;
- hinted swap was legal;
- successful move returned `swap`, `clear` and `settle` frames;
- every frame contained exactly 64 cells.

### PASS — protected project contracts

Byte-for-byte unchanged from ANM-013:

```text
src/data/narrative.ts
src/data/levels.ts
src/data/characterRigs.ts
src/content/ANM-003_Vertical_Slice_Screenplay.md
```

Save key remains `seiran-detectives-anm009-v1`.

### PASS — protected mobile pipeline bytes

The following files were copied from the current GitHub `main` / known-good merged baseline rather than regenerated:

```text
.github/workflows/ci.yml
.github/workflows/pages.yml
.github/workflows/import-zip.yml
scripts/validate-upload-zip.py
```

Current hashes in the candidate source:

```text
ci.yml          4baf2d504f13e535f3a2229fbac3054c732fca3e7f3cfe99514032b90236ede4
pages.yml       17f9d4aca99bf62f3b242eb2f14e4e99ac87bedebfb7aa675763f6bb6cd0007c
import-zip.yml  e0db0e61bf225679746c3740a017b9d9bcb2f863b4d6a8cd414d2134bdd21865
validator       47c958990d8d9463b8c94df46c237117eca4864f5fffe820a395d5a5b5017f49
```

This specifically protects against the previous newline/byte-difference failure.

### PASS — version-regression prevention

New tests compare `APP_VERSION` with `package.json.version` dynamically. They do not pin ANM-013/ANM-014 version literals as a permanent test contract.

## Full `npm run check`

**NOT VERIFIED locally.**

`npm ci --ignore-scripts --offline` cannot complete because this sandbox npm cache does not contain:

```text
why-is-node-running-2.3.0.tgz
```

Therefore Vitest/Vite PASS is intentionally not claimed here. The authoritative clean run is the read-only GitHub mobile-import validation job:

```text
npm ci --ignore-scripts
npm run check
```

## Manual iPhone QA for `/preview/`

1. Open M3_00 and verify the cream/green HUD, framed board and bottom detective/hint tray.
2. Verify tap+tap and swipe in all four directions.
3. Make an invalid adjacent swap: move count must not decrease and reject feedback must appear.
4. Press `ПОДСКАЗКА`: exactly two adjacent cells should highlight.
5. Execute the highlighted swap and confirm it is legal.
6. Verify staged `swap → clear → settle` feedback and that a second board move is ignored during the transaction.
7. Observe a 2+ cascade and special activation when available.
8. Confirm objective counters update to the final move result.
9. If a dead board occurs, verify `ПОЛЕ ПЕРЕМЕШАНО`.
10. Verify win/loss transitions still route to the existing result flows.
11. Repeat representative interaction with iOS Reduce Motion enabled.
12. Check compact layout at a small viewport / older iPhone if available.

## Known limitations

- Hint is a deterministic objective-priority heuristic, not a full multi-turn solver.
- Engine computes the entire move synchronously; visual frames are immutable snapshots of that result rather than asynchronous engine execution.
- No sound or haptics yet.
- Balance and level data are intentionally unchanged.
