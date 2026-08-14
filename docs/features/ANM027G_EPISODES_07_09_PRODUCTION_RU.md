## R1.2 expandable-test correction

R1.2 не меняет screenplay, runtime, Match-3 configs или localization. После R1.1 GitHub Quality gate оставил один stale snapshot в `CampaignStore.test.ts`: level index `9` уже валиден, но тест всё ещё ожидал, что он будет отброшен. Вместо очередного literal update три затронутых expandable-content assertions переведены на source-derived invariants (`levels.length`, `storySceneIds.length`, `MAX_OBJECTIVES_PER_LEVEL`). Exact milestone coverage остаётся в `StoryBatch0709.test.ts` и других content audits.

# ANM-027G — Episodes 07–09 Production Batch

Status: **R1.1 IN QA**. Base: merged ANM-027G `4–6` R1.1 (`976b4056528856760994c5eb8b1e755e2dc86c94`).

## R1.1 CI-contract correction

R1 runtime/story/gameplay content remains unchanged. R1.1 updates three stale test expectations that still encoded the previous `4–6` frontier: standalone campaign count `7 → 10`, normalized last story scene index `14 → 20`, and objective-count coverage from seven to ten production levels.

## Цель

Второй последовательный ANM-027G package превращает macro slots `7–9` в настоящий canonical playable content, не возобновляя paused character-art generation и не создавая fake runtime assets.

После acceptance authored prefix становится `0–9`; slots `10–21` остаются `macro-locked`.

## Canonical screenplay

Новый source:
- `src/content/ANM-027G_Episodes_07_09_Screenplay.md`;
- `src/content/story/ANM027G.episodes-07-09.story.json`;
- 119 stable lines `VN0370–VN0488`;
- шесть VN scenes: E7 pre/post, E8 pre/post, E9 pre/post;
- суммарный canonical runtime: **500 authored lines**, zero deferred IDs.

Runtime collection остаётся additive: ANM-003, `4–6` и `7–9` парсятся одним `storyRuntime.ts`; controller-specific episode tables не добавляются.

## Playable route

`... E6 post → E7 pre → M3_07 → E7 post → E8 pre → M3_08 → E8 post → E9 pre → M3_09 → E9 post → authored frontier`.

Terminal ID: `ENDING_AUTHORED_FRONTIER_09`. Это граница реализованного canonical контента, а не финал CASE 001.

## Episode 7 — Asterion

- Kurose узнаёт проводящую нить и даёт правдоподобное техническое объяснение;
- физическое совпадение отделено от administrative assignment registry;
- serial batch официально не числится в приёмке;
- `M3_07_ASTERION_THREAD`: `signal-cross`, clear blockers + collect + drop;
- evidence: `CUE_008 / asterion-thread`.

`asterionLab` — отдельный semantic background key, временно mapped на существующий master. Новый binary background не подделывается; внешний Stable Diffusion master позже заменит только mapping.

## Episode 8 — Lost & Found

- Rina впервые появляется как recurring-stage character;
- 87 sealed packages показывают масштаб системы;
- из журнала исчезают целые диапазоны номеров;
- `M3_08_LOST_FOUND_LEDGER`: reusable `service-lanes`, clear blockers + collect + drop;
- evidence: `CUE_009 / missing-package-ranges`.

`lostFoundWarehouse` — semantic variant family `laundry-service` без нового binary master в этом code/content package.

## Episode 9 — Maintenance

- Gen остаётся в отдельном B3 guest/witness tier;
- master-key timeline исключает его как непосредственного вора;
- неформальная передача тележки Rina и ночные Asterion containers фиксируют physical route;
- `M3_09_MAINTENANCE_KEYS`: reusable `service-lanes`, clear blockers + collect + dropGroup;
- evidence: `CUE_010 / night-containers`;
- additive choice gate `protect-gen-source` в `VN0480`; save schema остаётся `2`.

## Character production boundary

ANM-027F впервые триггерит full-stage production для Kurose и Rina, но character-art generation остаётся внешним/paused. Поэтому:
- `rina` и `kurose` добавлены в `upds-character-production-v2` как **planned**;
- оба имеют adult guardrail, speaker routing и placeholder metadata;
- у них **нет `assets` paths**;
- runtime использует существующий production-safe planned placeholder;
- Gen остаётся `upds-guest-witness-production-v1`, тоже asset-free planned.

Переход planned → production требует отдельного внешнего art import и обычного visual QA; этот screenplay package не ослабляет seven-asset full-stage contract.

## Match-3 production

| Level | Moves | Objectives | Archetype |
|---|---:|---|---|
| `M3_07_ASTERION_THREAD` | 28 | clearBlockers + collect + drop | signal-cross |
| `M3_08_LOST_FOUND_LEDGER` | 30 | clearBlockers + collect + drop | service-lanes |
| `M3_09_MAINTENANCE_KEYS` | 29 | clearBlockers + collect + dropGroup | service-lanes |

Новых mechanics нет. Новые blockers/ingredients используют существующую presentation asset library; semantic identities отделены от бинарного art replacement.

## Localization

RU/EN catalog parity расширена на все 500 canonical lines, шесть scene headers, три level packages, choice gate, clues, ingredients/blockers и narrative reactions. Stable IDs locale-independent. Остальные target locales всё ещё ждут полного screenplay `0–21`.

## Acceptance

Automated gates должны подтвердить:
1. `VN0370–VN0488` contiguous и source manifest корректен;
2. 500 canonical/runtime lines, zero deferred;
3. 21 scene / 10 Match-3 route graph полностью reachable;
4. macro authored `0–9`, macro-only `10–21`;
5. Rina/Kurose planned entries asset-free, Gen остаётся guest tier;
6. RU/EN parity и отсутствие Cyrillic fallback в English authored lines;
7. все 10 Match-3 levels проходят legality/start/hint/definition contracts;
8. protected pipeline files не меняются.

Manual iPhone QA:
- E7: Kurose placeholder не выдаётся за готовый арт; Asterion semantic background читается и VN→M3→VN route работает;
- E8: Rina placeholder и 87-package dialogue не ломают paging;
- E9: Gen guest testimony card, `protect-gen-source`, M3_09 и authored frontier работают;
- Match-3 Campaign показывает 10 последовательных levels.

Следующий package после merge: **ANM-027G `10–12`**.
