# PG-003Y — лаборатория Asterion, M3_07 и улика CUE_008 в Godot

## Изменения

- Story session продолжает VN_SCENE_15_E7_PRE (VN0370–VN0390), затем открывает M3_07_ASTERION_THREAD.
- Победа сохраняет completion и CUE_008, затем открывает VN_SCENE_16_E7_POST (VN0391–VN0409) с Continue.
- После VN0409 Godot останавливается перед следующей непортированной сценой VN_SCENE_17_E8_PRE (VN0410); saves дальше границы остаются недоступными и не переписываются.
- Экспортёр строит обе сцены из story graph с локализациями RU/BE/EN, исходным фоном лаборатории Asterion, постановкой персонажей и переходами.

## Проверки

- `GodotPrologueParity.test.ts` сверяет сцены, transitions, локализации, assets/staging и данные CUE_008 с каноническими источниками.
- `godot/tests/vn_prologue_smoke.gd` проходит связанную кампанию M3_00–M3_07, проверяет сохранение CUE_008, Continue и границу после VN0409.
- `godot/check.ps1` и полный npm/GitHub CI проверяют Godot runtime и source parity.

## Граница

Следующая сцена VN_SCENE_17_E8_PRE (VN0410–VN0429) и Match-3 M3_08 остаются следующим срезом порта.
