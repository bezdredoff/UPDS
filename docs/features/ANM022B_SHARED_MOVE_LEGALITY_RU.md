# ANM-022B — Shared Move Legality

Build: `0.22.0-anm022b`.

## Problem

До ANM-022B три потребителя определяли playable swap немного по-разному:
- `attemptSwap()` принимал ordinary match или special-containing swap;
- `getHintMove()` использовал то же широкое правило;
- `hasAvailableMove()` считал только ordinary match.

Это могло привести к premature reshuffle при наличии реально допустимого special move.

## Change

В `Match3Game` введён единый side-effect-free `evaluateSwap(first, second)`.

Он отвечает за:
- same-cell;
- adjacency;
- ingredient occupancy;
- locked cells;
- temporary swap;
- resulting match groups;
- special activation;
- no-match.

Его используют:
- actual move validation;
- hint search;
- dead-board detection.

Evaluation временно меняет board только для simulation и всегда возвращает swap обратно до возврата результата.

## Intentionally unchanged

- move budgets;
- level/objective data;
- special taxonomy (`row | column`);
- special creation rules;
- scoring;
- feedback vocabulary/UI;
- telemetry schema;
- saves;
- animation timing.

Следующая атомарная фича: ANM-022C — Feedback Semantics.
