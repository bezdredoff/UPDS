# G5 / G5b — Playtest follow-up 2026-10-04

Status: **R0 VN slice merged in PR #342; G5b Match-3 pacing, geometry and blocker candidates in review**.

Источник — integrated iPhone playtest после PR #341. Этот документ переводит наблюдения игрока в bounded release work. По умолчанию новые системы не строятся: сначала удаляем misleading/prototype presentation и исправляем воспроизводимые UX-дефекты.

## Что подтвердил playtest

| ID | Наблюдение | Решение |
| --- | --- | --- |
| G5-PT2-VN-001 | VN показывает `VARIABLE`, `CUT TO`, `INSERT`, `FADE IN`, `CHOICE CHECKPOINT` как полноценные игровые экраны | **R0 / active.** Сохранить authored directives как runtime metadata, но не рендерить их игроку. Choice gates и background transitions должны продолжить работать. Не строить hero-insert/gallery subsystem ради этих ремарок. |
| G5-PT2-VN-002 | размер персонажей заметно меняется между solo/duo/trio | **R1.** Проверить unified playable scale с trio composition как baseline и сохранить только необходимое позиционирование по X. |
| G5-PT2-VN-003 | в composition preview есть edge glow, в runtime нет | **R2 experiment.** Проверить очень слабый общий edge treatment на 1/2/3 персонажах. При заметном halo/style drift — не принимать. |
| G5b-PT2-M3-001 | foam выглядит как blocker, но M3_02 позволяет двигать/матчить фишки под ним; foam также используется вне мокрых/прачечных сцен | **R1 / review.** Candidate: любой blocker layer блокирует interaction; foam остаётся в M3_02/M3_15, M3_12/M3_16 используют solid. Same-seed 200-run win rate M3_02 остался 64.5%, но медиана использованных ходов выросла 15→21; нужен human/device retest. См. [G5b blocker semantics](../features/G5B_M3_BLOCKER_SEMANTICS_RU.md) и [audit](../reports/G5B_FOAM_SEMANTICS_AUDIT_2026-10-04.json). |
| G5b-PT2-M3-002 | цифры слоёв мешают визуалу; коробки и цепи перекрывают tile art | **R1 / review.** Candidate убирает player-facing числа, показывает solid как прозрачный CSS-пакет поверх существующего PNG и облегчает locked CSS-обработкой. Слои и механика сохранены; PNG не менялись. Нужна визуальная/device-приёмка. См. [ANM025D2](../features/ANM025D2_BLOCKER_READABILITY_RU.md). |
| G5b-PT2-M3-003 | светлый прозрачный top/camisole визуально становится тёмным | **R1.** Исправить art/readability, не меняя match identity. |
| G5b-PT2-M3-004 | у всех specials остаётся маленькая иконка исходной фишки, хотя special уже является отдельным объектом | **R1 / review.** В production board удалён `special-base-marker`; row/column directional marker сохранён. Обновлены unit/readability/E2E contracts; механика и PNG не менялись. Ожидает PR CI и review. |
| G5b-PT2-M3-005 | `НЕТ СОВПАДЕНИЯ` и возврат невалидного swap ощущаются слишком медленными | **R1 / review.** Hold сокращён до 700 ms; tile stacks начинают возвращаться после 150 ms обмена и оказываются дома в пределах 500 ms, при этом сообщение остаётся видимым. Reduced-motion сохраняет тот же feedback timing. |
| G5b-PT2-M3-006 | после drop-цели поле иногда слегка увеличивается/сдвигается вниз | **R1 / review; KI-007 open pending iPhone retest.** Deterministic Chromium capture выявил owner: `.match-guidance-slot` терял 12 px после `display:none` завершённой подсказки; flex playfield забирал освободившуюся высоту. Подсказки уложены в общий grid footprint; без compensating transform. Before/after snapshot проверяет все layout owners. |

## Foam / blocker distribution

Production campaign содержит 22 уровня:

- `locked`: 7/22 = **31.8%**;
- `solid`: 11/22 = **50.0%**;
- `overlay` с foam art: 4/22 = **18.2%**.

На момент исходного feedback foam стояла на `M3_02`, `M3_12`, `M3_15`, `M3_16`. Только `M3_02` имел permeability exception: **1/22 (4.5%)** уровней и **1/4** foam-уровней.

Тематически естественные foam-контексты: `M3_02` (pool/laundry) и `M3_15` (abandoned laundry). `M3_12` (Second Skin signal / old gym) и `M3_16` (gymnastics scanner) не имеют достаточной причины использовать soap foam.

### Resolution candidate — G5b-PT2-M3-001

Каждый blocker layer теперь блокирует перестановку и падение фишки до снятия слоя. Foam остаётся только в `M3_02` и `M3_15`; `M3_12` и `M3_16` используют существующий `solid`. Все placements, layers, goals, moves, seeds и board shapes сохранены. Same-seed simulation и human/device acceptance ещё ожидаются.

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

Каждый runtime slice должен идти отдельным маленьким PR поверх свежего `main`; visual baseline обновляется только после проверки intentional visual diff.
