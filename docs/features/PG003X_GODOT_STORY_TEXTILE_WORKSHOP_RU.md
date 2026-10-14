# PG-003X — текстильная мастерская, M3_06 и выбор извинения в Godot

## Изменения

- Story session продолжает VN_SCENE_13_E6_PRE (VN0327–VN0347), затем открывает M3_06_TEXTILE_WORKSHOP.
- Победа сохраняет completion и CUE_007, затем открывает VN_SCENE_14_E6_POST (VN0348–VN0369) с Continue.
- Choice gate `apology-to-hinata` получает локализованные варианты RU/BE/EN и сохраняется в `storyChoices`; legacy `CHOICE_00` остаётся отдельным.
- Общая обработка choice gates также включает существующий `meeting-tone`; ожидающие checkpoints не пропускаются как скрытые директивы.
- Экспортёр строит обе сцены из story graph с оригинальными фонами, постановкой и данными выборов.
- После VN0369 Story session останавливается перед VN_SCENE_15_E7_PRE.

## Проверки

- `GodotPrologueParity.test.ts` сверяет сцены, переходы, локализации, assets и данные choice gates с каноническими источниками.
- `GodotMatch3Parity.test.ts` проверяет экспорт всех Match-3 evidence images.
- `godot/tests/vn_prologue_smoke.gd` проходит путь M3_00–M3_06 и проверяет CUE_007, оба choice gate, Continue, сохранение выбора и границу после VN0369.
- `godot/check.ps1` и полный npm/GitHub CI проверяют Godot runtime и source parity.

## Граница

Следующая сцена VN_SCENE_15_E7_PRE (VN0370–VN0390) и M3_07 остаются следующим срезом порта.
