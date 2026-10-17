# PG-003AO: компактная камера основного состава и idle motion

Общий статус **active**. Исправлен крупный визуальный дефект, который не обнаруживало сравнение только actor IDs: исходный container CSS при ширине ≤340px задаёт всем `.portrait` высоту 168%, переопределяя authored высоту 128.16%. Godot сохранял 128.16% во всех 767 записях основного состава.

## Исправления

- Все пути экспорта (пролог, locker A/B/C, post-match и остальные сцены) сохраняют `compactHeight:168`. Обычная authored камера остаётся прежней. Source PNG, story IDs/тексты, save/schema и маршруты не изменены.
- Общий responsive layout, ранее добавленный для гостей, теперь применяется и к основному составу. Width-only resize переключает камеру без пересоздания story line.
- Idle использует исходный цикл 2.8s, два участка по 1.4s с CSS ease-in-out, амплитуда .35% **текущей** высоты портрета. Раньше tween запоминал амплитуду от authored размера при создании и не учитывал compact/resize. Теперь метод tween вычисляет смещение по текущему box.
- Реальная браузерная проверка выявила неработавший Web reduced-motion gate: даже в reduce-контексте native создавал idle tween. Общий helper теперь явно проверяет Web и читает `matchMedia` через `JavaScriptBridge.eval` в global context. На открытой VN сцене изменение настройки останавливает/сбрасывает или возобновляет eligible rig idle. Статичные prop poses и гости не анимируются.
- Изолированный capture fixture умеет останавливать и пошагово продвигать **production tween**. Для нулевой отметки используется минимальный положительный delta 1µs: нулевой delta не вызывал callback и оставлял предыдущую позу. [Документация Tween](https://docs.godotengine.org/en/stable/classes/class_tween.html#class-tween-method-custom-step) описывает ручной шаг; это диагностический путь, не дополнительный production API.

## Доказательства

[Исходный VN0001 probe](core-camera-motion-2026-10-17/before.json), RU 320×568:

| Rect component | Source | Godot до | Godot после |
| --- | ---: | ---: | ---: |
| X | -8 | 31.8400 | -8.0000 |
| Y при capture | 167.40625 | 167.39096 | 167.42002 |
| Width | 336 | 256.31993 | 335.99999 |
| Height | 504 | 384.47998 | 503.99998 |

Позиции измерены на реально отображаемом DOM portrait и native `TextureRect`, а не только вычислены по модели.

- [Геометрическая матрица](core-camera-motion-2026-10-17/geometry.json): **702/702 states**, 78 используемых сочетаний PNG/положения/model z × RU/BE/EN × три viewport. Максимальная rect delta 0.016572px, runtime/HTTP errors=0. Полный машинный отчёт сохраняет actual asset, rect, line ID и preference gate; сам draw order этим контрактом не проверяется.
- [Motion report](core-camera-motion-2026-10-17/motion.json): **180/180 states, 1620 paired time samples**, максимум расхождения rect 0.013782px, runtime/HTTP errors=0. Девять neutral rigs и один static prop pose × RU/BE/EN × три viewport × normal/reduce; времена 0/.35/.7/1.05/1.4/1.75/2.1/2.45/2.8s.
- Дополнительно **180 live preference transitions** на той же сцене: reduce и возврат no-preference. Source CSS animation presence и actual native tween/preference совпадают.
- [Три пары rendered frames](core-camera-motion-2026-10-17/phase-frames.json): [t=0 source](core-camera-motion-2026-10-17/miku-t0-web.png) / [native](core-camera-motion-2026-10-17/miku-t0-godot.png); [t=1.4 source](core-camera-motion-2026-10-17/miku-t1.4-web.png) / [native](core-camera-motion-2026-10-17/miku-t1.4-godot.png); [t=2.8 source](core-camera-motion-2026-10-17/miku-t2.8-web.png) / [native](core-camera-motion-2026-10-17/miku-t2.8-godot.png).
- [Guest regression](core-camera-motion-2026-10-17/guest-regression.json): все 12 используемых вариантов RU 320×568 сохраняют asset/geometry/static contracts. Selector runner теперь различает гостей по asset namespace: наличие `compactHeight` стало общим свойством всех портретов.
- Full Godot check проходит, включая новый core-camera smoke: пик idle, width-only 390→320→390 и пересчёт амплитуды без story advance. Vitest охватывает все 767 записей/девять персонажей; полный npm check — **173 files / 848 tests**.
- Свежий обычный release export загружен и открыт в VN реальным нажатием «Новая игра»: runtime/HTTP errors=0, активных capture hooks нет. [Результат](core-camera-motion-2026-10-17/normal-release.json).

Source digest кандидата для матриц: `ffc74bdf4f45404051323c402da907f56fda4a7b3aac10efc798671626b92653` (base `e68eea2` плюс этот срез).

## Воспроизведение и открытые части

После isolated Web export и preview server:

`node e2e/tools/godot-core-portraits.mjs --chrome <chrome.exe> --web <source-url> --godot <capture-url>/godot --output <outside-repo-dir>`

`--motion` проверяет реальные CSS/Web Animations и production Godot tweens на равных временных отметках плюс live preference changes. `--line-id VN0001 --locale ru --viewport 320x568 --motion` сохраняет контрольные rendered frames. Обычный release entry point capture hooks не активирует.

Это прямое evidence **asset/geometry/idle trajectory/preference**, не приёмка одинакового RGBA всех кадров. На кадрах сохраняются typography, nameplate, paper/controls и backdrop/compositing differences. Остальные feedback animations, overlay/state/input/device проверки остаются открытыми. Глобальный reduced-motion helper исправлен, но весь Match-3 motion этим VN-тестом не принят. Полный parity не объявляется.
