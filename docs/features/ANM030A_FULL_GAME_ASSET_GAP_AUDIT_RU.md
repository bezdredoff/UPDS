# ANM-030A R1.1 — Full Game Asset Gap Audit

Status: **R1.1 candidate**. Non-visual production-planning slice: no runtime asset, story, gameplay, save, localization or staging geometry changes.

## Цель

Перевести уже завершённый canonical content lock `0–21` в точный production backlog. Аудит отличает «runtime умеет что-то показать» от «для этого существует утверждённый production-ready art» и не считает semantic fallback полноценным asset.

Machine-readable source of truth: `src/content/art/ANM030A.asset-gap-audit.json` (`upds-asset-gap-audit-v1`). Он **не заменяет** story macro, character/guest manifests, level configs или runtime resolver; это производная матрица текущего baseline `6c7ced64284ecb30c2cdbc134468304c1a428cb4`.

## Статусы

- `production` — требуемый production asset/contract реально существует и используется;
- `runtime-fallback` — игра уже playable, но показывает semantic alias, placeholder, native evidence или legacy art;
- `planned-missing` — production package/variant залочен, но отдельного production asset ещё нет;
- `reusable` — отдельный уникальный asset по контракту не нужен;
- `external-art-blocked` — закрывается внешним Stable Diffusion/ComfyUI/background art workflow, а не repo-side генерацией;
- `rebuild-required` — asset существует в legacy package, но не принят как production style reference;
- `legacy-orphan` — бинарник физически есть, но текущий runtime data graph его не использует.

## Итог в цифрах

| Область | Текущее состояние | Production gap |
|---|---:|---:|
| Story | 22 / 22 slots authored | 0 content gaps |
| Background families | 8 | 4 new master families + variants |
| Background variants | 5 dedicated production / 24 runtime-used | 19 semantic aliases |
| Contract-only background variants | 2 | do not produce before actual use |
| Full-stage cast | 3 ready + 1 mixed + 5 planned = 9 | 38 replacement/new outputs |
| Guest packages | 0 / 6 production | 24 assets |
| Extras | 7 semantic roles | map onto ≤4 reusable visual archetypes |
| Hero clue close-ups | 0 / 6 dedicated | 6 external-art outputs |
| Match-3 | 22 levels / 6 layouts / 22 profiles | 1 shared production-art gap: 5 special/bonus visuals |
| VN staging | 8 presets / 23 Golden Sample shots | 0 blocking art gaps |
| Unreferenced clue binaries | 2 | review later; not a production blocker |

### Что это означает

Проект уже **полностью playable по content/runtime contracts**, но ещё не полностью production-ready визуально. Нельзя оценивать готовность по наличию URL: 19 из 24 runtime background keys сейчас лишь aliases на пять существующих masters, planned characters/guests используют placeholders/shell, а все шесть hero clues пока остаются native evidence/shared-art fallback.

## Full-stage characters

| Character | First cast slot | Ready / 7 | Состояние |
|---|---:|---:|---|
| `miku` | 0 | 7 / 7 | `production` |
| `onoe` | 0 | 7 / 7 | `production` |
| `ayuki` | 0 | 7 / 7 | `production` |
| `emi` | 0 | 4 / 7 | `production`, `runtime-fallback`, `rebuild-required`, `external-art-blocked` |
| `kentaro` | 1 | 0 / 7 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `norihiro` | 2 | 0 / 7 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `mayu` | 4 | 0 / 7 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `rina` | 8 | 0 / 7 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `kurose` | 7 | 0 / 7 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |

Практический remaining volume: **38 production outputs** — 35 assets для пяти planned rigs и три replacement assets для Emi (`embarrassed`, Pose B, medallion). Это не означает, что 38 файлов отсутствуют физически: три Emi legacy assets существуют, но должны быть заменены перед production closure.

## Guests и extras

Все шесть guest/witness packages остаются asset-free по правильному B3 контракту; runtime shell — fallback, а не fake production rig.

| Guest | First slot | Package | Status |
|---|---:|---:|---|
| `hinata` | 5 | 0 / 4 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `gen` | 9 | 0 / 4 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `aoi` | 10 | 0 / 4 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `kubo` | 13 | 0 / 4 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `kubo-mother` | 14 | 0 / 4 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |
| `vincent` | 16 | 0 / 4 | `planned-missing`, `runtime-fallback`, `external-art-blocked` |

