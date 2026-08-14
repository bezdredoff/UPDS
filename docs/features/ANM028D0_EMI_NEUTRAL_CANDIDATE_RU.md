# ANM-028D0 R1 — Emi Neutral Candidate QA

Status: **manual iPhone QA required**.  
Baseline: `main` commit `c224df25c35c610eb6f83e675f8d95f48b92a3c8` (ANM-028B1 R4.1 / PR #96).

## Решение

ANM-028B1 R4.1 прошёл iPhone visual QA и был смержен. Следующий ограниченный art slice создаёт
только один новый neutral Pose A master Эми. Expressions, Pose B, medallion и замена runtime assets
запрещены до отдельного ручного approval этого neutral в lineup/solo/duo/trio.

## Изоляция candidate

- PNG: `public/assets/characters/emi/candidates/anm028d0/neutral-r1.png`;
- metadata: `src/data/characterCandidates.ts` (`upds-character-candidate-v1`);
- status: `manual-qa`;
- `runtimeEligible: false`;
- файл отсутствует в `RuntimeAssets` и `characterProductionManifest`;
- текущий обрезанный Emi set остаётся runtime fallback с `visualApproval: rebuild-required`;
- Studio selector позволяет сравнивать `runtime` и `anm028d0-r1` без скрытой подмены игры.

## Измеренная геометрия

Общий canvas: `1024×1536`, RGBA, pivot `(0.5, 1.0)`.

| Master | Alpha bounds | Height | Onoe ratio | Bottom padding | Eye line |
|---|---:|---:|---:|---:|---:|
| Miku approved | `359,43,651,1418` | 1375 px | 92.7% | 118 px | 196 px |
| Onoe approved | `316,26,697,1510` | 1484 px | 100% | 26 px | 158 px |
| Ayuki approved | `304,18,746,1480` | 1462 px | 98.5% | 56 px | 242 px |
| **Emi R1 candidate** | **`330,80,737,1508`** | **1428 px** | **96.2%** | **28 px** | **244 px** |

Candidate имеет полный силуэт, обе стопы, alpha-center offset `+21.5 px` и не требует runtime CSS
scale/y repair. Eye line измерена вручную по центру наклонённой пары глаз и должна совпадать с
жёлтой selected-frame guide.

## Scene Studio QA

В candidate-режиме каждый actor preset намеренно включает Emi neutral:

- `solo-close`, `solo-medium` — Emi;
- `two-shot-conflict` — Miku + Emi;
- `two-shot-alliance` — Onoe + Emi;
- `trio-central-speaker` — Emi + Miku + Ayuki, Эми в центре;
- `trio-reaction` — Ayuki + Miku + Emi.

Candidate alpha bounds и `eyeLineYPx=244` используются и изображением, и направляющими. Lineup
заменяет только карточку Эми; Miku/Onoe/Ayuki остаются canonical approved references. Read-only
`upds-scene-studio-qa-v1` report сохраняет `artSource`, candidate metadata и фактическую actor geometry.

## Ручной gate

На `/preview/` проверить минимум `390×844`, затем крайние `320×568` и `430×932`:

1. Lineup: взрослый visual age, единый 2000s Hybrid style, анатомия, palette/value grouping,
   light direction, пропорции и footline относительно Miku/Onoe/Ayuki.
2. Solo close/medium: лицо не касается top safe area; dialogue/UI дают тот же crop, что playable VN.
3. Оба duo: лица находятся на background focal eye-line; фигуры не выглядят full-body/маленькими,
   не висят и не требуют scene-specific zoom.
4. Оба trio: Эми не ломает face lanes, headroom, порядок слоёв и читаемость остальных персонажей.
5. Guides: `SELECTED FRAME ALPHA` соответствует PNG `330,80,737,1508`, eye marker проходит через глаза.
6. Переключатель `Runtime fallback` возвращает старую Эми и её старую геометрию для честного A/B.

Только после ручного approval следующий slice может продвигать neutral в production baseline и
начинать по одному четыре face-ROI expression edits. R1 сам по себе не закрывает ANM-028D.

## Generation provenance

Built-in ChatGPT Work `imagegen`; approved design was regenerated on chroma-key, затем прошёл
детерминированный matte/de-spill и canvas translation. Финальный prompt и роли references:
[`../art/prompts/ANM028D0_EMI_NEUTRAL_R1_PROMPT.md`](../art/prompts/ANM028D0_EMI_NEUTRAL_R1_PROMPT.md).

