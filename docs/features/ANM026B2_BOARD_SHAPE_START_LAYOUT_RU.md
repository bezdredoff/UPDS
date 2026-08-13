# ANM-026B2 — Board Shape & Start Layout

## Цель

Добавить production-контракт для фигурных Match-3 полей и воспроизводимой стартовой раскладки, не меняя существующие M3_00–M3_03 и не связывая QA-инструмент с сюжетным сохранением.

## Контракт уровня

`LevelDefinition` получает два optional-поля:

- `boardHoles?: number[]` — индексы неактивных клеток внутри физической 8×8 сетки;
- `initialTiles?: { index, tile }[]` — фиксированные стартовые match identities, которые ставятся до seeded fill остальных активных клеток.

Если оба поля отсутствуют, используется legacy full-board path. Это намеренно сохраняет существующие production seeds и раскладки.

## Семантика holes

Hole:

- не содержит tile / ingredient / blocker;
- не участвует в match-group;
- не принимает tap/drag input;
- через hole нельзя сделать swap или match;
- special effect может геометрически пересекать hole, но на hole нечего очищать;
- gravity уплотняет содержимое по активным слотам колонки, пропуская holes;
- ingredient считается dropped, когда достигает нижнего активного слота своей колонки.

Locked blockers по-прежнему являются вертикальными барьерами для gravity. Hole сам по себе барьером не является.

## Deterministic start layout

`initialTiles` фиксирует только concrete `Match3TileId`. Specials намеренно не входят в B2 contract.

Для shaped/configured board engine:

1. ставит fixed start tiles;
2. ставит ingredients;
3. seeded RNG заполняет остальные активные клетки;
4. не допускает immediate matches;
5. проверяет наличие хотя бы одного legal move;
6. при невозможной конфигурации сообщает ошибку вместо молчаливого разрушения fixed layout.

После старта уровня fixed tiles становятся обычными tiles и могут двигаться/перемешиваться.

## Validation

Production validator отвергает:

- hole вне 0…63;
- duplicate holes;
- практически пустую доску (<3 active cells);
- blockers / ingredients / initialTiles внутри holes;
- duplicate initial tile indices;
- initial tile вне board;
- initial tile с tile id, которого нет среди шести active match types;
- initial tile поверх ingredient.

Level Lab дополнительно пробует построить playable initial board, поэтому невозможный draft блокирует Preview/Play.

## Level Lab

Редактор получает:

- `Board holes · JSON indices`;
- `Deterministic start tiles · JSON`.

Preview показывает holes как отдельные неигровые ячейки. `Play draft` запускает тот же `LevelDefinition` и тот же seed, что использовались в preview.

Export schema повышена до `upds-level-lab-v2`; shape/start-layout попадают в export только когда реально заданы.

## Backward compatibility

Текущие M3_00–M3_03 не получают `boardHoles` или `initialTiles`. Legacy constructor/fill/gravity path сохраняется отдельно. Regression check сравнивает стартовые signatures текущих production seeds до/после B2.

## Не входит в B2

- новые production shapes для текущих четырёх уровней;
- изменение move budgets/objectives/spawn weights;
- specials в initial layout;
- campaign progression/save;
- финальный 025E balance pass.
