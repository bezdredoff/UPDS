# ANM-027G R1.1 — Episodes 4–6 Canonical Production Batch

Status: **candidate / GitHub CI + iPhone gameplay QA required**.  
Baseline: `main` commit `b9e74c0038b75912179e2493d7425e72059e4976` (ANM-028B3 R1.1 / PR #104).

## Цель

Перевести первый post-slice пакет из ANM-027F macro lock в реально playable canonical content, не создавая новую механику и не блокируя сценарий отсутствующим внешним character/background art.

Batch охватывает slots `4–6`:

1. «Чрезвычайное бельевое совещание»;
2. «Заслон для вора»;
3. «Мастерская подозрительного размера».

После acceptance authored prefix становится `0–6`; slots `7–21` остаются `macro-locked`.

## Canonical screenplay/import

Новый source: `src/content/ANM-027G_Episodes_04_06_Screenplay.md`.

- 119 новых stable lines: `VN0251–VN0369`;
- шесть VN scenes: `VN_SCENE_09_E4_PRE` … `VN_SCENE_14_E6_POST`;
- manifest: `src/content/story/ANM027G.episodes-04-06.story.json`;
- `VN0250` из ANM-003 повышен из historical teaser до canonical bridge в E4;
- `storyRuntime.ts` теперь fail-closed импортирует несколько screenplay sources, каждый со своим scoped manifest;
- суммарно runtime получает 381 canonical authored line без deferred IDs.

ANM-003 остаётся самостоятельным source для slots `0–3`; его не раздуваем дальнейшими эпизодами.

## Playable route

Story graph расширен с 9 до 15 VN scenes и с 4 до 7 story Match-3 routes:

`VN0250 → E4 pre → M3_04 → E4 post → E5 pre → M3_05 → E5 post → E6 pre → M3_06 → E6 post → authored frontier`.

Текущий terminal ID — `ENDING_AUTHORED_FRONTIER_06`: это не «дело раскрыто», а честная граница реализованного контента перед slot 7 / Asterion.

## Story choices

Добавлен data-driven `src/data/storyChoices.ts` с двумя additive gates:

- `meeting-tone` после `VN0262`;
- `apology-to-hinata` после `VN0356`.

Оба имеют A/B/C варианты и сохраняются в `CampaignSave.storyChoices`. Legacy `CHOICE_00` и `CampaignSave.choice` не меняются. `SAVE_SCHEMA_VERSION` остаётся `2`, save key не меняется; старые saves нормализуются с пустым `storyChoices`.

Эти выборы пока меняют relationship-state для будущего authoring, но не переписывают факты дела и не создают параллельную сюжетную ветку.

## Match-3 4–6

Добавлены три production configs поверх существующего ANM-025/026 framework:

| Level | Moves | Objectives | Reused archetype |
|---|---:|---|---|
| `M3_04_EMERGENCY_MEETING` | 28 | collect tags + clear rumor cards + drop laundry calendar | ordered-grid |
| `M3_05_BASKETBALL_LOCKERS` | 27 | clear locker locks + collect service tags + drop repair log | locker-columns |
| `M3_06_TEXTILE_WORKSHOP` | 29 | clear garment bags + collect orders + drop warranty/spool group | workbench-clusters |

Новых gameplay mechanics нет. Новые semantic blocker/ingredient IDs используют существующие production images; это позволяет отдельно заменить presentation позже без изменения правил.

Quantitative E3 baseline остаётся утверждённым только для исходных уровней `0–3`. Уровни `4–6` имеют валидный production config, но не объявляются «сбалансированными» до реального playtest.

R1.1: `M3_04` переносит одну `rumorCard` с board index `14` на `22`, чтобы deterministic first legal move не создавал match через locked cell и сохранял общий smoke-contract `cleared >= 3`. Количество blockers, objectives и moves не меняются.

## Background/art boundary

027F разрешает batch `4–6` без нового master-location family. Поэтому runtime вводит три semantic aliases:

- `studentCouncilAuditorium` → текущий clubroom master;
- `basketballLocker` → athletics locker master;
- `textileWorkshop` → Kentaro apartment/workshop master.

Это **не финальный art approval**. Alias отделяет content identity от файла: внешний Stable Diffusion background позже заменяет один mapping, а screenplay/story IDs/level route не меняются.

Новые PNG/WebP в пакете отсутствуют.

Hinata в slots `5–6` использует уже смерженный ANM-028B3 `guest-testimony-card`; пока package `planned`, renderer честно показывает asset-free placeholder. Mayu и другие отсутствующие full-stage assets продолжают существующие placeholder contracts.

## Authored staging

027G расширяет B2 Golden Sample только actor-only сценами с уже принятыми presets:

- `VN0254` — `trio-central-speaker`;
- `VN0273` — `trio-reaction`;
- `VN0341` — `trio-central-speaker`.

Guest lines Хинаты не маскируются под B2 actors: ими владеет B3 renderer.

## Localization boundary

RU/EN получают полную parity для всех 381 текущих canonical lines и новых runtime keys. Stable IDs остаются locale-independent. Mass production остальных целевых языков всё ещё ждёт полного canonical screenplay `0–21`.

## Automated acceptance

GitHub CI должен подтвердить как минимум:

- 381 audited canonical lines, zero deferred;
- 15 contiguous graph scenes и семь story Match-3 routes;
- семь валидных production levels;
- macro status authored `0–6`, macro-only `7–21`;
- RU/EN catalog parity и отсутствие Cyrillic literals в localized runtime controllers;
- два story-choice gate при неизменном save schema/key;
- semantic background aliases не создают новых master binaries;
- старые ANM-003 routes/CHOICE_00 сохраняются.

## Manual iPhone QA

1. Продолжить Story после старого `VN0249`: после `VN0250` игра должна перейти в E4, а не в старый ending.
2. E4: увидеть трио, пройти `meeting-tone`, затем запустить/закончить `M3_04`.
3. E5: проверить Hinata через B3 guest card/placeholder и пройти `M3_05`.
4. E6: пройти `M3_06`, затем выбрать `apology-to-hinata` и дойти до authored frontier.
5. Убедиться, что новые backgrounds выглядят как намеренно переиспользованные masters, а не как ошибочно заявленный финальный art.
6. В Match-3 Campaign должны быть доступны семь production levels с последовательным unlock.

После merge следующий content package — **ANM-027G `7–9`**. Он впервые триггерит новый master-family `lab-asterion`, поэтому его asset brief можно производить параллельно со screenplay/config интеграцией.
