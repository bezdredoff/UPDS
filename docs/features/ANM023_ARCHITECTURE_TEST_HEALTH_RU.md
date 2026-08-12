# ANM-023 — Architecture & Test Health Pass

Статус: ✅ complete.

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
- mechanics doc отвечает за ANM-022 mechanics semantics, а production ordering — за `docs/ROADMAP_RU.md`;
- ANM-022F зафиксирован как реализованный.

### ANM-023C — UiSmoke Localization Stability ✅

- Match-3 UI smoke больше не зависит от literal Russian copy;
- smoke проверяет rendered localization catalog values;
- обычный copy-edit локализации не ломает unrelated smoke gate.

### ANM-023D — Architecture Boundary Audit ✅

- active architecture doc синхронизирован с реальным runtime после refactor и ANM-022;
- проверены composition root / AppSession / AppNavigation / VN / Match-3 ownership boundaries;
- source-audit расширен до generic feature boundary guard;
- sibling feature imports запрещены;
- feature controllers создаются только в `AnimeDetectiveApp`;
- event bus / generic flow coordinator не вводится без реальной необходимости.

Результат аудита: текущая архитектура достаточно модульна для следующего production-этапа. Единственный transient Match-3 → VN clue handoff остаётся узким callback, собранным в `AnimeDetectiveApp`; отдельный flow coordinator имеет смысл только если появится второй независимый cross-feature payload.

### ANM-023E — Pipeline Failure Hygiene ✅

- rejected/stale ZIP очищается из `incoming` и после validation/check failure;
- failed importer run остаётся красным и диагностируемым;
- cleanup/sync создаёт clean-tree commit с `[skip ci]`, поэтому удаление ZIP не порождает zero-ZIP importer run;
- тот же contract применяется при post-merge sync из Pages workflow;
- stale-base rejection и protected pipeline rules сохранены;
- pipeline contract tests расширены на failure cleanup и skip-CI sync.

### ANM-023F — Traceability Closeout ✅

- active `BUILD_LABEL` переведён на завершённый ANM-023 baseline;
- ANM-022F doc отмечен как merged/implemented;
- production roadmap синхронизирован с фактическим состоянием;
- package semver не режется искусственно только ради документации: фактический build/foundation status отслеживается через `BUILD_LABEL` и roadmap.

## Проверенные архитектурные решения

- `AnimeDetectiveApp` остаётся small composition root;
- campaign persistence централизован через `AppSession`;
- VN и Match-3 controllers не импортируют и не создают друг друга;
- Match-3 legality/special semantics остаются в engine, а presentation/input — в feature/UI слоях;
- source-audit используется только для действительно структурных инвариантов;
- copy/roadmap wording не должен быть случайным CI contract;
- GitHub CI остаётся authoritative automated gate.

## Non-goals

- balance changes;
- новые Match-3 mechanics;
- layout/safe-area work — это ANM-024;
- mass character/content production;
- save schema changes;
- speculative event bus/service locator architecture.

## Exit criteria

- ✅ нет известных retired face-overlay/runtime contracts в active code/tests/docs;
- ✅ нет stale `.bak` или альтернативных active workflow/test copies;
- ✅ test categories документированы;
- ✅ brittle roadmap/copy assertions заменены устойчивыми contract/smoke checks;
- ✅ sibling feature modules не импортируют и не создают друг друга;
- ✅ pipeline failure path очищает stale inbox artifact без ложного cleanup failure;
- ✅ ANM-022F/ANM-023 traceability синхронизирована;
- ✅ GitHub CI остаётся gate;
- ✅ нет намеренных gameplay/visual изменений.

Следующий production foundation: **ANM-024 — Display, Viewport & Safe-Area Foundation**.
