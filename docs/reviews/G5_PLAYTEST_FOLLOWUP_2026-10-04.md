# G5 / G5b — Playtest follow-up 2026-10-04

Status: **PR #342–#349 and #353 merged. Current follow-up candidate includes M3_00 simplification, permeable foam and two-stage lock → chain; technical checks and focused human retest pending.**

Источник — integrated iPhone playtest после PR #341. Этот документ переводит наблюдения игрока в bounded release work. По умолчанию новые системы не строятся: сначала удаляем misleading/prototype presentation и исправляем воспроизводимые UX-дефекты.

## Что подтвердил playtest

| ID | Наблюдение | Решение |
| --- | --- | --- |
| G5-PT2-VN-001 | VN показывает `VARIABLE`, `CUT TO`, `INSERT`, `FADE IN`, `CHOICE CHECKPOINT` как полноценные игровые экраны | **R0 / review · PR #342.** Authored directives сохранены как runtime metadata и auto-consumed в player VN; Browser Gate прошёл. Проверить на телефоне background transitions, choice gates, history и сохранение progression; `KI-006` открыт до этой проверки. |
| G5-PT2-VN-002 | размер/вертикальный baseline персонажей различается между solo/duo/trio | **R1 / accepted · PR #353.** Обычный solo runtime и все solo staging presets выровнены по общей focal eye line с duo/trio; масштаб 0.72 и размер кадра сохранены. Пользователь проверил merged результат и подтвердил, что ему нравится. Quality, Chromium full E2E и Mobile WebKit critical E2E прошли. |
| G5-PT2-VN-003 | в composition preview есть edge glow, в runtime нет | **R2 / проверено, отклонено · PR #349.** Слабый 1px edge treatment сравнен с runtime на solo, duo и trio. Ореол/style drift не заметны, но на мобильном размере преимущество практически неразличимо. Production CSS и goldens не менялись. |
| G5b-PT2-M3-001 | foam выглядит как blocker, но M3_02 позволяет двигать/матчить фишки под ним; foam также используется вне мокрых/прачечных сцен | **R1 / review · PR #345.** Все blocker layers блокируют interaction; foam остаётся в M3_02/M3_15, M3_12/M3_16 используют solid. Пользователь сообщил, что условие потери слоя неясно. Правило: один слой за clear, если он задел blocker cell или orthogonal neighbor; диагональ не учитывается. Локализованная подсказка уточнена в `G5b-PT3-M3-UX-002`; нужен короткий retest. См. [G5b blocker semantics](../features/G5B_M3_BLOCKER_SEMANTICS_RU.md) и [current all-22 audit](../reports/G5B_POST_FEEDBACK_MATCH3_AUTO_AUDIT_2026-10-04.json). |
| G5b-PT2-M3-002 | цифры слоёв мешают визуалу; коробки и цепи перекрывают tile art | **R1 / review · PR #344/#353.** Пользователь подтвердил отсутствие чисел, улучшенную видимость tile под blocker, а также принял locked blocker в merged PR #353: цепи/замок opaque, tile underneath слегка transparent. Solid zip-bag M3_01 ещё ожидает отдельной human visual confirmation. См. [ANM025D2](../features/ANM025D2_BLOCKER_READABILITY_RU.md). |
| G5b-PT2-M3-003 | светлый прозрачный top/camisole визуально становится тёмным | **R1 / accepted · PR #347.** Пользователь подтвердил, что transparent top/camisole остаётся читаемым на поле. |
| G5b-PT2-M3-004 | у всех specials остаётся маленькая иконка исходной фишки, хотя special уже является отдельным объектом | **R1 / accepted · PR #346.** Пользователь подтвердил, что заменённой base tile icon нет, а направление line-clear понятно. |
| G5b-PT2-M3-005 | `НЕТ СОВПАДЕНИЯ` и возврат невалидного swap ощущаются слишком медленными | **R1 / accepted · PR #343.** Пользователь подтвердил быстрый возврат и короткое сообщение, которое не блокирует поле. |
| G5b-PT2-M3-006 | после drop-цели поле иногда слегка увеличивается/сдвигается вниз | **R1 / review · PR #343; KI-007 open pending iPhone retest.** `.match-guidance-slot` сохраняет общий footprint после drop; deterministic before/after capture проверяет layout owners, без compensating transform. |

