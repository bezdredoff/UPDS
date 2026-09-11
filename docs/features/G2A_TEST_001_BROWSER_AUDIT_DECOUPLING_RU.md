# G2a-TEST-001 — historical Browser Coverage Audit decoupling

Status: **accepted via PR #281**.

## Цель

Убрать из fast/unit gate ручную зависимость между историческим ANM-023G8A coverage audit и текущим набором Playwright spec-файлов.

## Проблема

`ANM023G8A_PLAYWRIGHT_COVERAGE_AUDIT_RU.md` — снимок состояния Browser Gate на конкретном baseline: 7 Playwright specs, 20 Chromium cases и 15 Mobile WebKit critical cases.

При этом `BrowserCoverageAuditContract.test.ts` перечитывал текущую директорию `e2e/tests`, вычитал вручную поддерживаемый `postAuditSpecs` Set и требовал, чтобы остаток всегда был ровно 7 specs. Любой новый legit Playwright spec поэтому требовал отдельного изменения исторического contract-test, даже если новый spec автоматически запускался Browser Gate и имел собственную feature-документацию/coverage.

Это уже создавало ложный CI-failure: новый browser regression был корректен, но не был заранее внесён в central post-audit allowlist.

## Решение

- G8A audit остаётся immutable historical snapshot;
- `BrowserCoverageAuditContract.test.ts` проверяет семь явно перечисленных исторических G8A rows и их исходные case counts;
- test больше не делает `readdirSync(e2e/tests)` и не содержит `postAuditSpecs` registry;
- active Playwright discovery остаётся у `e2e/playwright.config.ts` через `testMatch: /.*\.pw\.ts/`;
- более поздние browser features защищают свои boundaries собственными contracts/docs, а не регистрацией в одном историческом списке.

## Что сохраняется

Slice не ослабляет runtime/browser coverage:

- Browser Gate продолжает автоматически запускать текущие `*.pw.ts` согласно Playwright config;
- historical G8A rows/counts остаются защищены как provenance;
- QA → production controller parity assertions сохраняются;
- Story completion / Match-3 browser-boundary trace assertions сохраняются;
- Selenium/WebDriver по-прежнему не вводится.

## Scope

Меняется только test/documentation ownership. Runtime, production UI, Playwright specs, workflows, Golden Samples, PWA и game logic не меняются.

## Последующие принятые результаты

После TEST-001 последовательно приняты TEST-002…006 через PR #283–#287. Они продолжили decoupling browser/source-shape contracts без ослабления Browser Gate. Финальный аудит после TEST-006 завершён и больше не является будущим шагом.

G2a закрыт после ARCH-010 / PR #298 и docs closeout / PR #299. Следующий активный трек — release work. KI-001/KI-003 позднее закрыты real-iPhone acceptance G0-PWA-001; G2a не продолжать без нового доказанного regression/ownership риска.
