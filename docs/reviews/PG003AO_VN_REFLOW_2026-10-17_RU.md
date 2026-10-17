# PG-003AO: изменение viewport во время чтения

До исправления реальный переход `480×854 → 320×568` оставлял RU VN0001 с двумя
страницами в Godot; исходник пересчитывал их до трёх. Fresh-state screenshots
не обнаруживали этот дефект: после изменения ширины использовался старый cache.

VN теперь пересчитывает страницы после source debounce 80 ms и двух layout
frames. Текущий индекс сохраняется и ограничивается новым числом страниц;
story scene/line не меняются. Возврат к видимой сцене также обновляет layout.
Крупный текст обновляет высоту своего текстового viewport вместе с размером шрифта.

Отложенный callback хранит SceneTree: после удаления screen из родителя
`get_tree()` возвращает null. Full story smoke выявил эту lifecycle ошибку;
она исправлена, и отдельный тест удаляет screen во время ожидания callback.

## Прямая проверка

`e2e/tools/godot-vn-reflow.mjs` проходит sequence во fresh disposable contexts:
new game → page 2 → narrow → последняя narrow page, если она есть → wide.
Для каждого шага сравнивает число страниц и текущий индекс, проверяет, что
остаётся VN0001, и запрещает runtime/HTTP errors. Tabs поочерёдно получают
активные frames, чтобы background RAF throttling не подменяло результат.

- RU: `2 → 3 → 2` страницы; текущий индекс `1 → 2 → 1` на последнем участке.
- BE/EN: две страницы, индекс 1 сохраняется после narrow/wide.
- Все 13 парных состояний прошли contracts без runtime errors.
- Native reflow smoke проверяет cache invalidation, восстановление wide layout,
  сохранение/clamping индекса, stable story ID, large-text height и detach.
  Полный Godot check также прошёл.

[Report](vn-reflow-2026-10-17/report.json) содержит исходный digest и весь sequence.
В том же каталоге сохранена RU narrow-last lossless pair. Полный набор PNG —
локально `D:\unity\vn-reflow-final-captures`.

Это проверка reflow одного пролога, а не принятие всех reading states. Два
BE/EN 320 px first-page font-boundary расхождения предыдущего отчёта сохраняются;
полный story corpus, overlay/large-text captures, AUTO timing и mobile device
acceptance остаются открытыми. PG-003AO остаётся active.
