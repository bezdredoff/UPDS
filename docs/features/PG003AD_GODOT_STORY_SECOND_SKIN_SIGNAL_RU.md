# PG-003AD — сигнал Second Skin, M3_12 и улика CUE_013 в Godot

## Изменения

- Story session продолжает VN_SCENE_25_E12_PRE (VN0568–VN0588), затем открывает M3_12_SECOND_SKIN_SIGNAL.
- Победа сохраняет completion и CUE_013, затем открывает VN_SCENE_26_E12_POST (VN0589–VN0607) с Continue.
- Choice gate `publish-tag` на VN0601 локализован для RU/BE/EN и сохраняет A/B/C в `storyChoices`; скрытые VN0602–VN0603 потребляются runtime.
- После VN0607 Godot останавливается перед VN_SCENE_27_E13_PRE (VN0608); saves за границей остаются нетронутыми.
- Экспортёр формирует обе сцены из story graph с локализациями, исходными фонами, постановкой персонажей и переходами.

## Проверки

- `GodotPrologueParity.test.ts` сверяет сцены, переходы, RU/BE/EN, assets/staging, CUE_013 и gate `publish-tag`.
- `godot/tests/vn_prologue_smoke.gd` проходит связанный маршрут M3_00–M3_12, проверяет улику, варианты A/B/C, persistence, Continue и границу после VN0607.
- `godot/check.ps1` и полный npm/GitHub CI проверяют Godot runtime и source parity.

## Граница

Следующая сцена VN_SCENE_27_E13_PRE (VN0608–VN0627) и Match-3 M3_13 остаются следующим срезом порта.
