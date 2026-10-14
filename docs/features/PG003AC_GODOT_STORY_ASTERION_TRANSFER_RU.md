# PG-003AC — цепочка контейнера Asterion, M3_11 и улика CUE_012 в Godot

## Изменения

- Story session продолжает VN_SCENE_23_E11_PRE (VN0528–VN0547), затем открывает M3_11_ASTERION_TRANSFER.
- Победа сохраняет completion и CUE_012, затем открывает VN_SCENE_24_E11_POST (VN0548–VN0567) с Continue.
- В пост-сцене checkpoint `photo-permission` на VN0560 локализован для RU/BE/EN и сохраняет A/B/C в `storyChoices`; VN0561 потребляется runtime.
- После VN0567 Godot останавливается перед VN_SCENE_25_E12_PRE (VN0568); saves за границей остаются нетронутыми.
- Экспортёр формирует сцены из story graph с RU/BE/EN, исходными фонами, постановкой персонажей и переходами.

## Проверки

- `GodotPrologueParity.test.ts` сверяет обе сцены, transitions, локализованные реплики, assets/staging, CUE_012 и gate `photo-permission`.
- `godot/tests/vn_prologue_smoke.gd` проходит связанный маршрут M3_00–M3_11, проверяет CUE_012, варианты A/B/C, persistence, Continue и границу после VN0567.
- `godot/check.ps1` и полный npm/GitHub CI проверяют Godot runtime и source parity.

## Граница

Следующая сцена VN_SCENE_25_E12_PRE (VN0568–VN0588) и Match-3 M3_12 остаются следующим срезом порта.
