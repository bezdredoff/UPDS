# ANM-026A — Level Lab Foundation

## Цель

Создать воспроизводимую mobile-first площадку для настройки и ручного плейтеста Match-3 до финального balance pass ANM-025E.

026A не является полноценным level editor. Он фиксирует фундамент, на который 026B добавит редактирование конфига.

## Player / QA flow

Из главного меню доступна кнопка `Level Lab · QA`.

Level Lab позволяет:

- выбрать один из текущих production levels;
- задать точный unsigned 32-bit seed (`0..4294967295`);
- увидеть стартовую 8×8 доску, созданную настоящим `Match3Game` с этим seed;
- увидеть moves, objectives, blocker count/layers, ingredients, active match-types и narrative/presentation context;
- увидеть результат существующего `validateLevelDefinitions`;
- запустить именно выбранный level + seed;
- после win/loss мгновенно повторить тот же seed или вернуться в Lab.

## Reproducibility contract

`Level Lab preview` и `Level Lab play` используют один и тот же production constructor:

`new Match3Game(level, seed)`.

Никакой отдельной mock/random implementation у Lab нет.

Одинаковый level + seed обязан давать одинаковую стартовую доску. Seed `0` является валидным и не заменяется default seed уровня.

## Isolation contract

Lab run имеет отдельный runtime mode `lab`.

Он **не меняет**:

- `CampaignSave.scene` / `line` / `choice`;
- Story `completed` levels;
- clues;
- Story attempts;
- `tutorialsCompleted`;
- VN progression.

Tutorial overlays в Lab отключены, чтобы они не мешали воспроизводимому balance/playtest run и не записывали tutorial progress.

Win в Lab не вызывает evidence transition и не выдаёт clue. Loss/retry не увеличивает Story attempt counter.

Telemetry `match_start` / `match_end` получает `mode: "lab"` и exact seed, чтобы raw playtest data можно было отличить от Story runs.

## Architecture

Новый `LevelLabController` не импортирует другие feature controllers.

Composition root связывает:

`LevelLabController -> callback -> Match3Controller.startLabMatch(...)`.

`Match3Game` и production `LevelDefinition` остаются единственным gameplay/config source of truth.

`Match3Game.ts` в 026A не меняется.

## Out of scope

026A намеренно не включает:

- редактирование board shape;
- изменение blockers/ingredients/start layout;
- изменение objectives/moves;
- spawn weights;
- export изменённого level config;
- отдельный player-facing Match-3 campaign save/unlocks.

Это scope 026B/026C.

## QA acceptance

1. На iPhone Level Lab открывается из main menu и скроллится без clipping/safe-area проблем.
2. Все четыре level configs можно выбрать.
3. Seed `0`, default seeds и произвольный seed отображаются и запускаются корректно.
4. Preview содержит 64 клетки и визуально соответствует стартовой доске после `Play seed`.
5. `Retry same seed` воспроизводит ту же стартовую доску.
6. После Lab run Story Continue, clues, attempts и tutorial state остаются прежними.
7. Story Match-3 flow продолжает работать как раньше.
