# PG-003AO — экранная матрица и responsive меню

Статус: **active**. Продолжение кандидата PR #469; общий паритет ещё не принят.

## Прямые проверки

Сняты **36 парных Web captures**: меню, VN0001, настройки и свежий campaign hub,
каждый в RU/BE/EN при `320×568`, `390×844`, `480×854`, DPR 1, reduced motion.
Runtime/console/HTTP errors в наборе отсутствуют. Это проверка здоровья и источник
визуальных расхождений, а не утверждение о паритете всех четырёх экранов.

Для меню дополнительно проходят **девять контрактов source geometry**:
phone frame, четыре кнопки, вертикальные bounds заголовка/подзаголовка/медальонов.
Допуск 1 px покрывает округление CSS дробных размеров контейнерами Godot.
Вертикальная разница медальонов составляет 0.656 px на узком экране и 0.250 px
на двух остальных размерах во всех локалях. Ранее RU `390×844` отличался
на −19.75 px, EN — на −12.75 px; узкий BE текст выходил за правый край.

Кандидат исправляет:

- Source flex margins, две строки заголовка с line-height `1.02`, переносимый
  подзаголовок и footer flow вместо фиксированного 20px слота/случайных gaps.
  Font leading компенсируется внутри title frame, не меняя положение блоков.
- BE при 320 px: две строки подзаголовка без обрезания. Source layout вынесен
  из composition root в `main_menu_layout.gd`.
- Source 3px border и внутренний content box медальонов, antialiasing,
  mipmap filtering. Для круглой тени используется Gaussian edge approximation
  с поправкой кривизны, sigma 7px и смещением 5px; прежняя StyleBox тень была
  слишком плотной. Source [box-shadow blur](https://www.w3.org/TR/css-backgrounds-3/#shadow-blur)
  14px соответствует sigma 7px.
- Тени primary action и phone frame, точные wash alpha из CSS и полноэкранный
  radial backdrop за ограниченной phone frame. Тень прямоугольной кнопки
  приближает скруглённый source box; это не заявление о побитном совпадении.
- Web font oversampling учитывает inverse scale phone frame. При `320×568`
  logical viewport имеет `475×844`; без item scale glyph atlas строился для
  уменьшенного viewport scale и затем увеличивался, давая видимое размытие.
  [CanvasItem oversampling with scale](https://docs.godotengine.org/en/stable/classes/class_canvasitem.html#class-canvasitem-property-oversampling-with-scale)
  сохраняет плотность растра при том же положении/размере UI.

В контрольном EN `390×844` RGB MAE области медальонов до исправления их
content/border/shadow составляла 25.9569, после — 1.8959 (ROI `65,190,260,130`).
В финальной матрице MAE вне кругов, ниже их верхней границы, составляет 0.946–1.554
на канале `0…255`. Расширенный hero ROI также содержит соседний текст и не
является чистой метрикой art; его ошибки на узких экранах нельзя объявлять
закрытыми по этому сравнению. Typeface/raster differences остаются в проверке.

## Воспроизводимый capture

Release templates Godot 4.7.2 запрещают scene-path overrides. Поэтому тестовый
экспорт создаётся из отдельной временной копии проекта с capture entry point;
оригинальный `project.godot` не меняется. Scene использует memory campaign state
и отдельный preferences path. Browser contexts одноразовые, без профиля игрока.

```powershell
npm.cmd run build
node e2e/tools/export-godot-parity.mjs --godot "C:\path\to\Godot_console.exe" --output "C:\captures\godot"
node e2e/tools/serve-parity-previews.mjs --web dist --godot "C:\captures\godot" --port 4186
# In another terminal:
node e2e/tools/godot-screen-matrix.mjs --web http://127.0.0.1:4186/ --godot http://127.0.0.1:4186/godot/ --output "C:\captures\screens" --enforce-menu
```

Можно указать `--chrome "C:\path\to\chrome.exe"`; иначе нужен установленный
Chromium Playwright. `--locale`, `--viewport`, `--states` ограничивают набор.
Test host обслуживает optional `/favicon.ico` ответом 204; ошибки игровых
ресурсов, runtime и console остаются ошибками capture.

Экспорт содержит SHA-256 исходного Godot tree (без generated cache/UID sidecars,
с нормализованными text line endings). Runtime возвращает digest вместе с
координатами; runner запрещает смешивать разные PCK в одной матрице. Git commit
в metadata — базовый HEAD на момент capture, не доказательство отсутствия
непубликовавшихся изменений; digest проверен отдельно против текущего tree.
Следующие экспорты также записывают `sourceTreeClean`.

Проверенный source digest:
`1e4073863fd807083c1003420a8535c9140d77ccf207613de4a132491016d385`.
Базовый HEAD при capture: `64f4de8`; меню исправлено в текущем кандидате поверх него.

Успешные временные копии автоматически удаляются после проверки их task-owned
пути; `--keep-project` оставляет копию для диагностики. Ошибочные экспорты сохраняют
копию и логи. Normal release export отдельно запущен при `390×844`: ошибок нет,
`updsParityCall` и `updsParityResult` отсутствуют — capture scene не активируется
в обычном main entry point.

## Артефакты и открытые расхождения

[Summary 36 captures](screens-2026-10-17/summary.json) фиксирует здоровье и результаты
menu contracts. В каталоге сохранены девять пар меню с per-case metadata и две
пары, показывающие следующие дефекты. Полный локальный набор:
`D:\unity\upds-screen-matrix-release`.

Следующий приоритет, подтверждённый captures:

1. **VN pagination и cue:** при RU `390×844` source VN0001 имеет три страницы,
   Godot — две; перенос/ellipsis отличается. Cue содержит missing glyph вместо
   source triangle; chrome/nameplate/dialogue styling и reduced-motion cue также
   требуют сравнения. [Web](screens-2026-10-17/ru-390x844-vn-web.png) /
   [Godot](screens-2026-10-17/ru-390x844-vn-godot.png).
2. **Settings narrow overflow:** BE `320×568` обрезает native language/audio content
   справа. Header eyebrow остаётся английским; slider styling/percent values
   и localization ещё отличаются. [Web](screens-2026-10-17/be-320x568-settings-web.png) /
   [Godot](screens-2026-10-17/be-320x568-settings-godot.png).
3. **Campaign hub:** узкие progress/card heights и текстовая плотность отличаются;
   unlocked/progress/result states ещё не покрыты этой fresh-state матрицей.
4. **Дальнейший общий объём:** остальные VN/choice/history/dossier/Match-3/intros/
   results/evidence/endings/dialog/save/error states, крупный текст, input sequences,
   motion frames и reduced motion. Изолированные art states и зелёный CI их не закрывают.

PG-003AO остаётся active до прохождения полного списка handoff.
