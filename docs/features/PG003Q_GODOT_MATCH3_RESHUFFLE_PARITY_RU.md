# PG-003Q — parity перемешивания поля Match-3

## Цель

Сохранить поведение TypeScript при восстановлении игрового поля после хода, когда дальнейших легальных ходов нет.

## Изменения

- Godot перемешивает в том же порядке Fisher–Yates только клетки с фишками, используя общую seeded random stream.
- Позиции holes, ingredients и blocker layers остаются на месте. Specials, связанные с перемешанными фишками, очищаются, как в TypeScript.
- До 100 раз проверяются условия отсутствия немедленных совпадений (включая формы Lead 2×2) и наличия доступного хода.
- После неудачных попыток fallback заполняет занятые клетки случайными фишками и снимает немедленные совпадения тем же правилом, что и TypeScript.
- Результат `attempt_swap` и `attempt_special_activation` содержит `reshuffled`, когда после действия понадобилось перемешивание.
- Добавлен восьмой oracle-сценарий: M3_02 с irregular topology, blockers, ingredient и specials; проверяется полная доска после перемешивания.

## Проверка

- Parity fixture генерируется из production TypeScript `Match3Game.shuffle()` тем же exporter.
- `npm run check` проверяет freshness fixtures, все Vitest tests, lint и production build.
- `godot/check.ps1` исполняет восемь детерминированных runtime сценариев и остальные Godot smoke checks.

## Границы

На момент этого среза story flow запускал M3_00. Отдельный campaign hub для всех Match-3 уровней добавлен следующим этапом в PG-003R; сюжетная цепочка уровней ещё требует связи с VN-сценами.
