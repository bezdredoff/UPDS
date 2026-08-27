# ANM-025E6B — Match-3 Human Playtest Protocol

## Цель

Закрыть последний gap remediation slice **E — Reporting & QA**: сделать human Match-3 playtests повторяемыми между билдами, а не набором разовых ручных проверок.

До E6B проект уже имеет:

- telemetry v2 и per-level `PlaytestSummary`;
- deterministic Match-3 fun/balance baselines;
- E6A Match-3 Playtest Summary прямо в QA Diagnostics;
- Chromium full E2E и Mobile WebKit critical E2E через Browser Gate;
- reviewed Mobile WebKit Golden Samples, включая Match-3 state;
- Level Lab, который запускает production level + production `Match3Game` с exact seed.

E6B не добавляет новую telemetry или runtime UI. Он фиксирует одинаковую human procedure поверх уже существующих инструментов.

## Канонический protocol

Source of truth:

`docs/process/MATCH3_HUMAN_PLAYTEST_PROTOCOL_RU.md`

Копируемый session form:

`docs/templates/MATCH3_PLAYTEST_SESSION_RU.md`

Protocol фиксирует:

- reset/export через `?qa=1 → Диагностика`;
- запуск через production-parity Level Lab;
- один основной comparative seed `120000`;
- follow-up seed `120004` только после основного cohort;
- запрет coaching, который мог бы скрыть UX проблему;
- одинаковые пять subjective scores после каждого уровня;
- одинаковые финальные вопросы;
- правила интерпретации маленькой human sample.

## Representative cohort

E6B не создаёт новый arbitrary sample, а переиспользует уже проверенную spatial выборку E4B + E4C:

- ранняя/control cohort: `M3_00`, `M3_02`, `M3_04`, `M3_06`;
- advanced cohort: `M3_11`, `M3_12`, `M3_17`, `M3_21`.

Это даёт один фиксированный восьмиуровневый route для сравнительного human Fun QA.

## Обязательные subjective dimensions

После каждого уровня tester оценивает `1..5`:

1. Понятность цели;
2. Визуальная читаемость;
3. Причинность;
4. Осмысленный выбор;
5. Fun / желание продолжать.

Telemetry продолжает автоматически собирать объективные показатели. Protocol специально не заставляет человека вручную считать moves/cascades/invalid moves/duration.

## Small-sample discipline

E6B не вводит fake statistical confidence.

- один tester — валидный источник defects и qualitative hypotheses, но не population balance verdict;
- одинаковая concrete проблема у 2+ независимых testers становится investigation signal;
- при N>=5 median <=3 по одной subjective dimension считается сильным directional signal;
- raw JSON и subjective notes хранятся рядом и не заменяют друг друга.

## Automated contract

`tests/Match3HumanPlaytestProtocol.test.ts` защищает только drift protocol:

- все восемь short IDs существуют в production `levels`;
- порядок cohort остаётся E4B → E4C;
- основной/follow-up seeds зафиксированы;
- reset/export/Level Lab procedure присутствует;
- пять subjective dimensions присутствуют и в protocol, и в session template;
- template содержит все восемь уровней и финальный questionnaire.

Новый Playwright spec не добавляется: E6B — process contract, а browser E2E/Golden coverage уже существует и не должен становиться длиннее ради Markdown workflow.

## Slice E closeout

После merge E6B исходный remediation scope **E — Reporting & QA** закрыт:

- **summary metrics** — telemetry summary + E4A metrics + E6A on-device dashboard;
- **E2E** — Browser Gate: Chromium full + Mobile WebKit critical;
- **golden screenshots** — reviewed Mobile WebKit Golden Samples;
- **playtest protocol** — E6B repeatable human protocol + session template.

Тем самым remediation plan A–E можно считать реализованным. Следующий правильный шаг после merge — не добавлять speculative Match-3 systems, а провести свежий human sample по Protocol v1 и принимать следующие design changes только по новым данным.
