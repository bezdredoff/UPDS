# ANM-027F R1 — Full Story Macro Lock

Status: **COMPLETE**. The original R1 macro contract is being consumed incrementally by ANM-027G; slots `4–9` are now authored/production-configured while `10–21` remain macro-only.

## Цель

Зафиксировать production-карту всех 22 content slots до подробного screenplay `4–21`, не сокращая утверждённую историю и не превращая предварительные production notes из ANM-002 в обязательство произвести уникальный art для каждого эпизода.

Машиночитаемый source of truth этой фичи: `src/content/story/ANM027F.full-story-macro.json` (`upds-story-macro-lock-v1`). Он **не заменяет** Story Bible, ANM-002 или уже authored ANM-003; он фиксирует production assignments, по которым ANM-027G может писать и импортировать следующие пакеты.

## Зафиксированные production-решения

- story scope остаётся `0–21`: общая линия `0–18`, затем один из финалов `19/20/21`;
- at R1 acceptance detailed screenplay was authored only for `0–3`; ANM-027G later promotes each accepted batch without changing the remaining macro-only slots;
- full-stage ceiling используется полностью: **9 персонажей** = Miku/Onoe/Ayuki + Emi/Kentaro/Norihiro/Mayu/Rina/Kurose;
- Rina и Kurose теперь однозначно закреплены как **Recurring Stage**; это production requirement, но не утверждение, что их art уже существует;
- Episode Guest / Witness package закреплён для **Hinata, Gen, Aoi, Kubo, mother Kubo и Vincent**; остальные одноэпизодические фоновые роли остаются extras;
- используются ровно **8 master-location families**. Четыре уже покрыты текущими мастерами/семействами; новые masters нужны только для `lab-asterion`, `laundry-service`, `campus-exterior`, `old-building-finale`;
- используются ровно **6 Match-3 layout archetypes** поверх существующего ANM-025/026 framework. Ни один слот не требует новой одноразовой mechanic;
- утверждено **6 hero clue close-ups** на всю игру: conductive seam, Asterion transfer chain, Second Skin tag, Rina catalog, post-Rina active tag, server evidence;
- unique CG и budget exceptions в macro lock **не требуются**.

## Фоны после macro lock

Новых master-family остаётся ровно **4**:

1. `lab-asterion` — первое обязательное использование в slot 7;
2. `laundry-service` — slot 8;
3. `campus-exterior` — slot 11;
4. `old-building-finale` — slot 15.

Slots `4–6` используют только варианты уже существующих семейств (`club-admin`, `sports-locker`, `apartment-workshop`). Значит первый ANM-027G batch можно писать и интегрировать до генерации новых master backgrounds; art может идти параллельно.

## Character production triggers

Macro lock не возобновляет остановленную генерацию персонажей. Он только фиксирует tier и момент, когда production asset потребуется downstream:

- Mayu — slot 0 / снова критична в batch `4–6`;
- Kentaro — slot 1;
- Norihiro — slot 2;
- Kurose — slot 7;
- Rina — slot 8;
- guest packages: Hinata 5, Gen 9, Aoi 10, Kubo 13, mother Kubo 14, Vincent 16.

До появления этих assets story/runtime pipeline может использовать существующий placeholder/guest-shell путь; фиктивные character paths запрещены.

## Hero clue close-up budget

| Slot | ID | Назначение |
|---:|---|---|
| 3 | `conductive-seam` | серебристый проводящий шов |
| 11 | `asterion-transfer-chain` | контейнер Asterion и цепочка передачи |
| 12 | `second-skin-tag` | активная метка Second Skin |
| 17 | `rina-catalog` | каталог Рины |
| 18 | `post-rina-active-tag` | новая метка после отстранения Рины |
| 20 | `server-evidence` | серверные логи и доказательство подмены согласия |

Остальные документы, журналы, таблицы, формы, чаты и сравнения остаются native/localizable UI.

## Slot map

