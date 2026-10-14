# PG-003AN — Playgama Bridge в Godot

**Статус:** review. Первый интеграционный слой платформы; web export и приёмка на площадке впереди.

## Реализация

- Подключён официальный [Playgama Bridge for Godot 4](https://github.com/Playgama/bridge-godot-4), release `v2.3.0` от 2026-09-30.
- Архив `playgama_bridge_v2.3.0.zip` проверен по SHA-256: `56720801a2d400bc3802667e8f58d5e703fc3a010c32a1d6cbed2f386123fde3`. MIT license включён рядом с исходниками аддона.
- Включён редакторный plugin и autoload `Bridge`; `PlaygamaRuntime` находится после него и изолирует SDK от игровых экранов.
- После запуска отправляется `game_ready`; pause state платформы приостанавливает/возобновляет SceneTree, audio state выключает/включает Master bus.
- Добавлен `Playgama Web` export preset, который выбирает официальный `addons/playgama_bridge/template/index.html`. Проверка hosted web build и площадки остаётся следующим упаковочным шагом.
- В конфиге SDK отключена предварительная загрузка interstitial и rewarded рекламы. Рекламные показы не добавлены до выбора модели публикации и подтверждения нужных размещений.

## Проверки

`godot/check.ps1` проверяет загрузку проекта, парсинг адаптера и работу editor mock для `game_ready`, pause/resume и audio on/off. Установленный Godot распознал `Playgama Web` preset, но пробный export остановился: локально отсутствуют web export templates `4.7.2.stable`. Headless export также сообщил, что активный редактор уже слушает MCP порт 6510. Smoke не эмулирует внешний SDK на реальной Playgama-площадке; повторить export с установленными шаблонами и проверить hosted build остаётся следующим шагом.

## Источники

- [Официальный релиз v2.3.0](https://github.com/Playgama/bridge-godot-4/releases/tag/v2.3.0)
- [Официальный quick start для Godot 4](https://github.com/Playgama/bridge-godot-4#quick-start)
- [Playgama Bridge: Getting Started](https://wiki.playgama.com/playgama/bridge-sdk/getting-started)
