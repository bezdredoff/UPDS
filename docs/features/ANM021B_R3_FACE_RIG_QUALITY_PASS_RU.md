# ANM-021B R3 — Face Rig Quality Pass

Build: `0.21.2-anm021b-r3`.

## Причина

Visual QA ANM-021B выявил две независимые проблемы:
1. Emi face overlays были независимо нормализованы и не совпадали с Pose A по масштабу/углу головы и шеи.
2. VN runtime заменял authored emotion на глобальные `speaking` / `blink`, из-за чего эмоции визуально пропадали и возникал flicker.

## Исправление

- Emi expressions геометрически выровнены относительно immutable Pose A и ограничены facial region;
- speaking/blink у Miku/Onoe/Ayuki/Emi превращены в малые animation patches;
- authored expression теперь отдельный persistent layer;
- animation layer больше не заменяет authored expression;
- speaking/blink временно активируются только на neutral lines;
- production contract запрещает изменение света, цвета, теней, волос, шеи, воротника и камеры между expression frames.

## Почему neutral-only animation

Текущий asset contract имеет один speaking/blink patch на персонажа, а не отдельный delta для каждой эмоции.
Neutral-only policy устраняет потерю smile/serious/surprised/embarrassed без раздувания ANM-021 на десятки дополнительных animation assets.
Если позже потребуется полноценная lip/blink animation поверх каждой эмоции, это должно быть отдельным animation feature.

## Existing protagonists audit

Miku/Onoe/Ayuki имеют физически отдельные authored expression PNG. R3 сохраняет эти expressions и устраняет runtime-подмену их global speaking frame.

## QA

В preview для каждого production героя:
1. открыть authored smile/serious/surprised/embarrassed;
2. убедиться, что эмоция остаётся стабильной и не превращается периодически в speaking;
3. на neutral line проверить speaking и blink;
4. искать скачки геометрии, skin tone, hair color, lighting и cel-shadow.
