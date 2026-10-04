# G5b-PT2-M3-001 — Единая семантика Match-3 blockers

## Решение

Любой blocker layer блокирует перестановку и падение фишки, пока слой не снят. Совпадение на blocker-клетке или рядом по-прежнему повреждает слой согласно текущей механике.

Foam/`overlay` остаётся только в мокрых и laundry-контекстах:

- `M3_02` — бассейн и прачечная;
- `M3_15` — заброшенная прачечная.

В `M3_12` (сигнал Second Skin) и `M3_16` (гимнастический сканер) foam заменена существующим reusable `solid` blocker.

## Сохранённые level data

В четырёх затронутых уровнях сохранены blocker placements и layers, цели, move budgets, seeds, board shape, ingredients, active tile sets и сюжетные данные. Уровневое изменение поведения ограничено удалением прежнего проницаемого исключения в M3_02; оно требует повторного human playtest и количественного сравнения.

## Balance check

Baseline до этого изменения: `docs/reports/G5B_POST_FEEDBACK_MATCH3_AUTO_AUDIT_2026-10-03.json`, 200 прогонов M3_02 с seed range, начинающимся с `150000`; win rate — **64.5%** objective-aware hint agent. Это диагностический показатель, не оценка human win rate.

Candidate измерен тем же агентом и на том же seed range; результаты представлены в `docs/reports/G5B_FOAM_SEMANTICS_AUDIT_2026-10-04.json`.

| Метрика M3_02 | Baseline | Candidate |
| --- | ---: | ---: |
| Win rate (200 seeds) | 64.5% | 64.5% |
| Median moves used | 15 | 21 |
| Median moves left on win | 15 | 8 |
| Average loss objective completion | 51.25% | 52.97% |
| Cascade rate (2+) | 33.81% | 28.76% |
| Reshuffle rate | 0.19% | 4.62% |

Частота побед совпала, но кандидат чаще требует почти весь лимит ходов и чаще попадает в reshuffle. Это агентный сигнал усиления pressure; он не является human win rate и должен быть проверен повторным human playtest до принятия.

## Проверки перед merge

- production contract: ровно 2 foam-levels и оба имеют мокрый/laundry context;
- каждый blocker layer блокирует swap/gravity, включая M3_02;
- начальное поле M3_02 остаётся solvable на production и comparator seeds;
- same-seed 200-run M3_02 audit сравнен с baseline выше;
- RU/BE/EN blocker tutorial не обещает исключения для пены;
- visual preview M3_02/M3_15 и human retest подтверждают понятность и приемлемую сложность.
