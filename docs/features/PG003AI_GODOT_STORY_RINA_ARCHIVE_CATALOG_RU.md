# PG-003AI — Каталог Рины в Godot

Перенести эпизод 17 в связанный Godot story runtime, сохранив канонические VN IDs, staging, RU/BE/EN локализации, Match-3 gate, улику и совместимость сохранений.

- До Match-3: `VN_SCENE_35_E17_PRE`, VN0766–VN0785.
- Уровень: `M3_17_RINA_ARCHIVE_CATALOG`; победа сохраняет `CUE_018`.
- После Match-3: `VN_SCENE_36_E17_POST`, VN0786–VN0805.
- Native smoke проверяет переход из предыдущей главы, gate, запись улики, Continue и границу перед VN0806.
- Экспортёр и parity тест сверяют сцены, staging, оригинальные ассеты и локализованную улику с web story graph.
- Story save key и schema не меняются.
