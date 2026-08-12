# ANM-021B R5 — VN Character Scale & Staging Normalization

Build: `0.21.1-anm021b-r5`.

## Найденная причина

R4 перевёл Pose A на `<img class="portrait-frame">`, но production CSS продолжал масштабировать только
`.portrait-base` и `.portrait-static`. Новый full-frame image не получал `position:absolute; inset:0;
width:100%; height:100%; object-fit:contain; object-position:center bottom`.

Из-за этого браузер мог использовать intrinsic 1024×1536 geometry внутри VN stage, что визуально
создавало резкие различия масштаба и положения.

## R5 virtual camera

Pose A и Pose B теперь используют один camera contract:
- один `.portrait` viewport;
- image всегда занимает `100% × 100%`;
- `object-fit: contain`;
- `object-position: center bottom`;
- общий bottom anchor;
- left/right/center меняют только горизонтальную lane, а не zoom.

## Character staging metadata

`characterStaging` хранит явные `scale` и `yPercent`.
Для Miku/Onoe/Ayuki R5 устанавливает `1 / 0`: одинаковая дистанция камеры.
Относительный рост/пропорции остаются частью утверждённых Golden Sample PNG на общем 1024×1536 canvas,
а не вычисляются через случайный CSS zoom.

Будущие персонажи не получают индивидуальный scale без отдельного art-direction решения.
Если канонический рост требует коррекции, она задаётся централизованно и тестируется side-by-side.

## Expression stability

Все пять expression frames одного героя:
- имеют одинаковый canvas;
- одинаковый alpha silhouette;
- одинаковый bottom anchor;
- переключение emotion не меняет staging metadata.

## Animation

R4 policy сохраняется: automatic mouth-flap/blink остаются отключены до отдельной корректной animation feature.
