# ANM-028E0C2 — Slot-aware Character Composition Editor

## Цель

E0C1 разделил editable Composition и read-only Story QA. E0C2 завершает UX-переход:
Composition становится небольшим визуальным редактором постановки, а не набором технических
калибровочных dropdown/slider controls.

## Slot-aware модель

Калибровка browser-local staging теперь адресуется связкой:

`preset + slot + character`

Это означает, что один и тот же персонаж может иметь разные Scale/X/Y в разных позициях и планах,
например:

- `trio-reaction / primary / ayuki`;
- `trio-central-speaker / tertiary / ayuki`;
- `two-shot-alliance / secondary / ayuki`.

Если отдельного slot override нет, используется character default. Первая правка slot автоматически
создаёт независимую копию текущего default. Reset slot возвращает наследование default.

Shared `resolveSceneStagingPreset()` использует тот же context, поэтому accepted slot override виден
как в Composition preview, так и в authored Story QA shots с тем же preset/slot/character.

## Редактор состава

Для каждого actor slot Composition показывает:

- Character;
- Expression;
- Pose A / Pose B.

Персонажей можно переставлять между слотами. Если выбран character, который уже присутствует в
другом слоте текущего плана, редактор меняет их местами, сохраняя expression/pose вместе с
персонажем и не создавая duplicate-character shot.

Каждый preset хранит собственный browser-session состав. Evidence/guest presets продолжают
использовать свои специализированные renderer paths и не получают actor editor.

## Позиционирование

Основной пользовательский набор сокращён до трёх параметров:

- Scale;
- X;
- Y.

Eye-line и Bottom pivot больше не отображаются как ручные Composition controls. Alpha geometry и
focal-eye guides остаются внутренними QA/runtime contracts и продолжают вычисляться автоматически.

X/Y можно менять двумя способами:

1. sliders для точного значения;
2. drag персонажа непосредственно в VN preview мышью или touch/pointer input.

Drag двигает X/Y относительно canonical slot anchor и коммитит результат в тот же slot-aware
calibration context.

## Character defaults

Отдельный свёрнутый блок `Character defaults` хранит базовые Scale/X/Y для каждого production
персонажа. Эти значения используются во всех планах, пока конкретная комбинация
`preset + slot + character` не получает собственный override.

Defaults и slot overrides остаются browser-local: production manifest, save и GitHub не меняются.

## JSON v3

Экспорт повышен до:

`upds-browser-local-character-export-v3`

Snapshot содержит:

- `compositionAssignments` — character/expression/pose по slot для каждого actor preset;
- `characters.*.default` — базовая calibration/staging;
- `characters.*.slotOverrides` — только явно созданные `preset/slot` overrides;
- production target paths для реально загруженных browser-local replacement assets.

Это позволяет перенести одобренный результат в production без повторной ручной расстановки и без
потери различий между позициями одного персонажа.

## Story QA

Story QA остаётся read-only. Он не показывает Composition editor и не позволяет менять authored
shot identity. Но shared staging resolver применяет уже настроенные browser-local default/slot
values, поэтому Story QA показывает фактический результат текущей калибровки на production shot.

## Тестовая стратегия

E0C2 заменяет старые per-plan calibration contracts на slot-aware behavioral contracts:

- global/default fallback сохраняется;
- конкретный `preset + slot + character` получает независимый Scale/X/Y;
- один character может иметь разные overrides в разных slots/presets;
- authored shot использует соответствующий slot override;
- Composition показывает character/expression/pose controls и только Scale/X/Y;
- Eye-line/Bottom-pivot отсутствуют в основном editor UX;
- JSON export использует v3 + compositionAssignments + slotOverrides;
- Story QA остаётся без editable Composition controls.


## ANM-028E0C2A — pointer interaction correction

Первоначальный E0C2 правильно добавил Pointer Events на portrait, но общий `vnFrameMarkup()`
продолжал получать `interactive: false`. Исторический Scene Studio contract превращал это в
HTML `inert` на всём VN frame, поэтому браузер не доставлял pointer events внутрь stage.

E0C2A разделяет эти понятия:

- Story QA и lineup остаются полностью inert;
- Composition scene оставляет VN chrome inert, но разрешает pointer input внутри stage;
- PNG получают `draggable=false` и CSS user-drag protection;
- Browser Gate реально перетаскивает portrait мышью и проверяет появление slot override и изменение X/Y.

## E0C2A — pointer drag regression

Composition preview intentionally keeps the shared VN chrome inert while exposing only the stage to pointer input.
The regression is covered inside the existing `e2e/tests/harness.pw.ts` QA-harness spec rather than by adding a ninth
Playwright spec file. This preserves the completed G8A spec-inventory baseline while still exercising a real mouse drag
against the production Scene Studio DOM in Browser Gate.
