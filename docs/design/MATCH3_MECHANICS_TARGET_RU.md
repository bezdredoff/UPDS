# UPDS — Match-3 Mechanics Target Contract

Status: ANM-022A audit baseline.

## Purpose

Этот документ фиксирует целевой контракт Match-3 перед последующими атомарными изменениями.
ANM-022A не меняет gameplay/balance/level data.

## Что уже хорошо в UPDS и сохраняется

- 8×8 board и adjacent swap;
- invalid normal swap не тратит ход и визуально возвращается;
- один player move тратится до resolution; cascades не тратят дополнительные moves;
- engine resolution отделён от DOM animation timing;
- clear / settle / spawn / reshuffle представлены frame sequence;
- recursive activation существующих row/column specials;
- objective-aware manual hint;
- deterministic seeded board generation;
- dead-board reshuffle;
- blockers и ingredient-drop objectives;
- reduced-motion fallback;
- telemetry schema должна оставаться стабильной во время mechanic comparison cohort.

## Найденные gaps

### 1. Special taxonomy слишком узкая

UPDS: только `row | column`; любой line >=4 создаёт line special.
Нет отдельной награды за line-5, T/L и 2×2.

RavenManor reference:
- line-4 → Rocket;
- T/L → area Bomb/Rune;
- 2×2 → Raven;
- line-5+ → Prism;
- shape priority is explicit.

Цель UPDS: расширять special taxonomy отдельной фичей, не смешивая с balance pass.

### 2. Special creation during cascades

UPDS текущий `resolve()` создаёт specials на каждой cascade iteration.
RavenManor deliberately creates specials only from first player-created resolution, while cascades may activate existing specials.

Target для первого UPDS pass: принять Raven-like правило `player-resolution only`.
Причина: меньше runaway generation, читаемее причинно-следственная связь, проще balance.

### 3. Direct special combinations

UPDS: swap с special активирует участвующие specials; recursive line effects есть, но bespoke pair semantics отсутствуют.

Target staged implementation:
- row/column + row/column → cross;
- line + area → expanded cross;
- area + area → larger area;
- prism + normal → clear selected tile type.
Unsupported pairs должны иметь явный deterministic fallback.

### 4. Available-move consistency

Сейчас `getHintMove()` считает swap, содержащий special, потенциально валидным.
`hasAvailableMove()` проверяет только обычный resulting match.

Target: один shared `isPlayableSwap` / simulation contract для:
- actual move;
- hint;
- dead-board detection.

Это предотвращает reshuffle при наличии реально активируемого special move.

### 5. Feedback semantics

Текущий runtime:
- ordinary first clear → MATCH;
- cascade 2+ → CHAIN ×N;
- activated special → special feedback.

Creation of match-4/match-5/strong shape itself does not receive a distinct player-skill message.

Target vocabulary must distinguish:
- **MATCH** — ordinary 3;
- **COMBO** / special-created feedback — strong player-created shape;
- **CHAIN ×N** — automatic cascade depth;
- special activation/combinations — their own feedback.

Важно: COMBO и CHAIN — разные concepts. Combo describes the player's strong authored move/combination; Chain describes automatic cascade continuation.

Final naming/localization may be tuned during implementation, but semantic categories are fixed here.

### 6. Interaction polish

UPDS already has pointer drag preview, commit threshold, invalid return and click accessibility fallback.
RavenManor additionally proved useful:
- direct double-tap activation of special;
- any-special drag activation;
- automatic objective-aware hint after five seconds;
- hint timer reset on any board/user activity;
- differentiated telemetry source.

Target: adopt only after engine shared-playable-swap contract is stable.

## Proposed atomic implementation order

### ANM-022B — Shared Move Legality ✅
Create one legality/simulation path used by attempt, hint and dead-board detection.
No new specials, no balance change.

### ANM-022C — Feedback Semantics
Separate MATCH / COMBO / CHAIN / SPECIAL semantics using existing mechanics first.
No move-budget changes.

### ANM-022D — Special Shape Taxonomy
Add area/prism-style special kinds and player-resolution-only creation priority.
No special-special combos yet.

### ANM-022E — Special Combination Matrix
Implement a small explicit combo matrix and deterministic unsupported fallback.

### ANM-022F — Interaction Guidance
Auto hint after inactivity + direct special activation polish + telemetry source differentiation.

### ANM-023 — Balance
Only after ANM-022 mechanics settle:
moves, objectives, difficulty curve, spawn/special frequency.

### ANM-024 — Structured Playtest
Stable mechanics + stable telemetry cohort; exported JSON comparison and full-slice playthrough.

## Non-goals of ANM-022A

- no level move/objective tuning;
- no new art requirement;
- no save migration;
- no screenplay/localization content changes;
- no new booster/meta systems;
- no animation overhaul.
