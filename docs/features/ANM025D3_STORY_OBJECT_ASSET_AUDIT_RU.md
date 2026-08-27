# ANM-025D3 — Measured Story-object Asset Audit

## Цель

Восстановить потерянный shortlist «четырёх проблемных Match-3 assets» из текущего runtime source-of-truth, а не по памяти или визуальной догадке.

## Измерение

`ingredientPresentation` содержит 27 semantic story-object identities, но runtime сводит их всего к четырём физическим изображениям.

| Priority | Runtime asset | Semantic identities |
| --- | --- | ---: |
| 1 | `goal_receipt.png` | 10 |
| 2 | `goal_memory_card.png` | 9 |
| 3 | `clue_towel_conductive_seam.png` | 6 |
| 4 | `clue_service_key.png` | 2 |

Итого: **27 semantic identities → 4 visual identities**.

Это и есть объективный текущий shortlist для asset-readability pass: каждый из четырёх файлов реально используется production levels и каждый представляет больше одного сюжетного предмета.

## Почему это проблема visual causality

После C3 игрок уже получает правильную текстовую подсказку и название текущего story object. Однако board/objective icon может показывать один и тот же визуал для семантически разных объектов.

Примеры текущего conflation:

- receipt-like art представляет не только квитанции, но и календарь, гарантийную карту, спецификацию, накладные, route card, manifest, каталог и подтверждение;
- memory-card art представляет карту памяти, журнал ремонта, лист номеров, пломбу, pilot list, книгу заказов, scanner, backup drive и финальный слайд;
- conductive-seam close-up представляет полотенце, катушку, напульсник, Second Skin tag, пакет и marked item;
- service-key art представляет и физический ключ, и key-card.

Таким образом textual semantics и visual semantics расходятся именно на этих четырёх shared assets.

## Machine-readable source

`src/content/art/ANM025D3.match3-story-object-asset-audit.json`

Schema: `upds-match3-story-object-asset-audit-v1`.

## Что не меняется в D3

D3 — только измерение и фиксация shortlist. Он не меняет:

- runtime assets или mapping;
- ingredient/drop mechanics;
- objectives, targets или placements;
- board topology, moves или balance;
- engine/controller/frame schema;
- localization, save или telemetry;
- C3 contextual guidance.

## Automated contract

`Match3StoryObjectAssetAudit.test.ts` доказывает:

- все 27 ingredient identities реально сводятся ровно к четырём assets;
- fan-out четырёх assets равен `10 / 9 / 6 / 2`;
- priority shortlist следует semantic fan-out;
- каждый shortlisted asset реально используется production levels.

## Следующий шаг

D4 должен работать **только с этими четырьмя runtime visual families**. Цель — уменьшить semantic ambiguity через split/replacement visual identities без изменения gameplay. Конкретный art scope можно выбирать атомарно, начиная с `goal_receipt.png` и `goal_memory_card.png`, потому что они покрывают 19 из 27 semantic identities.
