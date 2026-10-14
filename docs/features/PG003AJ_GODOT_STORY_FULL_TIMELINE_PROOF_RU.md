# PG-003AJ — Полная временная линия в Godot

Перенести эпизод 18 в связанный Godot story runtime, сохранив канонические VN IDs, staging, RU/BE/EN локализации, Match-3 gate, улику и выбор финальной стратегии.

- До Match-3: `VN_SCENE_37_E18_PRE`, VN0806–VN0826.
- Уровень: `M3_18_FULL_TIMELINE_PROOF`; победа сохраняет `CUE_019`.
- После Match-3: `VN_SCENE_38_E18_POST`, VN0827–VN0845.
- Выбор `final-strategy` локализован, хранится в `storyChoices` и восстанавливается из сохранения.
- Граф сохраняет маршруты A→scene 39, B→scene 41 и C→scene 43. Native smoke проверяет все три маршрута и останавливается на VN0845, пока ending scenes ещё не перенесены.
- Экспортёр и parity тест сверяют сцены, staging, оригинальные ассеты, локализованную улику и маршруты с web story graph.
- Story save key и schema не меняются.
