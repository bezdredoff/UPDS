# G5b — Match-3 design, balance и variety audit

Дата: 2026-10-02  
Статус: **ACTIVE · audit production-конфигов завершён; human playtest не проведён**  
Основание: `docs/release-status.json` → `G5b`  
Объём: все 22 production levels `M3_00–M3_21`.

## Что проверено

- Все 22 `LevelDefinition` в `src/data/levels.ts`: production brief, objective contract, move budget, blocker style, tile set, board surface и topology.
- All-22 deterministic snapshot E5A: 200 seeds на уровень, 4 400 прогонов objective-aware hint policy.
- Tuning reports E5B1 (`M3_06`, `M3_11`) и E5B2 (`M3_09`, `M3_14`, `M3_15`): по три независимые когорты по 200 seeds на каждый уровень.
- Канонический human protocol E6B не запускался: human scores, физическое устройство и human telemetry отсутствуют.

## Design и variety по всей кампании

Во всех уровнях используются шесть concrete tile identities, один из трёх blocker archetypes (`locked`, `solid`, `overlay`) и не более трёх целей. Сюжетная функция Match-3 развивается от сортировки вещей и проверки сервисных маршрутов к доказательной цепочке Asterion/Second Skin, затем к проверке каталогов, приватному возврату и трём разным финальным стратегиям.

| Level | Production brief | Цели (тип × количество) | Ходы | Поверхность / форма / blocker |
| --- | --- | --- | ---: | --- |
| M3_00 | Шкафчик Эми · туториал | преграды ×6; drop ×1 | 24 | locker-bench · full · locked |
| M3_01 | Фотореквизит и таймкоды | преграды ×10; drop ×1 | 26 | photo-contact-sheet · full · solid |
| M3_02 | Мокрые показания / пена | преграды ×18; drop ×1 | 25 | pool-service-tile · shaped · permeable overlay |
| M3_03 | Возвращённый мешок и новый шов | преграды ×8; dropGroup ×2 | 27 | ordered-cabinet · full · solid |
| M3_04 | Семь клубов и календарь | collect ×14; преграды ×8; drop ×1 | 28 | meeting-grid · split/bridge · solid |
| M3_05 | Баскетбольные шкафчики | преграды ×10; collect ×12; drop ×1 | 27 | locker-columns · full · locked |
| M3_06 | Мастерская Хинаты / две улики | преграды ×8; collect ×12; dropGroup ×2 | 32 | workbench-clusters · split-entry/shared workbench · solid |
| M3_07 | Нить и спецификация Asterion | преграды ×8; collect ×14; drop ×1 | 28 | signal-cross · full · locked |
| M3_08 | Номера потерянных пакетов | преграды ×10; collect ×14; drop ×1 | 30 | service-lanes · full · solid |
| M3_09 | Ключ и транспортная накладная | преграды ×8; collect ×14; dropGroup ×2 | 29 | service-lanes · full · solid |
| M3_10 | Контрольная экипировка / карате | преграды ×10; collect ×12; drop ×1 | 28 | locker-columns · full · locked |
| M3_11 | Передача контейнера Asterion | преграды ×8; dropGroup ×2; drop ×1 | 33 | service-lanes · transfer checkpoints · solid |
| M3_12 | Сигнал Second Skin | преграды ×10; collect ×14; drop ×1 | 28 | signal-cross · cross-shaped · blocking overlay |
| M3_13 | Кэндо и список пилота | преграды ×10; collect ×14; drop ×1 | 30 | locker-columns · full · solid |
| M3_14 | Семейное ателье / две записи | преграды ×8; collect ×14; dropGroup ×2 | 29 | workbench-clusters · full · solid |
| M3_15 | Заброшенный сервисный маршрут | преграды ×10; collect ×14; dropGroup ×2 | 30 | service-lanes · full · overlay |
| M3_16 | Розовые ленты и сканер | преграды ×10; collect ×14; drop ×1 | 29 | signal-cross · full · overlay |
| M3_17 | Каталог Рины | преграды ×10; collect ×14; drop ×1 | 30 | archive-rows · archive-shelves · locked |
| M3_18 | Полная временная линия | преграды ×10; collect ×14; drop ×1 | 31 | ordered-grid · full · solid |
| M3_19 | Приватный возврат | преграды ×10; collect ×14; drop ×1 | 30 | archive-rows · full · locked |
| M3_20 | Карта согласий и накопитель | преграды ×10; collect ×14; drop ×1 | 31 | service-lanes · full · locked |
| M3_21 | Удобный, но ложный финальный случай | collect ×14; преграды ×10; drop ×1 | 29 | ordered-grid · edited-case · solid |

