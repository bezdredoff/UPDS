# PG-003AO — проверка композиции прозрачного art

Дата: 2026-10-16. База: `40dd49a` (handoff #468). Статус PG-003AO остаётся **active**.

## Причина и исправление

После исправления затемнения в #467 общий `match3_drop_shadow.gdshader` всё ещё
использовал fragment `COLOR.a` для тени. Это уже alpha исходной текстуры: вне
силуэта она равна нулю и стирает тень. RGB тени также зависел от RGB прозрачного
пикселя. Предварительное умножение shadow/glow на `(1-source.a)` перед таким же
source-over дополнительно ослабляло края. При item opacity 50% появлялась тень
самого изображения сквозь его непрозрачную часть.

Shader теперь сохраняет item/parent modulation в vertex varying, читает RGBA
текстуры отдельно, композирует source поверх shadow/glow и применяет modulation
один раз к результату. Исходные shader uniforms и игровые assets не менялись.
Общий compositor используется VN-портретами, фишками, ингредиентами и частью
blocker/special эффектов; это исправление общего фильтра, не новая механика.

## Воспроизведение и измерения

Godot 4.7.2, Compatibility OpenGL 3.3, NVIDIA RTX 3080 Laptop GPU. Fixture:
прозрачная RGBA текстура 64×64, прямоугольник `(16,16,32,32)` цвета
`rgb(204,102,51)`, shadow offset `(8,0)`, blur `0`, shadow black alpha `0.5`.
Три состояния: opaque, item opacity 50%, texture alpha 50%. Четвёртое состояние
проверяет независимость цветной тени `rgba(.2,.6,.8,.5)` от RGB текстуры.
Нет шрифтов, локализации, игроковых сохранений или случайного состояния.

Chromium reference: Chrome на этом компьютере, viewport 192×64, DPR 1,
три SVG `<img>` 64×64 с тем же прямоугольником, CSS
`filter: drop-shadow(8px 0 0 rgb(0 0 0 / 50%))`; у второго `opacity: .5`,
у третьего SVG `fill-opacity=".5"`. Прозрачный screenshot снят после загрузки
изображений. Godot fixture находится в `godot/tests/art_compositing_render_smoke.gd`.
Два дополнительных GPU samples проверяют glow без blur за source alpha 50%:
alpha результата `0.7490` (ожидается `0.75`), с item opacity 50% — `0.3725`
(ожидается `0.375`). Это проверка композиции одного glow, а не всей CSS цепочки.

Samples: shadow `(52,32)` и overlap `(40,32)` в каждом 64px блоке.

| Состояние | Chromium alpha shadow / overlap | Godot до исправления | Godot после |
| --- | --- | --- | --- |
| Opaque | 128/255 / 255/255 | 0 / 1 | 0.4980 / 1 |
| Item opacity 50% | 64/255 / 128/255 | 0 / 0.5608 | 0.2510 / 0.4980 |
| Texture alpha 50% | 64/255 / 160/255 | 0 / 0.5294 | 0.2471 / 0.6235 |

Расхождение после исправления укладывается в 1/255 на этих samples. Opaque RGB
сохранился `(0.8,0.4,0.2)`; цветная тень в premultiplied readback имеет
`(0.098,0.298,0.4,0.498)` — близко к ожидаемым `(.1,.3,.4,.5)`.
При сравнении RGB учитывать, что Godot transparent SubViewport readback содержит
premultiplied RGB, а browser PNG — straight RGB. Alpha сравнивается напрямую.

Старая версия shader воспроизводимо провалила assertion исчезнувшей тени;
исправленная проходит. Runner проверяет exit code, stderr и success marker,
поскольку Godot способен завершиться с кодом 0 после неудачного assertion.

```powershell
.\godot\check-render.ps1 -GodotPath "C:\path\to\Godot_console.exe" -CapturePath "C:\captures\compositing.png"
```

Локальные исходные captures этого запуска: `D:\unity\art-compositing-before.png`,
`D:\unity\art-compositing-after.png`, `D:\unity\art-compositing-web.png`.
Это временные измерительные артефакты компьютера, не golden snapshots и не
замена воспроизводимому fixture.

## Границы результата

Эта проверка изолирует RGBA/source-over и modulation. Она не подтверждает полный
визуальный паритет. Остаются парные production captures персонажей/поз/одежды,
tiles/specials/blockers, точность ненулевого CSS Gaussian blur, clipping за пределами
рисуемого quad, последовательность CSS glow filters, Web export, локали, размеры
экрана и motion samples. Headless dummy renderer не является доказательством
отрисовки: GPU regression запускается отдельно от `godot/check.ps1`.

Версия web-продукта не меняется: `src/`, `public/` и web build identity не изменены.

## Локальная валидация

- Полный `godot/check.ps1`: все parser и smoke stages прошли, включая сюжет,
  экраны кампании и 8 TypeScript oracle scenarios.
- `godot/check-render.ps1`: шесть GPU состояний прошли.
- Полный `npm run check` с `VITEST_MAX_WORKERS=2`: audit, lint, 171 test files /
  826 tests и build прошли; стандартный timeout тестов сохранён. Первый запуск
  с default workers одновременно с Godot получил 8 timeout failures,
  ограничение локальной параллельности устранило их без изменения кода/CI.
- `git diff --check`: без ошибок. GitHub checks проверяются отдельно на PR head.
