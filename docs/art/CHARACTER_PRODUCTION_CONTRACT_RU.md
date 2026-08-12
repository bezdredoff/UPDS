# UPDS — Production Character Contract

## 1. Source of truth

1. Утверждённый `2000s Hybrid` art direction.
2. Существующие production rigs Мику / Оноэ / Аюки — технический и визуальный эталон.
3. ANM-003 — точная постановка текущего вертикального среза.
4. Story Bible — функция, возраст, роль и долгосрочная драматургия персонажа.

Новый персонаж не должен выглядеть как ассет из другой игры или другого поколения аниме.

## 2. Общий визуальный язык

- цветное телевизионное аниме середины 2000-х;
- чистый уверенный контур;
- простые формы;
- почти плоский cel shading;
- минимум глянца, bloom, частиц, сложных градиентов и реалистичных материалов;
- взрослые пропорции всех студентов;
- фансервис допустим через силуэт/одежду/комедийную ситуацию, но не через эротическую камеру;
- никаких школьных/несовершеннолетних визуальных кодов;
- без текста, логотипов и запечённых UI-элементов в character PNG.

## 3. Runtime canvas

Pose A:
- PNG RGBA;
- 1024×1536;
- прозрачный фон;
- единый pivot `(0.5, 1.0)`;
- одинаковая геометрия головы между base и overlays;
- нижняя часть персонажа может выходить за VN stage: runtime показывает close-up / waist-up.

Face overlay:
- PNG RGBA;
- 512×512;
- прозрачность вне лица;
- runtime placement: `left 25%`, `top 0%`, `width 50%`;
- overlay обязан точно совпадать с Pose A по масштабу, наклону головы, волосам у лица и анатомии.

Medallion:
- `portrait_neutral_256.png`;
- 256×256 RGBA;
- читаемый крупный портрет, не уменьшенная full-body фигура.

Pose B:
- 1024×1536 RGBA;
- цельный статичный PNG;
- тот же дизайн, пропорции и палитра;
- нужен как production reserve / будущая постановочная поза, даже если текущий vertical slice не вызывает его для данного героя.

## 4. Базовый набор файлов

Для совместимости с текущим `CharacterRig` каждый production-персонаж получает:

- `rig/pose_a/base-neutral.png`
- `rig/pose_a/face-smile.png`
- `rig/pose_a/face-serious.png`
- `rig/pose_a/face-surprised.png`
- `rig/pose_a/face-embarrassed.png`
- `rig/pose_a/face-speaking.png`
- `rig/pose_a/face-blink.png`
- `poses/<character-specific-pose-b>.png`
- `medallions/portrait_neutral_256.png`

Итого: 9 runtime PNG на персонажа.

Причина полного набора: текущий runtime типизирует faces как полный Record, а speaking/blink используются анимацией независимо от authored эмоции. Поэтому ANM-021 не должен вводить новый partial-face fallback-контракт только ради экономии нескольких изображений.

## 5. Семантика выражений

- neutral — базовое спокойное состояние;
- smile — облегчение, мягкость, доверие, искренность;
- serious — раздражение, защита позиции, сосредоточенность, твёрдость;
- surprised — тревога/встревоженность/растерянность/резкая реакция;
- embarrassed — нервозность, смущение, неловкость, «пойман на плохом объяснении»;
- speaking — нейтральное открытие рта, без изменения характера/настроения;
- blink — только закрытые глаза; не менять рот, брови, голову и причёску.

## 6. QA gates

До интеграции каждого героя:
1. размеры и RGBA корректны;
2. фон прозрачен;
3. base и все face overlays совпадают по anchor;
4. при переключении neutral ↔ expression нет скачка головы/волос/шеи;
5. speaking не выглядит отдельной эмоцией;
6. blink не меняет позу/рот;
7. силуэт читается на пяти текущих VN backgrounds;
8. close-up framing не обрезает глаза/подбородок на 320×568 и 390×844;
9. персонаж визуально совместим с Miku/Onoe/Ayuki;
10. никаких baked text/UI и запрещённых sexualized camera cues.

## 7. Folder naming

`public/assets/characters/<key>/...`

Ключи:
- `emi`
- `kentaro`
- `norihiro`
- `mayu`

Runtime filenames — ASCII, lowercase для character folders, kebab-case для pose B.
