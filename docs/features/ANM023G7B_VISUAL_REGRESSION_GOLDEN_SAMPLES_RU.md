# ANM-023G7B — Visual Regression / Golden Samples

Статус поставки: **candidate**.

## Цель

Добавить небольшой production-relevant visual regression слой поверх уже работающего ANM-023G7A Browser Gate.

G7B не пытается зафиксировать скриншотами каждый экран игры. Вместо этого выбраны четыре состояния, которые вместе покрывают основные визуальные системы vertical slice:

1. Main Menu;
2. VN authored multi-actor staging на `VN0008`;
3. `CHOICE_00`;
4. deterministic Match-3 Level Lab seed `7`.

## Почему Mobile WebKit

Golden Samples сравниваются в проекте Playwright `webkit-mobile` с device profile `iPhone 13`.

Это ближе к основному ручному QA-пути проекта на iPhone, чем desktop Chromium. Chromium при этом остаётся полным функциональным E2E gate; visual spec в Chromium намеренно skip.

Committed baselines имеют platform suffix `webkit-mobile-linux`, потому что authoritative CI renderer — Ubuntu GitHub Actions + Playwright WebKit.

## Стабилизация кадра

Перед screenshot assertion тест:

- использует `prefers-reduced-motion: reduce`;
- отключает animations в screenshot API;
- ждёт загрузки всех текущих `img`;
- ждёт `document.fonts.ready`;
- скрывает caret;
- снимает в CSS pixel scale.

Допустимая разница ограничена `maxDiffPixelRatio: 0.002` — 0.2% пикселей. Это достаточно узкий tolerance для обнаружения реальных layout/style regressions и не должно превращать visual gate в приблизительную проверку.

## Golden Sample 1 — Main Menu

Фиксирует:

- hero/title composition;
- character medallions;
- основные CTA;
- QA navigation block;
- вертикальный mobile layout.

Только `.menu-screen footer` скрывается перед screenshot. Footer содержит dynamic `BUILD_LABEL`, который меняется между candidate builds и не является layout contract.

## Golden Sample 2 — VN0008 trio

Вход выполняется через существующую QA Scene Navigation, после чего тест проходит настоящий `VnController` до `VN0008`.

Фиксируются:

- authored background;
- три production actor sprites;
- их staging / scale / bottom anchoring;
- header;
- nameplate;
- dialogue card;
- VN controls.

Отдельного QA renderer нет.

## Golden Sample 3 — CHOICE_00

Тест входит в authored Scene 1 через QA navigation, проходит до `VN0040`, затем обычным VN flow открывает `CHOICE_00`.

Фиксируются:

- background treatment;
- choice card geometry;
- title hierarchy;
- три option buttons;
- mobile margins / safe-area composition.

## Golden Sample 4 — Match-3 seed 7

Используется существующий visible Level Lab draft editor через `openDeterministicLab()`.

Seed `7` и детерминированная 8×8 board fixture проходят через production `Match3Controller → Match3Game → presentation`.

Фиксируются:

- level header / objective / moves HUD;
- field bark;
- 8×8 evidence board framing;
- production tile art and sockets;
- detective/tool tray;
- mobile bottom composition.

Тест не импортирует `Match3Game` и не меняет runtime напрямую.

## Baseline bootstrap

Первые authoritative PNG были созданы не вручную и не из локального браузера.

Процесс был таким:

1. visual spec запущен в обычном GitHub Actions WebKit runner без baselines;
2. Browser Gate сохранил реальные `actual.png` в diagnostics artifact;
3. четыре кадра были визуально проверены;
4. одноразовый PR-only bootstrap job запустил тот же Playwright WebKit stack с `--update-snapshots` и закоммитил PNG;
5. bootstrap workflow после этого удалён из candidate branch.

В production остаётся только read-only Browser Gate.

## Как обновлять Golden Samples дальше

Baseline нельзя обновлять автоматически только ради получения зелёного CI.

Если visual test падает после намеренного UI/art изменения:

1. открыть `playwright-report` / `test-results` Browser Gate;
2. сравнить expected / actual / diff;
3. вручную подтвердить, что новый вид является ожидаемым;
4. regenerate snapshots в том же Linux WebKit environment отдельным контролируемым baseline-refresh cut;
5. проверить PNG до merge;
6. только затем принять новый baseline.

Команда focused suite:

```bash
npm --prefix e2e run test:visual
```

`npm run check` по-прежнему не запускает Playwright.

## Acceptance

G7B готов, когда на одном и том же final PR head одновременно зелёные:

1. `UPDS CI / Quality gate`;
2. `Browser Gate / Chromium full E2E`;
3. `Browser Gate / Mobile WebKit critical E2E`, включая четыре Golden Sample comparison;
4. в diff нет production `src/` изменений и нет временного write-enabled bootstrap workflow.