### Наблюдения по variety

- Семь уровней используют authored board holes: `M3_02`, `M3_04`, `M3_06`, `M3_11`, `M3_12`, `M3_17`, `M3_21`. Они различаются по силуэту и расследовательской функции.
- Повторяются четыре основные objective primitives: `clearBlockers`, `collect`, `drop`, `dropGroup`. Разнообразие строится через сочетание и расположение целей, board shape, blockers, сюжетный brief и evidence route, без одноразовых механик.
- `service-lanes` — самая часто повторяемая поверхность (пять уровней). Поздняя связка `M3_16–M3_20` также часто использует blockers + collect 14 + один drop. Это может давать знакомый темп расследования, но может восприниматься как повтор или grind.
- Конфигурация подтверждает структурные различия, но не доказывает, что игрок их ощущает. Нужны человеческие оценки осмысленного выбора, причинности и желания продолжать, особенно для повторяющихся поверхностей и objective packages.

## Balance evidence

E5A измеряет поведение одного deterministic hint-following агента на исторической конфигурации до E5B tuning. Это comparative diagnostic, а не human win rate, прогноз вероятности победы игрока или fun score. Пять значений E5B справа относятся к текущим tuned production configs; остальные значения E5A — исторический comparator snapshot.

| Level | E5A agent win | После tuning, три когорты | Чтение сигнала |
| --- | ---: | ---: | --- |
| M3_00 | 76.0% | — | умеренный comparator; tutorial/control |
| M3_01 | 76.0% | — | умеренный comparator |
| M3_02 | 56.0% | — | agent-hard; проверить читаемость permeable overlay и целей |
| M3_03 | 55.0% | — | agent-hard; два evidence в общей dropGroup цели |
| M3_04 | 67.0% | — | умеренный comparator; shaped-board read остаётся human вопросом |
| M3_05 | 65.5% | — | умеренный comparator |
| M3_06 | 9.5% | **45.5 / 33.5 / 42.0%** | severe outlier скорректирован E5B1; сохраняется challenge-сигнал |
| M3_07 | 71.5% | — | умеренный comparator |
| M3_08 | 64.5% | — | умеренный comparator |
| M3_09 | 33.0% | **50.0 / 48.0 / 51.5%** | E5B2 снизил gross-outlier риск |
| M3_10 | 54.0% | — | agent-hard; переходный контрольный уровень |
| M3_11 | 2.0% | **44.0 / 37.5 / 38.0%** | severe outlier скорректирован E5B1; transfer route остаётся challenge |
| M3_12 | 70.5% | — | умеренный comparator |
| M3_13 | 73.0% | — | умеренный comparator |
| M3_14 | 38.5% | **52.5 / 46.5 / 42.5%** | E5B2 смягчил прежний very-hard сигнал |
| M3_15 | 21.5% | **44.0 / 45.0 / 46.0%** | E5B2 смягчил прежний very-hard сигнал |
| M3_16 | 68.5% | — | умеренный comparator после сложного участка |
| M3_17 | 63.5% | — | умеренный comparator; late shaped board |
| M3_18 | 53.5% | — | agent-hard; сюжетный pivot |
| M3_19 | 70.0% | — | умеренный comparator; ending route |
| M3_20 | 66.5% | — | умеренный comparator; ending route |
| M3_21 | 67.5% | — | умеренный comparator; advanced topology |

