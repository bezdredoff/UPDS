# ANM-016E · Compact Context Navigation

Build: `0.16.9-anm016e`

Небольшой polish-pass поверх ANM-016D. Persistent headers больше не показывают отдельную кнопку `Главное меню`. Глобальный выход перенесён внутрь Settings/CONFIG, в то время как CASE / LOG / Dossier / Back остаются контекстными действиями.

## Player-facing изменения

- VN header: CASE + LOG + Settings.
- Match-3 header: Back + Dossier + Settings.
- Choice / intro / result / dossier / QA screens больше не несут постоянную Menu-кнопку.
- Settings, открытые из игрового контекста, содержат компактный блок `Навигация → Главное меню`.
- VN CONFIG содержит такой же компактный пункт.
- Back из Settings возвращает caller screen.
- Активная Match-3 попытка защищена confirmation перед выходом в меню.
- Ending сохраняет прямую `В главное меню` CTA.

Подробности: `docs/ANM016E_COMPACT_NAVIGATION_RU.md`.
