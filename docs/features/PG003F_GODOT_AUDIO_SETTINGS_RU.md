# PG-003F — звук и настройки Godot

Статус: на проверке. Основано на merged PR #397 (`a2fb1e5`).

## Поведение

Настройки содержат громкость музыки и эффектов (0–100%), mute,
виброотклик и работающие кнопки проверки музыки/SFX. Начальные значения
повторяют web: 32%, 72%, mute выключен, виброотклик включён.
Все подписи поддерживают RU/BE/EN. Смена языка не стирает звук и наоборот.
Настройки хранятся в `user://player_preferences.cfg`, отдельно от кампаний;
ошибка записи оставляет старые значения и показывает сообщение.

`menu_audio.gd` владеет двумя AudioStreamPlayer. Музыка меню начинает играть
после первого нажатия/касания или проверки звука и продолжает играть после
возврата из настроек. Нулевой уровень и mute останавливают нужные каналы;
кнопки preview не обходят mute. Потеря фокуса останавливает звук,
возврат фокуса возобновляет активированную музыку. Закрытие сцены освобождает players.

`audio_synthesis.gd` синтезирует mono 16-bit PCM 22050 Hz без загрузки
внешних аудиофайлов. Мелодия меню, BPM, формы волн, gain, длительности и
частоты match/uiClick взяты из `src/audio/MusicTheme.ts` и `AudioCues.ts`.
Снимок `godot/data/menu_audio.json` проверяется на равенство исходным definitions
в `tests/GodotAudioParity.test.ts`. PCM не объявляется побитовой копией Web Audio.
Сохраняется music gain multiplier 0.52 и low-pass 2600 Hz/Q 0.45.

Виброотклик вызывает нативный `Input.vibrate_handheld` только на Android/iOS;
на desktop/web показана недоступность. Нативные импульсы повторяют последовательности
uiClick/match из исходных definitions. Фактическая вибрация требует проверки
на целевом устройстве; для Android export потребуется разрешение VIBRATE.
[API Godot](https://docs.godotengine.org/en/stable/classes/class_input.html#class-input-method-vibrate-handheld).

## Проверка и границы

`godot/check.ps1` включает parser checks аудио и audio smoke: UI → preferences
→ player gain, сохранение/reload, совместимость с выбором языка, preview PCM,
mute/zero volume, focus, reopen, invalid values и failed writes. Любой
`SCRIPT ERROR` теперь проваливает check даже при нулевом exit code движка.
Тесты используют собственные временные preference-файлы.

Локально 2026-10-13: 10 стадий Godot check, lint/typecheck и 20 focused tests
прошли. MCP подтвердил preview music playback, длину loop 11.1628 s, gain,
прокрутку до обеих preview-кнопок и отсутствие runtime errors.
Прослушивание и phone haptics acceptance не подменяются этими проверками.

Следующие срезы — сохранения и целевые Story/Match-3 экраны. Темы VN/Match-3,
остальные gameplay cues и платформенные ограничения web autoplay переносятся
вместе с соответствующими экранами. Web/PWA runtime и APP_VERSION не изменяются.