E5B1 тестировал три независимых набора по 200 seeds для каждого из `M3_06` и `M3_11`. E5B2 так же тестировал `M3_09`, `M3_14`, `M3_15`. В E5B2 менялись только позиции ingredients; ходовые бюджеты, objectives, blockers, активные tiles и сюжетный контекст сохранены. Текущая production-конфигурация уже включает эти правки.

### Решение на текущих данных

1. Не выполнять дополнительный blind auto-tuning: известные severe/very-hard выбросы получили диагностические правки и три holdout cohorts.
2. Не считать одиночное поражение или agent win rate основанием для изменения ходов/целей.
3. В human pass внимательно смотреть на `M3_06`, `M3_09`, `M3_11`, `M3_14`, `M3_15`, фиксируя субъективную причинность, выбор, retry impulse и progress по целям.
4. Если появляется воспроизводимый дефект, повторить тот же seed и записать точный repro. Повторяющиеся субъективные проблемы направлять в bounded design investigation.

## Human playtest gate — открыт

E6B задаёт comparative cohort из восьми уровней на seed `120000`: `M3_00`, `M3_02`, `M3_04`, `M3_06`, `M3_11`, `M3_12`, `M3_17`, `M3_21`. На каждом после игры заполняются пять оценок от 1 до 5: понятность цели, визуальная читаемость, причинность, осмысленный выбор, fun/желание продолжать; outcome, hints, intervention, заметки и telemetry export сохраняются рядом.

Эта восьмёрка не заменяет G5b scope «сыграть все 22 уровня». Для оставшихся уровней `M3_01`, `M3_03`, `M3_05`, `M3_07–10`, `M3_13–16`, `M3_18–20` требуется короткий проход на телефоне с фиксацией spike/soft-lock/unwinnable, objective clarity, retry и особых комбинаций. Субъективные `/5` не следует заполнять задним числом по автоаудиту.

Перед сессией: использовать stable build с `?qa=1`, записать VERSION/BUILD, locale/device; следовать reset/export порядку протокола без очистки Story save; играть E6B cohort на seed `120000`; затем пройти остальные 14 уровней; direct special combinations проверить отдельным phone gate. Любую telemetry JSON хранить рядом с anonymized session notes.

### Acceptance для G5b

- Source/design audit всех 22 production configs и существующего E5A/E5B evidence — **выполнено**.
- Человеческий телефонный проход всех 22 уровней с notes по objective clarity, spikes, soft-lock и retry — **pending**.
- Восьмиуровневый E6B sample с пятью субъективными score, notes и telemetry export — **pending**.
- Повторяющаяся материальная проблема оформлена в bounded investigation либо зафиксировано, что данных для rebalance нет — **pending human evidence**.
- G5b не переводится в `accepted` на основании только этого отчёта или deterministic audit.

## Источники

- Production configs: `src/data/levels.ts`.
- E5A all-22 snapshot: `docs/reports/ANM025E5A_MATCH3_AUTO_AUDIT.json`; объяснение метода: `docs/features/ANM025E5A_MATCH3_DIFFICULTY_CURVE_AUDIT_RU.md`.
- E5B1: `docs/reports/ANM025E5B1_MATCH3_TUNING.json` и `docs/features/ANM025E5B1_MATCH3_SEVERE_OUTLIER_TUNING_RU.md`.
- E5B2: `docs/reports/ANM025E5B2_MATCH3_TUNING.json` и `docs/features/ANM025E5B2_MATCH3_ROUTE_TUNING_RU.md`.
- Human procedure/session form: `docs/process/MATCH3_HUMAN_PLAYTEST_PROTOCOL_RU.md`, `docs/templates/MATCH3_PLAYTEST_SESSION_RU.md`.
