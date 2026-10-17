# PG-003AO: English serif metrics и пагинация

405-state story-entry matrix выявила 13 несовпадений первой страницы и 11 page-count mismatches в 135 английских состояниях. Проверка метрик показала, что общий размер Web serif 16/13px ошибочно применял Cyrillic fallback calibration к английскому Gelasio. Для Latin его advances совпадают с исходной Georgia значительно лучше при CSS размерах 17/14px.

## Изменение и прямые измерения

Web EN теперь использует normal 17px (14px narrow), large 19px (16px narrow). RU/BE и native OS font calibration не изменены этим срезом. Новые шрифты не добавлены, системные font files не копировались.

`e2e/tools/godot-font-metrics.mjs` измеряет production browser font stack через Canvas и реальные advances `UiFonts.serif()` в изолированном Godot Web export. [Отчёт](english-serif-2026-10-17/font-metrics.json): 45 sampled first-page strings каждой локали, всего 135; source normal 17px. Mean absolute relative width error:

| Locale | Godot 16px | Godot 17px |
| --- | ---: | ---: |
| EN | 5.7801% | 0.1454% |
| RU | 1.6523% | 7.9657% |
| BE | 1.9570% | 8.2811% |

Поэтому увеличение размера применяется только к EN. Эти средние не доказывают совпадения всех glyphs/kerning или всех авторских строк.

## Результат

- [Повторная EN normal matrix](english-serif-2026-10-17/normal.json): все 45 сцен × три viewport, **135 states**, page counts совпадают **135/135** (было 124/135), первая displayed page — **134/135** (было 122/135). Line IDs/actor selections совпадают; runtime/HTTP errors=0. Digest `a45db0f98b3c935629e196ad1e4091e163a6036b5568b925b9b7eeabce704332`.
- Остаётся **VN0946, scene44, EN 320×568**: source первая страница заканчивается `Coincidence three!…`, native — `Motive…`; число страниц одинаковое, 2. Это открытое расхождение fit/wrapping на близких метриках.
- [Large matrix](english-serif-2026-10-17/large.json): scenes 0/2/42 × три viewport, **9 states**, displayed pages и page counts совпадают 9/9, runtime/HTTP errors=0. Source переключается реальными controls конфигурации, fixture использует production config buttons/signals. Digest `6584f3a913f4b79a3c64cfd6471980a541c5e37ed0e79278ac44247b73abd69f` также относится к font-metrics report; разница с normal digest — добавленные диагностические fixture actions.
- Narrow до/после/source: [до](english-serif-2026-10-17/en-320-before.png), [после](english-serif-2026-10-17/en-320-after.png), [source](english-serif-2026-10-17/en-320-source.png). Large 390px: [source](english-serif-2026-10-17/en-390-large-source.png) / [Godot](english-serif-2026-10-17/en-390-large-godot.png).
- Full Godot check с изменённым runtime прошёл; финальный capture fixture отдельно parse-checked и выполнен в браузере.

Normal report дополнительно регистрирует 50 speaker-badge width mismatches; large report — 3. Исправление serif не исправляет UI sans fallback, карточку/controls/shadows и прочие visual gaps. Полный PG-003AO остаётся **active**, RU/BE pagination и остальные строки/состояния/motion/device acceptance открыты.

## Воспроизведение

1. `node e2e/tools/export-godot-parity.mjs --godot <console.exe> --output <capture-dir>`; поднять `serve-parity-previews.mjs` с production `dist` и этим export.
2. `node e2e/tools/godot-story-matrix.mjs --chrome <chrome.exe> --web <source-url> --godot <capture-url>/godot --output <outside-repo-dir> --locale en`.
3. Для large добавить `--scenes 0,2,42 --text-scale large`.
4. `node e2e/tools/godot-font-metrics.mjs --chrome <chrome.exe> --web <source-url> --godot <capture-url>/godot --cases docs/reviews/story-entries-2026-10-17/entries.json --output <outside-repo-dir>`.

Системный source font зависит от ОС браузера; сравнения выполнены в свежем Chromium/Windows context. Не обновлять Linux Playwright goldens этими кадрами. JSON contracts служат прямым evidence, но не объявляют все состояния визуально принятыми.
