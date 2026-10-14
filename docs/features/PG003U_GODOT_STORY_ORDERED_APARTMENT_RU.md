# PG-003U — глава проверки квартиры и Match-3 M3_03 в Godot

## Изменения

- Story session продолжает VN_SCENE_07_E3_PRE (VN0192–VN0216) после VN0191 и направляет в M3_03_ORDERED_APARTMENT.
- Победа сохраняет completion и CUE_004, затем открывает VN_SCENE_08_E3_POST (VN0217–VN0250) с поддержкой Continue.
- Экспортёр строит обе сцены из story graph, включая переходы, RU/BE/EN, backgrounds, authored staging и оригинальные assets.
- После VN0250 story session остаётся на явной границе перед VN_SCENE_09_E4_PRE.

## Проверки

- `GodotPrologueParity.test.ts` сверяет экспорт сцен, переходы, локализации и скопированные assets с каноническими источниками.
- `godot/tests/vn_prologue_smoke.gd` проходит связанный Story/Match-3 путь через M3_00–M3_03, проверяет CUE_004 и границу после VN0250.
- `godot/check.ps1` и `npm run check` проверяют нативный Godot runtime и web-source parity.

## Граница

Следующая сцена VN_SCENE_09_E4_PRE (VN0251–VN0270) и M3_04 остаются следующим срезом порта.
