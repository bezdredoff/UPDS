# PG-003AF — семейное ателье Кубо и разрешение на журнал в Godot

Связать главу ателье из story graph с `M3_14_KUBO_ATELIER_LEDGER`, уликой `CUE_015` и пост-сценой, сохранив privacy-решение семьи.

- `VN_SCENE_29_E14_PRE` экспортирует `VN0647–VN0666` и запускает `M3_14_KUBO_ATELIER_LEDGER`.
- Победа сохраняет completion и `CUE_015`; Continue открывает `VN_SCENE_30_E14_POST` (`VN0667–VN0686`).
- `family-ledger-permission` локализован для RU/BE/EN, сохраняется отдельно в `storyChoices` и продолжает с VN0680 после скрытой VN0679.
- Native smoke проверяет A/B/C, persistence и границу перед `VN_SCENE_31_E15_PRE` (VN0687), не меняя save schema/key.

Проверки: `GodotPrologueParity.test.ts`, полный `npm.cmd run check` и `godot/check.ps1`.