В macro lock есть **7 semantic extras roles**, а lean production contract ограничивает визуальную библиотеку **четырьмя reusable adult archetypes**. Это не противоречие: ANM-030B должен назначить семь story roles на ≤4 визуальных archetypes/wardrobe variants, а не создать семь новых full-stage персонажей.

## Backgrounds

Контракт содержит **26 variants в восьми families**. Story/runtime реально использует 24. Dedicated physical production masters сейчас соответствуют только пяти semantic variants; ещё 19 runtime keys являются aliases. Два variants (`central-laundry`, `campus-street`) залочены как допустимые family variants, но ни один текущий slot их не требует — производить их сейчас не нужно.

| Family | Macro status | Variants | Production / fallback / unused | First slot |
|---|---|---:|---|---:|
| `club-admin` | `existing-master-family` | 4 | 1 / 3 / 0 | 0 |
| `sports-locker` | `existing-master-family` | 5 | 1 / 4 / 0 | 0 |
| `pool` | `existing-master-family` | 1 | 1 / 0 / 0 | 2 |
| `apartment-workshop` | `existing-master-family` | 3 | 2 / 1 / 0 | 1 |
| `lab-asterion` | `new-master-required` | 3 | 0 / 3 / 0 | 7 |
| `laundry-service` | `new-master-required` | 4 | 0 / 3 / 1 | 8 |
| `campus-exterior` | `new-master-required` | 3 | 0 / 2 / 1 | 11 |
| `old-building-finale` | `new-master-required` | 3 | 0 / 3 / 0 | 15 |

Производить следует **family masters + controlled crop/dressing/grade variants**, а не 19 независимых одноразовых сцен. Особенно это важно для `lab-asterion`, `laundry-service`, `campus-exterior`, `old-building-finale`: macro требует четыре новых master families, а не отдельный master на каждый semantic key.

## Hero clues

Все шесть budgeted hero close-ups всё ещё отсутствуют как отдельные approved production assets. Текущий playable runtime корректно использует native/localizable evidence + shared clue/goal art и не должен маскировать этот fallback как готовый CG.

| Slot | Hero clue | Current fallback | Status |
|---:|---|---|---|
| 3 | `conductive-seam` | `CUE_004` / `./assets/clues/clue_towel_conductive_seam.png` | `runtime-fallback`, `planned-missing`, `external-art-blocked` |
| 11 | `asterion-transfer-chain` | `CUE_012` / `./assets/match3/goal_memory_card.png` | `runtime-fallback`, `planned-missing`, `external-art-blocked` |
| 12 | `second-skin-tag` | `CUE_013` / `./assets/clues/clue_towel_conductive_seam.png` | `runtime-fallback`, `planned-missing`, `external-art-blocked` |
| 17 | `rina-catalog` | `CUE_018` / `./assets/match3/goal_receipt.png` | `runtime-fallback`, `planned-missing`, `external-art-blocked` |
| 18 | `post-rina-active-tag` | `CUE_019` / `./assets/clues/clue_towel_conductive_seam.png` | `runtime-fallback`, `planned-missing`, `external-art-blocked` |
| 20 | `server-evidence` | `CUE_021` / `./assets/match3/goal_memory_card.png` | `runtime-fallback`, `planned-missing`, `external-art-blocked` |

## Match-3 и staging

- 22/22 story levels уже `production-configured`;
- шесть layout archetypes повторно используются минимум по нескольку раз;
- 22 tile-presentation profiles добавляют narrative tags, но **не подменяют tile identity asset**;
- 10 base tile identities, четыре ingredient visual families и четыре blocker visual families считаются production-sufficient и переиспользуются по всем уровням;
- **один общий Match-3 production-art gap остаётся открытым:** пять существующих special mechanics (`flash-row`, `flash-column`, `evidence`, `lead`, `insight`) сейчас используют простые SVG/runtime overlays. Они функциональны и читаемы, но считаются `runtime-fallback` / `rebuild-required`, а не финальным bonus-tile art;
- ANM-030B0A должен заменить их одним reusable **special/bonus visual pack из пяти production assets**. Предпочтительное направление — camera/flash/viewfinder/evidence motifs (например, фотоаппарат со вспышкой там, где это усиливает mechanic readability), без изменения самой механики;
- directional pair `flash-row` / `flash-column` должен сохранять мгновенно различимое направление;
- episode-specific Match-3 PNG pack по-прежнему **не нужен**: тот же special pack обслуживает все 22 уровня. Уникальные level skins возможны позднее только как measured polish;
- это **production-art gap, но не gameplay blocker**: `blockingMatch3ArtGaps = 0`, потому что уровни уже полностью playable;
- восемь staging presets production-ready и переиспользуемы; 23 authored Golden Sample shots фиксируют проверенные композиции, а остальные линии намеренно используют стабильный staging fallback. Отсутствие authored shot на каждой реплике не является asset gap.

