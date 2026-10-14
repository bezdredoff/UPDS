# PG-003AH — сканер розовых лент и выбор доверия Винсенту в Godot

Продолжить story graph сценами зала гимнастики и сканирования, связать их с `M3_16_PINK_RIBBON_SCANNER` и перенести решение о доверии Винсенту.

- `VN_SCENE_33_E16_PRE` экспортирует `VN0727–VN0746` и запускает `M3_16_PINK_RIBBON_SCANNER`.
- Победа сохраняет completion и `CUE_017`; Continue открывает `VN_SCENE_34_E16_POST` (`VN0747–VN0765`).
- `trust-vincent` локализован для RU/BE/EN и сохраняется отдельно в `storyChoices`; после выбора читатель продолжает с видимой VN0757.
- Native smoke проходит M3_00–M3_16 и останавливается перед `VN_SCENE_35_E17_PRE` (VN0766); ключ и схема сохранения не меняются.

Проверки: `GodotPrologueParity.test.ts`, полный `npm.cmd run check` и `godot/check.ps1`.
