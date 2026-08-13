# ANM-025D3 — Special Activation Tutorial

## Цель

Расширить persistent tutorial framework на первую special-механику, не показывая сложное обучение до того, как игрок реально создаст спецфишку.

## Concept

Добавлен `activate-special`:

- доступен на всех четырёх текущих уровнях;
- **не** показывается при старте уровня;
- становится eligible только после валидного player move с `specialsCreated > 0`;
- объясняет, что длинные/фигурные совпадения создают специальные инструменты;
- просит попробовать уже существующую direct activation через double-tap;
- считается освоенным только после успешного `attemptSpecialActivation`, а не после закрытия coachmark.

Если игрок сам успешно активировал special до показа урока, concept считается освоенным и лишний coachmark не появляется.

## Reveal vs completion

D3 добавляет в tutorial data contract независимые события:

- `revealOn` — когда concept имеет смысл впервые показать;
- `completeOn` — какое фактическое действие подтверждает освоение.

Base/objective concepts используют `level-start` как reveal event. `activate-special` использует `special-created`, поэтому framework не учит абстрактной механике заранее.

Runtime хранит reveal events только внутри текущей попытки. Persistent save хранит только завершённые concepts.

## Boundary

D3 не меняет:

- `Match3Game.ts` и special taxonomy;
- правила создания Flash/Evidence/Lead/Insight;
- direct activation semantics и стоимость хода;
- special-to-special combo matrix;
- objectives, balance или spawn weights;
- save schema/key.

Отдельный следующий tutorial cut должен покрыть special combinations/taxonomy, не перегружая первый special coachmark.
