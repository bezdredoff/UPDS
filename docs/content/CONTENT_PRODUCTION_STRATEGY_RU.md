# UPDS — Lean Content Production Contract

Status: active product/production decision, ANM-027E.

Этот документ фиксирует сбалансированный способ довести базовую игру до полного контента без
сокращения истории и без производства уникального арта для каждого эпизода. Он задаёт бюджетные
ограничения и authoring-процесс, но не объявляет ещё не созданные assets или screenplay готовыми.

## Неподвижный сюжетный объём

- Сохраняются все **22 planned content slots: `0–21`**.
- Общая ветка проходит слоты `0–18`, затем ведёт к одному из трёх финальных слотов `19`, `20` или
  `21`; все три финала остаются в scope.
- Сохраняются утверждённые канон, главная троица, расследование Second Skin, Рина/Куросэ и POV Мику.
- Сюжетный объём не сокращается ради art/token budget. Экономия достигается повторным
  использованием постановки, персонажей, локаций, UI-улик и Match-3 framework.
- Репозиторий пока содержит подробный authored screenplay только для слотов `0–3`. Слоты `4–21`
  должны пройти macro lock и затем импортироваться reviewable-пакетами через ANM-027 pipeline.

## Source reconciliation и supersession

Входы для ANM-027F идентифицированы явно:

- [`ANM-001_Story_Bible.md`](ANM-001_Story_Bible.md), v0.2 от 10 августа 2026 — текущий narrative canon: колледж Сэйран,
  совершеннолетние персонажи, POV Мику, `Second Skin`, Рина и Куросэ;
- [`ANM-002_22_Episode_Plot.md`](ANM-002_22_Episode_Plot.md), v0.1 от 10 августа 2026 — современный каркас слотов `0–21`,
  созданный на основе Story Bible и исходной презентации;
- `UPDS.pptx`, исходный файл от 21 октября 2016 — исторический beat source на 115 слайдов;
- `src/content/ANM-003_Vertical_Slice_Screenplay.md` — единственный текущий repository-authored
  detailed screenplay и runtime source (`0–3`).

`ANM-001/002` являются продуктовым input для ещё не выполненного macro lock, но не доказывают, что
screenplay `4–21` уже написан. `UPDS.pptx` сохраняет структурную ДНК, а не текущий канон. При
конфликте deck уступает Story Bible, ANM-002 и утверждённому repository screenplay.

### Что сохраняется из исходной презентации

- нумерация 22 Match-3 slots;
- общая линия `0–18` и выбор одного из финалов `19–21`;
- ритм VN → расследовательная Match-3 работа → опровержение удобной версии;
- спортивные клубы, цепочка ложных подозреваемых, кот и ПанцуИтер как переработанные комедийные
  motifs, если они проходят текущий canon/tone gate.

### Что не переносится

| Исторический deck | Текущий canon / действие |
| --- | --- |
| школа `Senbon Sakura`, «юные» школьники | частный колледж Сэйран; все студенты 18+, основные герои 19–22 |
| имя «Аюми» и старый расширяющийся состав клуба | Аюки; POV Мику и центральная команда Мику/Оноэ/Аюки |
| вторжения в квартиры без согласия | consent, процедура и последствия обязательны |
| ориентация, гендерное выражение, внешность или размер тела как punchline | прямо запрещено Story Bible; юмор направлен на поспешную версию и абсурд процедуры |
| маньяк, магия, культ или Аюки как буквальное объяснение финала | техническая система `Second Skin`, Рина как физический похититель и Куросэ как институциональный антагонист |
| эротизированная нагота/камера | adult light-ecchi без наготы, унижения пострадавших и фетишистской камеры |

### Какие старые production estimates заменены

ANM-027E supersedes **только production-volume estimates** из ANM-002 §8; сюжетные beats, clue
chain и ending logic этим не переписываются.

| ANM-002 v0.1 estimate | Новый обязательный budget |
| --- | --- |
| 8–10 эмоций и 2 позы у главных героинь | 5 стандартных Pose A expressions + 1 Pose B + medallion |
| 4–6 эмоций у крупных второстепенных и 3–4 у эпизодических | full-stage получает тот же строгий set; guest/witness — 2 эмоции; extras — 4 reusable archetypes |
| 18–20 базовых фонов, с возможным снижением до 16 | 8–10 master-location families с crop/dressing/grade variants |
| 12–15 крупных планов улик | 5–7 hero clue close-ups; остальные улики — native localized UI |
| 22 уровня без обязательной новой механики | сохраняется и уточняется как 5–6 layout archetypes поверх ANM-025/026 |

## Режим производства: balanced reuse

Принят средний режим: отдельный guest/witness tier, модульные локации, native локализуемые улики,
offline-композит выражений и библиотека staging presets. Этот выбор сам по себе **не** отменяет и не
переносит landscape, локализацию или safe-motion proof: их status остаётся в roadmap и меняется
только отдельным решением.

