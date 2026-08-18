# ANM-023G8F — Playwright Production-Flow Coverage Closeout

Status: **G8 COMPLETE / docs-and-plan closeout**.
Base: `e7bc2732a038073d3e3c85ea6e6bfe69fcfefa74` after merged ANM-023G8E3 R1.1 / PR #175.

## Зачем нужен closeout

G8 начинался как расширение Playwright production-flow coverage после стабилизации G1–G7D. По ходу работы реальные iPhone/browser regressions показали, что максимальную ценность дают не длинные автоматические playthrough, а проверки конкретных production boundaries и runtime stability.

Поэтому G8 закрывается по фактически доказанной ценности, а не по первоначальному списку любой ценой.

## Что завершено

- **G8A / PR #162 — Coverage Audit & QA/Production Parity**: инвентаризация Browser Gate и доказательство того, что QA Scene Navigation, Match-3 Campaign и Level Lab входят в те же production controllers/renderers, а не в отдельную тестовую игру.
- **G8B / PR #165 — Story/VN Production-Flow Expansion**: bounded Story Match-3 completion → evidence → canonical post-win VN → persisted Continue.
- **G8C1 / PR #166 — Match-3 Browser Interaction Parity**: настоящий browser pointer path `pointerdown → pointermove → pointerup`, committed drag и short-drag no-op.
- **G8D / PR #168 — Dependency Security Closure**: обновление Vite/Vitest security line и blocking `npm audit --audit-level=high` с нулём известных vulnerabilities на merge baseline.
- **G8E1 / PR #171 — PWA Update Reliability**: опубликованный build identity и гарантированный reload/update path вместо зависимости от наличия `registration.waiting`.
- **G8E2 / PR #174 — iOS VN Viewport Stability**: защита от iOS text inflation, in-place VN paging и реальная RU/BE/EN multi-page localization regression coverage.
- **G8E3 / PR #175 — Match-3 Render Stability**: hint/reaction/cascade presentation больше не требует полного rebuild Match-3 screen; board-level delegated input переживает замену cell DOM.

## Решение по G8C2

**G8C2 Campaign Completion & Progression Flow переносится в deferred backlog и не блокирует закрытие G8.**

Причины:

1. Реальный Campaign level намеренно зависит от balance/config/seed. Длинная sequence известных ходов быстро станет brittle при легитимном rebalance и будет проверять frozen board history, а не устойчивый product invariant.
2. Маленький automation-only win fixture формально прогнал бы `result → save → unlock`, но сузил бы условия до специально сконструированного тестового случая. Это противоречит цели G8 — защищать production signal, а не закрывать checklist.
3. Campaign store/progression/result behavior уже имеет focused unit/controller contracts. Browser E2E должен добавляться только если он защищает distinct browser boundary, которую дешевле не поймать.

Вернуться к G8C2 стоит, если:

- Match-3 balance стабилизирован достаточно, чтобы реальный production journey был долговечным; или
- появляется конкретная Campaign regression, которую нельзя надёжно поймать engine/store/controller тестом; или
- во время ANM-033 release hardening полное Campaign progression доказательство становится release-critical.

Не вводить tiny win fixture только ради статуса coverage.

## Post-G8 automation backlog

Это **приоритеты по ожидаемому defect signal**, а не обязательная серия следующих PR.

### P0 — RU/BE/EN mobile locale × viewport matrix

Проверять реальные production screens на уже принятой portrait matrix:

- `320×568`;
- `375×667`;
- `390×844`;
- `393×852`;
- `430×932`.

Минимальные invariants: нет horizontal overflow, game viewport стабилен, header/footer/actions остаются в viewport, controls доступны, locale-dependent text не вызывает scale jump/reflow всей оболочки. Не умножать Golden Sample screenshots: для этой задачи полезнее geometry/visibility assertions.

Приоритет основан на реальной G8E2 регрессии: локализованный белорусский VN менял физический viewport на iPhone, поэтому locale × viewport имеет доказанный defect yield.

### P1 — PWA offline/recovery journey

Production journey без test-only state mutation:

`online boot → active service worker → real save/locale state → offline → reload → app usable → Continue/Settings usable → network restored`.

Это естественное продолжение G8E1 и защищает PWA/offline promise целиком, а не только update button.

### P1 — VN/content asset crawl

QA Scene Navigation используется только как быстрый entry point. После входа работает production VN renderer.

Для каждой canonical scene достаточно smoke-инвариантов: runtime frame открылся, обязательный текст присутствует, видимые изображения decode/load успешно, browser/runtime health clean, shell не выходит за viewport. Не нужно кликать все 976 VN lines или делать screenshot baseline каждой сцены.

Особенно полезно во время будущих ANM-030 character/background imports: crawl быстро ловит broken paths, missing assets и staging references.

### P1 — quantitative Match-3 regression/reporting

Развивать существующий ANM-025E3 deterministic simulation через публичный `Match3Game`, а не заставлять Playwright выигрывать уровни.

Полезные сравнительные метрики на real levels/seed samples:

- win/loss envelope;
- moves-left distribution;
- objective-specific failure reasons;
- blocker/ingredient completion;
- reshuffle/dead-board frequency;
- special creation/activation distribution, если это можно измерять без искажения production policy.

Точные проценты не должны становиться frozen contract: candidate сравнивается с baseline/envelope, чтобы осознанный rebalance был допустим, а случайная крупная деградация — заметна.

## G8 exit criteria

G8 считается завершённым, потому что:

- один Playwright stack защищает Chromium и Mobile WebKit;
- QA entry points доказанно сходятся с production runtime;
- есть bounded real-player Story completion journey;
- реальный pointer interaction защищён browser-level тестом;
- production dependency/security gate закрыт;
- PWA update, localized iOS VN viewport и Match-3 transient rendering получили regression protection после реальных пользовательских дефектов;
- Selenium/WebDriver и browser-only game implementation не добавлены;
- Campaign completion не покрыт искусственным fixture только ради формального checklist;
- дальнейшая automation expansion записана как demand-driven backlog по production signal.

Runtime, balance, assets и workflows этим closeout slice не меняются.
