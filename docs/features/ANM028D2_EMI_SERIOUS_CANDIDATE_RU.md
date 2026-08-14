# ANM-028D2 R1 — Emi Serious Candidate QA

Status: **manual iPhone QA required**.  
Baseline: `main` commit `1f41ec3bcc7892bd75d09b704e38afe323a3a32e` (ANM-028D1 R1 / PR #98).

## Решение

Neutral R1 имеет статус `approved-master`, smile R1 прошёл ручной QA и имеет статус
`approved-expression`. Оба остаются вне runtime до готовности полного Emi set. ANM-028D2 добавляет
только `serious` и не заменяет старые runtime assets.

## Asset и изоляция

- approved anchor: `public/assets/characters/emi/candidates/anm028d0/neutral-r1.png`;
- approved smile: `public/assets/characters/emi/candidates/anm028d1/frame-smile-r1.png`;
- candidate: `public/assets/characters/emi/candidates/anm028d2/frame-serious-r1.png`;
- metadata: `src/data/characterCandidates.ts` (`upds-character-candidate-v1`);
- id: `anm028d2-r1`;
- expression: `serious`;
- status: `manual-qa`;
- `runtimeEligible: false`;
- файл отсутствует в `RuntimeAssets` и `characterProductionManifest`.

Scene Studio по умолчанию открывает serious R1 и сохраняет четыре источника: `runtime`, approved
neutral, approved smile и проверяемый serious.

## Multi-ROI contract

`imagegen` используется только как источник новой мимики. Финальный sprite наследует approved
neutral и заменяет три feathered области: левый глаз/бровь, правый глаз/бровь и рот.

| Property | Neutral R1 | Serious R1 |
|---|---:|---:|
| Canvas | `1024×1536` | `1024×1536` |
| Alpha bounds | `330,80,737,1508` | `330,80,737,1508` |
| Visual height | `1428 px` | `1428 px` |
| Bottom padding | `28 px` | `28 px` |
| Eye line | `244 px` | `244 px` |
| Alpha center offset | `+21.5 px` | `+21.5 px` |

Alpha channel и все пиксели за пределами трёх ограниченных ROI наследуются от neutral master.
Runtime face overlays не возвращаются.

## Scene Studio QA

В `anm028d2-r1` каждый actor preset намеренно использует Emi `serious`:

- `solo-close`, `solo-medium` — Эми;
- `two-shot-conflict` — Miku serious + Emi serious;
- `two-shot-alliance` — Onoe neutral + Emi serious;
- `trio-central-speaker` — Emi serious + Miku neutral + Ayuki neutral;
- `trio-reaction` — Ayuki surprised + Miku neutral + Emi serious.

## Ручной gate

На `/preview/` проверить `390×844`, затем `320×568` и `430×932`:

1. `neutral → serious`: сохраняются identity, head angle, gaze, волосы, тело, одежда и свет; меняются
   только брови/веки/рот.
2. Выражение читается как сосредоточенное, внимательное и умеренно строгое, но не злое, печальное
   или испуганное.
3. Оба глаза открыты; нет double eyes/brows/mouth, halo или шва вокруг трёх ROI.
4. `smile → serious` даёт явную смену эмоции без смены лица или геометрии.
5. Во всех solo/duo/trio сохраняются focal eye-line, headroom, dialogue occlusion и порядок слоёв.
6. Guides показывают `330,80,737,1508` и `y=244`; alpha/footline совпадают с neutral.

После approval serious получает статус `approved-expression`, но остаётся вне runtime до атомарной
замены полного семиассетного Emi set. Следующая эмоция производится отдельным slice.

## Provenance

Финальный Work prompt и параметры трёх ROI:
[`../art/prompts/ANM028D2_EMI_SERIOUS_R1_PROMPT.md`](../art/prompts/ANM028D2_EMI_SERIOUS_R1_PROMPT.md).
