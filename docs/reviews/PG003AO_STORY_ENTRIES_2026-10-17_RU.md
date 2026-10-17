# PG-003AO: входы во все 45 VN scenes и плашка говорящего

Статус: частичный прогресс, общий PG-003AO **active**. Проверка одного VN0001 не представляла остальные сцены. Новая прямая матрица охватывает первые видимые строки всех 45 сцен × RU/BE/EN × 320×568, 390×844, 480×854: **405 состояний**. Для production Web используются обычные campaign saves в свежих disposable contexts и кнопка «Продолжить» (для свежего пролога — «Новая игра»). QA-функции в production runtime не добавлены.

Изолированный Godot capture fixture теперь обновляет уже открытый VN после смены позиции и публикует фактическую текущую строку. Без `_refresh()` повторный `line` менял session state, но оставлял старый экран: такой fixture не годился для проверки нескольких сцен подряд. Scene/line IDs сравниваются с реально отображаемыми `.line-id` исходника.

## Наблюдения до изменения плашки

[Машинный отчёт 405 состояний](story-entries-2026-10-17/entries.json), digest Godot `ddfcd38f3d336148fc09aa5d350d78fdc4e0e535bad80ae2866cef222ab80bc3`, source base `a9cc8b9` плюс изменение fixture:

| Locale | States | Другая первая страница | Другое число страниц | Другой line ID / actor set |
| --- | ---: | ---: | ---: | ---: |
| RU | 135 | 8 | 4 | 0 / 0 |
| BE | 135 | 10 | 5 | 0 / 0 |
| EN | 135 | 13 | 11 | 0 / 0 |

Всего 372 из 405 совпали по четырём проверяемым entry contracts. В 33 есть расхождения: 31 по первому тексту, 20 по числу страниц; категории пересекаются. Runtime/HTTP errors: **0**. Например, RU VN0059 при 390px: исходник помещает полную строку на одной странице, Godot делит на две. Это открытый дефект, а не разрешённое исключение.

Actor set здесь сравнивает DOM `[data-character]` с данными текущей строки Godot; это проверка выбранного состава, **не** pixel/motion acceptance актёров. Полные локальные парные кадры сохранены для шести сцен каждого профиля. В репозитории оставлены репрезентативные пары, включая [EN scene44 source](story-entries-2026-10-17/en-390-scene44-source.png) / [Godot](story-entries-2026-10-17/en-390-scene44-godot.png).

## Изменение плашки

Прямой просмотр scene42 выявил фиксированную native ширину 200px вместо source 128px для короткой подписи. Убрана фиксированная ширина: плашка получает минимум 128px и расширяется по содержимому с CSS padding/border. Узкий X-offset исправлен 32→22px, высота minimum — 34/38px, emotion font — 7px во всех профилях; положение по Y теперь зависит от narrow width, как source media query.

- [До](story-entries-2026-10-17/ru-390-scene42-before.png), [после](story-entries-2026-10-17/ru-390-scene42-after.png), [source](story-entries-2026-10-17/ru-390-scene42-source.png).
- Новый smoke проверяет сжатие плашки до 128×38 после длинной подписи, compact offset и размеры шрифтов. Полный `godot/check.ps1` прошёл.
- [Повторная матрица 27 состояний](story-entries-2026-10-17/nameplates.json): scenes 0/2/42 × девять профилей, digest `89dd3a68f3623300e7c0984d4ad31e4dd07252b721e4b0ced0a41335e70cf9f8`. Все девять коротких плашек scene42 совпадают с source по четырём rect components с погрешностью <0.02px. Всего геометрия совпадает в 12/27, остаются **15 несовпадений длинных подписей**. Например, RU scene0 390px: native 211px против 200.8125px. Не объявляем полный badge parity.
- [BE compact source](story-entries-2026-10-17/be-320-scene0-source.png) / [Godot](story-entries-2026-10-17/be-320-scene0-godot.png) показывают оставшиеся различия текста/шрифта.

Source CSS использует системные font stacks (Inter с platform fallbacks, Georgia/serif); Godot Web использует bundled Inter/Gelasio/Noto Serif. Одинаковое имя в computed `font-family` само по себе не доказывает одинаковое фактически выбранное начертание. Следующий приоритет — согласовать font metrics и реальную fit predicate на широком corpus, а не подбирать перенос по одному прологу. Затем — прочие строки, B/C choices, history/dossier/config/save/error states, outcomes и motion.

## Воспроизведение и пределы

`node e2e/tools/godot-story-matrix.mjs --chrome <chrome.exe> --web <production-preview> --godot <isolated-capture-preview>/godot --output <outside-repo-dir>`

Опции `--locale`, `--viewport`, `--scenes 0,2,42` позволяют повторить срез. `--enforce-nameplate` превращает несовпадение геометрии в ошибку; на текущей полной 27-state matrix он **должен падать** из-за сохранённых 15 расхождений. Runtime/HTTP errors всегда фатальны. JSON сохраняется до финального assertion.

Обычные seeded saves задают choice A без набора доказательств/пройденных уровней. Это entry coverage, а не естественное прохождение, проверка всех 976 строк или принятие трёх ending outcomes. Кадры reduced-motion не проверяют анимации. Все эти части исходной цели остаются открытыми. Hygiene/status/traceability tests: 24 passed; GitHub checks проверяются на актуальном PR head отдельно.
