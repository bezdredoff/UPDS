# ANM-023 — Architecture & Test Health Pass

Статус: in progress.

Цель — подготовить кодовую базу к следующим production-фичам без намеренных gameplay/visual изменений.

## План прохода

### ANM-023A — Repository & Contract Hygiene

- удалить stale `.bak` files из active tree;
- привести PR checklist к текущему character runtime contract;
- зафиксировать категории tests: behavior / contract / smoke / source-audit;
- добавить repository hygiene guard;
- сохранить GitHub CI authoritative gate.

### ANM-023B — Test Health

- найти brittle source-string assertions;
- заменить их behavior/contract tests там, где контракт наблюдаем через API/runtime;
- удалить retired/overlapping tests;
- оставить source-audit только для структурных safety-инвариантов.

### ANM-023C — Ownership Boundaries

- определить high-churn/large source files;
- разделять только там, где есть ясная ownership boundary;
- проверить отсутствие дублирования Match-3 legality/special semantics;
- не менять gameplay semantics.

### ANM-023D — Architecture Reality Check

- синхронизировать active architecture docs с runtime;
- проверить stale localization/asset paths и retired face-overlay references;
- финальный full CI + targeted manual smoke.

## Non-goals

- balance changes;
- новые Match-3 mechanics;
- layout/safe-area work (ANM-024);
- mass character/content production;
- save schema changes.

## Exit criteria

- нет известных retired face-overlay/runtime contracts в active code/tests/docs;
- нет stale `.bak` или альтернативных active workflow/test copies;
- test categories документированы;
- один authoritative test на production contract вместо overlapping copies;
- GitHub CI зелёный до и после refactor;
- нет намеренных gameplay/visual изменений.
