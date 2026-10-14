# PG-003AG — погоня за Рэем и заброшенная прачечная в Godot

Продолжить канонический story graph главой погони, связать её с `M3_15_ABANDONED_LAUNDRY_ROUTE` и перенести пост-сцену с уликой `CUE_016`.

- `VN_SCENE_31_E15_PRE` экспортирует `VN0687–VN0707` и запускает `M3_15_ABANDONED_LAUNDRY_ROUTE`.
- Победа сохраняет completion и `CUE_016`; Continue открывает `VN_SCENE_32_E15_POST` (`VN0708–VN0726`).
- RU/BE/EN, переходы, постановка и оригинальные ассеты сверяются с TypeScript.
- Native smoke проходит M3_00–M3_15 и останавливается перед `VN_SCENE_33_E16_PRE` (VN0727); save schema/key не меняются.

Проверки: `GodotPrologueParity.test.ts`, полный `npm.cmd run check` и `godot/check.ps1`.