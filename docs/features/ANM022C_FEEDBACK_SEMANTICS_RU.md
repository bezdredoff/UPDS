# ANM-022C — Match-3 Feedback Semantics

Build: `0.22.0-anm022c`.

## Goal

Разделить четыре разных события, которые раньше визуально схлопывались почти в один MATCH.

## Contract

- `MATCH` — обычный player-created match-3.
- `COMBO` — сильная player-created форма: line-4+ или пересекающиеся match groups.
- `CHAIN ×N` — второй и последующие automatic cascade clears.
- `SPECIAL` — ход/clear с активацией существующего special.

Engine назначает `MatchFeedbackKind`; UI только отображает его.
Это исключает повторное угадывание semantics в controller.

## Current UI strings

EN:
- MATCH
- COMBO!
- CHAIN ×N
- OBSERVATION! (existing special label; отдельное переименование можно сделать позже вместе с special taxonomy)

RU:
- СОВПАДЕНИЕ
- КОМБО!
- ЦЕПОЧКА ×N
- НАБЛЮДЕНИЕ! (existing special label)

## Intentionally unchanged

- board legality;
- special taxonomy;
- special creation/effects;
- move budgets;
- objective data;
- scoring;
- saves;
- telemetry event schema;
- assets.

ANM-022D расширит taxonomy specials и сможет переиспользовать этот semantic contract.
