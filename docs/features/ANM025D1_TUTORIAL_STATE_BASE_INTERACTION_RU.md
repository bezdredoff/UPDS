# ANM-025D1 — Tutorial State + Base Interaction

## Цель

Ввести один переиспользуемый tutorial framework для Match-3 вместо набора одноразовых подсказок в `Match3Controller`. D1 обучает только базовой механике swap/match; blockers, ingredients и specials добавляются следующими атомарными срезами через тот же контракт.

## Контракт concepts

- `Match3TutorialConceptId` — стабильная identity обучаемой механики.
- LevelDefinition объявляет `tutorialConcepts`, которые уровень имеет право впервые показать.
- `match3TutorialDefinitions` определяет событие завершения concept.
- D1 содержит `basic-swap`, который показывается только в M3_00 и завершается после первого валидного swap.
- Повторный запуск уровня не показывает уже завершённый concept.

## Persistence

`CampaignSave.tutorialsCompleted` хранит завершённые concepts. Save schema повышена с 1 до 2 без изменения стабильного save key `seiran-detectives-anm009-v1`. Старые schema-0/1 saves нормализуются с пустым `tutorialsCompleted`; export/import сохраняет tutorial progress.

## UX

На первом старте M3_00 появляется modal coachmark поверх текущего игрового экрана. Он объясняет:

- матчятся визуально одинаковые предметы;
- нужно собрать линию из 3+;
- можно drag или последовательно tap двух соседних клеток.

Кнопка «ПОПРОБОВАТЬ» закрывает coachmark и возвращает управление доской. Concept отмечается completed не по нажатию кнопки, а после первого реально валидного swap. Если игрок выйдет до успешного хода, урок появится снова.

## Boundary

D1 не меняет `Match3Game`, правила матчей, specials, spawn weights, balance или objectives. Существующая 5-секундная inactivity hint остаётся отдельной contextual guidance системой и не конкурирует с tutorial modal: timer не запускается, пока coachmark открыт.
