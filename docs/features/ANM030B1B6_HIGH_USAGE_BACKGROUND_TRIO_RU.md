# ANM-030B1B6 — High-Usage Background Trio

Status: **R1.1 candidate**.

## Цель

Закрыть три наиболее часто используемых semantic background fallback в общей Story-ветке одним
bounded production batch:

- `textile-workshop` — 4 VN-сцены / 83 строки сценария;
- `combat-club-hall` — 4 VN-сцены / 78 строк сценария;
- `old-archive` — 3 VN-сцены / 57 строк сценария.

Приоритет выбран по фактической runtime-экспозиции, а не по старому порядку production waves.
Один batch заменяет три заведомо неверных location aliases сразу в 11 сцен-появлениях общей ветки.

## Production assets

Все три ассета:

- имеют master canvas `1080×1920`, portrait WebP;
- являются environment-only, без персонажей, baked UI, читаемого текста или localization content;
- следуют утверждённой UPDS early-2000s anime VN family;
- сохраняют спокойную нижнюю область под dialogue card и читаемую upper/middle staging zone.

### Textile workshop

- runtime path: `./assets/backgrounds/BG_TEXTILE_WORKSHOP.webp`;
- physical path: `public/assets/backgrounds/BG_TEXTILE_WORKSHOP.webp`;
- домашнее профессиональное ателье с манекенами, швейной машиной, выкройками, эластичными лентами,
  спортивным текстилем и закрытыми пакетами заказов;
- один намеренно reusable фон обслуживает квартиру-мастерскую Хинаты и семейное ателье Кубо.

### Combat club hall

- runtime path: `./assets/backgrounds/BG_COMBAT_CLUB_HALL.webp`;
- physical path: `public/assets/backgrounds/BG_COMBAT_CLUB_HALL.webp`;
- multipurpose university dojo с чистым тренировочным полом, белыми ги, поясами, shinai и закрыто
  хранящейся kendo-защитой;
- один намеренно reusable фон обслуживает карате и кэндо, не возвращаясь к athletics-locker alias.

### Old archive

- runtime path: `./assets/backgrounds/BG_OLD_ARCHIVE.webp`;
- physical path: `public/assets/backgrounds/BG_OLD_ARCHIVE.webp`;
- ночной sibling утверждённой заброшенной прачечной: та же старая institutional architecture,
  тяжёлая service door, exposed pipes, ровные ряды sealed textile evidence bags, catalog ledger и
  отдельная control shelf;
- заменяет unrelated pool-locker alias в слотах 17 и 18.

Пользователь явно разрешил сгенерировать три лидирующих по использованию фона одним batch и сразу
передать их в существующий candidate-PR pipeline. Финальная композиция с реальными персонажами и UI
по-прежнему подтверждается в `/preview/` перед merge.

## Runtime и audit changes

- `backgroundAssets.textileWorkshop`, `combatClubHall` и `oldArchive` разрешаются в dedicated WebP;
- соответствующие family variants и все их slot occurrences получают status `production`;
- background totals меняются с `10/24` production + `14` aliases на `13/24` production + `11`
  aliases;
- из slot gaps удаляются только эти три background requirements; guest и Hero Clue gaps не меняются;
- controller, screenplay, scene IDs, branching, save, localization, staging presets и Match-3
  mechanics не меняются.

## Acceptance

- каждый WebP существует, декодируется и имеет точный размер `1080×1920`;
- Story slots 6 и 14 используют `BG_TEXTILE_WORKSHOP.webp`;
- Story slots 10 и 13 используют `BG_COMBAT_CLUB_HALL.webp`;
- Story slots 17 и 18 используют `BG_OLD_ARCHIVE.webp` до authored перехода в clubroom-night;
- Story macro/audit checks подтверждают `13/24` production и `11` fallback variants;
- GitHub Quality gate проходит;
- `/preview/` проверяется как минимум в authored shots `VN0341`, `VN0505`, `VN0625`, `VN0663` и
  `VN0795`, включая trio/two-shot overlap, focal eye-line и dialogue-card readability.

## Следующая граница

После этого batch дальнейшая генерация фонов через ChatGPT ставится на паузу. Следующая отдельная
production задача должна подготовить воспроизводимый ComfyUI workflow, который использует эти и
утверждённые family anchors как style references. Оставшийся счётчик `11 aliases` не является
автоматическим обязательством производить ещё 11 изображений.