## Legacy/orphan art

Два clue binaries существуют, но не входят в текущий runtime data graph:
- `./assets/clues/clue_evidence_bag_coral.png` — `legacy-orphan`;
- `./assets/clues/clue_pink_slippers.png` — `legacy-orphan`;

ANM-030A их **не удаляет**: перед cleanup нужно решить, это будущий reusable art или действительно мёртвый legacy. Audit только запрещает считать их покрытием production gaps.

## 22-slot production matrix

`Gaps` ниже — именно визуальные production gaps; gameplay/content при этом остаются playable.

| Slot | Title | Background | Non-production cast | Hero | Match-3 | Gaps |
|---:|---|---|---|---|---|---|
| 0 | Дело класса U | `clubroom-day` (prod)<br>`athletics-locker` (prod) | `emi` | — | `locker-columns` / reusable | `cast:emi` |
| 1 | Чужая коллекция | `kentaro-apartment` (prod) | `kentaro` | — | `workbench-clusters` / reusable | `cast:kentaro` |
| 2 | Мокрые показания | `pool-locker-evening` (prod) | `norihiro` | — | `service-lanes` / reusable | `cast:norihiro` |
| 3 | Розовые тапочки | `norihiro-apartment` (prod) | `norihiro` | `conductive-seam` | `ordered-grid` / reusable | `cast:norihiro`<br>`hero-clue:conductive-seam` |
| 4 | Чрезвычайное бельевое совещание | `student-council-auditorium` (fallback) | `mayu` | — | `ordered-grid` / reusable | `background:student-council-auditorium`<br>`cast:mayu` |
| 5 | Заслон для вора | `basketball-locker` (fallback) | `hinata` | — | `locker-columns` / reusable | `background:basketball-locker`<br>`cast:hinata` |
| 6 | Мастерская подозрительного размера | `textile-workshop` (fallback) | `hinata` | — | `workbench-clusters` / reusable | `background:textile-workshop`<br>`cast:hinata` |
| 7 | Человек, у которого есть объяснение | `smart-textile-lab` (fallback) | `kurose` | — | `signal-cross` / reusable | `background:smart-textile-lab`<br>`cast:kurose` |
| 8 | Восемьдесят семь пакетов | `lost-found-warehouse` (fallback) | `rina`, `mayu` | — | `service-lanes` / reusable | `background:lost-found-warehouse`<br>`cast:rina`<br>`cast:mayu` |
| 9 | Король потерянных носков | `maintenance-room` (fallback) | `gen` | — | `service-lanes` / reusable | `background:maintenance-room`<br>`cast:gen` |
| 10 | Чёрный пояс, белые трусы | `combat-club-hall` (fallback) | `aoi`, `kentaro` | — | `locker-columns` / reusable | `background:combat-club-hall`<br>`cast:aoi`<br>`cast:kentaro` |
| 11 | Самый заметный тайный груз | `service-yard` (fallback)<br>`transfer-point` (fallback) | `kentaro` | `asterion-transfer-chain` | `service-lanes` / reusable | `background:service-yard`<br>`background:transfer-point`<br>`cast:kentaro`<br>`hero-clue:asterion-transfer-chain` |
| 12 | ПанцуИтер существует?! | `old-gym-night` (fallback) | — | `second-skin-tag` | `signal-cross` / reusable | `background:old-gym-night`<br>`hero-clue:second-skin-tag` |
| 13 | Под бронёй | `combat-club-hall` (fallback) | `kubo` | — | `locker-columns` / reusable | `background:combat-club-hall`<br>`cast:kubo` |
| 14 | Дом, где бельё ни при чём | `textile-workshop` (fallback) | `kubo`, `kubo-mother` | — | `workbench-clusters` / reusable | `background:textile-workshop`<br>`cast:kubo`<br>`cast:kubo-mother` |
| 15 | Кот с вещественным доказательством | `campus-path` (fallback)<br>`abandoned-laundry` (fallback) | — | — | `service-lanes` / reusable | `background:campus-path`<br>`background:abandoned-laundry` |
| 16 | Розовые ленты не лгут | `gymnastics-costume` (fallback) | `vincent` | — | `signal-cross` / reusable | `background:gymnastics-costume`<br>`cast:vincent` |
| 17 | Самый аккуратный преступник | `old-archive` (fallback) | `rina` | `rina-catalog` | `archive-rows` / reusable | `background:old-archive`<br>`cast:rina`<br>`hero-clue:rina-catalog` |
| 18 | Вор, который пытался остановить кражу | `old-archive` (fallback)<br>`clubroom-night` (fallback) | `rina`, `emi` | `post-rina-active-tag` | `ordered-grid` / reusable | `background:old-archive`<br>`background:clubroom-night`<br>`cast:rina`<br>`cast:emi`<br>`hero-clue:post-rina-active-tag` |
| 19 | Вор пойман | `anonymous-return-counter` (fallback)<br>`clubroom-day` (prod) | `rina`, `emi`, `mayu`, `kurose` | — | `archive-rows` / reusable | `background:anonymous-return-counter`<br>`cast:rina`<br>`cast:emi`<br>`cast:mayu`<br>`cast:kurose` |
| 20 | Под прачечной | `service-tunnel` (fallback)<br>`server-room` (fallback)<br>`disciplinary-assembly` (fallback) | `kurose`, `rina`, `emi`, `mayu`, `kentaro`, `kubo`, `vincent` | `server-evidence` | `service-lanes` / reusable | `background:service-tunnel`<br>`background:server-room`<br>`background:disciplinary-assembly`<br>`cast:kurose`<br>`cast:rina`<br>`cast:emi`<br>`cast:mayu`<br>`cast:kentaro`<br>`cast:kubo`<br>`cast:vincent`<br>`hero-clue:server-evidence` |
| 21 | Идеальный подозреваемый | `disciplinary-assembly` (fallback)<br>`clubroom-day` (prod) | `mayu`, `kurose`, `kentaro`, `norihiro`, `gen` | — | `ordered-grid` / reusable | `background:disciplinary-assembly`<br>`cast:mayu`<br>`cast:kurose`<br>`cast:kentaro`<br>`cast:norihiro`<br>`cast:gen` |

