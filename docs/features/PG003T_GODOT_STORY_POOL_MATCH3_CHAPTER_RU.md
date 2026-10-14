# PG-003T — глава бассейна и Match-3 M3_02 в Godot

## Изменения

- Story router загружает существующую VN_SCENE_05_E2_PRE (VN0143–VN0166) и запускает M3_02_POOL_LAUNDRY.
- Победа добавляет индекс уровня и улику CUE_003 в Story save, затем продолжает VN_SCENE_06_E2_POST (VN0167–VN0191).
- Экспорт VN-сцен использует канонический story graph и копирует используемые оригинальные фоновые и портретные assets.
- После VN0191 появляется граница порта перед VN_SCENE_07_E3_PRE.

## Проверки

- `GodotPrologueParity.test.ts` сравнивает экспорт обеих сцен, переходы, оригинальные assets и локализацию CUE_003 RU/BE/EN.
- `godot/tests/vn_prologue_smoke.gd` проходит накопленный story путь через M3_00, M3_01 и M3_02, проверяет save progress, улики и Match-3 routing.
- Полные `npm run check` и `godot/check.ps1` проверяют TypeScript и Godot проект.

## Граница

Следующая сцена VN_SCENE_07_E3_PRE (VN0192–VN0216) и M3_03 остаются за границей этого среза.
