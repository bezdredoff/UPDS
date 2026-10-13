# PG-003H — первый playable VN-срез Godot

Статус: на проверке. Основано на merged PR #399 (`8921b28`).

## Игровой путь

New Game открывает пролог `VN_SCENE_00_PROLOGUE`, `VN0001–VN0022`.
Reader показывает локализованные speaker/emotion/text, исходные портреты,
авторские trio shots и VN-тему. Далее продвигает позицию и записывает
readLines; `VN0021` остаётся скрытой режиссурой. Повторный тап в пределах
120 ms не пропускает вторую реплику. Длинный текст доступен через native
RichTextLabel с прокруткой, без усечения; web paging/auto/history — следующие срезы.

Меню и настройки доступны из reader. Закрытие настроек возвращает ту же
реплику и фокус. Меню сохраняет in-memory session; Continue включается для
существующего прогресса на поддерживаемой позиции. После перезапуска session
загружается из native store #399. Ошибка записи не останавливает чтение,
но явно сообщает, что прогресс пока остаётся только в памяти.

В конце пролога последняя позиция сохраняется: reader сообщает границу
доступного фрагмента и публикует `continuation_requested` для canonical
`VN_SCENE_01_E0_PRE`. Неперенесённая сцена не запускается и save.scene
не подменяется. Это не изменение canonical story graph или его финалов.

Прогресс из других сцен/позиций сохраняется нетронутым, Continue для него
отключён с пояснением. New Game требует явного подтверждения, если есть
прогресс, ошибка чтения или recovered/future save. Отмена не меняет слот.

## Источники и ресурсы

`node scripts/export-godot-prologue.cjs` собирает `prologue.json` из audited
`getScene(0)`, RU/BE/EN catalogs, production character metadata и authored
staging. Используются существующие masters без генерации/редактирования:
фон клуба и восемь expression PNG Мику, Оноэ, Аюки и Эми.
Single-speaker lanes 29/71/50% следуют текущему web CSS; группы используют
resolved authored camera/anchor/z values. Native framing сохраняет пропорции
master canvas 1024×1536; визуальная приёмка остаётся отдельной.

`GodotPrologueParity.test.ts` сверяет content/staging snapshots, точные байты
скопированного арта и исходные VN music/vnAdvance cue definitions.
Audio runtime переключает menu/vn темы и кэширует созданные PCM loops.

## Проверки

- Все 18 стадий `godot/check.ps1` прошли на Godot 4.7.2.
- VN smoke проходит весь пролог, три языка, скрытую строку, быстрые тапы,
  restart/resume, settings return, boundary, new-game confirm/cancel,
  write failure, unsupported/future save preservation.
- Все menu/settings/audio smoke tests теперь получают отдельный memory store
  и не читают/пишут настоящие campaign saves.
- `tests/vn_preview.tscn` — изолированная editor/MCP preview-сцена. Она
  использует memory campaign и отдельный preference path.
- MCP screenshots: первый диалог, trio `VN0008`, длинная белорусская
  `VN0003`; текст/контролы видны, runtime errors = 0.

Следом переносить переход в scene 1, `CHOICE_00` и переход к первому Match-3
gate. Полная VN UI parity, paging/history/auto, manual save/load UI и следующие
эпизоды пока не объявляются завершёнными. Web/PWA runtime, source story,
save schemas и APP_VERSION не меняются.
