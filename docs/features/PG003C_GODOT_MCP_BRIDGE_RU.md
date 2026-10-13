# PG-003C — подключить Godot MCP к проекту

Статус: подготовлено к проверке.

## Изменение

- В `godot/addons/godot-mcp/` добавлен editor-side bridge из MIT-licensed upstream `letsagents/godot-mcp`, commit `88fe614fbbd26f1d49cb3a5905fdd1a7bc3e35c7`.
- Плагин включён в `godot/project.godot`. Он слушает только localhost и использует порт 6510, ожидаемый MCP connector Codex в этом окружении.
- Bridge нужен для разработки и не входит в экспортированную игру.

## Проверка

Открыть `godot/` в Godot 4.7+, дождаться загрузки editor plugin и вызвать `mcp__godot_mcp__list_assets`. Успешный ответ подтверждает связь с редактором и индексирование ресурсов. Игра для editor-side tools запускаться не обязана.