## Foam / blocker distribution

Production campaign содержит 22 уровня:

- `locked`: 7/22 = **31.8%**;
- `solid`: 11/22 = **50.0%**;
- `overlay` с foam art: 4/22 = **18.2%**.

На момент исходного feedback foam стояла на `M3_02`, `M3_12`, `M3_15`, `M3_16`. Только `M3_02` имел permeability exception: **1/22 (4.5%)** уровней и **1/4** foam-уровней.

Тематически естественные foam-контексты: `M3_02` (pool/laundry) и `M3_15` (abandoned laundry). `M3_12` (Second Skin signal / old gym) и `M3_16` (gymnastics scanner) не имеют достаточной причины использовать soap foam.

### Resolution candidate — G5b-PT2-M3-001

Каждый blocker layer теперь блокирует перестановку и падение фишки до снятия слоя; foam остаётся только в `M3_02` и `M3_15`. После PR #345 обновлённый 4,400-run auto audit на текущем main фиксирует M3_02: 129/200 wins (64.5%), median 21/25 moves, reshuffle 4.62%. Это agent-only диагностический сигнал. При первом human retest игрок сообщил, что условие снятия foam слоя остаётся неясным; tutorial copy уточняет ортогональное соседство и исключает диагональ. Повторный тест M3_02 / M3_15 нужен после merge. См. [свежий all-22 audit](../reports/G5B_POST_FEEDBACK_MATCH3_AUTO_AUDIT_2026-10-04.json).

## Scope decisions

- User selected the two-step locked blocker: first adjacent/on-cell clear removes the padlock; the next clear removes the diagonal chains. Campaign placements use two layers; the covered tile stays locked until both are gone. M3_05 introduces the rule with a unique localized tutorial.

- Screenplay directives остаются authoritative metadata и stable VN IDs не удаляются.
- Player-facing `VARIABLE/CUT TO/INSERT/FADE IN/CHOICE CHECKPOINT` presentation удаляется.
- Не реализовывать memory-card gallery, phone-photo insert, close-up system или другие новые renderer'ы только потому, что такие режиссёрские ремарки существуют в screenplay. Это optional future work, если позднее будет отдельная product need.
- Blocker layer mechanics можно оставить двухслойными, но цифры не обязаны сообщать внутреннее состояние игроку: визуальная деградация blocker art должна быть достаточной.
- Glow не является обязательным fix; это controlled visual experiment после стабилизации размера персонажей.

## Порядок маленьких слайсов

1. `G5-PT2-VN-001` — убрать служебные VN-экраны, защитить choice/background/save semantics тестами.
2. `G5b-PT2-M3-005` + `G5b-PT2-M3-006` — interaction pacing и geometry stability.
3. `G5b-PT2-M3-002` — blocker counters/art occlusion.
4. `G5b-PT2-M3-001` — foam semantics и thematic mapping.
5. `G5b-PT2-M3-004` + `G5b-PT2-M3-003` — special marker и светлый top (**accepted by user retest**).
6. `G5-PT2-VN-002` — character scale baseline.
7. `G5-PT2-VN-003` — optional edge-glow experiment.

Runtime slices PR #342–#349 merged; все три Browser Gate checks прошли для каждого PR. Следующий Match-3 slice заменяет blocker PNG и уточняет foam tutorial; далее — короткий retest, оставшиеся VN/geometry checks, затем полный human pass на 22 production levels. Auto-agent audit не считается human balance evidence. Edge-glow эксперимент закрыт без production CSS/golden diff.

## Human retest 1 — first campaign tranche (user, 2026-10-04)

### Accepted from direct observation

