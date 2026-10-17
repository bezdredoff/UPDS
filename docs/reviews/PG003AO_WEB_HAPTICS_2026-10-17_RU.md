# PG-003AO: Web haptics, 2026-10-17

После merged PR #469 исправлен Web gate вибрации: порт ранее считал поддерживаемыми только Android/iOS и не вызывал браузерный API. Теперь Web проверяет `navigator.vibrate` и передаёт паттерн одним вызовом, как production `AudioManager`. Отсутствие API и исключение не прерывают игру. Подписи доступности соответствуют исходнику на RU/BE/EN.

Прямая сверка выявила второй дефект: `menu_audio.json` содержал только пять cue definitions и три вибропаттерна. Новый `node scripts/export-godot-audio.cjs` экспортирует обе музыкальные темы и все 14 событий из production TS. Добавлены десять недостающих паттернов; `vnAdvance` по исходному контракту не вибрирует. Vitest теперь сравнивает полное определение каждого события.

## Прямые проверки

- `e2e/tools/godot-haptics.mjs` запускает настоящий Web export и использует production `AudioManager` как oracle. Девять сценариев: RU/BE/EN × API поддерживается / отсутствует / выбрасывает исключение. В каждом все 14 событий проверяются при включении, выключении и повторном включении: **378 сравнений**, расхождений и runtime/HTTP errors нет. Mute включён, обе громкости равны нулю: вибрация остаётся независимой от громкости, как в исходнике.
- [Полный машинный отчёт](web-haptics-2026-10-17/report.json), Godot source digest `cabef8a9ae12ba15e4ef300f202f644d2b9f12e6a092648e2603665d80efd5f6`. Изолированный capture export не меняет production entry point.
- Полный `godot/check.ps1` прошёл; `npm run check` прошёл, включая 840 tests. Отдельно source audio/prologue parity: 21 test.

API подменён только внутри свежих тестовых browser contexts; физическая вибрация не запускалась. [Официальная документация Godot](https://docs.godotengine.org/en/stable/classes/class_input.html#class-input-method-vibrate-handheld) подтверждает Web support с ограничениями браузера/устройства. Проверки физических устройств, разрешений, background/focus transitions и полного audio feedback остаются открытыми. PG-003AO остаётся active; полный визуальный/поведенческий паритет этим срезом не объявляется.
