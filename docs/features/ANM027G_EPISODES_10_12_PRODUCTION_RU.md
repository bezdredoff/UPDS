# ANM-027G — Episodes 10–12 Canonical Production Batch

Status: **R1.1 IN QA**. Base: merged ANM-027G `7–9` R1.2 (`39bd8451967d69bc53fb4a6e2ac80408ea2c3aaa`).

## R1.1 CI hotfix

R1 прошёл 392/394 теста; два падения были stale snapshot assertions, а не runtime/content regressions. R1.1 переводит общий macro boundary test и authored-shot adoption test на expandable-content invariants, а точные shot IDs сохраняет в batch-specific milestone tests `4–6`, `7–9`, `10–12`. Production story/levels/localization data относительно R1 не меняются.

## Цель

Третий последовательный ANM-027G package превращает macro slots `10–12` в canonical playable content без новых Match-3 mechanics и без возобновления paused character-art generation. После acceptance authored prefix становится `0–12`; slots `13–21` остаются macro-locked.

## Canonical screenplay

Новый source `src/content/ANM-027G_Episodes_10_12_Screenplay.md` и scoped manifest `src/content/story/ANM027G.episodes-10-12.story.json` добавляют 119 stable lines `VN0489–VN0607` и шесть VN scenes. Общий runtime после batch: **619 authored lines**, zero deferred IDs, 27 VN scenes и 13 story Match-3 routes.

- slot 10 — «Чёрный пояс, белые трусы»: Аой даёт контрольную выборку экипировки; серебристая система обнаруживается не только на белье;
- slot 11 — «Самый заметный тайный груз»: фотографии Кэнтаро, пломбы и манифест восстанавливают laundry → Asterion → return chain;
- slot 12 — «ПанцуИтер существует?!»: оккультная приманка отделяет легенду от активного радиосигнала и раскрывает внутреннее имя `Second Skin`.

Terminal ID: `ENDING_AUTHORED_FRONTIER_12`. Это authored-content frontier, не финал CASE 001.

## Presentation / art budget

Aoi остаётся `episode-guest` из `upds-guest-witness-production-v1`; fake full-stage asset не создаётся. Kentaro сохраняет planned full-stage fallback. `campus-exterior` впервые триггерится macro lock, но текущий R1.1 использует semantic background aliases до внешнего Stable Diffusion production pass.

Macro hero-clue triggers `asterion-transfer-chain` и `second-skin-tag` представлены native evidence UI на существующих clue assets. Dedicated CG не генерируется и не подменяется случайным изображением.

## Match-3

Три production configs переиспользуют только существующий framework:

- `M3_10_CONTROL_SAMPLE_GEAR` — `locker-columns`, clearBlockers + collect + drop;
- `M3_11_ASTERION_TRANSFER` — `service-lanes`, clearBlockers + dropGroup + drop;
- `M3_12_SECOND_SKIN_SIGNAL` — `signal-cross`, clearBlockers + collect + drop.

Новые semantic ingredients/blocker используют существующие production assets. New mechanic trigger отсутствует.

## Choices

Additive `CampaignSave.storyChoices` получает два gate без изменения schema/key:

- `photo-permission` at `VN0560`;
- `publish-tag` at `VN0601`.

Они меняют relationship/evidence direction будущего контента, но не переписывают подтверждённые факты и не форкают текущий route graph.

## Localization

RU/EN catalog parity покрывает 619 canonical lines, новые scene headers, choices, Match-3 objectives/barks/clues и reaction catalog. VN/level/choice IDs остаются locale-independent.

## Acceptance gates

1. `VN0489–VN0607` contiguous, scoped manifest и multi-source runtime audit проходят fail-closed;
2. 619 canonical/runtime lines, zero deferred;
3. 27 scenes / 13 Match-3 routes reachable, terminal frontier `12`;
4. macro authored `0–12`, macro-only `13–21`;
5. Aoi resolves through guest tier без broken/fake image;
6. semantic background aliases не считаются новыми production masters;
7. все 13 Match-3 levels проходят legality/start/hint/definition contracts;
8. RU/EN parity и no-raw-key/no-Cyrillic-in-EN runtime guards зелёные;
9. iPhone preview проходит E10 → M3_10 → E11 → M3_11 → E12 → M3_12 → authored frontier.

Следующий package после merge: **ANM-027G `13–15`**.
