# G2a-TEST-004 — QA Harness contract ownership

Status: **accepted via PR #285**.

## Проблема

`BrowserAutomationHarnessContract.test.ts` исторически читал production composition root, Menu, Diagnostics, Campaign, Level Lab, Match3Controller, Match3Presentation и VN frame, а затем сравнивал точные строки реализации.

Отдельно `BrowserCoverageAuditContract.test.ts` повторно читал `AnimeDetectiveApp`, `Match3Controller`, browser helpers и сам `BrowserAutomationHarnessContract`, включая названия его test cases.

Это создавало два типа ложной связанности:

- безопасный рефакторинг production controller/markup мог ломать fast test без изменения поведения;
- изменение одного contract test могло ломать другой contract test только из-за текста test name.

## Новое разделение ответственности

### RepositoryHygiene

`RepositoryHygiene.test.ts` остаётся владельцем architecture boundaries:

- feature controllers создаются только в composition root;
- feature modules не импортируют sibling features;
- campaign persistence централизован через AppSession/composition root.

### BrowserAutomationHarnessContract

Contract читает только browser automation layer:

- `e2e/selectors.ts` — stable automation API;
- `e2e/helpers/runtime.ts` — browser-side reset без game/runtime mutation hooks;
- `e2e/tests/harness.pw.ts` — наличие Scene Navigation, Scene Studio, Campaign и Level Lab journeys через публичные selectors.

Он больше не читает production controllers/renderers и не фиксирует их локальные statement strings.

### BrowserCoverageAuditContract

G8A audit остаётся историческим snapshot. Contract защищает исторические spec/case counts, parity decisions и зафиксированные coverage gaps, но больше не перепроверяет текущую production implementation или текст другого test-файла.

### Browser Gate

Фактическая QA → production parity остаётся исполняемой проверкой: `harness.pw.ts` открывает реальные production VN/Match-3 surfaces в браузере.

## Что не меняется

- runtime/gameplay/Story/Match-3 код;
- QA entry points;
- `e2e/tests/harness.pw.ts`;
- selector values;
- Browser Gate lane composition;
- Golden Samples;
- backgrounds/PWA.

## Acceptance

- browser contract больше не зависит от production source shape;
- historical coverage audit не зависит от current controller internals или test-name strings;
- stable selector API и anti-shortcut boundaries остаются в fast gate;
- runtime parity продолжает проверяться Browser Gate;
- архитектурные boundaries продолжают проверяться `RepositoryHygiene.test.ts`.
