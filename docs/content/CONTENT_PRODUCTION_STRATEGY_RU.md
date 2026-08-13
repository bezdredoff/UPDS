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
содержит production Miku/Onoe/Ayuki/Emi и planned Kentaro/Norihiro/Mayu; Rina/Kurose и гости не
получают вымышленные paths до отдельного утверждённого integration slice.

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

1. **ANM-027E** — этот lean production contract и traceability gate.
2. **ANM-028B1** — reusable staging preset/data contract и Scene Studio preview без нового mass art.
3. **ANM-027F** — macro lock `0–21` и asset-trigger map на основе Story Bible и исходной презентации.
4. Завершить 028B Studio/lineup/guest preview; выполнить ограниченный 028C safe-motion proof и 028D
   production integration в порядке, утверждённом roadmap.
5. **ANM-027G** — screenplay/import пакетами по три эпизода, начиная с `4–6`, с параллельным
   производством только тех assets, которые прошли trigger budget.
6. ANM-029 mass localization и ANM-030 mass art — только после полного canonical content lock.

