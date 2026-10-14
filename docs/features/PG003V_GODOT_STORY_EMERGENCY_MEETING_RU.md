# PG-003V — глава экстренного совещания и Match-3 M3_04 в Godot

## Изменения

- Story session продолжает VN_SCENE_09_E4_PRE (VN0251–VN0270) и направляет в M3_04_EMERGENCY_MEETING.
- Скрытая директива VN0251 автоматически потребляется при переходе в сцену и записывается в `readLines`.
- Победа сохраняет completion и CUE_005, затем открывает VN_SCENE_10_E4_POST (VN0271–VN0288) с Continue.
- Экспортёр строит обе сцены из story graph, включая переходы, RU/BE/EN, authored staging и оригинальные assets.
- После VN0288 story session останавливается перед VN_SCENE_11_E5_PRE.

## Проверки

- `GodotPrologueParity.test.ts` сверяет экспорт сцен, переходы, локализации и скопированные assets с каноническими источниками.
- `godot/tests/vn_prologue_smoke.gd` проходит связанный Story/Match-3 путь через M3_00–M3_04, проверяет CUE_005, скрытые директивы и границу после VN0288.
- `godot/check.ps1` и `npm run check` проверяют нативный Godot runtime и web-source parity.

## Граница

Следующая сцена VN_SCENE_11_E5_PRE (VN0289–VN0308) и M3_05 остаются следующим срезом порта.