## Классы персонажей

| Класс | Планирование | Production package | Критерий |
| --- | --- | --- | --- |
| Stage Core | Miku, Onoe, Ayuki | строгий full-stage set из 7 runtime assets | главные героини |
| Recurring Stage | Emi; затем Kentaro, Norihiro, Mayu; после macro lock — Rina и Kurose | тот же строгий full-stage set | персонаж появляется минимум в 3 эпизодах, участвует в развязке или несёт крупную эмоциональную сцену |
| Episode Guest / Witness | например Hinata, Gen, Aoi, Kubo; окончательный список определяет macro lock | отдельный guest/witness package: один bust/half-body master, две читаемые эмоции и neutral medallion | короткая свидетельская или функциональная роль |
| Extras | четыре повторно используемых взрослых архетипа | силуэт/полуфигура и precomposed варианты одежды/цвета | фоновые роли без отдельной драматической арки |

Provisional production ceiling — не более девяти full-stage персонажей: три Stage Core и до шести
Recurring Stage. Это **бюджет**, а не runtime status. На текущем baseline production manifest
содержит runtime-production Miku/Onoe/Ayuki/Emi и planned Kentaro/Norihiro/Mayu; manual visual
approval при этом отдельный. Старый Emi set всё ещё `rebuild-required`; ANM-028D0 neutral уже
утверждён как authoring master, но полный старый runtime set остаётся fallback до завершения и
атомарной интеграции всей replacement family.
Rina/Kurose и гости не получают вымышленные paths до отдельного утверждённого integration slice.

Guest/witness package является планируемым отдельным presentation/asset contract. Пока его schema и
runtime renderer не реализованы, гостя нельзя добавлять в `upds-character-production-v2` как якобы
полноценного stage-персонажа с пустыми или фиктивными путями.

## Выражения, позы и генерация

Full-stage taxonomy остаётся закрытой:

- Pose A: `neutral`, `smile`, `serious`, `surprised`, `embarrassed`;
- одна Pose B;
- один neutral medallion.

Новые стандартные expression names не добавляются. Редкий специальный climax frame допустим только
для поворотной сцены/финала после явного budget approval; он не меняет обязательный 7-asset manifest.
Pose B производится только для full-stage персонажей.

Рекомендуемый production-source workflow:

1. Утвердить neutral full-body master 1024×1536 в общей lineup/baseline.
2. Зафиксировать тело, камеру, силуэт, одежду, волосы, свет и alpha bounds.
3. Генерировать/редактировать **одну эмоцию за раз** внутри ограниченного face ROI.
4. Выполнить offline-композит изменённой области на неизменённый master.
5. Экспортировать готовый precomposed 1024×1536 RGBA frame.
6. Автоматически проверить, что pixels вне разрешённого expression region не изменились, размеры
   сохранены, а alpha-height отличается не более чем на 1 px; затем пройти ручной visual QA.

Layered masters, masks и face parts разрешены только как производственные исходники. Runtime
получает только готовые precomposed frames; runtime face overlay, двойное лицо и multi-actor PNG
запрещены.

## Библиотека постановки

ANM-028B должен дать scene authoring восемь переиспользуемых presets:

1. `solo-close`;
2. `solo-medium`;
3. `two-shot-conflict`;
4. `two-shot-alliance`;
5. `trio-central-speaker`;
6. `trio-reaction`;
7. `evidence-cutaway`;
8. `guest-testimony-card`.

Preset задаёт shot size (`wide`/`medium`/`close`), actor slots, роль
(`active`/`listening`/`background`), speaker focus, safe-area/non-overlap rules и разрешённые
entry/exit transitions. Небольшой camera push и общая reaction motion могут быть metadata, но
реальное движение включается только в рамках safe-motion contract.

Геометрия preset считается замороженной только после ANM-028B1 R4.1 QA внутри общего playable VN
frame: с реальными header/dialogue/controls, ANM-024 viewport matrix, playable `.portrait` crop,
duo/trio focal-eye-line alignment, selected-expression alpha/eye guides и runtime
`contain-over-fill`. Actor safe lanes защищают лица, а не полный прозрачный PNG; нижняя
часть персонажа намеренно уходит под dialogue card. Neutral full-master lineup и background
horizon/footline/actor-zone calibration являются обязательными acceptance inputs. Runtime scale
или episode-specific CSS нельзя использовать для маскировки неправильного character master или
background perspective.

Runtime всегда композитит самостоятельные character assets. Несколько актёров нельзя запекать в
один runtime PNG: разнообразие создаётся сочетанием слотов, ролей, выражений, планов и порядка входа.

## Локации и варианты

Целевой бюджет базовой игры — **8–10 master-локаций**, а не отдельная иллюстрация на каждую сцену.
Рабочие семейства:

1. клубная комната / администрация;
2. спортзал / раздевалка;
3. бассейн;
4. квартира;
5. прачечная / service area;
6. лаборатория / Asterion;
7. campus exterior;
8. старое здание / finale.

