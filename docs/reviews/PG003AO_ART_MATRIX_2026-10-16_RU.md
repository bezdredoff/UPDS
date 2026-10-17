# PG-003AO — парная матрица art web/Godot

Статус: **active**, общий паритет не принят. Продолжение PR #469 на базе `61180ae`.

## Покрытие и воспроизведение

Новый `e2e/tools/godot-art-matrix.mjs` снимает изолированные, неподвижные art states:
36 используемых персонажных кадров/поз девяти персонажей, 10 типов tiles, 5 specials,
27 ingredient routes, locked/solid/overlay blockers с одним и двумя слоями — **84**.
Все 59 уникальных PNG побайтно сверяются с `public/` перед capture.
Это полная матрица скопированного art данного типа, а не всех экранов игры.

Godot fixture использует production VN material и реальные TextureRect,
созданные Match-3 screen, с их anchors, offsets, scale, opacity и material.
Campaign state хранится в памяти; idle заморожен. Chromium fixture загружает
весь production CSS в порядке `src/main.ts`, поэтому учитывает специфичность
селекторов и UI A. Filename сохранён в data URL fragment: CSS `[src*=...]`
для locked/foam blocker иначе не сработал бы.

Размер capture `384×480`, DPR 1, фон `#223b58`, без текста и локализации.
Портрет занимает `256×384`; клетка Match-3 берётся из native geometry, и web
получает ровно те же размеры/координаты. Это контролируемая проверка art,
а не замена экранной матрице `320×568 / 390×844 / 480×854`.

```powershell
npm.cmd --prefix e2e install --ignore-scripts --package-lock=false
node e2e/tools/godot-art-matrix.mjs --godot "C:\path\to\Godot_console.exe" --chrome "C:\path\to\chrome.exe" --output "C:\captures\art-matrix" --enforce-contracts
```

Если `--chrome` не указан, используется Chromium из установленного Playwright.
`--kind tile` ограничивает capture одним типом. `--output` должен быть отдельным
каталогом. Результат: `index.html`, парные PNG, geometry, manifest, report JSON,
renderer log. Runner отклоняет engine errors/неполный capture. `--enforce-contracts`
проверяет content bounds с допуском 0,08 px (CSS subpixel rounding), brightness,
saturation и opacity. Пиксельные метрики сообщаются отдельно и сами по себе
не означают визуальную приёмку.

## Наблюдавшиеся причины и изменения

- Computed UI A CSS задаёт tile scale **1.08**, нулевой padding внутри **1px**
  cell border; Godot применял **1.04** и **2px** inset. Исправлены реальные размеры.
- Более специфичный `.tile[data-tile-variant="tile:camisole"]` сохраняет
  `brightness(1.38) drop-shadow(0 1px 1px #10172d66)`, несмотря на поздний `.tile`.
  Godot ошибочно применял общий saturation/shadow. Восстановлен source filter.
- Ingredient padding **2px** и blocker padding **1px** отсчитываются внутри cell
  border. Native content insets теперь **3px / 2px**. Ingredient idle по-прежнему
  поднимается на **2px**, сохраняя размер; его resting/peak assertions обновлены.
- Specials используют inner cell box; 14% bleed вычисляется отдельно от ширины
  и высоты, а не только от ширины квадратной клетки.
- Для CSS saturation используется luminance matrix `.213/.715/.072`, описанная
  в [Filter Effects](https://www.w3.org/TR/filter-effects/#feColorMatrixElement).
- GPU screenshots выявили aliasing при уменьшении крупных PNG без mipmaps.
  Для этих 59 текстур включена генерация mipmaps, production TextureRect используют
  mipmap filtering. Shader выбирает нижний дискретный mip level для source art,
  чтобы не размывать детали смесью с более грубым уровнем. Это калибровка по
  измеренному Chromium capture, не утверждение о внутреннем алгоритме всех браузеров.
  Исходные PNG, персонажные постановки и игровые правила не менялись.

## Измерения

Средняя абсолютная RGB ошибка измеряется в одинаковом ROI: art/cell bounds плюс
32px поля, три канала `0…255`. ROI одинаков до/после; пустые поля входят в среднее,
поэтому это сравнительная метрика, не процент визуальной идентичности.

| Группа | Состояний | До geometry/filter/mipmap fixes | После |
| --- | ---: | ---: | ---: |
| Портреты | 36 | 0.9171 | 0.3431 |
| Tiles | 10 | 2.3215 | 0.7897 |
| Specials | 5 | 2.3886 | 0.9441 |
| Ingredients | 27 | 0.6130 | 0.5760 |
| Blockers | 6 | 1.2109 | 0.7727 |

Все 84 geometry/filter/opacity contracts прошли. JSON с исходными SHA-256,
профилями/координатами, per-case pixel metrics и digest проверенного production
кода находится в [report.json](art-matrix-2026-10-16/report.json).
Пять пар lossless captures включены в тот же каталог: Ayuki, Rina, white tile,
camisole и locked blocker. Полные локальные наборы этого запуска:
`D:\unity\upds-art-matrix-before` и `D:\unity\upds-art-matrix-final`.

## Что ещё открыто

Остались ненулевой Gaussian shadow blur и clipping за границами рисуемого quad,
точность texture resampling на других GPU/browser/масштабах, composited tile under
blocker и special-direction badges, выбранные/hinted/drag/clear states, а также
полные экраны, motion, локали и responsive matrix. Изолированный art capture
не подтверждает исправления в свежем Web export — он проверяется отдельно.
Mipmap chains увеличивают объём импортированных текстур; mobile performance и
Web export size требуют прямой проверки, а не вывода из native RTX captures.

## Проверки этого среза

- `godot/check.ps1`: все parser/smoke stages прошли, включая фактическое наличие mip levels.
- GPU compositing smoke: шесть состояний прошли; art matrix: 84 contracts прошли.
- Полный `npm run check` (`VITEST_MAX_WORKERS=2`): 171 test files / 826 tests, audit/lint/build прошли.
- Docs/hygiene: 30 tests прошли после добавления отчётов.
- Свежий Playgama Web export: успешно собран; Chromium 390×844 boot без page/console errors.
- На этом компьютере установлены Web templates 4.7.2 из официального архива; SHA-256 совпадает с handoff `f298490b8d44d934be425a5a65a51bf15f422428b229a06a6e11d9ffea248011`.
- GitHub checks выполняются отдельно на актуальном PR head.