| Slot | Эпизод | Акт | Location family / variant | Match-3 archetype | Evidence | New master | Hero close-up |
|---:|---|---|---|---|---|---|---|
| 0 | Дело класса U | I | `club-admin` / clubroom-day<br>`sports-locker` / athletics-locker | `locker-columns` | selective-missing | — | — |
| 1 | Чужая коллекция | I | `apartment-workshop` / kentaro-apartment | `workbench-clusters` | kentaro-alibi | — | — |
| 2 | Мокрые показания | I | `pool` / pool-locker-evening | `service-lanes` | mixed-targets | — | — |
| 3 | Розовые тапочки | I | `apartment-workshop` / norihiro-apartment | `ordered-grid` | conductive-seam | — | conductive-seam |
| 4 | Чрезвычайное бельевое совещание | II | `club-admin` / student-council-auditorium | `ordered-grid` | laundry-cadence | — | — |
| 5 | Заслон для вора | II | `sports-locker` / basketball-locker | `locker-columns` | service-stitch | — | — |
| 6 | Мастерская подозрительного размера | II | `apartment-workshop` / textile-workshop | `workbench-clusters` | post-repair-seam | — | — |
| 7 | Человек, у которого есть объяснение | II | `lab-asterion` / smart-textile-lab | `signal-cross` | asterion-thread | lab-asterion | — |
| 8 | Восемьдесят семь пакетов | II | `laundry-service` / lost-found-warehouse | `service-lanes` | missing-package-ranges | laundry-service | — |
| 9 | Король потерянных носков | II | `laundry-service` / maintenance-room | `service-lanes` | night-containers | — | — |
| 10 | Чёрный пояс, белые трусы | III | `sports-locker` / combat-club-hall | `locker-columns` | control-sample-gear | — | — |
| 11 | Самый заметный тайный груз | III | `campus-exterior` / service-yard<br>`lab-asterion` / transfer-point | `service-lanes` | lab-transfer-chain | campus-exterior | asterion-transfer-chain |
| 12 | ПанцуИтер существует?! | III | `sports-locker` / old-gym-night | `signal-cross` | second-skin-tag | — | second-skin-tag |
| 13 | Под бронёй | III | `sports-locker` / combat-club-hall | `locker-columns` | pilot-participant-codes | — | — |
| 14 | Дом, где бельё ни при чём | III | `apartment-workshop` / textile-workshop | `workbench-clusters` | rina-pretheft-search | — | — |
| 15 | Кот с вещественным доказательством | III | `campus-exterior` / campus-path<br>`old-building-finale` / abandoned-laundry | `service-lanes` | consent-note-route | old-building-finale | — |
| 16 | Розовые ленты не лгут | III | `sports-locker` / gymnastics-costume | `signal-cross` | post-rina-activation | — | — |
| 17 | Самый аккуратный преступник | IV | `old-building-finale` / old-archive | `archive-rows` | rina-catalog | — | rina-catalog |
| 18 | Вор, который пытался остановить кражу | IV | `old-building-finale` / old-archive<br>`club-admin` / clubroom-night | `ordered-grid` | continued-project-proof | — | post-rina-active-tag |
| 19 | Вор пойман | ENDING | `laundry-service` / anonymous-return-counter<br>`club-admin` / clubroom-day | `archive-rows` | case-closed-stitch | — | — |
| 20 | Под прачечной | ENDING | `old-building-finale` / service-tunnel<br>`lab-asterion` / server-room<br>`club-admin` / disciplinary-assembly | `service-lanes` | server-logs-consent | — | server-evidence |
| 21 | Идеальный подозреваемый | ENDING | `club-admin` / disciplinary-assembly<br>`club-admin` / clubroom-day | `ordered-grid` | discarded-contradictions | — | — |

## Ending lock

Slot 18 обязан показывать три явно различимые стратегии и переходить только в `19`, `20` или `21`.

- `19 / B — Вор пойман`: всегда доступен; кражи прекращаются, Second Skin остаётся системно неразобранным.
- `20 / A — Под прачечной`: лучший результат требует `Evidence >= 7`, `Team Trust >= 2`, `Source Trust >= 2`; macro lock сохраняет условных союзников без отдельной ветки screenplay каждого эпизода.
- `21 / C — Идеальный подозреваемый`: всегда доступен; выбранный ранее оправданный подозреваемый меняет реплики, но не моральный результат.

Факты дела не меняются между финалами — меняется стратегия команды и то, какие факты она превращает в публичное обвинение.

## ANM-027G batches

После acceptance этой фичи подробный screenplay/import идёт строго шестью reviewable packages:

`4–6` → `7–9` → `10–12` → `13–15` → `16–18` → `19–21`.

Каждый batch должен сверяться с macro JSON: location family, cast tier, staging preset IDs, evidence presentation, Match-3 archetype/objective kinds и asset triggers нельзя молча расширять. Изменение macro lock возможно отдельным reviewable diff, а не побочным эффектом написания реплик.

## Automated gate

`tests/StoryMacroLock.test.ts` проверяет:

1. ровно 22 последовательных slots `0–21` и terminal endings `19/20/21`;
2. contiguous authored prefix versus remaining macro-locked slots (after ANM-027G `7–9`: authored `0–9`, macro-locked `10–21`);
3. 8 location families и ровно 4 новых master triggers;
4. 5–6 reusable Match-3 archetypes, только существующие objective kinds и отсутствие new mechanic;
5. только замороженные `upds-scene-staging-v1` preset IDs;
6. full-stage ceiling 9, guest package list и максимум один full-stage production trigger на slot;
7. 5–7 hero close-ups (здесь 6), отсутствие unique CG и budget exceptions;
8. шесть последовательных ANM-027G batches начиная с `4–6`.

## Review gate

Это non-visual content contract. iPhone visual QA не требуется. Перед merge нужно просмотреть Slot Map и убедиться, что:

- ни один утверждённый beat/финал из ANM-001/002 не потерян;
- Rina/Kurose/guest tiers выглядят разумно;
- четыре новых master-family и шесть hero close-ups соответствуют ожидаемому art budget;
- packages `4–6` and `7–9` are the first two implemented detailed screenplay batches; `10–12` is next.
