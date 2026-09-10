# ANM-030G4 — Background flow и common-route batch

Status: **accepted / integrated**  
Baseline: `e5c9ecd85b7fc4784a40785798a048223e9b45e9`  
Runtime source: `src/data/narrative.ts`  
Asset root: `public/assets/backgrounds/`

## Решение

Производить не 24 независимых картинки, а небольшую библиотеку environment masters и
контролируемых вариантов. В текущем batch интегрированы все 10 утверждённых ChatGPT Image
masters; отдельная сцена `server-room` выведена из текущего scope и больше не является runtime key.

1. `maintenance-room`
2. `old-gym-night`
3. `gymnastics-costume`
4. `asterion-transfer-point`
5. `campus-path`

Источник утверждённых бинарников: `C:/UPDS-Character-Production-Toolkit/assets/backgrounds_approved/`.
ComfyUI flow сохранён как воспроизводимый экспериментальный fallback, но production batch
зафиксирован через ChatGPT Image из-за лучшего качества и меньшего числа AI-артефактов.

## Фактический инвентарь

В runtime 23 semantic keys и 23 физических production WebP. Все фоновые masters имеют
размер `1080×1920`, формат WebP; aliases/fallbacks: `0`.

| Semantic key | Текущий файл | Статус | Сценовые слоты |
|---|---|---|---:|
| `clubroom` | `BG_CLUBROOM_DAY.webp` | production | 0, 1, 19, 21 |
| `lockerAthletics` | `BG_LOCKER_ATHLETICS_DAY.webp` | production | 2 |
| `kentaroApartment` | `BG_KENTARO_APARTMENT_EVENING.webp` | production | 3, 4 |
| `poolLocker` | `BG_POOL_LOCKER_EVENING.webp` | production | 5, 6 |
| `norihiroApartment` | `BG_NORIHIRO_APARTMENT_NIGHT.webp` | production | 7, 8 |
| `studentCouncilAuditorium` | `BG_STUDENT_COUNCIL_AUDITORIUM_DAY.webp` | production | 9, 10 |
| `basketballLocker` | `BG_BASKETBALL_LOCKER.webp` | production | 11, 12 |
| `textileWorkshop` | `BG_TEXTILE_WORKSHOP.webp` | production | 13, 14, 29, 30 |
| `asterionLab` | `BG_ASTERION_SMART_TEXTILE_LAB.webp` | production | 15, 16 |
| `lostFoundWarehouse` | `BG_LOST_FOUND_WAREHOUSE.webp` | production | 17, 18 |
| `maintenanceRoom` | `BG_MAINTENANCE_ROOM.webp` | production | 19, 20 |
| `combatClubHall` | `BG_COMBAT_CLUB_HALL.webp` | production | 21, 22, 27, 28 |
| `serviceYard` | `BG_CAMPUS_SERVICE_YARD.webp` | production | 23 |
| `asterionTransferPoint` | `BG_ASTERION_TRANSFER_POINT.webp` | production | 24 |
| `oldGymNight` | `BG_OLD_GYM_NIGHT.webp` | production | 25, 26 |
| `campusPath` | `BG_CAMPUS_PATH.webp` | production | 31 |
| `abandonedLaundry` | `BG_ABANDONED_LAUNDRY.webp` | production | 32 |
| `gymnasticsCostume` | `BG_GYMNASTICS_COSTUME.webp` | production | 33, 34 |
| `oldArchive` | `BG_OLD_ARCHIVE.webp` | production | 35, 36, 37 |
| `clubroomNight` | `BG_CLUBROOM_NIGHT.webp` | production | 38 |
| `anonymousReturnCounter` | `BG_ANONYMOUS_RETURN_COUNTER.webp` | production | 39 |
| `serviceTunnel` | `BG_SERVICE_TUNNEL.webp` | production | 41 |
| `disciplinaryAssembly` | `BG_DISCIPLINARY_ASSEMBLY.webp` | production | 42, 43 |

Слоты в таблице — zero-based `sceneMeta` indices. Комментарии старых feature-файлов с числами
`10/24`, `13/24` и т.п. являются историей отдельных импортов, а не текущим runtime-аудитом.
Число production считается по dedicated semantic mappings после G4: `23/23`, aliases: `0`.

## Style lock

Каждый новый master должен соответствовать следующим инвариантам:

- portrait-first composition `1080×1920`, environment-only, без людей, UI, логотипов и читаемого
  текста;
- early-2000s anime visual-novel environment: clean perspective, controlled linework, умеренная
  детализация, мягкие материалы и читаемые крупные формы;
