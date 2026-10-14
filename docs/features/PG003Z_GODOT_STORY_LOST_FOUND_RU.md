# PG-003Z — склад бюро находок, M3_08 и улика CUE_009 в Godot

## Изменения

- Story session продолжает VN_SCENE_17_E8_PRE (VN0410–VN0429), затем открывает M3_08_LOST_FOUND_LEDGER.
- Победа сохраняет completion и CUE_009, затем открывает VN_SCENE_18_E8_POST (VN0430–VN0448) с Continue.
- После VN0448 Godot останавливается перед VN_SCENE_19_E9_PRE (VN0449); saves дальше границы остаются недоступными и не переписываются.
- Экспортёр формирует сцены из story graph с RU/BE/EN, исходным фоном склада бюро находок, постановкой персонажей и переходами.

## Проверки

- `GodotPrologueParity.test.ts` сверяет сцены, переходы, локализации, assets/staging и CUE_009 с каноническими источниками.
- `godot/tests/vn_prologue_smoke.gd` проходит связанный маршрут M3_00–M3_08, проверяет сохранение CUE_009, Continue и границу после VN0448.
- `godot/check.ps1` и полный npm/GitHub CI проверяют Godot runtime и source parity.

## Граница

Следующая сцена VN_SCENE_19_E9_PRE (VN0449–VN0469) и Match-3 M3_09 остаются следующим срезом порта.
