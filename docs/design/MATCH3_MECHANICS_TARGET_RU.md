# UPDS — Match-3 Mechanics Target Contract

Status: ANM-022 mechanics contract; ANM-022B–F implemented.

## Purpose

Этот документ фиксирует целевой контракт Match-3 механик, сформированный в ANM-022A и реализованный атомарными изменениями ANM-022B–F.
Он не является production roadmap: дальнейшая нумерация и порядок работ принадлежат `docs/ROADMAP_RU.md`.

## Что уже хорошо в UPDS и сохраняется

- 8×8 board и adjacent swap;
- invalid normal swap не тратит ход и визуально возвращается;
- один player move тратится до resolution; cascades не тратят дополнительные moves;
- engine resolution отделён от DOM animation timing;
- clear / settle / spawn / reshuffle представлены frame sequence;
- recursive activation существующих specials;
- objective-aware hint;
- deterministic seeded board generation;
- dead-board reshuffle;
- blockers и ingredient-drop objectives;
- reduced-motion fallback;
- telemetry schema должна оставаться стабильной во время mechanic comparison cohort.

## Зафиксированные механические решения

### 1. Special taxonomy

Целевая taxonomy:
- line-4 → Flash;
- T/L → Evidence-style area special;
- 2×2 → Lead;
- line-5+ → Insight;
- shape priority is explicit.

Special taxonomy развивается отдельно от balance pass.

### 2. Special creation during cascades

Новые specials создаются только из первого player-created resolution.
Cascades могут активировать уже существующие specials, но не создают новые.

Причина: меньше runaway generation, читаемее причинно-следственная связь, проще balance.

### 3. Direct special combinations

Явная deterministic combination matrix покрывает поддерживаемые пары, включая:
- Flash + Flash → cross;
- Flash + Evidence → expanded cross;
- Evidence + Evidence → larger area;
- Lead combinations → objective-aware Lead target;
- Insight + normal → clear selected tile type;
- Insight + special → clear partner base type + activate both swapped cells.

Unsupported special pairs используют deterministic fallback.

### 4. Available-move consistency

Один shared legality/simulation contract используется для:
- actual move;
- hint;
- dead-board detection.

Это предотвращает reshuffle при наличии реально активируемого special move.

### 5. Feedback semantics

Semantic vocabulary различает:
- **MATCH** — ordinary 3;
- **COMBO** / special-created feedback — strong player-created shape;
- **CHAIN ×N** — automatic cascade depth;
- special activation/combinations — собственную special feedback category.

Важно: COMBO и CHAIN — разные concepts. Combo describes the player's strong authored move/combination; Chain describes automatic cascade continuation.

### 6. Interaction guidance

Сохранены pointer drag preview, commit threshold, invalid return и click accessibility fallback.
Дополнительно реализованы:
- direct double-tap activation of special;
- any-special drag activation;
- automatic objective-aware hint after five seconds;
- hint timer reset on board/user activity;
- differentiated telemetry source.

## Atomic implementation record

### ANM-022B — Shared Move Legality ✅
Один legality/simulation path для attempt, hint и dead-board detection.

### ANM-022C — Feedback Semantics ✅
Разделены MATCH / COMBO / CHAIN / SPECIAL semantics без balance changes.

### ANM-022D — Special Shape Taxonomy ✅
Добавлены Flash / Evidence / Lead / Insight и player-resolution-only creation priority.

### ANM-022E — Special Combination Matrix ✅
Добавлена явная combo matrix и deterministic unsupported fallback.

### ANM-022F — Interaction Guidance ✅
Добавлены inactivity auto-hint, direct special activation и telemetry source differentiation.

## После ANM-022

Этот документ больше не назначает номера будущим production-фичам. Авторитетный порядок находится в `docs/ROADMAP_RU.md`.
Дальнейшая работа включает architecture/test health, display/safe-area foundation, Match-3 production framework с отдельным balance pass и Level Lab/campaign tooling.

## Non-goals механического контракта

- level move/objective tuning;
- новые art requirements;
- save migration;
- screenplay/localization content production;
- booster/meta systems;
- animation overhaul.