- одна нейтральная камера уровня глаз, вертикальные линии без сильного wide-angle distortion;
- upper/middle staging zone свободна для персонажей, нижняя треть спокойная и не конфликтует с
  dialogue card;
- свет и палитра должны быть объяснимы сценой: дневной/вечерний/ночной вариант — это
  controlled grade одного master family, а не новый случайный стиль;
- предметы-улики допускаются только если они есть в brief; никаких случайных персонажей,
  псевдотекста и повторяющихся AI-артефактов.

В качестве style anchors использовать уже принятые `BG_CLUBROOM_DAY.webp`,
`BG_TEXTILE_WORKSHOP.webp`, `BG_ASTERION_SMART_TEXTILE_LAB.webp` и
`BG_ABANDONED_LAUNDRY.webp`: они покрывают клубную, тёплую мастерскую, холодную лабораторную и
тёмную service-среду. Не пытаться привести все сцены к одной температуре; унифицировать нужно
камеру, уровень детализации, линию, staging и grade discipline.

## Воспроизводимый flow

### 1. Brief до генерации

Для каждого key создать короткий YAML/JSON entry: `semantic_key`, `slot_ids`, `location_truth`,
`family`, `time_of_day`, `anchor_refs`, `must_have`, `must_not_have`, `focal_zone`, `grade` и
`acceptance_notes`. Сначала утверждается brief, затем выбирается инструмент.

### 2. Решение по инструменту за одну сессию

- ChatGPT Image — production default для сложных одиночных сцен и этого утверждённого batch.
- ComfyUI — воспроизводимый test/fallback flow для будущих серий; до нового style approval не
  смешивать его output с принятыми masters внутри одной family.
- Не строить новую инфраструктуру ради одного фона и не смешивать два генератора внутри одной
  family до принятия style anchor.

### 3. Pilot

Сначала `maintenance-room`: три варианта композиции с одним brief, затем один выбранный
вариант довести до export и проверить в реальной сцене на телефоне. Если pilot принят, зафиксировать
workflow, model, seed, references, prompt, negative prompt, upscale/cleanup и export command.

### 4. Batch

Генерировать 2–3 родственных ассета за один bounded batch. Для каждой картинки сохранять рядом
sidecar metadata и preview contact sheet. Варианты одной family получать через controlled crop,
dressing и lighting grade; не менять камеру и геометрию без причины.

### 5. Technical gate

Перед интеграцией проверить декодирование, exact `1080×1920`, отсутствие alpha/UI/text, WebP
payload, размер файла и checksum. Затем сделать runtime crawl: каждый новый binary должен быть
доступен из `backgroundAssets`, а каждый alias должен быть явно перечислен в manifest.

### 6. Visual gate

Проверить preview в сцене с одним персонажем, с двумя/тремя персонажами и с dialogue card.
Отдельно проверить readability focal eye-line, отсутствие конкурирующих high-contrast деталей и
то, что предметы в brief читаются на phone viewport. Принятие делает пользователь; статус
`production` менять только после этого просмотра.

### 7. Integration / evidence

Одна партия содержит только один логически завершённый набор: base SHA, binary list, runtime
mapping, checksums, команды проверок, preview URL/path и решение `accepted`/`deferred`.
Бинарные изменения доставляются существующим binary-safe lane; не объединять их с unrelated UI
или несколькими незавершёнными art streams.

## Приоритеты и критерии остановки

| Wave | Keys | Решение |
|---|---|---|
| G4.1 common route | `maintenance-room`, `old-gym-night`, `gymnastics-costume` | новые masters; проверить вместе на phone |
| G4.2 common route | `asterion-transfer-point`, `campus-path` | новые masters; связать с existing family anchors |
| G4.3 conditional | `clubroom-night` | только controlled night grade, если текущая сцена неубедительна |
| G4.4 endings | `anonymous-return-counter`, `service-tunnel`, `disciplinary-assembly` | integrated; повторная visual QA только при style regression |

Остановиться и переключить инструмент, если после одной рабочей сессии нет accepted pilot или
нужна отдельная починка инфраструктуры. Не производить `central-laundry`, `campus-street`,
hero close-ups или новые варианты только ради уменьшения числа aliases.

## Definition of done

- [x] утверждённый batch из 10 masters интегрирован в runtime;
- [x] все новые файлы `1080×1920`, декодируются и проходят binary-safe crawl;
- [x] runtime mapping обновлён после accepted binary;
- [x] `server-room` исключён из текущего scope, macro lock и runtime catalog;
- [ ] финальный human/iPhone visual spot-check после сборки остаётся частью G4a/G5.
