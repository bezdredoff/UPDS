# PG-003AA — журнал ключей в комнате обслуживания, M3_09 и выбор CUE_010 в Godot

## Изменения

- Story session продолжает VN_SCENE_19_E9_PRE (VN0449–VN0469), затем открывает M3_09_MAINTENANCE_KEYS.
- Победа сохраняет completion и CUE_010, затем открывает VN_SCENE_20_E9_POST (VN0470–VN0488) с Continue.
- В пост-сцене выбор protect-gen-source на VN0480 сохраняет A/B/C отдельно в storyChoices; скрытая директива VN0481 потребляется runtime.
- После VN0488 Godot останавливается перед VN_SCENE_21_E10_PRE (VN0489); saves за границей не перезаписываются.
- Экспортёр формирует сцены из story graph с RU/BE/EN, фоном, постановкой персонажей, переходами и выбором из канонических данных.

## Проверки

- `GodotPrologueParity.test.ts` сверяет сцены, переходы, локализации, assets/staging, CUE_010 и gate protect-gen-source.
- `godot/tests/vn_prologue_smoke.gd` проходит связанный маршрут M3_00–M3_09, проверяет CUE_010, выборы A/B/C, persistence и границу после VN0488.
- `godot/check.ps1` и полный npm/GitHub CI проверяют Godot runtime и source parity.

## Граница

Следующая сцена VN_SCENE_21_E10_PRE (VN0489–…) остаётся следующим срезом порта.
