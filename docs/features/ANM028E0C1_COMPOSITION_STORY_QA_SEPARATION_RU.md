# ANM-028E0C1 — Composition / Story QA Separation

## Причина

До E0C1 Scene Studio смешивала две разные задачи в одном состоянии:

1. ручное редактирование reusable staging preset;
2. просмотр конкретной production VN line.

При каждом render выбранная `lineId` проверялась через authored-shot resolver. Если line была authored,
её production `presetId` и background молча заменяли выбранный в dropdown preset. Поэтому выбор
`trio-reaction` с исторически привязанной `VN0038` визуально сбрасывался в `two-shot-alliance` —
именно таким production shot является `VN0038` (Ayuki Pose B + Emi).

Одновременно Art Source dropdown всё ещё показывал четыре временных ANM-028D Emi candidate mode,
которые были нужны во время ранней production-проверки Emi, но после Browser Visual Lab стали
лишним пользовательским состоянием.

## Новая граница режимов

Scene Studio теперь имеет два независимых workspace mode.

### Composition

- staging preset выбирается и остаётся source of truth;
- background выбирается независимо;
- VN line не участвует в resolution и вообще не отображается как control;
- preview использует runtime assets или загруженные browser-local replacements;
- Scene / Lineup остаются Composition diagnostics;
- browser-local calibration и JSON export доступны для редактирования.

Composition использует нейтральный staging-preview dialogue shell и не вызывает
`resolveAuthoredVnShot()` для определения композиции. Поэтому authored VN data больше не может
перезаписать выбранный preset.

### Story QA

- пользователь выбирает реальную authored VN line;
- `presetId` и background берутся только из production authored-shot data;
- derived plan/background показываются read-only;
- Scene Studio показывает реальную комбинацию actor / expression / pose;
- browser-local PNG replacements остаются видимыми, но calibration controls скрыты, чтобы Story QA
  оставался проверкой результата, а не вторым редактором.

Story QA использует полный текущий `authoredVnShotManifest`, а не отдельный вручную поддерживаемый
маленький список sample lines.

## Legacy Emi candidates

`characterCandidates.ts` и candidate assets не удаляются: они остаются историческими production-
артефактами и traceability data. Но активный Scene Studio больше не импортирует candidate selector,
не подменяет ими sample sets и не показывает `Art Source` dropdown.

Runtime-approved Emi frames продолжают работать через обычный character runtime resolver. Это
отдельный production contract и не зависит от удалённого candidate UI.

## Browser Visual Lab

E0C1 не меняет формат browser-local ZIP и не меняет JSON v2 calibration model. Эти данные остаются
совместимыми с E0B.

Редактирование calibration временно остаётся `character + global/per-plan` и будет заменено в E0C2
на slot-aware editor (`preset + slot + character`) с прямым drag X/Y, Scale и выбором
character/expression/pose.

## Тестовая стратегия

Старые Scene Studio tests, которые требовали конкретные Emi candidate modes, заменены behavioral
contracts:

- Composition `trio-reaction` не зависит от `VN0038`;
- Story QA `VN0038` честно резолвится как `two-shot-alliance` Ayuki + Emi;
- Story QA plan/background read-only и derived из authored data;
- active UI не содержит legacy Emi Art Source selector;
- runtime staging, focal-eye guides, evidence/guest modes и approved runtime Emi asset сохраняются;
- browser calibration редактируется в Composition и скрыта в Story QA.

Production authored-shot manifest и scene-staging manifest не изменяются.
