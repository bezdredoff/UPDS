# ANM-025A — Match-3 Golden Sample Parity

Статус: candidate; complete on merge.

## Цель

Довести существующую Match-3 композицию до production-ready визуального baseline на основе уже утверждённого `ANM-005_Golden_Sample_Match3_2000s_Hybrid.png`, не меняя механику, level data или balance.

## Что сохраняется

Golden Sample vocabulary уже присутствовал после ANM-014:

- cream evidence/objective cards;
- green case labels;
- крупный moves counter;
- navy framed board;
- видимая detective team;
- отдельный hint/tool tray.

025A усиливает и унифицирует эту иерархию, а не создаёт новый art direction.

## Runtime changes

- `src/match3Production.css` становится узким production presentation layer для Match-3 и импортируется после legacy/viewport CSS;
- level intro и Match-3 используют общий case-file palette;
- существующая `.board` получает production navy case-frame без дополнительного DOM wrapper;
- board sockets становятся темнее и нейтральнее, чтобы существующие цветные tile assets читались лучше;
- hint action получает явный green action treatment;
- shadows/gloss слегка упрощены в соответствии с утверждённым 2000s hybrid direction;
- portrait compact и low-height landscape размеры playfield остаются ограниченными отдельными responsive rules.

## Non-goals

Не меняются:

- Match-3 DOM/input markup и `Match3Game` / move legality;
- special taxonomy/combinations;
- level move budgets/objectives;
- tile distribution/spawn weights — это 025B/025C/025E;
- tutorial framework — 025D;
- narrative reaction system — 025F;
- новые production art assets.

## Visual QA

На `/preview/` проверить M3_00 и хотя бы один последующий уровень:

1. `PREVIEW · <build-id>` виден;
2. level intro и match screen выглядят частью одного case-file UI;
3. board визуально главный элемент и не стал меньше относительно 024D;
4. шесть базовых tile types хорошо отделяются от socket background;
5. objectives и moves читаются без горизонтального/вертикального clipping;
6. detective strip и hint action остаются доступны;
7. tap/drag, invalid swap, hint, special activation и cascade выглядят как раньше;
8. 320×568 compact и landscape не теряют критические controls.
