# PG-003AO: портреты гостевых свидетелей

Статус общего parity track: **active**. Прямая проверка VN0294 (scene11, line5) показала гостя Хинату в production Web и `actors=[]` в Godot. [Исходные данные](guest-portraits-2026-10-17/vn0294-before.json) и кадры: [до](guest-portraits-2026-10-17/vn0294-before.png), [после](guest-portraits-2026-10-17/vn0294-after.png), [source](guest-portraits-2026-10-17/vn0294-source.png).

## Изменение

- Экспорт VN использует production `guestWitnessForSpeaker` и `guestWitnessAssetForDirection`, когда у строки нет authored shot/основного персонажа и это не режиссёрская директива. Исправлены **71 guest line в 14 сценах**, включая все шесть гостей: Хината, Гэн, Аой, Кубо, мать Кубо, Винсент. Стабильные IDs, ветки, save schema и RU/BE/EN тексты сохранены.
- Добавлены **18 исходных stage PNG** (neutral/serious/smile для каждого гостя), побайтно совпадающих с production, с mipmaps. В текущем authored story реально используются 12 вариантов: среди них smile Аой; остальные шесть файлов сохранены как полный production guest package. Арт не генерировался и не перерисовывался.
- Сохранены исходные camera/слой: правая полоса 71%, aspect 2:3, top 0, высота 178% normal / 168% narrow, z=2. Guest markup исходника не имеет `character-rig`, поэтому новые портреты **не получают idle-breathe**.
- Первая 108-state matrix обнаружила 36 narrow geometry mismatches: source stage начинается на Y=56px, native оставлял 60px. Исправлены compact header height, отступы и группировка header actions. Case title использует source override 10/9px и однострочное обрезание с ellipsis вместо переноса длинного названия. Это не объявляет полный visual parity header.
- Guest camera пересчитывается и при width-only resize, когда высота stage может не измениться; это закреплено нативным smoke.

## Прямые доказательства

[Финальная матрица](guest-portraits-2026-10-17/matrix.json), digest `662e29d7bb3648f1f22d3650a0ba35d9c591e856dd0af6634ae72fd39eb4dce6`:

- **108/108**: 12 реально используемых вариантов × RU/BE/EN × 320×568, 390×844, 480×854. Source запускает обычные seeded campaign saves; target — изолированный release Web export, не изменяющий production entry point.
- Сравниваются реальные `.portrait` DOM rect/asset/guest ID и видимый native `TextureRect`, его загруженный resource path и rect. Все assets, line IDs и geometry contracts проходят, runtime/HTTP errors=0.
- `reducedMotion=no-preference`: у source guest `animation-name:none`, положение/размер native остаются неизменными через 350ms. Это не тест анимаций основного состава или всей VN motion matrix.
- Нативный smoke воспроизводит VN0294, проверяет импортированные mipmaps, неподвижность и width-only 390→320→390 без смены story line; полный `godot/check.ps1` прошёл.
- Новый независимый Vitest обходит production narrative и проверяет все 71 guest line/маршрут выражения плюс все 18 оригинальных PNG/import flags. Полный npm check: **172 files / 847 tests**, audit/lint/build прошли.
- Свежий обычный release export с `main_menu.tscn` также загружается в приватном Chromium без runtime/HTTP errors; `window.updsParityCall` и `window.updsParityResult` отсутствуют. [Результат проверки](guest-portraits-2026-10-17/normal-release.json).

Шесть гостей непосредственно просмотрены на парных stage crops. Порядок слева направо: Аой, Гэн, Хината; внизу Кубо, мать Кубо, Винсент. [Source sheet](guest-portraits-2026-10-17/six-guests-source.png) / [Godot sheet](guest-portraits-2026-10-17/six-guests-godot.png). Narrow EN: [source](guest-portraits-2026-10-17/en-320-hinata-source.png) / [Godot](guest-portraits-2026-10-17/en-320-hinata-godot.png).

[RGB измерение VN0294](guest-portraits-2026-10-17/vn0294-rgb.json): mean error видимой stage ROI 34.8113→5.7444, непрозрачной части гостя 73.5103→2.0652 по шкале 0–255. ROI исключает пересечение с nameplate; opaque mask — alpha≥254 из исходного PNG, масштабированного к source rect. Source frame drift между запусками 0.0008. Это измерение улучшения, **не pixel-identity acceptance**: остаются sampling/shadow/backdrop и UI differences. Общий PG-003AO не завершён.

## Воспроизведение и Windows import

1. `node scripts/export-godot-prologue.cjs` копирует полный production guest package и обновляет VN data.
2. `node e2e/tools/export-godot-parity.mjs --godot <console.exe> --output <outside-repo-capture-dir>`; поднять `serve-parity-previews.mjs` с `dist` и capture export.
3. `node e2e/tools/godot-guest-matrix.mjs --chrome <chrome.exe> --web <source-url> --godot <capture-url>/godot --output <outside-repo-evidence-dir>`.
4. `--line-id VN0294 --locale ru --viewport 390x844` воспроизводит контрольную строку. Для RGB добавить `--sharp <absolute-sharp-package-directory>`; без него геометрические/asset/motion contracts проверяются, RGB остаётся null.

Свежий Windows editor import дважды завершился status 3221226356 (`0xC0000374`). Export helper теперь сохраняет status/signal и stdout tail, а в **временной Windows копии** задаёт `editor/import/use_multiple_threads=false`; последующие три последовательных импорта/экспорта прошли. Наличие этого editor-only setting подтверждено [исходным кодом Godot](https://github.com/godotengine/godot/blob/master/editor/register_editor_types.cpp). Точная первопричина crash не доказана. Production `project.godot`, пользовательский редактор и game thread settings не изменены. Capture metadata содержит `serialImport`.

Открыты: остальные story/state overlays, варианты выбора, motion основного состава, typography/pagination, полные compositing и device checks. Matrix покрывает 12 natural guest variants, а не все 71 строки × каждый профиль и не естественное прохождение всей игры. GitHub CI проверяется на актуальном head PR отдельно.
