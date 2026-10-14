# PG-003W — глава баскетбольной раздевалки и Match-3 M3_05 в Godot

## Изменения

- Story session продолжает VN_SCENE_11_E5_PRE (VN0289–VN0308), затем открывает M3_05_BASKETBALL_LOCKERS.
- Скрытая директива VN0289 автоматически потребляется при входе в главу и сохраняется в `readLines`.
- Победа сохраняет завершение уровня и CUE_006, затем открывает VN_SCENE_12_E5_POST (VN0309–VN0326) с Continue.
- Экспортёр строит обе сцены из story graph, включая переходы, RU/BE/EN, authored staging и оригинальный фон.
- Story session останавливается после VN0326 перед VN_SCENE_13_E6_PRE.

## Проверки

- `GodotPrologueParity.test.ts` сверяет экспорт сцен, переходы, локализации и скопированный фон с каноническими источниками.
- `godot/tests/vn_prologue_smoke.gd` проходит связанный путь через M3_00–M3_05, проверяет CUE_006, скрытые директивы и границу после VN0326.
- `godot/check.ps1` и полный npm/GitHub CI проверяют Godot runtime и web-source parity.

## Граница

Следующая сцена VN_SCENE_13_E6_PRE (VN0327–VN0346) и M3_06 остаются следующим срезом порта.
