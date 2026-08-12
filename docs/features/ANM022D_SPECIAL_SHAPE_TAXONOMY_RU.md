# ANM-022D R1 — Narrative Special Taxonomy

Build: `0.22.0-anm022d-r1.2`.

## Production vocabulary

RavenManor-derived placeholder vocabulary is retired.

- line-4 horizontal → `flash-row` / Горизонтальная вспышка;
- line-4 vertical → `flash-column` / Вертикальная вспышка;
- T/L → `evidence` / Улика;
- player-created 2×2 → `lead` / Зацепка;
- line-5+ → `insight` / Озарение.

Механические правила ANM-022D сохранены:
- Flash очищает соответствующий ряд/столбец;
- Evidence очищает 3×3;
- Lead очищает локальные клетки и находит одну полезную удалённую цель;
- Insight очищает фишки своего retained base type;
- specials создаются только на первом player-authored resolution.

## Production overlays

Каждый special имеет отдельный transparent SVG overlay в
`public/assets/match3/specials/`.

Базовый цветной tile остаётся видимым под overlay: тип фишки и способность кодируются независимо.

- Flash Row: горизонтальный световой луч + flare;
- Flash Column: вертикальный световой луч + flare;
- Evidence: карточка/фотография улики;
- Lead: лупа + маркер найденной цели;
- Insight: глаз/объектив с расходящимися связями.

SVG геометрические и не зависят от image-generation pipeline.

## Excluded from ANM-022D R1

- `special-special` combination rules remain out of scope;
- direct special combination matrix remains ANM-022E;
- balance, level objectives and move budgets are unchanged.

## Follow-up

Discarded pre-R1 ANM-022E package must not be imported.
ANM-022E is to be rebuilt on this narrative taxonomy.