- `G5b-PT2-M3-005`: invalid no-match swap returns promptly; feedback does not block the board.
- `G5b-PT2-M3-003`: light transparent top/camisole remains readable.
- `G5b-PT2-M3-004`: specials no longer show the replaced base tile; line-clear direction is clear.
- Partial confirmation for `G5b-M3-RECT-002`: new panties/sports socks read as distinct tiles; variety improves; M3_04 H shape reads clearly. Campaign-wide 9x7 comfort/balance was not explicitly assessed.
- Partial confirmation for `G5b-PT2-M3-002`: layer numbers are gone and covered tiles are more visible.
- `G5-PT2-VN-002`: user checked merged PR #353 and confirmed the common solo/duo/trio portrait scale and vertical alignment look good.
- `KI-009`: user visually accepted locked blocker treatment in merged PR #353; chains/padlock stay opaque while the underlying tile is slightly transparent.

### Follow-up required

- `KI-008` / `G5b-PT3-M3-ART-001`: **closed by user confirmation after PR #353.** Empty transparent zip-bag at M3_01 is accepted; the contents fit fully inside its clear window. At 64%, the sports-socks alpha bounds render at about 118×158 px inside a measured 196×185 px clear window.
- `KI-009` / `G5b-PT3-M3-ART-001`: **closed · PR #353.** Backing square absent; chains/padlock remain opaque; only the tile beneath receives subtle transparency (`opacity: .84`). User visually accepted the merged result.
- `KI-010` / `G5b-PT3-M3-UX-002`: foam currently blocks movement in the merged build, but the user now prefers it to allow moving/matching covered tiles while slightly obscuring them. Preserve the established damage condition: one layer per clear on the foam or one orthogonal cell away; diagonal contact does not count. Add a separate localized first-encounter popup.
- `G5b-PT2-M3-001`, `G5b-PT2-M3-002`, `G5b-PT2-M3-006`, G5b UI/geometry, and full campaign balance stay in review where acceptance was not directly reported. `G5-PT2-VN-002` and `KI-008` are accepted.

## Follow-up design feedback — first blocker levels

- M3_00 should teach only the basic swap and have one goal: collect a set quantity of items. Remove blocker and ingredient objectives from this first level.
- Keep the empty zip-bag at M3_01 as the first hard blocker and explain how to remove it in RU/BE/EN.
- Foam is the lightest blocker: it slightly reduces visibility, but does not prevent moving or matching its covered tile. A match on foam or in a side-adjacent cell removes one layer; a diagonal match does not.
- Add a separate first-encounter explanation for foam at M3_02 in RU/BE/EN. Unique tutorial IDs prevent legacy completion state from hiding it.
- The user chose two visible locked-blocker stages (padlock first, chain second). Both stages use the shared adjacent/on-cell clear rule, while the first clear swaps the visual to the chain-only asset.
- User confirmed the 9×7 field size and campaign balance are comfortable; retain 9×7.

The tester did not provide device/build/date details; no platform-specific claim is inferred.

## Published-build verification — 2026-10-04

Checked `https://bezdredoff.github.io/UPDS/` on `v0.27.2-dev` in a desktop browser. The temporary `?qa=1` Level Lab was used for isolated M3_02/M3_05 runs and then disabled with `?qa=0`; campaign progress was not changed by those lab runs.

- M3_00 was played to a win; its production field had no blockers.
- M3_02 resolved a hinted match involving a foam-covered tile; the blocker objective advanced and the visible foam changed. Persistent Help states that covered tiles remain movable, a clear on/orthogonally beside foam removes one layer, and diagonal contact does not count. This closes the foam-mechanics ambiguity (`KI-010`) and confirms `G5b-PT2-M3-001`; first-entry coachmark review remains separate.
- M3_05 showed padlock-and-chain assets over two-layer blocker placements. Help correctly says the first clear removes the lock and the next clear removes the chain. The actual gameplay transition from padlock to chain-only was not exercised; `G5b-PT3-M3-BLOCKER-004` remains in review.
- The permanent guide opens during a level and presents all three blocker rules. `G5b-PT3-M3-HELP-005` is accepted. Its zip-bag illustration is almost indistinguishable from the dark thumbnail background at the rendered size (`KI-011`).
- The board's accessibility name still says “Поле 8 на 8” while runtime geometry and visible board are 7 columns × 9 rows (`KI-012`).
- Focused suite passed: 8 test files / 93 tests.

This is browser evidence, not an iPhone/PWA retest or a complete 22-level balance pass. No production files were changed during the QA run.
