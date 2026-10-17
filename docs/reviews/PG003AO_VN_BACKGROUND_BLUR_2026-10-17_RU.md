# PG-003AO: экранный blur, дробный contain и кеш VN-фона

Общий статус **active**. Предыдущий цветовой срез исправил brightness/saturate и виньетку, но native fill использовал девять texture-space taps, не повторял CSS blur(16px)/scale(1.08), а резкий слой терял дробную геометрию contain и давал сильный aliasing.

## Renderer

- `vn_background_fill.gd` сначала растеризует source cover в CSS-размер кадра, затем выполняет горизонтальный и вертикальный Gaussian sigma=16px, radius=48px. Соседние taps объединены через linear filtering. Вертикальный intermediate хранит premultiplied RGBA; presentation shader применяет scale(1.08) вокруг центра и переводит цвет в straight alpha для canvas source-over.
- Вне исходного image element выборки прозрачны; vertical padding сохраняет filter bounds. Финальная quad ограничена phone frame, под ней source base `#1b2340`. Brightness .7 и saturate .82 используют source sRGB matrix.
- Три SubViewport обновляются через UPDATE_ONCE при смене asset/размера. Idle story frames и повторный refresh того же asset используют кеш. Это не тяжёлый Gaussian на каждом кадре анимации персонажей.
- Fit shader вычисляет contain в дробных координатах, сохраняя source brightness .92/saturate .96 и vertex modulation без повторного умножения texture. Для 390×844 и 1080×1920 граница Y=75.333px. [Исходник TextureRect](https://github.com/godotengine/godot/blob/4.7-stable/scene/gui/texture_rect.cpp) подтверждает целочисленные `tex_width`/`tex_height` в прежнем centred-aspect пути.
- Mipmap sampling включён для 23 фонов. [SHA report](vn-background-blur-2026-10-17/assets.json) подтверждает **23/23 byte-identical WEBP** относительно утверждённых source assets. Содержимое арта не менялось.
- Ending paths сохраняют отдельный legacy blur/material/geometry и отключают VN vignette. Исходный ending backdrop contract ещё не принят; этот срез не объявляет его исправленным.

## Доказательства

- [Матрица](vn-background-blur-2026-10-17/matrix.json): все 23 story backgrounds × RU/BE/EN × 320×568/390×844/480×854, **207 состояний**. Измеряются все RGB pixels phone frame, actual asset IDs, размеры cover raster и стабильность cache generation. Baseline — [после цветового среза](vn-background-colors-2026-10-17/after.json).
- **207/207** states уменьшили mean absolute RGB error; **2.72552 → 1.55682 / 255**, runtime/HTTP errors=0. Все cache/raster/asset contracts проходят. По viewport: 320×568 — 2.77233→1.68492, 390×844 — 2.72790→1.27432, 480×854 — 2.67634→1.71121. Наибольший остаток — Campus Path 480×854, 2.52274/255.
- [Blur regions](vn-background-blur-2026-10-17/regions.json): отдельно измерены RU поля вне contain с исключением двух пикселей у границы. **46/46** профилей с такими полями улучшились, среднее **5.34591 → 0.52690 / 255**. Norihiro apartment 390×844: **9.02739 → 0.52470**. При 320×568 фон почти целиком занимает contain, поэтому отдельного поля шире двух пикселей нет.
- Просмотрены Asterion lab 390×844: [до blur](vn-background-blur-2026-10-17/lab-before.png) / [после](vn-background-blur-2026-10-17/lab-godot.png) / [source](vn-background-blur-2026-10-17/lab-web.png). [Composed VN0389](vn-background-blur-2026-10-17/composed.json): 2/2 actor asset/rect/idle/z-order contracts проходят, max rect delta <0.014px, errors=0. Это не приёмка остающихся UI/typography differences.
- [Live resize](vn-background-blur-2026-10-17/resize.json): RU/BE/EN, **12 states**, одна открытая VN0371, 390×844→320×568→480×854→390×844. Line ID сохраняется, cache generation 1→2→3→4, idle снимки не вызывают пересчёт. Source hidden establishing VN0370 пропускается production runtime, поэтому для проверки стабильности выбрана видимая строка.
- `godot/check-render.ps1` теперь запускает и новый actual Compatibility GPU smoke. Независимый CPU Gaussian oracle проверяет alpha прозрачной границы и premultiplied RGB; прямое чтение GPU bytes доказывает, что dirty cover/blur canvas не перерисовываются в idle. Resize создаёт новый raster. `SubViewport` хранит requested UPDATE_ONCE в своём property и после его потребления сервером; тест не подменяет GPU evidence чтением этого поля ([исходник](https://github.com/godotengine/godot/blob/4.7-stable/scene/main/viewport.cpp)). Оба GPU smoke проходят.
- Полный npm check — **173 files / 849 tests**. Полный Godot check включает source-asset/raster contract вместо устаревшего требования старых stretch modes, resize/cache и три ending guards.
- [GPU check log](vn-background-blur-2026-10-17/gpu-check.txt) сохранён для обоих renderer smoke.

Source digest окончательного isolated Web candidate: `2bade17634cf882ced9b4def7696c4748bad81ab622b63b2fa63792d9843ce53` (base `df0a645` плюс этот срез). Production entry point не меняется; capture-only metadata остаётся в отдельном fixture.

## Воспроизведение и пределы

После isolated export/preview server:

`node e2e/tools/godot-vn-background.mjs --chrome <chrome.exe> --web <source-url> --godot <capture-url>/godot --output <outside-repo-dir> --sharp <installed-sharp-package-dir>`

`godot-vn-background-resize.mjs` с теми же аргументами проверяет живой resize. `godot/check-render.ps1 -GodotPath <console.exe>` требует реального Compatibility renderer; dummy headless не считается pixel evidence.

Остаточные RGB differences сохраняются: browser downsampling/kernel/rasterization не объявляются идентичными. CPU Gaussian oracle доказывает выбранную формулу native shader, а прямые source/native Web captures измеряют её фактическую близость к browser implementation. Полный pixel parity, ending backdrops, typography/pagination, остальные screen/state/motion/device проверки остаются открытыми.
