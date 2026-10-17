# PG-003AO: пагинация VN и указатель продолжения

Прямой RU capture `390×844` выявил две страницы Godot вместо трёх source.
Первая native страница содержала искусственное `колле-\nджа` и следующее слово.
Это был дефект алгоритма, а не только различие начертания шрифтов.

## Исправление

- `dialogue_paging.gd` переносит production `src/ui/vnDialoguePaging.ts` для RU/BE/EN:
  предпочитает границы предложений/слов, резервирует место под многоточие,
  сохраняет здоровый хвост продолжения, балансирует короткие хвосты.
  Presentation ellipsis заменяет завершающие `.`, `;`, `:`, как в исходнике.
- В Web используется тот же браузерный `Intl.Segmenter` для предложений.
  Без него действует регулярный fallback исходной функции; native fallback
  ещё требует проверки аббревиатур всего story corpus.
- Удалена самодельная вставка дефисов внутри авторских слов. Grapheme fallback
  применяется к длинным неделимым токенам, а не для уплотнения обычных страниц.
- Текстовая область учитывает CSS padding: narrow card inset 8 px плюс
  border/padding 16 px; обычный inset 12+22 px. Отдельно заданы top 9/right 1/
  bottom 6 px внутри текста. Высота viewport зависит от CSS размера normal/large.
  Узкая полоса controls имеет source minimum 58 px и нижний gap карточки 5 px.
- Cue рисуется полигоном вместо отсутствующего в subset шрифта `▼`.
  Существующие motion/reduced-motion, page advance, AUTO и debounce сохраняются.

## Доказательства

`node scripts/export-godot-dialogue-paging.cjs` выполняет **production TS функцию**
и экспортирует 252 vectors: все prologue lines RU/BE/EN, три fit budgets и
edge cases. Native `dialogue_paging_smoke.gd` сверяет страницы и displayed text
с этими source results; тест включён в `godot/check.ps1`. Это алгоритмические
проверки с общей fit predicate, а не доказательство одинаковых метрик шрифтов.

В screen fixture записываются все страницы, индекс и displayed text.
Runner сохраняет source `data-dialogue-pages/page` и проверяет реальный текст и
число страниц. `--enforce-vn` делает эти расхождения ошибкой запуска;
menu/settings enforcement независимо от VN.

Свежая release-Web matrix VN0001:

- число страниц совпадает во всех девяти RU/BE/EN × 320×568, 390×844, 480×854;
- первая страница совпадает полностью в семи вариантах;
- BE `320×568`: native первая страница заканчивается на `спартыўныя…`, source
  включает ещё `клубы…`;
- EN `320×568`: native включает `practice…`, source заканчивается на `to…`.

Следовательно, **полный VN parity ещё не принят**. Две узкие границы требуют
сверки реальных font metrics/measurement, далее — остальные строки/сцены,
large text, choices, history/dossier/config, save/load и motion/input sequences.
Сохранён полный авторский текст без пропусков; native story smoke проходит
существующие переходы и концовки. Цвета/шрифты/весь chrome не приняты этим тестом.

Артефакты: [summary](vn-paging-2026-10-17/summary.json), per-case JSON с source
digest и lossless пары RU `390×844`, BE/EN `320×568` в том же каталоге.
Source digest кандидата: `a085083017e2070526af6220260e79b6aee05064be00a44f3b44538288f695a7`;
базовый HEAD capture — `2cd07f8`, `sourceTreeClean=false` отражает этот кандидат.
Локально: полный Godot check, 252 source vectors, полный `npm run check`
(171 files / 826 tests) и hygiene (19 tests) прошли. Дополнительный 36-state
regression capture перед последней калибровкой narrow controls не выявил
runtime errors и сохранил menu/settings contracts. Последние девять VN captures
с указанным digest включают окончательный narrow minimum 58 px.
PG-003AO остаётся active.
