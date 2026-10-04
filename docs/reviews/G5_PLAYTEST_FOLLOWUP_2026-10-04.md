# G5 / G5b — Playtest follow-up 2026-10-04

Status: **PR #342–#349 merged. Runtime candidates passed the Browser Gate; G5b/VN scale human retest remains open.**

Источник — integrated iPhone playtest после PR #341. Этот документ переводит наблюдения игрока в bounded release work. По умолчанию новые системы не строятся: сначала удаляем misleading/prototype presentation и исправляем воспроизводимые UX-дефекты.

## Что подтвердил playtest

| ID | Наблюдение | Решение |
| --- | --- | --- |
| G5-PT2-VN-001 | VN показывает `VARIABLE`, `CUT TO`, `INSERT`, `FADE IN`, `CHOICE CHECKPOINT` как полноценные игровые экраны | **R0 / review · PR #342.** Authored directives сохранены как runtime metadata и auto-consumed в player VN; Browser Gate прошёл. Проверить на телефоне background transitions, choice gates, history и сохранение progression; `KI-006` открыт до этой проверки. |
| G5-PT2-VN-002 | размер персонажей заметно меняется между solo/duo/trio | **R1 / review · PR #348.** Общий масштаб 0.72 применяется к legacy solo и authored solo/duo/trio; x-позиции и eye-line anchors сохранены. VN0008 Linux/WebKit golden проверен; Quality, Chromium и Mobile WebKit прошли. Human visual acceptance ожидается. |
| G5-PT2-VN-003 | в composition preview есть edge glow, в runtime нет | **R2 / проверено, отклонено · PR #349.** Слабый 1px edge treatment сравнен с runtime на solo, duo и trio. Ореол/style drift не заметны, но на мобильном размере преимущество практически неразличимо. Production CSS и goldens не менялись. |
| G5b-PT2-M3-001 | foam выглядит как blocker, но M3_02 позволяет двигать/матчить фишки под ним; foam также используется вне мокрых/прачечных сцен | **R1 / review · PR #345.** Все blocker layers блокируют interaction; foam остаётся в M3_02/M3_15, M3_12/M3_16 используют solid. На свежем auto audit M3_02: 129/200 побед, медиана 21/25 ходов, reshuffle 4.62%; нужна human/device перепроверка. См. [G5b blocker semantics](../features/G5B_M3_BLOCKER_SEMANTICS_RU.md) и [current all-22 audit](../reports/G5B_POST_FEEDBACK_MATCH3_AUTO_AUDIT_2026-10-04.json). |
| G5b-PT2-M3-002 | цифры слоёв мешают визуалу; коробки и цепи перекрывают tile art | **R1 / review · PR #344.** Player-facing layer numbers удалены, solid стал визуально прозрачнее, locked легче читается. Слои и механика сохранены; PNG не менялись. Нужна visual/device-приёмка. См. [ANM025D2](../features/ANM025D2_BLOCKER_READABILITY_RU.md). |
| G5b-PT2-M3-003 | светлый прозрачный top/camisole визуально становится тёмным | **R1 / review · PR #347.** Production tile `camisole` получил адресную яркость; PNG, alpha, форма, match identity, mechanics и balance не менялись. Проверить читаемость на телефоне в кампании. |
| G5b-PT2-M3-004 | у всех specials остаётся маленькая иконка исходной фишки, хотя special уже является отдельным объектом | **R1 / review · PR #346.** Удалён `special-base-marker`, directional marker сохранён; mechanics и PNG не менялись. Проверить production special на реальном поле. |
| G5b-PT2-M3-005 | `НЕТ СОВПАДЕНИЯ` и возврат невалидного swap ощущаются слишком медленными | **R1 / review · PR #343.** Hold сокращён до 700 ms; tile stacks возвращаются после короткого 150 ms swap-return и оказываются дома в пределах 500 ms. Reduced-motion сохраняет семантику. |
| G5b-PT2-M3-006 | после drop-цели поле иногда слегка увеличивается/сдвигается вниз | **R1 / review · PR #343; KI-007 open pending iPhone retest.** `.match-guidance-slot` сохраняет общий footprint после drop; deterministic before/after capture проверяет layout owners, без compensating transform. |

## Foam / blocker distribution

Production campaign содержит 22 уровня:

- `locked`: 7/22 = **31.8%**;
- `solid`: 11/22 = **50.0%**;
- `overlay` с foam art: 4/22 = **18.2%**.

На момент исходного feedback foam стояла на `M3_02`, `M3_12`, `M3_15`, `M3_16`. Только `M3_02` имел permeability exception: **1/22 (4.5%)** уровней и **1/4** foam-уровней.

Тематически естественные foam-контексты: `M3_02` (pool/laundry) и `M3_15` (abandoned laundry). `M3_12` (Second Skin signal / old gym) и `M3_16` (gymnastics scanner) не имеют достаточной причины использовать soap foam.

### Resolution candidate — G5b-PT2-M3-001

Каждый blocker layer теперь блокирует перестановку и падение фишки до снятия слоя; foam остаётся только в `M3_02` и `M3_15`. После PR #345 обновлённый 4,400-run auto audit на текущем main фиксирует M3_02: 129/200 wins (64.5%), median 21/25 moves, reshuffle 4.62%. Это agent-only диагностический сигнал; human/device acceptance и ретест M3_12/M3_16 ещё ожидаются. См. [свежий all-22 audit](../reports/G5B_POST_FEEDBACK_MATCH3_AUTO_AUDIT_2026-10-04.json).

## Scope decisions

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
5. `G5b-PT2-M3-004` + `G5b-PT2-M3-003` — special marker и светлый top.
6. `G5-PT2-VN-002` — character scale baseline.
7. `G5-PT2-VN-003` — optional edge-glow experiment.

Runtime slices PR #342–#348 merged; все три Browser Gate checks прошли для каждого PR. PR #349 тоже прошёл Quality, Chromium и Mobile WebKit. Следующий release шаг — human retest на текущем merged `main`, начиная с исправлений `G5-PT2` и 22 production Match-3 levels; auto-agent audit не считается human balance evidence. Edge-glow эксперимент закрыт без production CSS/golden diff.
