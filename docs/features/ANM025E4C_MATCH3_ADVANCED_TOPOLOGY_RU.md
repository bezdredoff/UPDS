# ANM-025E4C — Match-3 Advanced Topology Cohort

Build label: `ANM-025E4C R2 · Advanced Topology Cohort · F4 compatible`.

## Цель

Закрыть evidence-driven E4 topology experiment вторым, более поздним cohort без добавления новых Match-3 mechanics. E4C меняет только spatial topology уровней `M3_11`, `M3_12`, `M3_17`, `M3_21`; moves, objectives, blockers, ingredients, active tile sets, spawn weights, specials, Story rewards и Campaign ordering остаются прежними.

Выбор форм опирается не только на тему сцены, но и на deterministic E4A baseline: новые topology не должны снижать прежнее число побед hint-following агента на фиксированных seeds `120000..120007`.

## Cohort

### M3_11 — Transfer Checkpoints

```text
#..##..#
########
########
#.####.#
#.####.#
########
########
#..##..#
```

`boardHoles = [1, 2, 5, 6, 25, 30, 33, 38, 57, 58, 61, 62]` — 52 active cells.

Верх/низ выглядят как узкие контрольные ворота контейнера, центральная пара рядов — как зона сверки между маршрутными lane. Все три ingredient документа остаются на активных путях.

### M3_12 — Signal Cross

```text
..####..
..####..
########
########
########
########
..####..
..####..
```

`boardHoles = [0, 1, 6, 7, 8, 9, 14, 15, 48, 49, 54, 55, 56, 57, 62, 63]` — 48 active cells.

Толстый центральный крест поддерживает `signal-cross` presentation: шум сосредоточен вокруг центрального измерительного поля, а Second Skin tag остаётся внутри активного ядра.

### M3_17 — Archive Shelves

```text
##..####
##....##
########
########
########
########
########
####..##
```

`boardHoles = [2, 3, 10, 11, 12, 13, 60, 61]` — 56 active cells.

Смещённые верхние вырезы и нижний проход читаются как проходы между архивными полками, не копируя split/workbench формы E4B. Каталог Рины остаётся на активной центральной позиции. R2 уменьшает число holes до восьми после F4 auto-2×2 hardening, чтобы сохранить исходный deterministic balance envelope.

### M3_21 — Edited Case

```text
.######.
########
#.#####.
.#####.#
#.#####.
.#####.#
########
.#####.#
```

`boardHoles = [0, 7, 17, 23, 24, 30, 33, 39, 40, 46, 56, 62]` — 56 active cells.

Чередующиеся вырезы по краям визуально напоминают сознательно выкинутые противоречия из «идеального дела». Final slide остаётся в активном центральном коридоре.

## Deterministic evidence

E4A baseline на seeds `120000..120007` до E4C:

| Level | Before | E4C candidate |
| --- | ---: | ---: |
| M3_11 | 1/8 | 1/8 |
| M3_12 | 4/8 | 6/8 |
| M3_17 | 6/8 | 8/8 |
| M3_21 | 7/8 | 8/8 |

R2 повторно проверен уже поверх ANM-025F4 auto-2×2 resolution. Это не новый balance target для игрока и не замена human playtest. Это regression envelope: topology не должна незаметно сделать поздние levels хуже для уже установленного deterministic comparator.

## Automated acceptance

- `validateLevelDefinitions(levels) === []`;
- topology adoption ограничена восемью уровнями E4B+E4C;
- exact silhouettes защищены отдельным `Match3TopologyAdvancedCohort.test.ts`;
- blockers/ingredients не попадают в holes;
- production seeds стартуют без immediate matches и с legal move;
- все восемь E4A sample seeds завершаются в move budget;
- hint-following win counts для E4C cohort не ниже pre-E4C baseline;
- существующие E3/E4A/Browser Gate contracts не ослабляются.

## Manual iPhone QA

Через `?qa=1` / Level Lab проверить `M3_11`, `M3_12`, `M3_17`, `M3_21`:

1. форма поля читается как намеренный layout, а не missing tiles;
2. holes не реагируют на tap/drag и не заполняются refill;
3. gravity/ingredients визуально понятны на shaped board;
4. direct specials не вызывают board blink после E4B R7 render hardening;
5. reaction comments не двигают board;
6. каждый уровень ощущается пространственно отличимым от E4B cohort и друг от друга.

## Decision gate / closeout

После green CI + короткого human Fun QA E4 topology experiment считается закрытым. Новые формы/механики дальше не добавляются без конкретного playtest evidence. Следующий production priority возвращается к R0 release backlog: background semantic closure, guest/witness closure и затем ANM-033 RC hardening.
