# G2a-ARCH-004 — Unified compact layout

Status: **accepted via PR #291**.

## Проблема

До этого compact presentation выбирался несколькими независимыми viewport media queries вида:

`@media (max-height: 650px), (max-width: 340px)`

и отдельными родственными `max-height:650px` / `max-width:340px` правилами.

Из-за height branch Safari мог переключить часть UI в compact mode только потому, что browser chrome изменил видимую высоту. Это было особенно опасно для VN: менялись portrait scale, dialogue typography, controls и header geometry без изменения ширины устройства.

После ARCH-001/002 runtime geometry уже игнорирует height-only Safari changes, а ARCH-003 сделал `.game-viewport` постоянной DOM-границей. Но CSS media queries по-прежнему смотрели напрямую на browser viewport и могли обойти этот runtime contract.

## Решение

`.game-viewport` теперь является named inline-size container:

`container: upds-game / inline-size`

Compact/narrow presentation rules в shared UI, Match-3 production/tutorial/HUD/help/guidance/reactions, standalone help override и Diagnostics используют `@container upds-game (...)` вместо старого `650px` height decision или viewport-width narrow decision там, где это часть той же compact family.

Таким образом:

- browser viewport height больше не выбирает compact presentation;
- compact зависит от фактической ширины постоянного игрового canvas;
- desktop phone frame, mobile browser и installed PWA используют один и тот же layout owner;
- feature CSS остаётся владельцем своих визуальных правил — отдельный global `compact.css` не создаётся;
- JavaScript state/`data-upds-layout-density` не добавляется;
- `650px` больше не используется как media-query presentation breakpoint в migrated production CSS.

## VN cleanup

`vnViewportStability.css` раньше содержал отдельный normal-width override, который вручную отменял legacy compact rules после height flip. После container migration этот anti-breakpoint слой удалён: runtime VN сохраняет только frozen pixel tokens и text-size protection.

Это уменьшает cascade complexity и устраняет схему `legacy rule → компенсационный override`.

## Что остаётся height-based намеренно

ARCH-004 не запрещает все height media queries. Отдельно остаются локальные vertical-fit правила с другими contract boundaries, например:

- Match-3/Menu board fit при `max-height: 760px`;
- landscape layouts.

Они не являются compact-state selector и не меняют VN presentation family. Их можно оценивать отдельно, если появится конкретная regression evidence.

## Regression contract

Unit/source contracts проверяют, что:

- `.game-viewport` публикует named `upds-game` inline-size container;
- старые `650px` compact media decisions больше не владеют migrated presentation rules;
- VN больше не содержит normal-width anti-height compensation;
- Match-3 production и Diagnostics используют container-based narrow layout.

Browser Gate проверяет два сценария:

1. `390×700 → 390×620`: пересечение старого 650px height threshold не меняет VN geometry, tokens или persistent frame identity;
2. `390px → 320px` по ширине: реальное сужение game container включает compact VN typography.

Golden Samples не меняются.

## Не входит в slice

- standalone display-mode/root-canvas convergence не входила в ARCH-004; впоследствии принята как ARCH-005A / PR #292 и ARCH-005B / PR #293;
- `!important` / button cascade cleanup не входил в ARCH-004; впоследствии принят как ARCH-006 / PR #294;
- изменение `ViewportRuntime` height formulas или event policy;
- изменение Match-3 gameplay/balance;
- закрытие KI-001/KI-003 без реального iPhone QA.
