# ANM-026C — Match-3 Campaign Mode

## Цель

Добавить отдельный player-facing режим Match-3, который позволяет проходить production-уровни без повторного проигрывания VN и при этом не загрязняет сюжетное сохранение.

## Контракт режима

- В главном меню появляется `Match-3 кампания` без QA-маркера.
- Кампания использует те же `levels` и тот же `Match3Game`, что Story и Level Lab.
- M3_00 открыт сразу. Следующий уровень открывается только после победы в предыдущем.
- Пройденные уровни остаются доступны для replay.
- Для каждого уровня сохраняются attempts и лучший результат по оставшимся ходам.
- После победы можно сразу перейти к следующему уровню, повторить текущий или вернуться в hub.
- После поражения можно повторить уровень или вернуться в hub.

## Изоляция сохранений

Story save остаётся на стабильном ключе:

`seiran-detectives-anm009-v1`

Match-3 campaign использует отдельный ключ:

`seiran-detectives-match3-campaign-v1`

В campaign save хранятся только:

- `completed` level IDs;
- `attempts`;
- `bestMovesLeft`;
- `tutorialsCompleted` для этого режима.

Campaign run не должен менять Story `scene`, `line`, `choice`, `clues`, `completed`, `attempts`, `readLines` или `tutorialsCompleted`.

## Tutorials

Campaign использует существующий ANM-025D tutorial framework, но mastery хранится в campaign save. Поэтому игрок может независимо пройти обучение в Story и в standalone Match-3 campaign.

Level Lab по-прежнему не сохраняет tutorial progress вообще.

## Telemetry

`match_start`, `match_end` и tutorial events получают `mode: campaign`. Story и Lab сохраняют свои `story` / `lab` значения.

## Не входит в 026C

- отдельные campaign-only уровни;
- звёзды/очки/энергия/монетизация;
- изменение production balance;
- импорт Level Lab draft прямо в campaign;
- массовая playtest-аналитика — остаётся возможным 026D.
