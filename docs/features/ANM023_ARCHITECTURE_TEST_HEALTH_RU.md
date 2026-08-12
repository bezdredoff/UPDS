# ANM-023 — Architecture & Test Health Pass

Статус: in progress; ANM-023A–D prepared/implemented, pipeline hygiene remains.

Цель — подготовить кодовую базу к следующим production-фичам без намеренных gameplay/visual изменений.

## Реализованный проход

### ANM-023A — Repository & Contract Hygiene ✅

- удалены stale `.bak` files из active tree;
- PR checklist приведён к текущему precomposed expression-frame runtime contract;
- зафиксированы категории tests: behavior / contract / smoke / source-audit;
- добавлен repository hygiene guard;
- GitHub CI сохранён как authoritative gate.

### ANM-023B — Match-3 Contract Test Health ✅

- Match-3 mechanics contract отделён от production roadmap numbering;
- удалена чужая character-rig ответственность из Match-3 roadmap test;
- mechanics doc теперь отвечает только за ANM-022 mechanics semantics;
- ANM-022F зафиксирован как реализованный.

### ANM-023C — UiSmoke Localization Stability ✅

- Match-3 UI smoke больше не зависит от literal Russian copy;
- smoke проверяет rendered localization catalog values;
- copy-edit локализации не должен ломать unrelated smoke gate.

### ANM-023D — Architecture Boundary Audit

- синхронизировать active architecture doc с реальным runtime после refactor и ANM-022;
- проверить composition root / AppSession / AppNavigation / VN / Match-3 ownership;
- не вводить event bus или generic flow abstraction без реальной необходимости;
- расширить source-audit с двух конкретных controllers до generic feature boundary guard;
- запретить sibling feature imports и construction feature controllers вне composition root.

Результат аудита: текущая архитектура достаточно модульна для следующего production-этапа. Единственный transient Match-3 → VN clue handoff остаётся узким callback, собранным в `AnimeDetectiveApp`; отдельный flow coordinator имеет смысл только если появится второй независимый cross-feature payload.

## Следующий остаток ANM-023

### ANM-023E — Pipeline Failure & Traceability Hygiene

- убрать stale ZIP из `incoming` после validation/check failure без создания noisy zero-ZIP run;
- проверить поведение importer при replace/delete binary inbox content;
- сохранить stale-base rejection и protected pipeline rules;
- синхронизировать version/build-label/roadmap/localization traceability, отложенную при minimal ANM-022F patch;
- финальный full CI без gameplay semantics changes.

Workflow-файлы защищены от Delta ZIP, поэтому ANM-023E выполняется через отдельную GitHub branch/PR с ручным merge.

## Non-goals

- balance changes;
- новые Match-3 mechanics;
- layout/safe-area work (следующая production foundation feature);
- mass character/content production;
- save schema changes;
- speculative event bus/service locator architecture.

## Exit criteria

- нет известных retired face-overlay/runtime contracts в active code/tests/docs;
- нет stale `.bak` или альтернативных active workflow/test copies;
- test categories документированы;
- brittle roadmap/copy assertions заменены устойчивыми contract/smoke checks;
- sibling feature modules не импортируют и не создают друг друга;
- pipeline failure path не оставляет stale inbox artifact и не создаёт ложный failure на cleanup;
- 022F traceability metadata синхронизирована;
- GitHub CI зелёный до и после изменений;
- нет намеренных gameplay/visual изменений.
