# ANM-028D1 R1 — Emi Smile Candidate QA

Status: **manual iPhone QA required**.  
Baseline: `main` commit `977ab2d98f33ae3cdf922d0b92685e6ce2e0f25b` (ANM-028D0 R1 / PR #97).

## Решение

Neutral R1 прошёл ручной lineup/solo/duo/trio QA и имеет статус `approved-master`. Он остаётся
изолированным от runtime до готовности полного Emi expression family. ANM-028D1 добавляет только
первую производную эмоцию — `smile` — и не заменяет старые runtime assets.

## Asset и изоляция

- approved anchor: `public/assets/characters/emi/candidates/anm028d0/neutral-r1.png`;
- candidate: `public/assets/characters/emi/candidates/anm028d1/frame-smile-r1.png`;
- metadata: `src/data/characterCandidates.ts` (`upds-character-candidate-v1`);
- id: `anm028d1-r1`;
- expression: `smile`;
- status: `manual-qa`;
- `runtimeEligible: false`;
- файл отсутствует в `RuntimeAssets` и `characterProductionManifest`.

Scene Studio по умолчанию открывает smile R1. Selector сохраняет три честных источника:
`runtime`, утверждённый `anm028d0-r1` и проверяемый `anm028d1-r1`.

## Face-ROI contract

`imagegen` используется как источник новой мимики, а не как разрешение перерисовать персонажа.
Финальный sprite собран поверх approved neutral через bounded face ROI:

| Property | Neutral R1 | Smile R1 |
|---|---:|---:|
| Canvas | `1024×1536` | `1024×1536` |
| Alpha bounds | `330,80,737,1508` | `330,80,737,1508` |
| Visual height | `1428 px` | `1428 px` |
| Bottom padding | `28 px` | `28 px` |
| Eye line | `244 px` | `244 px` |
| Alpha center offset | `+21.5 px` | `+21.5 px` |

В smile изменена только область `88×42 px` вокруг рта с feathered ellipse. Alpha channel и все
пиксели за границами этого ROI наследуются от neutral master. Runtime face overlays не возвращаются.

## Scene Studio QA

В `anm028d1-r1` каждый actor preset намеренно использует Emi `smile`:

- `solo-close`, `solo-medium` — Эми;
- `two-shot-conflict` — Miku serious + Emi smile;
- `two-shot-alliance` — Onoe neutral + Emi smile;
- `trio-central-speaker` — Emi smile + Miku neutral + Ayuki neutral;
- `trio-reaction` — Ayuki surprised + Miku neutral + Emi smile.

Точная геометрия smile используется одновременно изображением, crop-camera и selected-frame guides.
Lineup показывает smile рядом с approved Miku/Onoe/Ayuki; переключение на neutral позволяет оценить
только изменение эмоции, а `runtime` остаётся контролем старого набора.

## Ручной gate

На `/preview/` проверить `390×844`, затем `320×568` и `430×932`:

1. `neutral → smile`: сохраняются identity, head angle, глаза, волосы, тело, одежда и свет; меняется
   только мимика рта/щёк.
2. Улыбка уверенная и тёплая, читается в solo/duo/trio crop, но не выглядит чрезмерной.
3. Глаза остаются открытыми; нет wink, blush, double mouth, halo или шва вокруг face ROI.
4. Во всех сценах сохраняются focal eye-line, headroom, occlusion диалогом и порядок слоёв.
5. Guides показывают `330,80,737,1508` и `y=244`; alpha/footline совпадают с neutral.

После approval smile получает статус `approved-expression`, но остаётся вне runtime до атомарной
замены полного семиассетного Emi set. Следующая эмоция производится отдельным slice.

## Provenance

Финальный Work prompt и параметры детерминированного ROI:
[`../art/prompts/ANM028D1_EMI_SMILE_R1_PROMPT.md`](../art/prompts/ANM028D1_EMI_SMILE_R1_PROMPT.md).
