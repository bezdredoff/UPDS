# PG-003AO: карточки настроек — ввод и состояния

До исправления реальный клик в 4 px от края «Без звука» переключал source,
но оставлял Godot без изменений: работала только внутренняя подпись высотой 22 px.

## Изменения

- Вся карточка делегирует release своему toggle, сохраняет keyboard focus;
  уход указателя за пределы или прокрутка карточки отменяют переключение.
- Pointer events проходят в ScrollContainer. Подпись обслуживает клавиатуру,
  а pointer обрабатывается карточкой единообразно: без двойного toggle.
- Active/off backgrounds, border/pill colors, padding, helper size/leading и
  вертикальное центрирование соответствуют production `.setting-toggle`.
  Narrow minimum — 48 px, обычный — 58 px; 1 px border учтён отдельно от padding.
- Focus style больше не рисует серую рамку вокруг внутренней подписи:
  keyboard focus очерчивает всю карточку по source `:focus-visible`;
  mouse click скрывает эту рамку.
- RU ON/OFF и EN/BE helper copy, BE `available` синхронизированы с каталогом.

## Проверка

`e2e/tools/godot-settings-input.mjs` запускает production web и isolated Godot
release в disposable contexts: RU/BE/EN × 320×568, 390×844, 480×854 × mouse/touch.
Сравнивает DOM `aria-pressed`, фактические Godot button states и сохранённые
preferences после edge click, Space, drag cancellation, haptics edge/caption
click и reload. Reload использует **не default** значения mute=true/haptics=false.
Тексты helper и ON/OFF также сравниваются с production DOM.

Для touch при 320×568 отдельный CDP swipe, начинающийся на карточке, проверяет
прокрутку обеих версий без изменения preference. Сравнивается наличие прокрутки,
а не равенство её расстояния: вертикальный ритм всего settings ещё открыт.

Результат: 18 cases / 138 input steps, без runtime/HTTP errors.
[Report](settings-input-2026-10-17/report.json) содержит source digest и состояния.
Сохранены девять crop pairs активной mute-card; это доказательство state styling,
а не принятие полного экрана. Full settings containment matrix из девяти cases
также прошла; её предыдущая съёмка лежит локально в
`D:\unity\settings-card-final-width`.

Native audio smoke проверяет release/cancel/focus/Space, сохранение preferences,
ошибки записи, mute/preview/focus lifecycle и ширину трёх locale layouts.
Полный Godot check прошёл.

## Открыто

Source font rasterization, полный settings vertical rhythm, sliders/preview
states, реальные device checks и platform capabilities ещё не приняты.
В частности, текущий `menu_audio.gd` gate разрешает haptics только Android/iOS,
хотя [Godot Input поддерживает Web](https://docs.godotengine.org/en/stable/classes/class_input.html#class-input-method-vibrate-handheld).
Это следующий отдельный дефект; passing preference tests не означает проверенную
физическую вибрацию. PG-003AO остаётся active.
