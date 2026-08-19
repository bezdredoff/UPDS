# ANM-028E — Main Cast Replacement Trial

Status: **visual candidate / manual QA**.

## Цель

Проверить новые production-candidate версии трёх основных персонажей — Miku, Onoe и Ayuki —
как прямые runtime replacements старых Pose A/Pose B изображений в существующем VN staging.

## Scope

- заменены пять Pose A expression frames и один Pose B asset для каждого из Miku/Onoe/Ayuki;
- canvas остаётся `1024×1536 RGBA`;
- runtime paths, character IDs, speaker mapping, expressions и VN staging implementation не меняются;
- medallions не меняются;
- `characterProduction.ts` обновляет только измеряемую geometry metadata под новые PNG:
  alpha bounds, visual height и neutral eye line;
- новые eye-line значения являются стартовой калибровкой для preview QA и должны быть подтверждены
  на реальных solo/duo/trio сценах до окончательного visual approval.

## Измеренная geometry

| Character | Alpha bounds | Visual height | Eye line |
|---|---:|---:|---:|
| Miku | `268,41,756,1419` | 1378 px | 208 px |
| Onoe | `234,24,790,1512` | 1488 px | 198 px |
| Ayuki | `249,16,775,1482` | 1466 px | 247 px |

У всех пяти Pose A expressions внутри каждого персонажа alpha bounds совпадают, поэтому переключение
эмоций не должно менять silhouette/pivot.

## Browser Gate во время visual trial

G7B mobile Golden Sample `VN0008` содержит основной trio cast. Поскольку этот slice намеренно меняет
изображения Miku/Onoe/Ayuki, visual-regression comparison для `VN0008` ожидаемо должен показать diff.
Это не причина автоматически обновлять baseline: сначала новый cast проходит ручной `/preview/` QA, и только
после явного visual approval Golden Sample может быть перезаписан отдельным follow-up. Функциональные
Chromium/WebKit проверки при этом должны оставаться зелёными.

## Manual preview QA

Перед merge проверить на телефоне:

1. solo Miku / Onoe / Ayuki;
2. representative duo и trio;
3. authored shots с существующими focal-eye-line presets;
4. Pose B shots;
5. переключение нескольких expressions подряд;
6. отсутствие overlap, scale jump, top/bottom crop и ухода лица из focal zone.

Если staging требует отдельной коррекции, править geometry metadata/presets отдельным follow-up,
не масштабировать PNG через случайный per-scene CSS zoom.
