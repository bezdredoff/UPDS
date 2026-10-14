# PG-003AB — контрольная экипировка, M3_10 и улика CUE_011 в Godot

## Изменения

- Story session продолжает VN_SCENE_21_E10_PRE (VN0489–VN0508), затем открывает M3_10_CONTROL_SAMPLE_GEAR.
- Победа сохраняет completion и CUE_011, затем открывает VN_SCENE_22_E10_POST (VN0509–VN0527) с Continue.
- После VN0527 Godot останавливается перед VN_SCENE_23_E11_PRE (VN0528); saves за границей остаются нетронутыми.
- Экспортёр формирует сцены из story graph с RU/BE/EN, исходным фоном, постановкой персонажей, переходами и локализациями.

## Проверки

- `GodotPrologueParity.test.ts` сверяет обе сцены, transitions, localized line data, assets/staging и CUE_011.
- `godot/tests/vn_prologue_smoke.gd` проходит связанный маршрут M3_00–M3_10, проверяет CUE_011, Continue и границу после VN0527.
- `godot/check.ps1` и полный npm/GitHub CI проверяют Godot runtime и source parity.

## Граница

Следующая сцена VN_SCENE_23_E11_PRE (VN0528–VN0547) и Match-3 M3_11 остаются следующим срезом порта.