## Recommended ANM-030B waves

ANM-030B лучше продолжать не «по типу файла», а вертикальными visual-production waves, чтобы после каждого merge рос непрерывный production-ready участок игры:

1. **030B0A Match-3 Special/Bonus Visual Pack** — пять reusable production visuals для `flash-row`, `flash-column`, `evidence`, `lead`, `insight`; заменить текущие generic SVG overlays без изменения механик и без level-specific packs.
2. **030B0B Character Closure** — заменить три legacy Emi outputs и зафиксировать mapping 7 extras roles → ≤4 visual archetypes.
3. **030B1 Early `0–6`** — Kentaro, Norihiro, Mayu, Hinata; existing-family variants для student council / basketball / textile workshop; `conductive-seam` hero close-up.
4. **030B2 System reveal `7–12`** — Kurose, Rina, Gen, Aoi; новые master families `lab-asterion`, `laundry-service`, `campus-exterior`; hero clues `asterion-transfer-chain` и `second-skin-tag`.
5. **030B3 Late common route `13–18`** — Kubo, mother Kubo, Vincent; `old-building-finale`; hero clues `rina-catalog` и `post-rina-active-tag`.
6. **030B4 Endings `19–21`** — ending-specific variants `anonymous-return-counter`, `service-tunnel`, `server-room`, `disciplinary-assembly`; `server-evidence`.

Каждая wave может быть раздроблена на более мелкие atomic ZIP features. Production order внутри character/background pipelines может меняться при наличии готового external art, но audit status меняется только после реальной интеграции и QA.

## Acceptance gate

- machine-readable audit содержит ровно 22 slots и сохраняет macro assignments;
- все runtime background aliases отмечены как fallback, а не production;
- planned characters/guests не получают вымышленных asset paths;
- Emi mixed status явно сохраняет четыре approved overrides и три legacy replacements;
- six hero clue budget не расширяется и не объявляется готовым из-за generic Match-3 images;
- Match-3 reuse budget не превращается в 22 episode-specific art packs, но пять текущих generic special overlays явно остаются planned shared production pack;
- extras roles не раздувают full-stage ceiling;
- no runtime, canonical screenplay, save, localization catalog or binary art changes.

## Next

После merge ANM-030A source-of-truth используется для **ANM-030B+ budgeted art integration**. Первый разумный implementation slice — `030B0A` shared Match-3 special/bonus visual pack либо `030B0B` character closure в зависимости от того, какие external assets готовы фактически. До отдельного art-production решения ничего генерировать не требуется.
