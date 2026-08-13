# ANM-026B1 — Editable Balance Config

## Цель

Сделать Level Lab реальным production-инструментом для ранней настройки Match-3 перед ANM-025E, не превращая QA UI в скрытый редактор канонических данных.

## Контракт

Level Lab хранит draft только в памяти текущей сессии и никогда сам не пишет `src/data/levels.ts`, Story save, clues, attempts или tutorial state.

Редактируются:

- move budget;
- blocker type и placements;
- ingredient placements;
- objectives;
- ровно шесть active match identities;
- относительные spawn weights.

Draft проходит тот же `validateLevelDefinitions()`, что production levels. Невалидный draft нельзя preview/play.

## Spawn weights

`LevelDefinition.spawnWeights` — optional production contract.

- если поле отсутствует, `Match3Game` использует прежний uniform RNG path без изменения текущих production seeds;
- отсутствующий weight внутри заданной map трактуется как `1`;
- weights должны быть конечными положительными числами;
- weight для inactive tile запрещён;
- Lab с кастомными weights использует тот же `Match3Game`, что и production runtime.

Таким образом значения, найденные в Lab, позже можно перенести в production level data без отдельной balance implementation.

## Export

Level Lab экспортирует `upds-level-lab-v1` JSON override только с редактируемыми полями. Он намеренно не содержит context, clue/story metadata или tutorial config.

Экспорт — переносимый артефакт для следующего feature patch, а не автоматическая запись в repository.

## Не входит

- board mask / holes;
- предзаданный start layout;
- campaign progression;
- финальный balance tuning production levels.

Board shape и start layout выделены в ANM-026B2, потому что требуют нового engine/data contract и не должны смешиваться с balance editor.
