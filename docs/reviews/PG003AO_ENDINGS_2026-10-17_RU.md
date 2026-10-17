# PG-003AO: концовки — 2026-10-17

Срез переносит самостоятельный экран трёх концовок из production web runtime: шапку, последнюю найденную улику (или последнюю улику каталога), content-sized карточку, метрики, сводку и две кнопки. PG-003AO остаётся active: полный pixel/device/gameplay паритет ещё не достигнут.

## Реализация и найденные ошибки

- EndingView владеет своим layout и вводом. Скрыты оставшиеся VN nameplate/header/controls/vignette. Исходный фон использует cover → Gaussian σ3 CSS px → brightness .45 → scale1.03; VN возвращает профиль σ16/.7/.82/1.08.
- CSS line boxes, padding и переносы воспроизводятся по production CSS. Web измеряет advances через браузерный Canvas с исходным CSS font stack; Godot рисует glyphs своей гарнитурой. Это выравнивает поток текста и размеры, но не обеспечивает совпадение формы букв/антиалиасинга. Native non-Web использует собственные Font metrics и требует отдельной проверки.
- Реальный pointer тест обнаружил, что декоративная переполненная карточка перехватывала настройки несмотря на z-order. Декоративные Control теперь пропускают ввод.
- Первый Tab из body focus начинает с настроек; затем меню и повтор. При переполнении исходный браузер прокручивает скрытый overflow для focused button. Native повторяет сдвиг header/card/background; перемещение не пересчитывает Gaussian cache. Возврат из настроек сбрасывает focus/scroll как новый DOM исходника.
- Continue принимает сохранённую границу line==scene.lines.length. Проверка hidden использует безопасный default для пустой current_line, устраняя runtime error.
- Настройки из концовки получили source navigation footer с выходом в главное меню. Назад сохраняет концовку и изменённую локаль; повтор сбрасывает story save, меню сохраняет его.
- Экспортирована каноническая ending music theme из MusicTheme.ts. Runtime принимает сцену ending; главное меню больше не перезаписывает её темой VN после загрузки сохранённой концовки. Lifecycle проверяет ending stream duration, настройки/back, replay→VN и menu theme.

## Прямые измерения

[Matrix](endings-2026-10-17/matrix.json): **45/45** — A/B/C, fallback truth→B и пустая коллекция × RU/BE/EN × 320×568, 390×844, 480×854. Проверены ending ID, metrics, весь текст сводки, clue/background assets, filter profile и actual rects десяти узлов. Расхождений >0.1px и runtime/HTTP errors нет. На 480px используется общий 430px phone frame.

18 чистых background pairs (два ассета × девять locale/viewport): средняя абсолютная RGB ошибка **0.283229/255**. Это остаточное rendering difference, а не pixel equality.

[Ввод](endings-2026-10-17/input.json): **27/27 profiles, 243/243 шага**, errors=0. RU/BE/EN × три viewport × активация mouse/touch/keyboard; проверены settings/back, неизменность save, Tab settings→menu→replay, source scroll/card rect, replay→VN0001, menu→Continue и settings→menu. Все профили дополнительно содержат keyboard focus walk: это не 27 исключительно сенсорных маршрутов. Кнопки активируются настоящими Playwright pointer/touch/key событиями, а не capture-командами; QA command используется только для установки стартовой концовки и снимков состояния.

[Live resize](endings-2026-10-17/resize.json): **12/12 states**, RU/BE/EN, VN0371, 390×844→320×568→480×854→390×844. Line ID сохранён, generation 1→2→3→4, idle cache стабилен, failures/errors=0.

[VN background regression](endings-2026-10-17/vn-backgrounds.json): **207/207 states**, 23 ассета × RU/BE/EN × три viewport; asset/cache/raster contracts проходят, errors=0. RGB MAE **1.556828/255**, практически тот же уровень, что в предыдущем срезе 1.55682; padding presentation не создаёт существенной регрессии.

Кадры: [RU 320 A source](endings-2026-10-17/ru-320x568-A-web.png) / [Godot](endings-2026-10-17/ru-320x568-A-godot.png); [RU 390 B source](endings-2026-10-17/ru-390x844-B-web.png) / [Godot](endings-2026-10-17/ru-390x844-B-godot.png) / [до](endings-2026-10-17/B-before.png); [EN 480 C source](endings-2026-10-17/en-480x854-C-web.png) / [Godot](endings-2026-10-17/en-480x854-C-godot.png).

Чистый isolated Web export (warmImport=false), canonical Godot source SHA256: **15f530d3764026f749f064ce405c3c999d4967718ada4092786d87593d9b5086**. [Metadata](endings-2026-10-17/capture-build.json) фиксирует base commit и dirty source snapshot; hash относится к содержимому Godot, а не к будущему commit документации. Production entry point не изменён.

Полный npm check: **173 files / 849 tests**. [Полный Godot check](endings-2026-10-17/godot-check.txt), включая новый lifecycle, проходит. [Actual Compatibility GPU check](endings-2026-10-17/gpu-check.txt) проверяет σ16 и σ3, прозрачные границы, premultiplied RGB, idle cache и resize; dummy headless не используется как pixel evidence.

## Воспроизведение и пределы

После export-godot-parity.mjs (по умолчанию cold import) и serve-parity-previews.mjs:

- godot-endings.mjs --chrome <chrome> --web <url> --godot <url>/godot --output <dir> --strict --backgrounds --sharp <package-dir>
- godot-ending-input.mjs с теми же chrome/web/godot/output, без sharp.
- godot-vn-background.mjs и godot-vn-background-resize.mjs проверяют общий background renderer.

Опциональный --warm-import предназначен для итераций: копирует только imported resource cache, затем Godot всё равно проверяет import; режим отмечается в metadata. Финальные измерения выше выполнены без него.

Открыты форма glyphs/антиалиасинг, точный blur теней карточки/primary button, другие screens/states/motion, Match-3 и реальные touch/mobile/audio devices. Матрица mouse/touch/keyboard не заменяет device acceptance. Merge/deploy не выполнялись.
