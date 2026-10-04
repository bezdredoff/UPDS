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

## Новое направление после human feedback — 2026-10-04

Предыдущее решение «все blockers блокируют движение» superseded текущим candidate: `overlay`/foam — лёгкий визуальный blocker, который оставляет tile доступной для перемещения, match и gravity. Пена лишь слегка снижает видимость; совпадение на самой foam-cell или в любой ортогонально соседней клетке снимает один слой, диагональное совпадение — нет. `solid` zip-bag и `locked` chain/padlock сохраняют недоступность накрытого tile до снятия blocker.

Zip-bag и chain/padlock используют одинаковое правило соседнего повреждения, но у locked blocker два визуальных этапа: первый clear снимает padlock и оставляет диагональные chains, второй clear снимает chains. На всех locked-клетках кампании задано ровно два слоя; покрытая tile остаётся недоступной до полного снятия обоих слоёв. Первое появление — M3_05; отдельный RU/BE/EN tutorial объясняет порядок. Однослойный chain-only PNG входит в runtime/offline asset catalog.

## Балансный эффект

Новая механика повышает нагрузку в уровнях с locked blocker. Existing comparator suite показал падение M3_17 с установленного минимума 5/8 до 2/8 побед hint-following agent при старом бюджете 30 ходов. При 40 ходах результат достигал 4/8; бюджет поднят до 42, чтобы вернуть уровень к прежнему минимальному порогу когорты. Это автоматический диагностический сигнал, не human balance acceptance. Перепроверьте M3_05, M3_07, M3_10, M3_17, M3_19 и M3_20 на человеческом ретесте. Для M3_15 проницаемая пена дала 39/48 побед при прежней верхней границе 38; расширенная граница учтена как ожидаемое смягчение лёгкого blocker, но общий campaign balance остаётся открытым.
