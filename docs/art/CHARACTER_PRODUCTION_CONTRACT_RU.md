# UPDS — Production Character Contract

## Source of truth

Новые персонажи должны совпадать с утверждённым `2000s Hybrid` и существующими Miku/Onoe/Ayuki:
чистый контур, простые формы, почти плоский cel shading, минимум бликов/градиентов/мелких деталей,
взрослые college-age пропорции и отсутствие современного glossy-gacha рендера.

## R4: precomposed expression frames

Layered face overlays больше НЕ являются production runtime contract.

Pose A строится из одного immutable master и пяти готовых full-frame кадров:
- `frame-neutral.png`
- `frame-smile.png`
- `frame-serious.png`
- `frame-surprised.png`
- `frame-embarrassed.png`

Каждый файл:
- 1024×1536 RGBA;
- одинаковый pivot `(0.5, 1.0)`;
- идентичные camera/scale/head/neck/collar/hair silhouette/body;
- одинаковые lighting, cel-shadow, skin tone, hair color, saturation, contrast и highlights;
- различаются только пиксели, необходимые для мимики.

Runtime показывает ровно ОДИН expression frame. Никакое второе лицо не накладывается поверх него.

## Animation policy

Автоматические `speaking` mouth-flap и `blink` временно исключены из production contract.
Причина: один generic overlay не может корректно удалить уже нарисованный рот/глаза и вызывает double-mouth,
halo и потерю authored emotion.

Возврат lip/blink animation допускается только отдельной feature с replacement/delta masks,
которые доказанно сохраняют текущую authored expression.

## Semantic uniqueness

`smile`, `serious`, `surprised`, `embarrassed` обязаны визуально читаться как разные эмоции.
Формально разные PNG с практически одинаковым лицом — FAIL.

## Pixel fidelity gate

Вне утверждённой facial-change region кадры одного Pose A должны быть пиксельно идентичны neutral master.
Нельзя менять:
- форму/масштаб/наклон головы;
- волосы и их внешний силуэт;
- уши, шею, воротник, одежду;
- тени и освещение;
- цвета кожи/волос/одежды;
- alpha по границе головы или тела.

Это предотвращает halo/flicker при смене выражения.

## Additional files

На персонажа также:
- `poses/<pose-b>.png` — 1024×1536 RGBA;
- `medallions/portrait_neutral_256.png` — 256×256 RGBA.

Минимальный production runtime set теперь: 5 Pose A frames + Pose B + medallion = 7 PNG.

## Emi rejection / regeneration gate

ANM-021B R2/R3 Emi art отклонён visual QA:
слишком современный дизайн, сложная причёска, избыток деталей/теней/бликов и несовпадающая палитра.
До новой генерации, которая проходит side-by-side comparison с Miku/Onoe/Ayuki, Эми остаётся placeholder.

Новый Emi master должен сначала пройти standalone art approval; expressions производятся ТОЛЬКО после approval master.

## VN staging / virtual camera

Все production character frames используют общий VN camera viewport.
PNG никогда не определяет CSS zoom своим intrinsic размером.

Runtime contract:
- `.portrait-frame` и `.portrait-static`: absolute inset 0, width/height 100%, `object-fit: contain`, `object-position: center bottom`;
- Pose A и Pose B используют одинаковый camera box;
- expression switch не меняет scale/y/side;
- `characterStaging` — единственная допустимая точка character-specific scale/vertical offset;
- default для production art: `scale: 1`, `yPercent: 0`.

Разница роста должна быть художественно заложена в согласованный 1024×1536 master canvas либо отдельно утверждена
в staging metadata. Нельзя «подгонять голову» случайным zoom на отдельной сцене.


## ANM-021B R6
Новый Emi master approved и интегрирован по precomposed-frame/R5 staging contract.
