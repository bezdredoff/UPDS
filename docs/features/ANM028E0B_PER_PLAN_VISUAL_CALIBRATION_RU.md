# ANM-028E0B — Per-plan visual calibration

## Причина

После ANM-028E0A browser-local параметры `scale` и `yPercent` уже доходили до runtime
resolver и были видны в обычной VN-игре, но Scene Studio задавала их на внешнем actor-slot.
Сам `.portrait` содержит собственные CSS defaults `--character-scale: 1` и
`--character-y: 0%`, поэтому эти два значения не наследовались в preview. Eye-line и
bottom-pivot были видны, потому что их geometry variables не переопределялись на portrait.

Кроме того, одной калибровки на персонажа недостаточно: solo, duo и trio планы требуют
разной композиционной доводки.

## Исправление preview

Scene Studio и bounded authored shots теперь передают `scale` и `yPercent` непосредственно
на реальный `.portrait` node. Это тот же DOM-уровень, на котором staging работает в обычном
VN runtime, поэтому preview больше не показывает ложные `scale=1 / y=0`.

## Горизонтальное смещение

Добавлен `xPercent`.

- В обычном VN global X добавляется к left lane (`29 / 50 / 71%`).
- В shared scene staging X добавляется к authored `anchorXPercent` выбранного плана.
- Это смещение измеряется в процентах ширины сцены и не зависит от масштаба PNG.

## Global и Current plan

Lab теперь имеет scope selector:

- **Global for character** — базовая browser-local калибровка персонажа;
- **Current plan** — отдельный override для текущего `SceneStagingPresetId`.

Пока у плана нет собственного override, он наследует Global. Первая правка в plan scope
создаёт независимую копию текущего Global. Доступны:

- `Copy global → plan`;
- `Reset this plan` — возвращает конкретный план к Global;
- `Reset global` — сбрасывает только Global, не удаляя уже сохранённые per-plan overrides.

Для каждого scope доступны пять параметров:

1. `eyeLineOffsetPx`;
2. `bottomOffsetPx`;
3. `scale`;
4. `xPercent`;
5. `yPercent`.

## Runtime parity

Per-plan calibration применяется внутри общего `resolveSceneStagingPreset()`.
Поэтому один и тот же результат используют:

- Scene Studio;
- bounded authored VN shots;
- QA-пути, использующие shared staging resolver.

Обычные speaker-side VN portraits не имеют `SceneStagingPresetId`, поэтому используют
Global calibration, что сохраняет понятный fallback.

## JSON export v2

Формат повышен до:

`upds-browser-local-character-export-v2`

Для каждого локально подменённого персонажа экспорт содержит:

- production asset paths;
- `global` — resolved calibration, staging и geometry;
- `perPlan` — только явно созданные plan overrides с уже resolved staging/geometry.

Таким образом, выбранный вариант можно переносить в production без повторной ручной
калибровки и без потери различий между solo/duo/trio планами.
