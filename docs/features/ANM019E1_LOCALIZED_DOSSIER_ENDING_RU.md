# ANM-019E1 · Localized Dossier & Ending

Build: `0.19.4-anm019e1`.

## Цель

Продолжить атомарную миграцию локализации после доказанного VN runtime-контракта: локализовать Dossier и Ending, не затрагивая Match-3 runtime и оставшийся screenplay content pass.

## Scope

- Dossier chrome, tabs, locked states, suspect statuses и reset action работают через localization catalog;
- clue title/summary разрешаются по стабильному Match-3 level ID;
- Ending chrome, summary, choice title, clue count и actions локализованы;
- ru/en catalog parity защищён тестом;
- gameplay/save/telemetry contracts не меняются.

## QA

Переключить English, открыть Dossier и проверить locked/unlocked clue cards. Затем проверить Ending через доступный debug/scene flow: заголовки, summary и кнопки должны быть английскими. Русский режим должен визуально совпадать с предыдущим поведением.
