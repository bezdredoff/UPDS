# PG-003AO: цветовые фильтры и виньетка VN

Общий статус **active**. Godot применял только brightness .92 к резкому фону, пропуская CSS saturate .96 и обе `.vn-vignette` gradient layers. Добавлены sRGB brightness/saturation с исходной luminance matrix и premultiplied alpha композиция горизонтального градиента поверх нижнего вертикального. Позиции stops, цвета и opacity взяты из production CSS.

Виньетка находится над фоном, под stage/UI. На всех трёх концовках она отключается; прежний ending renderer сохраняется, поскольку source ending background использует отдельный, ещё не принятый контракт. Возврат в VN восстанавливает материал и виньетку. Source WEBP bytes, story IDs, тексты, save schema и версия web runtime не меняются.

## Прямые измерения

Runner `e2e/tools/godot-vn-background.mjs` открывает настоящие source/Godot Web screens. Для изоляции фоновых слоёв он скрывает foreground children через DOM visibility и отдельный action изолированного capture fixture; обычный production entry point hooks не активирует. Измеряются все RGB pixels phone frame, включая размытые поля. В отчёте остаются actual asset IDs, viewport, locale, source digest и runtime/HTTP errors. Pixel error измеряется, а не объявляется прошедшей произвольный порог.

- [До](vn-background-colors-2026-10-17/before.json) и [после](vn-background-colors-2026-10-17/after.json): **207 states**, все **23 используемых story background** × RU/BE/EN × 320×568/390×844/480×854. Baseline — renderer из `a80a1d8` с тем же QA isolation action в отдельной временной копии.
- Средняя абсолютная RGB-ошибка **10.90164 → 2.72552 / 255**, уменьшилась во всех 207 состояниях. Это измерение фоновых слоёв, не whole-screen acceptance.

| Viewport | До | После |
| --- | ---: | ---: |
| 320×568 | 11.39455 | 2.77233 |
| 390×844 | 10.51706 | 2.72790 |
| 480×854 | 10.79332 | 2.67634 |

Контрольные captures: Campus Path 320×568 [до](vn-background-colors-2026-10-17/campus-before.png) / [после](vn-background-colors-2026-10-17/campus-godot.png) / [source](vn-background-colors-2026-10-17/campus-web.png); Asterion lab 390×844 [native](vn-background-colors-2026-10-17/lab-godot.png) / [source](vn-background-colors-2026-10-17/lab-web.png). Пары просмотрены, уменьшение ошибки не принимается за pixel identity.

Окончательный source digest: `98cc42ef4f39faea8b01829f3f1a5c98417eb458f0071c0a19924e635d48f093`, source commit `5629660`, включая merged main `dbeb722` и этот срез. [Матрица обычной композиции VN0389](vn-background-colors-2026-10-17/composed.json) отдельно сверяет actual portrait assets/rect/static idle contracts: 2/2 states, max rect delta <0.014px, errors=0. После интеграции merged PR #472 повторены все 207 фоновых states; VN0389 дополнительно сверяет actual z/painter order всех участников.

Полный npm check: **173 files / 849 tests**. Полный Godot check включает обычный VN material/visibility и отсутствие виньетки на трёх ending panels.

Воспроизведение: после isolated export/preview server запустить `node e2e/tools/godot-vn-background.mjs --chrome <chrome.exe> --web <source-url> --godot <capture-url>/godot --output <outside-repo-dir> --sharp <installed-sharp-package-dir>`. Sharp используется только для чтения screenshots и RGB metric; dependency игры не добавляется.

## Открытые части

Сохраняются отличия downsampling, CSS blur(16px), fill transform scale(1.08) и краевого clipping. Самая высокая средняя ошибка после изменения — Campus Path 390×844, 4.35220/255. Native nine-tap blur не считается эквивалентом CSS Gaussian. Ending backdrops, остальные экраны, UI fonts/pagination, overlays, motion и device acceptance остаются открытыми. Полный parity не объявляется.
