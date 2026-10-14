# PG-003AE — глава кэндо и список пилота в Godot

Связать сцену клуба кэндо с каноническим Match-3 уровнем и пост-сценой, продолжив порт без изменения сюжета и save schema.

- `VN_SCENE_27_E13_PRE` экспортирует `VN0608–VN0627` из story graph и запускает `M3_13_KENDO_PILOT_LIST`.
- Победа сохраняет completion и `CUE_014`; Continue открывает `VN_SCENE_28_E13_POST` (`VN0628–VN0646`).
- RU/BE/EN, постановка и исходные фоновые/персонажные изображения сверяются с TypeScript-источником.
- Native smoke проходит от M3_00 до M3_13 и останавливается перед `VN_SCENE_29_E14_PRE` (`VN0647`); save schema и ключи не меняются.

Проверки: `GodotPrologueParity.test.ts`, полный `npm.cmd run check` и `godot/check.ps1`.