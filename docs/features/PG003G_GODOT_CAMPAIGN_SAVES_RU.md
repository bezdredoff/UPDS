# PG-003G — нативные сохранения кампаний Godot

Статус: на проверке. Основано на merged PR #398 (`0a02e74`).

## Изменение

- `save_format.gd`: fresh/normalize/decode/encode для Story и Match-3,
  экспорт Story в существующий `upds-campaign-save` bundle.
- `save_storage.gd`: текстовый key-value адаптер в `user://campaign_saves`.
  Логические ключи сохранены; имена файлов — URI-encoded ключ плюс `.json`,
  включая безопасные для Windows manual/recovery keys с двоеточием.
- `campaign_store.gd`: загрузка, запись, сброс независимых кампаний,
  ручной Story слот, recovery backup, импорт/экспорт текста и отчёт загрузки.

Запись идёт в соседний временный файл с flush/close, затем rename заменяет
основной слот. Ошибка записи возвращается вызывающему коду; старый слот
сохраняется. Незавершённый `.tmp` не участвует в загрузке. Ключи ограничены
четырьмя известными слотами; пользовательский путь не строится из импортируемого JSON.

## Совместимость

- Story key `seiran-detectives-anm009-v1`, schema 2; Match-3 key
  `seiran-detectives-match3-campaign-v1`, schema 1.
- Legacy saves, фильтры IDs, storyChoices, прочитанные VN lines, attempts,
  completed, tutorials и bestMovesLeft следуют TypeScript normalizers.
- `save_contract.json` содержит исходные IDs и metadata. Тест сравнивает
  этот снимок с web source; при изменении source его нужно перегенерировать.
- Повреждённый Story сохраняется в recovery до записи fresh state.
  Future/incompatible schema не перезаписывается; Match-3 invalid data
  возвращает fresh state без перезаписи источника.
- Перед импортом текущий Story копируется в recovery. В отличие от web
  best-effort backup, native adapter прекращает замену, если backup не удалось
  записать: старое состояние остаётся доступным. Reset возвращает bool,
  чтобы будущий экран мог явно обработать ошибку удаления.
- Нативные файлы отделены от настроек языка/аудио. Автоматической миграции
  browser localStorage нет; существующий Story export text принимается codec/store API.

Godot допускает некоторые невалидные JSON записи; перед его parser выполняется
проверка JSON grammar, чтобы trailing commas, literal control characters и
неправильные числа отклонялись как в web `JSON.parse`.
[Ограничения Godot JSON](https://docs.godotengine.org/en/stable/classes/class_json.html).

## Проверки и следующий срез

`node scripts/export-godot-save-fixtures.cjs` обновляет contract и 454 case vectors
из реальных TypeScript codecs. Vitest проверяет актуальность снимков, а Godot
исполняет те же normalize/decode/encode/export/JSON cases своим кодом.

Все 15 стадий `godot/check.ps1` прошли локально на Godot 4.7.2. Storage smoke
проверяет реальную файловую запись/reload/replace, legacy, future, corrupt,
manual, import/export, reset isolation, interrupted temp, failed write,
backup failure и запрет неизвестных ключей. Используются только отдельные
временные каталоги тестов; реальные player saves не изменяются.

Это слой данных: экран Story и его session/navigation ещё не перенесены.
Continue остаётся выключенной до появления рабочего целевого экрана.
Следующий срез — Story session и первый playable VN экран с подключением store.
Web/PWA runtime, save schemas и APP_VERSION не меняются. Финальные PR CI
проверки фиксируются в описании PR, а не считаются визуальной приёмкой.