Разнообразие создаётся заранее подготовленными crop, foreground dressing, светом и
day/evening/night grade. Варианты precomposed offline, не содержат запечённый локализуемый текст и
используют общий background resolver вместо эпизодических mappings.

## Улики и интерфейс

Документы, формы, таблицы, серийные номера, переписка, manifests и сравнения по умолчанию строятся
как native локализуемый UI. Отдельный art close-up резервируется для **5–7 hero clue close-ups** на
всю базовую игру. Предварительный список: серебряная нить, изменённый шов, контейнер Asterion,
каталог Рины, sensor tag, server evidence и финальное сравнение.

Hero close-up не должен содержать запечённый переводимый текст. Обычные свидетельства могут быть
показаны через dossier, phone/photo UI или `guest-testimony-card`, если полноценная сцена не даёт
достаточной драматической ценности.

## Match-3 reuse budget

ANM-025/026 остаются общей системой для всех сюжетных уровней:

- 5–6 повторно используемых layout/board-shape archetypes;
- активные tiles выбираются из общего production catalog, без нового набора PNG на каждый эпизод;
- вариативность создают board shape, start layout, spawn weights, objectives, blocker combinations,
  narrative context и reactions;
- новая одноразовая mechanic запрещена; новая mechanic допустима только если используется минимум в
  четырёх уровнях и имеет tutorial/Level Lab/validation coverage.

## Asset-trigger budget для сценария

Macro и detailed screenplay проходят проверку до art production:

- не более одного нового full-stage персонажа в одном эпизоде;
- в среднем не более одной новой master-локации на 2–3 эпизода;
- не более одного hero clue close-up на эпизод и 5–7 на всю игру;
- Pose B — только full-stage cast;
- уникальный CG — только поворот акта или финал;
- новая mechanic — только при повторном использовании минимум в четырёх уровнях.

Это trigger budget, а не требование потратить каждый слот. Исключение требует короткой записи:
драматическая цель, почему preset/native UI/reuse недостаточны, какие downstream assets и
localization QA добавляются.

## Authoring и delivery

### ANM-027F — Full Story Macro Lock

До подробного screenplay создаётся таблица всех слотов `0–21`. Для каждого фиксируются:

- case/emotional beat и переход;
- локация из master-family;
- active cast и его production tier;
- clue/evidence presentation;
- Match-3 archetype, objective и reused mechanic;
- ветвление/ending dependency;
- новые asset triggers и исключения из бюджета.

Macro lock опирается на утверждённый Story Bible и исходную сценарную презентацию; он не заменяет их
и не переносит неутверждённые детали прямо в runtime.

### ANM-027G — Episode Batch Production

Подробный сценарий производится пакетами по три последовательных эпизода. Каждый пакет содержит:

- screenplay с stable authored IDs и режиссурой;
- content manifest/audit и story-graph transitions;
- Match-3 level config из существующего framework;
- stable localization keys без массового перевода до full story lock;
- asset briefs только для прошедших budget gate новых triggers;
- runtime transition tests и review изменившихся production budgets.

Пакет считается готовым, когда нет unassigned authored lines, фиктивных asset paths, baked text и
одноразового controller behavior; story audit, graph/runtime tests и relevant level validators
проходят, а изменённые budget exceptions явно утверждены.

## Immediate execution order

1. **ANM-027E — COMPLETE** — этот lean production contract и traceability gate.
2. **ANM-028B1 R4.1 — COMPLETE** — reusable `upds-scene-staging-v1`, shared playable VN frame,
   focal-eye-line duo/trio crop, frame-accurate guides, viewport/background calibration,
   visual-status lineup и read-only QA brief без нового art; R4.1 passed iPhone QA and merged as PR #96.
3. **ANM-028D0 R1 — COMPLETE** — Emi neutral прошёл lineup/solo/two-shot/trio approval и является
   approved authoring master, но остаётся вне runtime до полного семиассетного set.
4. **ANM-028D1 R1 — COMPLETE** — smile прошёл iPhone QA и остаётся approved expression вне runtime.
5. **ANM-028D2 R1 — IN QA** — serious производится через три bounded face ROI; surprised,
   embarrassed, Pose B и medallion следуют по одному, без массовой генерации и частичной runtime-подмены.
6. **ANM-027F — NEXT AFTER EMI SET** — macro lock `0–21` и asset-trigger map на основе Story
   Bible и исходной презентации; staging назначается только из замороженных после visual QA preset IDs.
7. Завершить 028B Studio/lineup/guest preview; выполнить ограниченный 028C safe-motion proof и 028D
   production integration в порядке, утверждённом roadmap.
8. **ANM-027G** — screenplay/import пакетами по три эпизода, начиная с `4–6`, с параллельным
   производством только тех assets, которые прошли trigger budget.
9. ANM-029 mass localization и ANM-030 mass art — только после полного canonical content lock.
